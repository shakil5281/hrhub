package handlers

import (
	"errors"
	"fmt"
	"net/http"
	"os"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/jung-kurt/gofpdf"
	"github.com/shakil5281/peoplehub-api/internal/database"
	"github.com/shakil5281/peoplehub-api/internal/models"
	"github.com/shakil5281/peoplehub-api/internal/repository"
	"github.com/shakil5281/peoplehub-api/internal/utils"
	"gorm.io/gorm"
)

type LeaveHandler struct {
	leaveRepo      *repository.LeaveRepository
	employeeRepo   *repository.EmployeeRepository
	attendanceRepo *repository.AttendanceRepository
}

func NewLeaveHandler(leaveRepo *repository.LeaveRepository, employeeRepo *repository.EmployeeRepository, attendanceRepo *repository.AttendanceRepository) *LeaveHandler {
	return &LeaveHandler{leaveRepo: leaveRepo, employeeRepo: employeeRepo, attendanceRepo: attendanceRepo}
}

// --- Request types ---

type CreateLeaveTypeRequest struct {
	CompanyID        string `json:"company_id" binding:"required"`
	Name             string `json:"name" binding:"required"`
	Code             string `json:"code" binding:"required"`
	TotalDays        int    `json:"total_days" binding:"required"`
	CarryForwardDays int    `json:"carry_forward_days"`
	ApplicableGender string `json:"applicable_gender"`
}

type UpdateLeaveTypeRequest struct {
	Name             string `json:"name" binding:"required"`
	TotalDays        int    `json:"total_days" binding:"required"`
	CarryForwardDays int    `json:"carry_forward_days"`
	ApplicableGender string `json:"applicable_gender"`
	Status           string `json:"status"`
}

type ApplyLeaveRequest struct {
	CompanyID   string `json:"company_id" binding:"required"`
	EmployeeID  string `json:"employee_id" binding:"required"`
	LeaveTypeID string `json:"leave_type_id" binding:"required"`
	FromDate    string `json:"from_date" binding:"required"`
	ToDate      string `json:"to_date" binding:"required"`
	Reason      string `json:"reason"`
}

type UpdateLeaveRequest struct {
	LeaveTypeID string `json:"leave_type_id"`
	FromDate    string `json:"from_date"`
	ToDate      string `json:"to_date"`
	TotalDays   int    `json:"total_days"`
	Reason      string `json:"reason"`
}

type RejectLeaveRequest struct {
	RejectionReason string `json:"rejection_reason" binding:"required"`
}

// --- Leave Types ---

// ListLeaveTypes godoc
//
// @Summary      List leave types
// @Description  Get all leave types
// @Tags         Leave Types
// @Security     BearerAuth
// @Produce      json
// @Param        company_id query string false "Filter by company"
// @Param        page       query int    false "Page number (default: 1)"
// @Param        limit      query int    false "Page size (default: 20, max: 100)"
// @Success      200  {object}  utils.PaginatedResponse
// @Failure      401  {object}  map[string]string
// @Failure      500  {object}  map[string]string
// @Router       /leave-types [get]
func (h *LeaveHandler) ListLeaveTypes(c *gin.Context) {
	companyID := c.Query("company_id")
	p := utils.ParsePagination(c)
	list, total, err := h.leaveRepo.ListLeaveTypes(companyID, p.Page, p.Limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, utils.NewPaginatedResponse(list, total, p))
}

// GetLeaveType godoc
//
// @Summary      Get leave type by ID
// @Tags         Leave Types
// @Security     BearerAuth
// @Produce      json
// @Param        id path string true "Leave Type ID"
// @Success      200  {object}  map[string]interface{}
// @Failure      404  {object}  map[string]string
// @Router       /leave-types/{id} [get]
func (h *LeaveHandler) GetLeaveType(c *gin.Context) {
	id := c.Param("id")
	lt, err := h.leaveRepo.FindLeaveTypeByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "leave type not found"})
		return
	}
	c.JSON(http.StatusOK, lt)
}

// CreateLeaveType godoc
//
// @Summary      Create leave type
// @Tags         Leave Types
// @Security     BearerAuth
// @Accept       json
// @Produce      json
// @Param        request body CreateLeaveTypeRequest true "Leave type details"
// @Success      201  {object}  map[string]interface{}
// @Failure      400  {object}  map[string]string
// @Router       /leave-types [post]
func (h *LeaveHandler) CreateLeaveType(c *gin.Context) {
	var req CreateLeaveTypeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	userID := c.GetString("user_id")

	lt := &models.LeaveType{
		CompanyID:        req.CompanyID,
		Name:             req.Name,
		Code:             req.Code,
		TotalDays:        req.TotalDays,
		CarryForwardDays: req.CarryForwardDays,
		ApplicableGender: req.ApplicableGender,
		Status:           "active",
		CreatedBy:        &userID,
	}
	if lt.ApplicableGender == "" {
		lt.ApplicableGender = "All"
	}

	if err := h.leaveRepo.CreateLeaveType(lt); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, lt)
}

// UpdateLeaveType godoc
//
// @Summary      Update leave type
// @Tags         Leave Types
// @Security     BearerAuth
// @Accept       json
// @Produce      json
// @Param        id path string true "Leave Type ID"
// @Param        request body UpdateLeaveTypeRequest true "Updated leave type"
// @Success      200  {object}  map[string]interface{}
// @Failure      400  {object}  map[string]string
// @Failure      404  {object}  map[string]string
// @Router       /leave-types/{id} [put]
func (h *LeaveHandler) UpdateLeaveType(c *gin.Context) {
	id := c.Param("id")
	lt, err := h.leaveRepo.FindLeaveTypeByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "leave type not found"})
		return
	}
	var req UpdateLeaveTypeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	userID := c.GetString("user_id")

	lt.Name = req.Name
	lt.TotalDays = req.TotalDays
	lt.CarryForwardDays = req.CarryForwardDays
	if req.ApplicableGender != "" {
		lt.ApplicableGender = req.ApplicableGender
	}
	if req.Status != "" {
		lt.Status = req.Status
	}
	lt.UpdatedBy = &userID

	if err := h.leaveRepo.UpdateLeaveType(lt); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, lt)
}

// DeleteLeaveType godoc
//
// @Summary      Delete leave type
// @Tags         Leave Types
// @Security     BearerAuth
// @Produce      json
// @Param        id path string true "Leave Type ID"
// @Success      200  {object}  map[string]string
// @Failure      404  {object}  map[string]string
// @Router       /leave-types/{id} [delete]
func (h *LeaveHandler) DeleteLeaveType(c *gin.Context) {
	id := c.Param("id")
	if _, err := h.leaveRepo.FindLeaveTypeByID(id); err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "leave type not found"})
		return
	}
	if err := h.leaveRepo.DeleteLeaveType(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "leave type deleted"})
}

// --- Leave Applications ---

// ListLeaves godoc
//
// @Summary      List leave applications
// @Description  Get all leave applications with optional filters
// @Tags         Leaves
// @Security     BearerAuth
// @Produce      json
// @Param        company_id    query string false "Filter by company"
// @Param        department_id query string false "Filter by department"
// @Param        employee_id   query string false "Filter by employee"
// @Param        status        query string false "Filter by status (pending|approved|rejected|cancelled)"
// @Param        from_date     query string false "Start date (YYYY-MM-DD)"
// @Param        to_date       query string false "End date (YYYY-MM-DD)"
// @Param        page          query int    false "Page number (default: 1)"
// @Param        limit         query int    false "Page size (default: 20, max: 100)"
// @Success      200  {object}  utils.PaginatedResponse
// @Failure      401  {object}  map[string]string
// @Failure      500  {object}  map[string]string
// @Router       /leaves [get]
func (h *LeaveHandler) ListLeaves(c *gin.Context) {
	companyID := c.Query("company_id")
	departmentID := c.Query("department_id")
	employeeID := c.Query("employee_id")
	status := c.Query("status")
	fromDate := c.Query("from_date")
	toDate := c.Query("to_date")

	p := utils.ParsePagination(c)
	list, total, err := h.leaveRepo.ListLeaves(companyID, departmentID, employeeID, status, fromDate, toDate, p.Page, p.Limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, utils.NewPaginatedResponse(list, total, p))
}

// GetLeave godoc
//
// @Summary      Get leave by ID
// @Tags         Leaves
// @Security     BearerAuth
// @Produce      json
// @Param        id path string true "Leave ID"
// @Success      200  {object}  map[string]interface{}
// @Failure      404  {object}  map[string]string
// @Router       /leaves/{id} [get]
func (h *LeaveHandler) GetLeave(c *gin.Context) {
	id := c.Param("id")
	l, err := h.leaveRepo.FindLeaveByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "leave not found"})
		return
	}
	c.JSON(http.StatusOK, l)
}

// ApplyLeave godoc
//
// @Summary      Apply for leave
// @Description  Submit a new leave application. Validates allocation balance.
// @Tags         Leaves
// @Security     BearerAuth
// @Accept       json
// @Produce      json
// @Param        request body ApplyLeaveRequest true "Leave application"
// @Success      201  {object}  map[string]interface{}
// @Failure      400  {object}  map[string]string
// @Failure      409  {object}  map[string]string
// @Router       /leaves [post]
func (h *LeaveHandler) ApplyLeave(c *gin.Context) {
	var req ApplyLeaveRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	userID := c.GetString("user_id")

	from, err := time.Parse("2006-01-02", req.FromDate)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid from_date"})
		return
	}
	to, err := time.Parse("2006-01-02", req.ToDate)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid to_date"})
		return
	}
	if to.Before(from) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "to_date must be after from_date"})
		return
	}
	totalDays := int(to.Sub(from).Hours()/24) + 1

	// Check allocation
	year := from.Year()
	alloc, err := h.leaveRepo.FindAllocation(req.EmployeeID, req.LeaveTypeID, year)
	if err != nil {
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		alloc = nil
	} else {
		remaining := alloc.TotalDays - alloc.UsedDays - alloc.PendingDays
		if remaining < totalDays {
			c.JSON(http.StatusConflict, gin.H{"error": "insufficient leave balance", "remaining": remaining, "requested": totalDays})
			return
		}
	}

	l := &models.Leave{
		CompanyID:   req.CompanyID,
		EmployeeID:  req.EmployeeID,
		LeaveTypeID: req.LeaveTypeID,
		FromDate:    req.FromDate,
		ToDate:      req.ToDate,
		TotalDays:   totalDays,
		Reason:      req.Reason,
		Status:      "pending",
		CreatedBy:   &userID,
	}

	// Wrap leave creation + allocation update in a transaction
	err = database.DB.Transaction(func(tx *gorm.DB) error {
		leaveTx := h.leaveRepo.WithTx(tx)
		if err := leaveTx.CreateLeave(l); err != nil {
			return err
		}
		if alloc != nil {
			alloc.PendingDays += totalDays
			if err := leaveTx.UpsertAllocation(alloc); err != nil {
				return err
			}
		}
		return nil
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, l)
}

// UpdateLeave godoc
//
// @Summary      Update leave application
// @Tags         Leaves
// @Security     BearerAuth
// @Accept       json
// @Produce      json
// @Param        id path string true "Leave ID"
// @Param        request body UpdateLeaveRequest true "Updated leave"
// @Success      200  {object}  map[string]interface{}
// @Failure      400  {object}  map[string]string
// @Failure      404  {object}  map[string]string
// @Router       /leaves/{id} [put]
func (h *LeaveHandler) UpdateLeave(c *gin.Context) {
	id := c.Param("id")
	l, err := h.leaveRepo.FindLeaveByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "leave not found"})
		return
	}
	if l.Status != "pending" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "can only update pending leaves"})
		return
	}

	var req UpdateLeaveRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	userID := c.GetString("user_id")

	if req.LeaveTypeID != "" {
		l.LeaveTypeID = req.LeaveTypeID
	}
	if req.FromDate != "" {
		l.FromDate = req.FromDate
	}
	if req.ToDate != "" {
		l.ToDate = req.ToDate
	}
	if req.TotalDays > 0 {
		l.TotalDays = req.TotalDays
	}
	if req.Reason != "" {
		l.Reason = req.Reason
	}
	l.UpdatedBy = &userID

	if err := h.leaveRepo.UpdateLeave(l); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, l)
}

// DeleteLeave godoc
//
// @Summary      Permanently delete leave application
// @Description  Hard delete a leave regardless of status and revert related attendance
// @Tags         Leaves
// @Security     BearerAuth
// @Produce      json
// @Param        id path string true "Leave ID"
// @Success      200  {object}  map[string]string
// @Failure      404  {object}  map[string]string
// @Failure      500  {object}  map[string]string
// @Router       /leaves/{id} [delete]
func (h *LeaveHandler) DeleteLeave(c *gin.Context) {
	id := c.Param("id")
	l, err := h.leaveRepo.FindLeaveByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "leave not found"})
		return
	}

	err = database.DB.Transaction(func(tx *gorm.DB) error {
		leaveTx := h.leaveRepo.WithTx(tx)
		attTx := h.attendanceRepo.WithTx(tx)

		// Revert leave allocation
		year := time.Now().Year()
		if yr, err := strconv.Atoi(l.FromDate[:4]); err == nil {
			year = yr
		}
		alloc, err := leaveTx.FindAllocation(l.EmployeeID, l.LeaveTypeID, year)
		if err == nil && alloc != nil {
			switch l.Status {
			case "approved":
				alloc.UsedDays -= l.TotalDays
				if alloc.UsedDays < 0 {
					alloc.UsedDays = 0
				}
			case "pending":
				alloc.PendingDays -= l.TotalDays
				if alloc.PendingDays < 0 {
					alloc.PendingDays = 0
				}
			}
			if err := leaveTx.UpsertAllocation(alloc); err != nil {
				return err
			}
		}

		// Remove on_leave attendance marker for the leave period
		if err := attTx.ClearOnLeaveStatus(l.EmployeeID, l.FromDate, l.ToDate); err != nil {
			return err
		}

		// Hard delete the leave
		return leaveTx.HardDeleteLeave(id)
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "leave deleted"})
}

// ApproveLeave godoc
//
// @Summary      Approve leave application
// @Tags         Leaves
// @Security     BearerAuth
// @Produce      json
// @Param        id path string true "Leave ID"
// @Success      200  {object}  map[string]interface{}
// @Failure      400  {object}  map[string]string
// @Failure      404  {object}  map[string]string
// @Router       /leaves/{id}/approve [put]
func (h *LeaveHandler) ApproveLeave(c *gin.Context) {
	id := c.Param("id")
	l, err := h.leaveRepo.FindLeaveByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "leave not found"})
		return
	}
	if l.Status != "pending" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "leave is not pending"})
		return
	}

	userID := c.GetString("user_id")
	now := time.Now()
	l.Status = "approved"
	l.ApprovedBy = &userID
	l.ApprovedAt = &now

	// Wrap leave approval + allocation + attendance update in a transaction
	err = database.DB.Transaction(func(tx *gorm.DB) error {
		leaveTx := h.leaveRepo.WithTx(tx)
		attTx := h.attendanceRepo.WithTx(tx)

		if err := leaveTx.UpdateLeave(l); err != nil {
			return err
		}

		// Move pending → used in allocation
		year := time.Now().Year()
		alloc, err := leaveTx.FindAllocation(l.EmployeeID, l.LeaveTypeID, year)
		if err == nil && alloc != nil {
			alloc.PendingDays -= l.TotalDays
			alloc.UsedDays += l.TotalDays
			if err := leaveTx.UpsertAllocation(alloc); err != nil {
				return err
			}
		}

		// Mark attendance as on_leave for the leave period
		if err := attTx.UpdateStatusByEmployeeAndDateRange(l.EmployeeID, l.FromDate, l.ToDate, "on_leave"); err != nil {
			return err
		}
		return nil
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, l)
}

// RejectLeave godoc
//
// @Summary      Reject leave application
// @Tags         Leaves
// @Security     BearerAuth
// @Accept       json
// @Produce      json
// @Param        id path string true "Leave ID"
// @Param        request body RejectLeaveRequest true "Rejection reason"
// @Success      200  {object}  map[string]interface{}
// @Failure      400  {object}  map[string]string
// @Failure      404  {object}  map[string]string
// @Router       /leaves/{id}/reject [put]
func (h *LeaveHandler) RejectLeave(c *gin.Context) {
	id := c.Param("id")
	l, err := h.leaveRepo.FindLeaveByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "leave not found"})
		return
	}
	if l.Status != "pending" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "leave is not pending"})
		return
	}

	var req RejectLeaveRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userID := c.GetString("user_id")
	l.Status = "rejected"
	l.ApprovedBy = &userID
	l.RejectionReason = req.RejectionReason

	// Wrap leave rejection + allocation update in a transaction
	err = database.DB.Transaction(func(tx *gorm.DB) error {
		leaveTx := h.leaveRepo.WithTx(tx)
		if err := leaveTx.UpdateLeave(l); err != nil {
			return err
		}

		// Decrement pending in allocation
		year := time.Now().Year()
		alloc, err := leaveTx.FindAllocation(l.EmployeeID, l.LeaveTypeID, year)
		if err == nil && alloc != nil {
			alloc.PendingDays -= l.TotalDays
			if alloc.PendingDays < 0 {
				alloc.PendingDays = 0
			}
			if err := leaveTx.UpsertAllocation(alloc); err != nil {
				return err
			}
		}
		return nil
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, l)
}

// --- Leave Balance ---

// ListLeaveBalance godoc
//
// @Summary      Get leave balance
// @Description  Get leave balance for employees
// @Tags         Leave Balance
// @Security     BearerAuth
// @Produce      json
// @Param        employee_id query string false "Filter by employee"
// @Param        year        query int    false "Year (default: current)"
// @Param        page        query int    false "Page number (default: 1)"
// @Param        limit       query int    false "Page size (default: 20, max: 100)"
// @Success      200  {object}  utils.PaginatedResponse
// @Failure      500  {object}  map[string]string
// @Router       /leave-balance [get]
func (h *LeaveHandler) ListLeaveBalance(c *gin.Context) {
	employeeID := c.Query("employee_id")
	yearStr := c.DefaultQuery("year", strconv.Itoa(time.Now().Year()))
	year, _ := strconv.Atoi(yearStr)
	if year == 0 {
		year = time.Now().Year()
	}

	p := utils.ParsePagination(c)
	list, total, err := h.leaveRepo.ListAllocations(employeeID, year, p.Page, p.Limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	type BalanceEntry struct {
		EmployeeID  string `json:"employee_id"`
		LeaveTypeID string `json:"leave_type_id"`
		LeaveType   string `json:"leave_type"`
		Year        int    `json:"year"`
		Total       int    `json:"total"`
		Used        int    `json:"used"`
		Pending     int    `json:"pending"`
		Remaining   int    `json:"remaining"`
	}

	var result []BalanceEntry
	for _, a := range list {
		result = append(result, BalanceEntry{
			EmployeeID:  a.EmployeeID,
			LeaveTypeID: a.LeaveTypeID,
			LeaveType:   a.LeaveType.Name,
			Year:        a.Year,
			Total:       a.TotalDays,
			Used:        a.UsedDays,
			Pending:     a.PendingDays,
			Remaining:   a.TotalDays - a.UsedDays - a.PendingDays,
		})
	}
	c.JSON(http.StatusOK, utils.NewPaginatedResponse(result, total, p))
}

// --- Monthly Report ---

// MonthlyLeaveReport godoc
//
// @Summary      Monthly leave report
// @Description  Get monthly leave report grouped by department
// @Tags         Leave Reports
// @Security     BearerAuth
// @Produce      json
// @Param        month       query int    false "Month (1-12, default: current)"
// @Param        year        query int    false "Year (default: current)"
// @Param        company_id  query string false "Filter by company"
// @Param        department_id query string false "Filter by department"
// @Success      200  {array}   map[string]interface{}
// @Failure      500  {object}  map[string]string
// @Router       /leave-reports/monthly [get]
func (h *LeaveHandler) MonthlyLeaveReport(c *gin.Context) {
	monthStr := c.DefaultQuery("month", strconv.Itoa(int(time.Now().Month())))
	yearStr := c.DefaultQuery("year", strconv.Itoa(time.Now().Year()))
	companyID := c.Query("company_id")
	departmentID := c.Query("department_id")

	month, _ := strconv.Atoi(monthStr)
	year, _ := strconv.Atoi(yearStr)
	if month < 1 || month > 12 {
		month = int(time.Now().Month())
	}
	if year == 0 {
		year = time.Now().Year()
	}

	results, err := h.leaveRepo.MonthlyReport(month, year, companyID, departmentID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, results)
}

// ExportLeaveFormPDF godoc
//
// @Summary      Export single leave application as PDF form
// @Description  Generate a leave application form PDF for a specific leave
// @Tags         Leaves
// @Security     BearerAuth
// @Produce      application/pdf
// @Param        id path string true "Leave ID"
// @Success      200  {file}  binary
// @Failure      404  {object}  map[string]string
// @Failure      500  {object}  map[string]string
// @Router       /leaves/{id}/export/pdf [get]
func (h *LeaveHandler) ExportLeaveFormPDF(c *gin.Context) {
	id := c.Param("id")
	var leave models.Leave
	if err := database.DB.
		Preload("Company").
		Preload("Employee.Department").
		Preload("Employee.DesignationRef").
		Preload("LeaveType").
		Where("id = ? AND deleted_at IS NULL", id).
		First(&leave).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "leave not found"})
		return
	}

	pdf := gofpdf.New("P", "mm", "A4", "")
	pdf.SetMargins(20, 15, 20)
	pdf.AddPage()

	// Try to load font for Bangla support
	banglaFont := ""
	// Prefer Nirmala (true Unicode Bengali) then SutonnyMJ
	fontCandidates := []struct {
		path string
		bold string
	}{
		{"C:\\Windows\\Fonts\\Nirmala.ttf", "C:\\Windows\\Fonts\\Nirmala.ttf"},
		{"C:\\Windows\\Fonts\\SutonnyMJ.ttf", "C:\\Windows\\Fonts\\SutonnyMJ-Bold.ttf"},
	}
	for _, f := range fontCandidates {
		if _, err := os.Stat(f.path); err == nil {
			pdf.AddUTF8Font("Bangla", "", f.path)
			pdf.AddUTF8Font("Bangla", "B", f.bold)
			banglaFont = "Bangla"
			break
		}
	}
	if banglaFont == "" {
		banglaFont = "Arial"
	}

	// Helper functions
	fieldRow := func(label, value string) {
		pdf.SetFont(banglaFont, "B", 10)
		pdf.CellFormat(50, 7, label, "", 0, "L", false, 0, "")
		pdf.SetFont(banglaFont, "", 10)
		pdf.CellFormat(0, 7, value, "", 1, "L", false, 0, "")
		pdf.Ln(1)
	}

	sectionHeader := func(title string) {
		pdf.Ln(3)
		pdf.SetFont(banglaFont, "B", 11)
		pdf.SetFillColor(240, 245, 255)
		pdf.SetTextColor(40, 40, 40)
		pdf.CellFormat(0, 8, "  "+title, "", 1, "L", true, 0, "")
		pdf.SetTextColor(0, 0, 0)
		pdf.Ln(2)
	}

	// --- Company Header ---
	companyName := ""
	if leave.Company.CompanyNameBn != "" {
		companyName = leave.Company.CompanyNameBn
	} else {
		companyName = leave.Company.CompanyNameEn
	}
	companyAddress := ""
	if leave.Company.AddressBn != "" {
		companyAddress = leave.Company.AddressBn
	} else {
		companyAddress = leave.Company.AddressEn
	}

	// Company name (center)
	pdf.SetFont(banglaFont, "B", 16)
	pdf.CellFormat(0, 10, companyName, "", 1, "C", false, 0, "")

	// Address (center)
	pdf.SetFont(banglaFont, "", 8)
	pdf.SetTextColor(100, 100, 100)
	pdf.CellFormat(0, 5, companyAddress, "", 1, "C", false, 0, "")
	pdf.SetTextColor(0, 0, 0)

	// Date on the right side
	pdf.Ln(2)
	pdf.SetFont(banglaFont, "", 9)
	dateStr := time.Now().Format("2006-01-02")
	rightX := 190.0 - pdf.GetStringWidth("ZvwiL: "+dateStr)
	pdf.SetXY(20, pdf.GetY())
	pdf.SetX(rightX)
	pdf.CellFormat(0, 6, "ZvwiL: "+dateStr, "", 1, "R", false, 0, "")

	// Separator line
	pdf.SetDrawColor(68, 114, 196)
	pdf.SetLineWidth(0.8)
	pdf.Line(20, pdf.GetY()+2, 190, pdf.GetY()+2)
	pdf.Ln(6)

	// Title
	pdf.SetFont(banglaFont, "B", 14)
	pdf.SetFillColor(68, 114, 196)
	pdf.SetTextColor(255, 255, 255)
	pdf.CellFormat(0, 10, " AvwW bv¤^vi: ", "", 1, "C", true, 0, "")
	pdf.Ln(8)
	pdf.SetTextColor(0, 0, 0)

	// --- Employee Information ---
	sectionHeader("AvwW bv¤^vi:")

	empName := ""
	if leave.Employee.NameBn != "" {
		empName = leave.Employee.NameBn
	} else if leave.Employee.NameEn != "" {
		empName = leave.Employee.NameEn
	}
	fieldRow("AvwW bv¤^vi:", leave.EmployeeID)
	fieldRow("bvg:", empName)

	deptName := ""
	if leave.Employee.Department != nil {
		if leave.Employee.Department.NameBn != "" {
			deptName = leave.Employee.Department.NameBn
		} else {
			deptName = leave.Employee.Department.Name
		}
	}
	fieldRow("wefvM:", deptName)

	desigName := ""
	if leave.Employee.DesignationRef != nil {
		if leave.Employee.DesignationRef.NameBn != "" {
			desigName = leave.Employee.DesignationRef.NameBn
		} else {
			desigName = leave.Employee.DesignationRef.Name
		}
	}
	fieldRow("c`^`:", desigName)

	// --- Leave Details ---
	sectionHeader("QvUvi weeiY")

	leaveTypeName := ""
	if leave.LeaveType.Name != "" {
		leaveTypeName = leave.LeaveType.Name
	}
	fieldRow("QvUvi cÖKvi:", leaveTypeName)
	fieldRow("ïiæ ZvwiL:", leave.FromDate)
	fieldRow("†kl ZvwiL:", leave.ToDate)
	fieldRow("g‡Wv wiU:", strconv.Itoa(leave.TotalDays))
	fieldRow("KviY:", leave.Reason)

	// --- Approval Section ---
	sectionHeader("Aby‡gv`b")

	statusLabel := leave.Status
	switch leave.Status {
	case "approved":
		statusLabel = "Aby‡gv`b Kiv n‡q‡Q"
	case "rejected":
		statusLabel = "F‡Ü Kiv n‡q‡Q"
	case "pending":
		statusLabel = "w¯’iZ cv‡k"
	}
	statusColor := [3]int{0, 0, 0}
	switch leave.Status {
	case "approved":
		statusColor = [3]int{0, 128, 0}
	case "rejected":
		statusColor = [3]int{200, 0, 0}
	case "pending":
		statusColor = [3]int{200, 150, 0}
	}
	pdf.SetFont(banglaFont, "B", 10)
	pdf.CellFormat(50, 7, "Aby‡gv`b:", "", 0, "L", false, 0, "")
	pdf.SetTextColor(statusColor[0], statusColor[1], statusColor[2])
	pdf.SetFont(banglaFont, "B", 10)
	pdf.CellFormat(0, 7, statusLabel, "", 1, "L", false, 0, "")
	pdf.SetTextColor(0, 0, 0)
	pdf.Ln(1)

	rejectionReason := ""
	if leave.RejectionReason != "" {
		rejectionReason = leave.RejectionReason
	}
	fieldRow("F‡Üi KviY:", rejectionReason)

	// --- Signature Section ---
	pdf.Ln(8)
	pdf.SetDrawColor(180, 180, 180)
	pdf.SetLineWidth(0.3)
	pdf.Line(20, pdf.GetY(), 190, pdf.GetY())
	pdf.Ln(6)

	signatureHeader := func(title string) {
		pdf.SetFont(banglaFont, "B", 11)
		pdf.SetFillColor(240, 245, 255)
		pdf.SetTextColor(40, 40, 40)
		pdf.CellFormat(0, 8, "  "+title, "", 1, "L", true, 0, "")
		pdf.SetTextColor(0, 0, 0)
		pdf.Ln(4)
	}

	signatureHeader("†iwRó¡")

	signatories := []string{
		"FvZ¥v cÖKvwkZ",
		"cÖ¯‘Zwe` cÖKvwkZ",
		"BwÂwU (G.Rg.G)",
		"Aby‡gv`bKvix",
	}

	colW := 170.0 / float64(len(signatories))
	xStart := 20.0

	for i := range signatories {
		x := xStart + float64(i)*colW
		pdf.Line(x, pdf.GetY()+20, x+colW-5, pdf.GetY()+20)
	}

	pdf.Ln(22)

	for i, s := range signatories {
		x := xStart + float64(i)*colW
		pdf.SetFont(banglaFont, "B", 9)
		pdf.SetTextColor(80, 80, 80)
		pdf.CellFormat(colW, 6, s, "", 0, "C", false, 0, "")
		_ = x
	}
	pdf.Ln(8)

	// Footer
	pdf.SetDrawColor(180, 180, 180)
	pdf.SetLineWidth(0.3)
	pdf.Line(20, pdf.GetY(), 190, pdf.GetY())
	pdf.Ln(3)
	pdf.SetFont(banglaFont, "", 7)
	pdf.SetTextColor(150, 150, 150)
	pdf.CellFormat(0, 4, fmt.Sprintf("ZvwiL: %s  |  AvwW bv¤^vi: %s", time.Now().Format("2006-01-02 15:04"), leave.ID), "", 1, "C", false, 0, "")
	pdf.SetTextColor(0, 0, 0)

	c.Header("Content-Type", "application/pdf")
	c.Header("Content-Disposition", fmt.Sprintf("attachment; filename=leave_application_%s.pdf", leave.EmployeeID))
	if err := pdf.Output(c.Writer); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate PDF"})
	}
}
