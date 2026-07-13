package handlers

import (
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/shakil5281/hrhub-api/internal/models"
	"github.com/shakil5281/hrhub-api/internal/repository"
)

type AttendanceHandler struct {
	attendanceRepo *repository.AttendanceRepository
}

func NewAttendanceHandler(attendanceRepo *repository.AttendanceRepository) *AttendanceHandler {
	return &AttendanceHandler{attendanceRepo: attendanceRepo}
}

type CreateAttendanceRequest struct {
	EmployeeID string `json:"employee_id" binding:"required"`
	CompanyID  string `json:"company_id" binding:"required"`
	ShiftID    string `json:"shift_id"`
	Date       string `json:"date" binding:"required"`
	CheckIn    string `json:"check_in"`
	CheckOut   string `json:"check_out"`
	Status     string `json:"status"`
}

type ClockInRequest struct {
	EmployeeID string `json:"employee_id" binding:"required"`
	ShiftID    string `json:"shift_id"`
}

type ClockOutRequest struct {
	EmployeeID string `json:"employee_id" binding:"required"`
}

// ListAttendances godoc
//
// @Summary      List attendances
// @Description  Get attendances by date (default: today)
// @Tags         Attendance
// @Security     BearerAuth
// @Produce      json
// @Param        date query string false "Date (YYYY-MM-DD)"
// @Success      200  {array}   map[string]interface{}
// @Failure      401  {object}  map[string]string
// @Failure      500  {object}  map[string]string
// @Router       /attendance [get]
func (h *AttendanceHandler) List(c *gin.Context) {
	date := c.DefaultQuery("date", time.Now().Format("2006-01-02"))
	attendances, err := h.attendanceRepo.ListByDate(date)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, attendances)
}

// GetAttendance godoc
//
// @Summary      Get attendance by ID
// @Description  Get an attendance record by its ID
// @Tags         Attendance
// @Security     BearerAuth
// @Produce      json
// @Param        id   path     string true "Attendance ID"
// @Success      200  {object}  map[string]interface{}
// @Failure      401  {object}  map[string]string
// @Failure      404  {object}  map[string]string
// @Router       /attendance/{id} [get]
func (h *AttendanceHandler) GetByID(c *gin.Context) {
	id := c.Param("id")
	attendance, err := h.attendanceRepo.FindByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "attendance record not found"})
		return
	}
	c.JSON(http.StatusOK, attendance)
}

// CreateAttendance godoc
//
// @Summary      Create attendance
// @Description  Create a new attendance record
// @Tags         Attendance
// @Security     BearerAuth
// @Accept       json
// @Produce      json
// @Param        request body CreateAttendanceRequest true "Attendance details"
// @Success      201  {object}  map[string]interface{}
// @Failure      400  {object}  map[string]string
// @Failure      401  {object}  map[string]string
// @Router       /attendance [post]
func (h *AttendanceHandler) Create(c *gin.Context) {
	var req CreateAttendanceRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	status := req.Status
	if status == "" {
		status = "present"
	}

	userID := c.GetString("user_id")
	var checkIn, checkOut *string
	if req.CheckIn != "" {
		checkIn = &req.CheckIn
	}
	if req.CheckOut != "" {
		checkOut = &req.CheckOut
	}

	attendance := &models.Attendance{
		EmployeeID: req.EmployeeID,
		CompanyID:  req.CompanyID,
		Date:       req.Date,
		CheckIn:    checkIn,
		CheckOut:   checkOut,
		Status:     status,
		CreatedBy:  &userID,
	}

	if req.ShiftID != "" {
		attendance.ShiftID = &req.ShiftID
	}

	if err := h.attendanceRepo.Create(attendance); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, attendance)
}

// UpdateAttendance godoc
//
// @Summary      Update attendance
// @Description  Update an attendance record
// @Tags         Attendance
// @Security     BearerAuth
// @Accept       json
// @Produce      json
// @Param        id      path     string true "Attendance ID"
// @Param        request body CreateAttendanceRequest true "Updated attendance details"
// @Success      200  {object}  map[string]interface{}
// @Failure      400  {object}  map[string]string
// @Failure      401  {object}  map[string]string
// @Failure      404  {object}  map[string]string
// @Router       /attendance/{id} [put]
func (h *AttendanceHandler) Update(c *gin.Context) {
	id := c.Param("id")
	attendance, err := h.attendanceRepo.FindByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "attendance record not found"})
		return
	}

	var req CreateAttendanceRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userID := c.GetString("user_id")
	attendance.EmployeeID = req.EmployeeID
	attendance.CompanyID = req.CompanyID
	attendance.Date = req.Date
	attendance.Status = req.Status
	attendance.UpdatedBy = &userID

	if req.CheckIn != "" {
		attendance.CheckIn = &req.CheckIn
	}
	if req.CheckOut != "" {
		attendance.CheckOut = &req.CheckOut
	}
	if req.ShiftID != "" {
		attendance.ShiftID = &req.ShiftID
	}

	if err := h.attendanceRepo.Update(attendance); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, attendance)
}

// DeleteAttendance godoc
//
// @Summary      Delete attendance
// @Description  Soft delete an attendance record
// @Tags         Attendance
// @Security     BearerAuth
// @Produce      json
// @Param        id   path     string true "Attendance ID"
// @Success      200  {object}  map[string]string
// @Failure      401  {object}  map[string]string
// @Failure      404  {object}  map[string]string
// @Router       /attendance/{id} [delete]
func (h *AttendanceHandler) Delete(c *gin.Context) {
	id := c.Param("id")
	if _, err := h.attendanceRepo.FindByID(id); err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "attendance record not found"})
		return
	}

	if err := h.attendanceRepo.Delete(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "attendance record deleted"})
}

// ListJobCard godoc
//
// @Summary      Job card data
// @Description  Get attendance records for job card with advanced filters
// @Tags         Attendance
// @Security     BearerAuth
// @Produce      json
// @Param        start_date    query string false "Start date (YYYY-MM-DD)"
// @Param        end_date      query string false "End date (YYYY-MM-DD)"
// @Param        company_id    query string false "Filter by company"
// @Param        employee_id   query string false "Filter by employee"
// @Param        department_id query string false "Filter by department"
// @Param        status        query string false "Filter by status (present|late|absent|half-day)"
// @Success      200  {object}  map[string]interface{}
// @Failure      500  {object}  map[string]string
// @Router       /attendance/job-card [get]
func (h *AttendanceHandler) ListJobCard(c *gin.Context) {
	startDate := c.DefaultQuery("start_date", time.Now().Format("2006-01-02"))
	endDate := c.DefaultQuery("end_date", time.Now().Format("2006-01-02"))
	companyID := c.Query("company_id")
	employeeID := c.Query("employee_id")
	departmentID := c.Query("department_id")
	status := c.Query("status")

	attendances, err := h.attendanceRepo.ListJobCard(startDate, endDate, companyID, employeeID, departmentID, status)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"attendances": attendances,
		"total":       len(attendances),
		"start_date":  startDate,
		"end_date":    endDate,
	})
}

// ClockIn godoc
//
// @Summary      Clock in
// @Description  Mark clock-in for an employee today
// @Tags         Attendance
// @Security     BearerAuth
// @Accept       json
// @Produce      json
// @Param        request body ClockInRequest true "Clock-in details"
// @Success      201  {object}  map[string]interface{}
// @Failure      400  {object}  map[string]string
// @Failure      401  {object}  map[string]string
// @Failure      409  {object}  map[string]string
// @Router       /attendance/clock-in [post]
func (h *AttendanceHandler) ClockIn(c *gin.Context) {
	var req ClockInRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	today := time.Now().Format("2006-01-02")
	now := time.Now().Format("15:04")

	existing, err := h.attendanceRepo.FindByEmployeeAndDate(req.EmployeeID, today)
	if err == nil && existing != nil && existing.ID != "" {
		c.JSON(http.StatusConflict, gin.H{"error": "already clocked in today"})
		return
	}

	userID := c.GetString("user_id")
	attendance := &models.Attendance{
		EmployeeID: req.EmployeeID,
		Date:       today,
		CheckIn:    &now,
		Status:     "present",
		CreatedBy:  &userID,
	}

	if req.ShiftID != "" {
		attendance.ShiftID = &req.ShiftID
	}

	if err := h.attendanceRepo.Create(attendance); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, attendance)
}

// ClockOut godoc
//
// @Summary      Clock out
// @Description  Mark clock-out for an employee today
// @Tags         Attendance
// @Security     BearerAuth
// @Accept       json
// @Produce      json
// @Param        request body ClockOutRequest true "Clock-out details"
// @Success      200  {object}  map[string]interface{}
// @Failure      400  {object}  map[string]string
// @Failure      401  {object}  map[string]string
// @Failure      404  {object}  map[string]string
// @Router       /attendance/clock-out [post]
func (h *AttendanceHandler) ClockOut(c *gin.Context) {
	var req ClockOutRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	today := time.Now().Format("2006-01-02")
	now := time.Now().Format("15:04")

	attendance, err := h.attendanceRepo.FindByEmployeeAndDate(req.EmployeeID, today)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "no clock-in found for today"})
		return
	}

	if attendance.CheckOut != nil {
		c.JSON(http.StatusConflict, gin.H{"error": "already clocked out today"})
		return
	}

	userID := c.GetString("user_id")
	attendance.CheckOut = &now
	attendance.UpdatedBy = &userID

	// Calculate total hours
	if attendance.CheckIn != nil {
		checkInTime, _ := time.Parse("15:04", *attendance.CheckIn)
		checkOutTime, _ := time.Parse("15:04", now)
		duration := checkOutTime.Sub(checkInTime)
		hours := int(duration.Hours())
		minutes := int(duration.Minutes()) % 60
		totalHours := fmt.Sprintf("%02d:%02d", hours, minutes)
		attendance.TotalHours = &totalHours
	}

	if err := h.attendanceRepo.Update(attendance); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, attendance)
}
