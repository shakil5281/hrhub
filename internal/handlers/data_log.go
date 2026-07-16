package handlers

	import (
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/shakil5281/hrhub-api/internal/models"
	"github.com/shakil5281/hrhub-api/internal/repository"
	"github.com/shakil5281/hrhub-api/internal/service"
)

func generateDateRange(start, end string) ([]string, error) {
	startDate, err := time.Parse("2006-01-02", start)
	if err != nil {
		return nil, err
	}
	endDate, err := time.Parse("2006-01-02", end)
	if err != nil {
		return nil, err
	}
	var dates []string
	for d := startDate; !d.After(endDate); d = d.AddDate(0, 0, 1) {
		dates = append(dates, d.Format("2006-01-02"))
	}
	return dates, nil
}

func isWeekend(dateStr string, weekendDays string) bool {
	if weekendDays == "" {
		return false
	}
	t, err := time.Parse("2006-01-02", dateStr)
	if err != nil {
		return false
	}
	dayName := t.Weekday().String()
	dayAbbr := dayName[:3]
	for _, d := range strings.Split(weekendDays, ",") {
		tr := strings.TrimSpace(d)
		if strings.EqualFold(tr, dayAbbr) || strings.EqualFold(tr, dayName) {
			return true
		}
	}
	return false
}

type DataLogHandler struct {
	dataLogRepo    *repository.DataLogRepository
	attendanceRepo *repository.AttendanceRepository
	employeeRepo   *repository.EmployeeRepository
	shiftRepo      *repository.ShiftRepository
	leaveRepo      *repository.LeaveRepository
	mdbReader      *service.MDBReader
}

func NewDataLogHandler(
	dataLogRepo *repository.DataLogRepository,
	attendanceRepo *repository.AttendanceRepository,
	employeeRepo *repository.EmployeeRepository,
	shiftRepo *repository.ShiftRepository,
	leaveRepo *repository.LeaveRepository,
	mdbReader *service.MDBReader,
) *DataLogHandler {
	return &DataLogHandler{
		dataLogRepo:    dataLogRepo,
		attendanceRepo: attendanceRepo,
		employeeRepo:   employeeRepo,
		shiftRepo:      shiftRepo,
		leaveRepo:      leaveRepo,
		mdbReader:      mdbReader,
	}
}

type ImportRequest struct {
	FilePath  string `json:"file_path"`
	StartDate string `json:"start_date"` // YYYY-MM-DD, optional
	EndDate   string `json:"end_date"`   // YYYY-MM-DD, optional
}

type ProcessRequest struct {
	Date      string `json:"date"`
	StartDate string `json:"start_date"`
	EndDate   string `json:"end_date"`
	CompanyID string `json:"company_id"`
}

// ImportDataLogs godoc
//
// @Summary      Import data logs from ZKTeco MDB
// @Description  Read and import raw punch data from ZKTeco Access MDB file
// @Tags         Data Logs
// @Security     BearerAuth
// @Accept       json
// @Produce      json
// @Param        request body ImportRequest false "MDB file path (defaults to C:\\\\Program Files (x86)\\\\ZKTeco\\\\att2000.mdb)"
// @Success      200  {object}  map[string]interface{}
// @Failure      400  {object}  map[string]string
// @Failure      500  {object}  map[string]string
// @Router       /data-logs/import [post]
func (h *DataLogHandler) Import(c *gin.Context) {
	var req ImportRequest
	filePath := h.mdbReader.DefaultPath
	if err := c.ShouldBindJSON(&req); err == nil && req.FilePath != "" {
		filePath = req.FilePath
	}

	records, err := h.mdbReader.ReadPunches(filePath, req.StartDate, req.EndDate)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if len(records) == 0 {
		c.JSON(http.StatusOK, gin.H{"message": "No records found in MDB file", "imported": 0})
		return
	}

	var logs []models.DataLog
	for _, rec := range records {
		punchTime := rec.PunchTimeParsed()
		if h.dataLogRepo.ExistsByBadgeAndPunchTime(rec.BadgeNumber, punchTime) {
			continue
		}
		log := models.DataLog{
			UserID:       rec.UserID,
			BadgeNumber:  rec.BadgeNumber,
			EmployeeName: rec.Name,
			PunchTime:    punchTime,
			PunchType:    rec.PunchType,
			DeviceID:     rec.DeviceID,
			DeviceSN:     rec.DeviceSN,
			Date:         punchTime.Format("2006-01-02"),
		}
		logs = append(logs, log)
	}

	if err := h.dataLogRepo.BatchCreate(logs); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":  "Data logs imported successfully",
		"imported": len(logs),
	})
}

// ListDataLogs godoc
//
// @Summary      List data logs
// @Description  Get raw punch data logs by date range
// @Tags         Data Logs
// @Security     BearerAuth
// @Produce      json
// @Param        start query string false "Start date (YYYY-MM-DD)"
// @Param        end   query string false "End date (YYYY-MM-DD)"
// @Success      200  {array}   map[string]interface{}
// @Failure      500  {object}  map[string]string
// @Router       /data-logs [get]
func (h *DataLogHandler) List(c *gin.Context) {
	start := c.DefaultQuery("start", time.Now().Format("2006-01-02"))
	end := c.DefaultQuery("end", time.Now().Format("2006-01-02"))

	logs, err := h.dataLogRepo.ListByDateRange(start, end)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, logs)
}

// ProcessDataLogs godoc
//
// @Summary      Process data logs into attendance
// @Description  Convert unprocessed raw punch data into attendance records
// @Tags         Data Logs
// @Security     BearerAuth
// @Accept       json
// @Produce      json
// @Param        request body ProcessRequest false "Date to process (defaults to today)"
// @Success      200  {object}  map[string]interface{}
// @Failure      500  {object}  map[string]string
// @Router       /data-logs/process [post]
func (h *DataLogHandler) Process(c *gin.Context) {
	var req ProcessRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	startDate := req.StartDate
	endDate := req.EndDate
	if startDate == "" && endDate == "" {
		if req.Date != "" {
			startDate = req.Date
			endDate = req.Date
		} else {
			startDate = time.Now().Format("2006-01-02")
			endDate = startDate
		}
	} else if startDate == "" {
		startDate = endDate
	} else if endDate == "" {
		endDate = startDate
	}

	dates, err := generateDateRange(startDate, endDate)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	totalProcessed := 0
	totalLogs := 0
	var results []map[string]interface{}

	shiftCache := make(map[string]*models.Shift)
	getShift := func(id string) *models.Shift {
		if s, ok := shiftCache[id]; ok {
			return s
		}
		s, err := h.shiftRepo.FindByID(id)
		if err != nil || s == nil {
			shiftCache[id] = nil
			return nil
		}
		shiftCache[id] = s
		return s
	}

	for _, date := range dates {
		dayProcessed := 0
		logs, _ := h.dataLogRepo.ListUnprocessedByDate(date)

		// Build badge-to-employee mapping for all unique badge numbers
		badgeSet := make(map[string]bool)
		for _, l := range logs {
			if l.BadgeNumber != "" {
				badgeSet[l.BadgeNumber] = true
			}
		}
		badgeNumbers := make([]string, 0, len(badgeSet))
		for b := range badgeSet {
			badgeNumbers = append(badgeNumbers, b)
		}

		employeeByBadge := make(map[string]*models.Employee)
		if len(badgeNumbers) > 0 {
			byCode, _ := h.employeeRepo.FindByEmployeeCodes(badgeNumbers)
			for i := range byCode {
				employeeByBadge[byCode[i].EmployeeCode] = &byCode[i]
			}
			// Try punch_number fallback for unmatched
			unmatched := make([]string, 0)
			for _, b := range badgeNumbers {
				if _, ok := employeeByBadge[b]; !ok {
					unmatched = append(unmatched, b)
				}
			}
			if len(unmatched) > 0 {
				byPunch, _ := h.employeeRepo.FindByPunchNumbers(unmatched)
				for i := range byPunch {
					employeeByBadge[byPunch[i].PunchNumber] = &byPunch[i]
				}
			}
		}

		// Fetch all attendance for this date and approved leaves for this date
		activeEmployees, _ := h.employeeRepo.ListActive(req.CompanyID)
		allEmployeeIDs := make([]string, len(activeEmployees))
		for i := range activeEmployees {
			allEmployeeIDs[i] = activeEmployees[i].ID
		}

		existingAttList, _ := h.attendanceRepo.ListByDateAndEmployeeIDs(date, allEmployeeIDs)
		existingAttByEmp := make(map[string]*models.Attendance, len(existingAttList))
		for i := range existingAttList {
			existingAttByEmp[existingAttList[i].EmployeeID] = &existingAttList[i]
		}

		approvedLeaves, _ := h.leaveRepo.ListApprovedByDate(date)
		onLeaveSet := make(map[string]bool, len(approvedLeaves))
		for _, l := range approvedLeaves {
			onLeaveSet[l.EmployeeID] = true
		}

		// Process punch logs - group by ZK user ID
		var logIDsToMark []string
		if len(logs) > 0 {
			totalLogs += len(logs)

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

			for _, gp := range grouped {
				punches := gp.Punches
				if len(punches) == 0 || gp.BadgeNumber == "" {
					continue
				}

				employee, ok := employeeByBadge[gp.BadgeNumber]
				if !ok {
					continue
				}
				if req.CompanyID != "" && employee.CompanyID != req.CompanyID {
					continue
				}

				logIDsToMark = append(logIDsToMark, gp.LogIDs...)

				var checkIn *string
				var checkOut *string
				var status = "present"

				var shiftID *string
				var lateMinutes int
				var shift *models.Shift
				if employee.ShiftID != nil {
					shift = getShift(*employee.ShiftID)
					if shift != nil {
						shiftID = &shift.ID
					}
				}

				isWeekendDay := false
				if shift != nil && shift.WeekendDays != "" && isWeekend(date, shift.WeekendDays) {
					isWeekendDay = true
					status = "weekend"
				}

				var shiftOutTime time.Time
				if shift != nil && shift.EndTime != "" {
					shiftOutTime, _ = time.Parse("15:04", shift.EndTime)
				}

				for _, p := range punches {
					if p.PunchType == "I" || p.PunchType == "i" {
						punchT := p.PunchTime.Format("15:04")
						punchTime, _ := time.Parse("15:04", punchT)
						if !shiftOutTime.IsZero() && punchTime.After(shiftOutTime) {
							continue
						}
						checkIn = &punchT
						break
					}
				}

				for i := len(punches) - 1; i >= 0; i-- {
					if punches[i].PunchType == "O" || punches[i].PunchType == "o" {
						t := punches[i].PunchTime.Format("15:04")
						checkOut = &t
						break
					}
				}
				if checkOut == nil && !shiftOutTime.IsZero() {
					for i := len(punches) - 1; i >= 0; i-- {
						punchT := punches[i].PunchTime.Format("15:04")
						punchTime, _ := time.Parse("15:04", punchT)
						if punchTime.After(shiftOutTime) {
							checkOut = &punchT
							break
						}
					}
				}
				if checkOut == nil && len(punches) > 1 {
					lastPunch := punches[len(punches)-1]
					t := lastPunch.PunchTime.Format("15:04")
					checkOut = &t
				}

				if !isWeekendDay {
					if checkIn == nil && checkOut == nil {
						status = "absent"
					} else if checkIn == nil {
						status = "late"
					}
				}

				if !isWeekendDay && shift != nil && checkIn != nil {
					shiftStart, _ := time.Parse("15:04", shift.StartTime)
					grace := time.Duration(shift.LateGraceMinutes) * time.Minute
					deadline := shiftStart.Add(grace)
					actualIn, err := time.Parse("15:04", *checkIn)
					if err == nil && actualIn.After(deadline) {
						lateMinutes = int(actualIn.Sub(shiftStart).Minutes())
					}
				}

				if !isWeekendDay && onLeaveSet[employee.ID] {
					status = "on_leave"
				}

				if existing, exists := existingAttByEmp[employee.ID]; exists {
					existing.CheckIn = checkIn
					existing.CheckOut = checkOut
					existing.Status = status
					existing.ShiftID = shiftID
					existing.LateMinutes = lateMinutes
					existing.PunchNumber = &gp.BadgeNumber
					if h.attendanceRepo.Update(existing) == nil {
						dayProcessed++
					}
				} else {
					att := &models.Attendance{
						EmployeeID:  employee.ID,
						CompanyID:   employee.CompanyID,
						Date:        date,
						CheckIn:     checkIn,
						CheckOut:    checkOut,
						Status:      status,
						ShiftID:     shiftID,
						LateMinutes: lateMinutes,
						PunchNumber: &gp.BadgeNumber,
					}
					if err := h.attendanceRepo.Create(att); err == nil {
						dayProcessed++
					}
					existingAttByEmp[employee.ID] = att
				}
			}
		}

		if len(logIDsToMark) > 0 {
			_ = h.dataLogRepo.MarkProcessed(logIDsToMark)
		}

		// Create attendance for active employees with NO existing record
		for _, emp := range activeEmployees {
			if existingAttByEmp[emp.ID] != nil {
				continue
			}
			var shiftID *string
			status := "absent"
			if emp.ShiftID != nil {
				shiftID = emp.ShiftID
				shift := getShift(*emp.ShiftID)
				if shift != nil && shift.WeekendDays != "" && isWeekend(date, shift.WeekendDays) {
					status = "weekend"
				}
			}
			if onLeaveSet[emp.ID] {
				status = "on_leave"
			}
			att := &models.Attendance{
				EmployeeID: emp.ID,
				CompanyID:  emp.CompanyID,
				Date:       date,
				Status:     status,
				ShiftID:    shiftID,
			}
			if err := h.attendanceRepo.Create(att); err == nil {
				dayProcessed++
			}
		}

		totalProcessed += dayProcessed
		results = append(results, map[string]interface{}{
			"date":      date,
			"processed": dayProcessed,
			"logs":      len(logs),
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"message":    fmt.Sprintf("Processed %d employee attendances across %d days from %d raw logs", totalProcessed, len(dates), totalLogs),
		"start":      startDate,
		"end":        endDate,
		"days":       len(dates),
		"total_logs": totalLogs,
		"processed":  totalProcessed,
		"details":    results,
	})
}

// DataLogStats godoc
//
// @Summary      Data log statistics
// @Description  Get count of imported data logs
// @Tags         Data Logs
// @Security     BearerAuth
// @Produce      json
// @Success      200  {object}  map[string]interface{}
// @Router       /data-logs/stats [get]
func (h *DataLogHandler) Stats(c *gin.Context) {
	total, _ := h.dataLogRepo.Count()
	today := time.Now().Format("2006-01-02")
	todayCount, _ := h.dataLogRepo.CountByDate(today)

	c.JSON(http.StatusOK, gin.H{
		"total_logs":  total,
		"today_logs":  todayCount,
		"today_date":  today,
	})
}

func strPtr(s string) *string {
	return &s
}

// DeleteAllDataLogs godoc
//
// @Summary      Delete all data logs
// @Description  Permanently delete all raw punch data logs
// @Tags         Data Logs
// @Security     BearerAuth
// @Produce      json
// @Success      200  {object}  map[string]string
// @Failure      500  {object}  map[string]string
// @Router       /data-logs/delete-all [delete]
func (h *DataLogHandler) DeleteAll(c *gin.Context) {
	if err := h.dataLogRepo.DeleteAll(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "All data logs deleted permanently"})
}