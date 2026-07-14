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

	dates, err := h.dataLogRepo.ListUnprocessedDatesInRange(startDate, endDate)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if len(dates) == 0 {
		c.JSON(http.StatusOK, gin.H{
			"message":   "No unprocessed logs found for date range",
			"start":     startDate,
			"end":       endDate,
			"processed": 0,
		})
		return
	}

	totalProcessed := 0
	totalLogs := 0
	var results []map[string]interface{}

	for _, date := range dates {
		logs, err := h.dataLogRepo.ListUnprocessedByDate(date)
		if err != nil || len(logs) == 0 {
			continue
		}
		totalLogs += len(logs)

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

		dayProcessed := 0
		var processedIDs []string
		for _, empLogs := range grouped {
			punches := empLogs.Punches
			if len(punches) == 0 || empLogs.BadgeNumber == "" {
				continue
			}

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

			var checkIn *string
			var checkOut *string
			var status = "present"

			// Look up shift for time-based check-in/out logic
			var shiftID *string
			var lateMinutes int
			var shift *models.Shift
			if employee.ShiftID != nil {
				shift, _ = h.shiftRepo.FindByID(*employee.ShiftID)
				if shift != nil {
					shiftID = &shift.ID
				}
			}

			// Determine shift out time for reference
			var shiftOutTime time.Time
			if shift != nil && shift.EndTime != "" {
				shiftOutTime, _ = time.Parse("15:04", shift.EndTime)
			}

			// Find check-in: first 'I' punch that is BEFORE or near shift end time
			// (if all punches are after shift end, no check-in)
			for _, p := range punches {
				if p.PunchType == "I" || p.PunchType == "i" {
					punchT := p.PunchTime.Format("15:04")
					punchTime, _ := time.Parse("15:04", punchT)
					// If shift out is known and punch is after shift out, skip (this is outTime)
					if !shiftOutTime.IsZero() && punchTime.After(shiftOutTime) {
						continue
					}
					checkIn = &punchT
					break
				}
			}

			// Find check-out: last 'O' punch, or last 'I' punch after shift out time
			// First try last 'O' punch
			for i := len(punches) - 1; i >= 0; i-- {
				if punches[i].PunchType == "O" || punches[i].PunchType == "o" {
					t := punches[i].PunchTime.Format("15:04")
					checkOut = &t
					break
				}
			}
			// If no 'O' punch, find last punch after shift out time (all 'I' config)
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
			// Fallback: if still no check-out and multiple punches, last punch is out
			if checkOut == nil && len(punches) > 1 {
				lastPunch := punches[len(punches)-1]
				t := lastPunch.PunchTime.Format("15:04")
				checkOut = &t
			}

			if checkIn == nil && checkOut == nil {
				status = "absent"
			} else if checkIn == nil {
				status = "late"
			}

			// Late calculation
			if shift != nil && checkIn != nil {
				shiftStart, _ := time.Parse("15:04", shift.StartTime)
				grace := time.Duration(shift.LateGraceMinutes) * time.Minute
				deadline := shiftStart.Add(grace)
				actualIn, err := time.Parse("15:04", *checkIn)
				if err == nil && actualIn.After(deadline) {
					lateMinutes = int(actualIn.Sub(shiftStart).Minutes())
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
			dayProcessed++
		}

		if len(processedIDs) > 0 {
			_ = h.dataLogRepo.MarkProcessed(processedIDs)
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