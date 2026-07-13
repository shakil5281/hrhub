package handlers

import (
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/shakil5281/hrhub-api/internal/models"
	"github.com/shakil5281/hrhub-api/internal/repository"
	"github.com/shakil5281/hrhub-api/internal/service"
)

type DataLogHandler struct {
	dataLogRepo    *repository.DataLogRepository
	attendanceRepo *repository.AttendanceRepository
	employeeRepo   *repository.EmployeeRepository
	shiftRepo      *repository.ShiftRepository
	mdbReader      *service.MDBReader
}

func NewDataLogHandler(
	dataLogRepo *repository.DataLogRepository,
	attendanceRepo *repository.AttendanceRepository,
	employeeRepo *repository.EmployeeRepository,
	shiftRepo *repository.ShiftRepository,
	mdbReader *service.MDBReader,
) *DataLogHandler {
	return &DataLogHandler{
		dataLogRepo:    dataLogRepo,
		attendanceRepo: attendanceRepo,
		employeeRepo:   employeeRepo,
		shiftRepo:      shiftRepo,
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
		log := models.DataLog{
			UserID:       rec.UserID,
			BadgeNumber:  rec.BadgeNumber,
			EmployeeName: rec.Name,
			PunchTime:    rec.PunchTimeParsed(),
			PunchType:    rec.PunchType,
			DeviceID:     rec.DeviceID,
			DeviceSN:     rec.DeviceSN,
			Date:         rec.PunchTimeParsed().Format("2006-01-02"),
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
	date := time.Now().Format("2006-01-02")
	var req ProcessRequest
	if err := c.ShouldBindJSON(&req); err == nil && req.Date != "" {
		date = req.Date
	}

	logs, err := h.dataLogRepo.ListUnprocessedByDate(date)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if len(logs) == 0 {
		c.JSON(http.StatusOK, gin.H{"message": "No unprocessed logs found for date", "date": date, "processed": 0})
		return
	}

	// Group logs by user
	type employeeLogs struct {
		EmployeeName string
		BadgeNumber  string
		Punches      []models.DataLog
		LogIDs       []string
	}
	grouped := make(map[int]*employeeLogs)

	for _, log := range logs {
		if grouped[log.UserID] == nil {
			grouped[log.UserID] = &employeeLogs{
				EmployeeName: log.EmployeeName,
				BadgeNumber:  log.BadgeNumber,
			}
		}
		grouped[log.UserID].Punches = append(grouped[log.UserID].Punches, log)
		grouped[log.UserID].LogIDs = append(grouped[log.UserID].LogIDs, log.ID)
	}

	processed := 0
	var processedIDs []string
	for _, empLogs := range grouped {
		punches := empLogs.Punches
		if len(punches) == 0 || empLogs.BadgeNumber == "" {
			continue
		}

		// Look up employee by badge number -> employee_code, then try punch_number
		employee, err := h.employeeRepo.FindByEmployeeCode(empLogs.BadgeNumber)
		if err != nil {
			employee, err = h.employeeRepo.FindByPunchNumber(empLogs.BadgeNumber)
			if err != nil {
				continue
			}
		}
		if req.CompanyID != "" && employee.CompanyID != req.CompanyID {
			continue
		}

		// Calculate attendance windows based on assigned shift
		var checkIn *string
		var checkOut *string
		var status = "present"

		// Process first 'I' punch as check-in (basic logic)
		for _, p := range punches {
			if p.PunchType == "I" || p.PunchType == "i" {
				t := p.PunchTime.Format("15:04")
				checkIn = &t
				break
			}
		}

		// Process last 'O' punch as check-out (basic logic)
		for i := len(punches) - 1; i >= 0; i-- {
			if punches[i].PunchType == "O" || punches[i].PunchType == "o" {
				t := punches[i].PunchTime.Format("15:04")
				checkOut = &t
				break
			}
		}

		// Determine status
		if status == "present" {
			if checkIn == nil && checkOut == nil {
				status = "absent"
			} else if checkIn == nil {
				status = "late"
			}
		}

		// Look up employee shift for late calculation and window
		var shiftID *string
		var lateMinutes int
		if employee.ShiftID != nil {
			shift, err := h.shiftRepo.FindByID(*employee.ShiftID)
			if err == nil && shift != nil {
				shiftID = &shift.ID
				shiftStart, _ := time.Parse("15:04", shift.StartTime)
				grace := time.Duration(shift.LateGraceMinutes) * time.Minute
				deadline := shiftStart.Add(grace)
				if checkIn != nil {
					actualIn, err := time.Parse("15:04", *checkIn)
					if err == nil && actualIn.After(deadline) {
						lateMinutes = int(actualIn.Sub(shiftStart).Minutes())
					}
				}
			}
		}

		attendance := &models.Attendance{
			EmployeeID:  employee.ID,
			CompanyID:   employee.CompanyID,
			Date:        date,
			CheckIn:     checkIn,
			CheckOut:    checkOut,
			Status:      status,
			ShiftID:     shiftID,
			LateMinutes: lateMinutes,
			PunchNumber: &empLogs.BadgeNumber,
		}

		if err := h.attendanceRepo.Create(attendance); err != nil {
			continue
		}
		processedIDs = append(processedIDs, empLogs.LogIDs...)
		processed++
	}

	// Mark successful logs as processed
	if len(processedIDs) > 0 {
		_ = h.dataLogRepo.MarkProcessed(processedIDs)
	}

	c.JSON(http.StatusOK, gin.H{
		"message":    fmt.Sprintf("Processed %d employee attendances from %d raw logs", processed, len(logs)),
		"date":       date,
		"total_logs": len(logs),
		"processed":  processed,
		"skipped":    len(logs) - len(processedIDs),
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