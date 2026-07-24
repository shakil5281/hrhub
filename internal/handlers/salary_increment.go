package handlers

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/shakil5281/peoplehub-api/internal/models"
	"github.com/shakil5281/peoplehub-api/internal/repository"
)

type SalaryIncrementHandler struct {
	incrementRepo *repository.SalaryIncrementRepository
	employeeRepo  *repository.EmployeeRepository
}

func NewSalaryIncrementHandler(incrementRepo *repository.SalaryIncrementRepository, employeeRepo *repository.EmployeeRepository) *SalaryIncrementHandler {
	return &SalaryIncrementHandler{incrementRepo: incrementRepo, employeeRepo: employeeRepo}
}

type CreateIncrementRequest struct {
	CompanyID       string  `json:"company_id" binding:"required"`
	EmployeeID      string  `json:"employee_id" binding:"required"`
	IncrementAmount float64 `json:"increment_amount" binding:"required,min=1"`
	EffectiveDate   string  `json:"effective_date" binding:"required"`
	Remarks         string  `json:"remarks"`
}

type ApproveIncrementRequest struct {
	IncrementAmount *float64 `json:"increment_amount"`
	EffectiveDate   *string  `json:"effective_date"`
}

// ListIncrements godoc
//
// @Summary      List salary increments
// @Description  Get all salary increments for a company
// @Tags         Salary
// @Security     BearerAuth
// @Produce      json
// @Param        company_id query string true "Company ID"
// @Success      200  {object}  map[string]interface{}
// @Failure      500  {object}  map[string]string
// @Router       /salary/increments [get]
func (h *SalaryIncrementHandler) List(c *gin.Context) {
	companyID := c.Query("company_id")
	if companyID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "company_id is required"})
		return
	}

	increments, err := h.incrementRepo.List(companyID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"increments": increments,
		"total":      len(increments),
	})
}

// CreateIncrement godoc
//
// @Summary      Create salary increment
// @Description  Apply a salary increment for an employee
// @Tags         Salary
// @Security     BearerAuth
// @Accept       json
// @Produce      json
// @Param        request body CreateIncrementRequest true "Increment details"
// @Success      201  {object}  map[string]interface{}
// @Failure      400  {object}  map[string]string
// @Failure      500  {object}  map[string]string
// @Router       /salary/increments [post]
func (h *SalaryIncrementHandler) Create(c *gin.Context) {
	var req CreateIncrementRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	emp, err := h.employeeRepo.FindByEmployeeID(req.EmployeeID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Employee not found"})
		return
	}
	if emp.CompanyID != req.CompanyID {
		c.JSON(http.StatusNotFound, gin.H{"error": "Employee not found in this company"})
		return
	}

	newGross := emp.GrossSalary + req.IncrementAmount

	inc := &models.SalaryIncrement{
		CompanyID:       req.CompanyID,
		EmployeeID:      req.EmployeeID,
		PreviousGross:   emp.GrossSalary,
		PreviousBasic:   emp.BasicSalary,
		PreviousHouse:   emp.HouseRent,
		PreviousMedical: emp.MedicalAllowance,
		IncrementAmount: req.IncrementAmount,
		NewGross:        newGross,
		NewBasic:        newGross * 0.5,
		NewHouse:        newGross * 0.25,
		NewMedical:      newGross * 0.1,
		EffectiveDate:   req.EffectiveDate,
		Status:          "pending",
		Remarks:         req.Remarks,
		CreatedBy:       c.GetString("user_id"),
	}

	if err := h.incrementRepo.Create(inc); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, inc)
}

// ApproveIncrement godoc
//
// @Summary      Approve salary increment
// @Description  Approve a pending increment and update employee salary
// @Tags         Salary
// @Security     BearerAuth
// @Accept       json
// @Produce      json
// @Param        id      path string true "Increment ID"
// @Param        request body ApproveIncrementRequest false "Optional override values"
// @Success      200  {object}  map[string]interface{}
// @Failure      404  {object}  map[string]string
// @Failure      500  {object}  map[string]string
// @Router       /salary/increments/{id}/approve [put]
func (h *SalaryIncrementHandler) Approve(c *gin.Context) {
	id := c.Param("id")

	inc, err := h.incrementRepo.FindByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Increment not found"})
		return
	}

	if inc.Status != "pending" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Only pending increments can be approved"})
		return
	}

	emp, err := h.employeeRepo.FindByEmployeeID(inc.EmployeeID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Employee not found"})
		return
	}

	emp.GrossSalary = inc.NewGross
	emp.BasicSalary = inc.NewBasic
	emp.HouseRent = inc.NewHouse
	emp.MedicalAllowance = inc.NewMedical

	if err := h.employeeRepo.Update(emp); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	now := time.Now()
	userID := c.GetString("user_id")
	inc.Status = "approved"
	inc.ApprovedBy = &userID
	inc.ApprovedAt = &now

	if err := h.incrementRepo.Update(inc); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, inc)
}

// RejectIncrement godoc
//
// @Summary      Reject salary increment
// @Description  Reject a pending increment request
// @Tags         Salary
// @Security     BearerAuth
// @Accept       json
// @Produce      json
// @Param        id      path string true "Increment ID"
// @Param        request body map[string]string false "Rejection reason"
// @Success      200  {object}  map[string]interface{}
// @Failure      404  {object}  map[string]string
// @Failure      500  {object}  map[string]string
// @Router       /salary/increments/{id}/reject [put]
func (h *SalaryIncrementHandler) Reject(c *gin.Context) {
	id := c.Param("id")

	inc, err := h.incrementRepo.FindByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Increment not found"})
		return
	}

	if inc.Status != "pending" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Only pending increments can be rejected"})
		return
	}

	var body struct {
		Reason string `json:"reason"`
	}
	c.ShouldBindJSON(&body)

	now := time.Now()
	userID := c.GetString("user_id")
	inc.Status = "rejected"
	inc.RejectedBy = &userID
	inc.RejectedAt = &now
	inc.RejectionReason = body.Reason

	if err := h.incrementRepo.Update(inc); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, inc)
}
