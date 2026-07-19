package service

import (
	"time"

	"github.com/shakil5281/hrhub-api/internal/models"
	"github.com/shakil5281/hrhub-api/internal/repository"
	"github.com/shakil5281/hrhub-api/internal/utils"
)

type AttendanceProcessor struct {
	dataLogRepo    *repository.DataLogRepository
	attendanceRepo *repository.AttendanceRepository
	employeeRepo   *repository.EmployeeRepository
	shiftRepo      *repository.ShiftRepository
	leaveRepo      *repository.LeaveRepository
	tempShiftRepo  *repository.TemporaryShiftRepository
}

func NewAttendanceProcessor(
	dataLogRepo *repository.DataLogRepository,
	attendanceRepo *repository.AttendanceRepository,
	employeeRepo *repository.EmployeeRepository,
	shiftRepo *repository.ShiftRepository,
	leaveRepo *repository.LeaveRepository,
	tempShiftRepo *repository.TemporaryShiftRepository,
) *AttendanceProcessor {
	return &AttendanceProcessor{
		dataLogRepo:    dataLogRepo,
		attendanceRepo: attendanceRepo,
		employeeRepo:   employeeRepo,
		shiftRepo:      shiftRepo,
		leaveRepo:      leaveRepo,
		tempShiftRepo:  tempShiftRepo,
	}
}

// DayResult holds per-day processing summary.
type DayResult struct {
	Date      string `json:"date"`
	Processed int    `json:"processed"`
	Logs      int    `json:"logs"`
}

// ProcessDateRangeResult holds the aggregated result of processing a date range.
type ProcessDateRangeResult struct {
	TotalProcessed int         `json:"total_processed"`
	TotalLogs      int         `json:"total_logs"`
	Days           int         `json:"days"`
	Details        []DayResult `json:"details"`
}

// ProcessDateRange converts unprocessed raw punch data into attendance records
// for each day in the given date range.
func (p *AttendanceProcessor) ProcessDateRange(startDate, endDate, companyID string) (*ProcessDateRangeResult, error) {
	dates, err := utils.GenerateDateRange(startDate, endDate)
	if err != nil {
		return nil, err
	}

	result := &ProcessDateRangeResult{
		Days:    len(dates),
		Details: make([]DayResult, 0, len(dates)),
	}

	// Pre-fetch all temporary shifts for the date range
	tempShiftByKey := make(map[string]*models.TemporaryShift)
	if companyID != "" {
		allTempShifts, _ := p.tempShiftRepo.ListByCompanyAndDateRange(companyID, startDate, endDate)
		for i := range allTempShifts {
			key := allTempShifts[i].EmployeeID + "|" + allTempShifts[i].Date
			tempShiftByKey[key] = &allTempShifts[i]
		}
	}

	// Shift cache to avoid repeated DB lookups
	shiftCache := make(map[string]*models.Shift)

	for _, date := range dates {
		dayProcessed, dayLogs := p.processDay(date, companyID, tempShiftByKey, shiftCache)
		result.TotalProcessed += dayProcessed
		result.TotalLogs += dayLogs
		result.Details = append(result.Details, DayResult{
			Date:      date,
			Processed: dayProcessed,
			Logs:      dayLogs,
		})
	}

	return result, nil
}

func (p *AttendanceProcessor) processDay(
	date, companyID string,
	tempShiftByKey map[string]*models.TemporaryShift,
	shiftCache map[string]*models.Shift,
) (processedCount, logCount int) {

	logs, _ := p.dataLogRepo.ListUnprocessedByDate(date)
	logCount = len(logs)

	// Build badge-to-employee mapping
	employeeByBadge := p.buildEmployeeByBadge(logs)

	// Fetch all active employees for the date
	activeEmployees, _ := p.employeeRepo.ListActiveAll(companyID)
	allEmployeeIDs := make([]string, len(activeEmployees))
	for i := range activeEmployees {
		allEmployeeIDs[i] = activeEmployees[i].EmployeeID
	}

	// Fetch existing attendance and approved leaves
	existingAttList, _ := p.attendanceRepo.ListByDateAndEmployeeIDs(date, allEmployeeIDs)
	existingAttByEmp := make(map[string]*models.Attendance, len(existingAttList))
	for i := range existingAttList {
		existingAttByEmp[existingAttList[i].EmployeeID] = &existingAttList[i]
	}

	approvedLeaves, _ := p.leaveRepo.ListApprovedByDate(date)
	onLeaveSet := make(map[string]bool, len(approvedLeaves))
	for _, l := range approvedLeaves {
		onLeaveSet[l.EmployeeID] = true
	}

	// --- Process punch logs (if any) ---
	if len(logs) > 0 {
		type empPunches struct {
			BadgeNumber string
			Punches     []models.DataLog
			LogIDs      []string
		}
		grouped := make(map[int]*empPunches)

		for _, log := range logs {
			if grouped[log.UserID] == nil {
				grouped[log.UserID] = &empPunches{
					BadgeNumber: log.BadgeNumber,
				}
			}
			grouped[log.UserID].Punches = append(grouped[log.UserID].Punches, log)
			grouped[log.UserID].LogIDs = append(grouped[log.UserID].LogIDs, log.ID)
		}

		var logIDsToMark []string

		for _, gp := range grouped {
			if len(gp.Punches) == 0 || gp.BadgeNumber == "" {
				continue
			}

			employee, ok := employeeByBadge[gp.BadgeNumber]
			if !ok {
				continue
			}
			if companyID != "" && employee.CompanyID != companyID {
				continue
			}

			checkIn, checkOut, status, lateMinutes, shiftID := p.resolveAttendanceFromPunches(
				employee, date, gp.Punches, tempShiftByKey, shiftCache, onLeaveSet,
			)

			var attErr error
			if existing, exists := existingAttByEmp[employee.EmployeeID]; exists {
				existing.CheckIn = checkIn
				existing.CheckOut = checkOut
				existing.Status = status
				existing.ShiftID = shiftID
				existing.LateMinutes = lateMinutes
				existing.PunchNumber = &gp.BadgeNumber
				attErr = p.attendanceRepo.Update(existing)
				if attErr == nil {
					processedCount++
				}
			} else {
				att := &models.Attendance{
					EmployeeID:  employee.EmployeeID,
					CompanyID:   employee.CompanyID,
					Date:        date,
					CheckIn:     checkIn,
					CheckOut:    checkOut,
					Status:      status,
					ShiftID:     shiftID,
					LateMinutes: lateMinutes,
					PunchNumber: &gp.BadgeNumber,
				}
				attErr = p.attendanceRepo.Create(att)
				if attErr == nil {
					processedCount++
				}
				existingAttByEmp[employee.EmployeeID] = att
			}
			if attErr == nil {
				logIDsToMark = append(logIDsToMark, gp.LogIDs...)
			}
		}

		if len(logIDsToMark) > 0 {
			_ = p.dataLogRepo.MarkProcessed(logIDsToMark)
		}
	}

	// --- Create attendance for active employees with NO existing record ---
	for _, emp := range activeEmployees {
		if existingAttByEmp[emp.EmployeeID] != nil {
			continue
		}

		status := "absent"
		var shiftID *string
		var weekShift *models.Shift

		tempKey := emp.ID + "|" + date
		if ts, ok := tempShiftByKey[tempKey]; ok && ts.ShiftID != "" {
			shiftID = &ts.ShiftID
			weekShift = p.getShift(ts.ShiftID, shiftCache)
		} else if emp.ShiftID != nil {
			shiftID = emp.ShiftID
			weekShift = p.getShift(*emp.ShiftID, shiftCache)
		}

		if weekShift != nil && weekShift.WeekendDays != "" && utils.IsWeekend(date, weekShift.WeekendDays) {
			status = "weekend"
		}
		if onLeaveSet[emp.ID] {
			status = "on_leave"
		}

		att := &models.Attendance{
			EmployeeID: emp.EmployeeID,
			CompanyID:  emp.CompanyID,
			Date:       date,
			Status:     status,
			ShiftID:    shiftID,
		}
		if err := p.attendanceRepo.Create(att); err == nil {
			processedCount++
		}
	}

	return processedCount, logCount
}

func (p *AttendanceProcessor) buildEmployeeByBadge(logs []models.DataLog) map[string]*models.Employee {
	badgeSet := make(map[string]bool)
	for _, l := range logs {
		if l.BadgeNumber != "" {
			badgeSet[l.BadgeNumber] = true
		}
	}
	if len(badgeSet) == 0 {
		return nil
	}

	badgeNumbers := make([]string, 0, len(badgeSet))
	for b := range badgeSet {
		badgeNumbers = append(badgeNumbers, b)
	}

	employeeByBadge := make(map[string]*models.Employee)

	// Primary: match by PunchNumber
	byPunch, _ := p.employeeRepo.FindByPunchNumbers(badgeNumbers)
	for i := range byPunch {
		if byPunch[i].PunchNumber != "" {
			employeeByBadge[byPunch[i].PunchNumber] = &byPunch[i]
		}
	}

	// Fallback: match by EmployeeID for unmatched badges
	unmatched := make([]string, 0)
	for _, b := range badgeNumbers {
		if _, ok := employeeByBadge[b]; !ok {
			unmatched = append(unmatched, b)
		}
	}
	if len(unmatched) > 0 {
		byID, _ := p.employeeRepo.FindByEmployeeIDs(unmatched)
		for i := range byID {
			employeeByBadge[byID[i].EmployeeID] = &byID[i]
		}
	}

	return employeeByBadge
}

func (p *AttendanceProcessor) resolveAttendanceFromPunches(
	employee *models.Employee,
	date string,
	punches []models.DataLog,
	tempShiftByKey map[string]*models.TemporaryShift,
	shiftCache map[string]*models.Shift,
	onLeaveSet map[string]bool,
) (checkIn, checkOut *string, status string, lateMinutes int, shiftID *string) {

	status = "present"

	// Resolve shift
	var shift *models.Shift
	tempKey := employee.ID + "|" + date
	if ts, ok := tempShiftByKey[tempKey]; ok && ts.ShiftID != "" {
		shift = p.getShift(ts.ShiftID, shiftCache)
		if shift != nil {
			shiftID = &shift.ID
		}
	} else if employee.ShiftID != nil {
		shift = p.getShift(*employee.ShiftID, shiftCache)
		if shift != nil {
			shiftID = &shift.ID
		}
	}

	// Weekend check
	isWeekendDay := false
	if shift != nil && shift.WeekendDays != "" && utils.IsWeekend(date, shift.WeekendDays) {
		isWeekendDay = true
		status = "weekend"
	}

	// Parse shift times for filtering
	var shiftStartTime, shiftOutTime time.Time
	if shift != nil {
		if shift.StartTime != "" {
			shiftStartTime, _ = time.Parse("15:04", shift.StartTime)
		}
		if shift.EndTime != "" {
			shiftOutTime, _ = time.Parse("15:04", shift.EndTime)
		}
	}

	// Find check-in
	// Priority 1: first 'I' punch before shift end
	// Priority 2: first punch before shift start (early punch)
	for _, punch := range punches {
		punchT := punch.PunchTime.Format("15:04")
		punchTime, _ := time.Parse("15:04", punchT)

		if !shiftOutTime.IsZero() && punchTime.After(shiftOutTime) {
			continue
		}

		if punch.PunchType == "I" || punch.PunchType == "i" {
			t := punchT
			checkIn = &t
			break
		}

		// Early punch before shift start → use as check-in (no 'I' tag needed)
		if checkIn == nil && !shiftStartTime.IsZero() && (punchTime.Before(shiftStartTime) || punchTime.Equal(shiftStartTime)) {
			t := punchT
			checkIn = &t
			// Don't break — keep looking for a proper 'I' punch
		}
	}

	// Helper to check if a punch time is valid for check-out (must be after shift start)
	isValidOutTime := func(t time.Time) bool {
		return shiftStartTime.IsZero() || t.After(shiftStartTime)
	}

	// Find check-out (last 'O' punch after shift start)
	for i := len(punches) - 1; i >= 0; i-- {
		punchT := punches[i].PunchTime.Format("15:04")
		punchTime, _ := time.Parse("15:04", punchT)
		if (punches[i].PunchType == "O" || punches[i].PunchType == "o") && isValidOutTime(punchTime) {
			t := punchT
			checkOut = &t
			break
		}
	}

	// Fallback check-out: last punch after shift end if no explicit 'O'
	if checkOut == nil && !shiftOutTime.IsZero() {
		for i := len(punches) - 1; i >= 0; i-- {
			punchT := punches[i].PunchTime.Format("15:04")
			punchTime, _ := time.Parse("15:04", punchT)
			if punchTime.After(shiftOutTime) && isValidOutTime(punchTime) {
				t := punchT
				checkOut = &t
				break
			}
		}
	}

	// Final fallback: last punch after shift start
	if checkOut == nil && len(punches) > 1 {
		lastPunch := punches[len(punches)-1]
		punchT := lastPunch.PunchTime.Format("15:04")
		punchTime, _ := time.Parse("15:04", punchT)
		if isValidOutTime(punchTime) {
			t := punchT
			checkOut = &t
		}
	}

	// Determine status from punches
	if !isWeekendDay {
		if checkIn == nil && checkOut == nil {
			status = "absent"
		} else if checkIn == nil {
			status = "late"
		}
	}

	// Calculate late minutes
	if !isWeekendDay && shift != nil && checkIn != nil {
		shiftStart, _ := time.Parse("15:04", shift.StartTime)
		grace := time.Duration(shift.LateGraceMinutes) * time.Minute
		deadline := shiftStart.Add(grace)
		actualIn, err := time.Parse("15:04", *checkIn)
		if err == nil && actualIn.After(deadline) {
			lateMinutes = int(actualIn.Sub(shiftStart).Minutes())
		}
	}

	// Leave override
	if !isWeekendDay && onLeaveSet[employee.ID] {
		status = "on_leave"
	}

	return checkIn, checkOut, status, lateMinutes, shiftID
}

func (p *AttendanceProcessor) getShift(id string, cache map[string]*models.Shift) *models.Shift {
	if s, ok := cache[id]; ok {
		return s
	}
	s, err := p.shiftRepo.FindByID(id)
	if err != nil || s == nil {
		cache[id] = nil
		return nil
	}
	cache[id] = s
	return s
}


