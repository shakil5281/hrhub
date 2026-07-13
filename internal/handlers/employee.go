package handlers

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/shakil5281/hrhub-api/internal/database"
	"github.com/shakil5281/hrhub-api/internal/models"
)

type EmployeeHandler struct{}

func NewEmployeeHandler() *EmployeeHandler {
	return &EmployeeHandler{}
}

type CreateEmployeeRequest struct {
	EmployeeCode string  `json:"employee_code" binding:"required"`
	PunchNumber  string  `json:"punch_number"`
	CompanyID    string  `json:"company_id"`
	Designation  string  `json:"designation"`
	ShiftID      string  `json:"shift_id"`
	JoiningDate  string  `json:"joining_date"`
	Salary       float64 `json:"salary"`
	Status       string  `json:"status"`
}

// GetEmployees godoc
//
// @Summary      List employees
// @Description  Get all employees
// @Tags         Employees
// @Security     BearerAuth
// @Produce      json
// @Success      200  {array}   map[string]interface{}
// @Failure      401  {object}  map[string]string
// @Failure      500  {object}  map[string]string
// @Router       /employees [get]
func (h *EmployeeHandler) GetEmployees(c *gin.Context) {
	var employees []models.Employee
	if err := database.DB.Preload("User").Preload("Shift").Find(&employees).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, employees)
}

// CreateEmployee godoc
//
// @Summary      Create employee
// @Description  Create a new employee record
// @Tags         Employees
// @Security     BearerAuth
// @Accept       json
// @Produce      json
// @Param        request body CreateEmployeeRequest true "Employee details"
// @Success      201  {object}  map[string]interface{}
// @Failure      400  {object}  map[string]string
// @Failure      500  {object}  map[string]string
// @Router       /employees [post]
func (h *EmployeeHandler) CreateEmployee(c *gin.Context) {
	var req CreateEmployeeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	jd, err := time.Parse("2006-01-02", req.JoiningDate)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid joining_date format, use YYYY-MM-DD"})
		return
	}

	status := req.Status
	if status == "" {
		status = "active"
	}

	employee := models.Employee{
		EmployeeCode: req.EmployeeCode,
		PunchNumber:  req.PunchNumber,
		CompanyID:    req.CompanyID,
		Designation:  req.Designation,
		JoiningDate:  jd,
		Salary:       req.Salary,
		Status:       status,
	}
	if req.ShiftID != "" {
		employee.ShiftID = &req.ShiftID
	}

	if err := database.DB.Create(&employee).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	database.DB.Preload("User").Preload("Shift").First(&employee, "id = ?", employee.ID)
	c.JSON(http.StatusCreated, employee)
}

// UpdateEmployee godoc
//
// @Summary      Update employee
// @Description  Update an existing employee record
// @Tags         Employees
// @Security     BearerAuth
// @Accept       json
// @Produce      json
// @Param        id      path     string true "Employee ID"
// @Param        request body CreateEmployeeRequest true "Employee details"
// @Success      200  {object}  map[string]interface{}
// @Failure      400  {object}  map[string]string
// @Failure      404  {object}  map[string]string
// @Failure      500  {object}  map[string]string
// @Router       /employees/{id} [put]
func (h *EmployeeHandler) UpdateEmployee(c *gin.Context) {
	id := c.Param("id")
	var emp models.Employee
	if err := database.DB.First(&emp, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "employee not found"})
		return
	}

	var req CreateEmployeeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	emp.EmployeeCode = req.EmployeeCode
	if req.PunchNumber != "" {
		emp.PunchNumber = req.PunchNumber
	}
	if req.CompanyID != "" {
		emp.CompanyID = req.CompanyID
	}
	if req.Designation != "" {
		emp.Designation = req.Designation
	}
	if req.Salary != 0 {
		emp.Salary = req.Salary
	}
	if req.JoiningDate != "" {
		jd, err := time.Parse("2006-01-02", req.JoiningDate)
		if err == nil {
			emp.JoiningDate = jd
		}
	}
	if req.Status != "" {
		emp.Status = req.Status
	}
	if req.ShiftID != "" {
		emp.ShiftID = &req.ShiftID
	} else {
		emp.ShiftID = nil
	}

	if err := database.DB.Save(&emp).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	database.DB.Preload("User").Preload("Shift").First(&emp, "id = ?", emp.ID)
	c.JSON(http.StatusOK, emp)
}

// GetEmployee godoc
//
// @Summary      Get employee by ID
// @Description  Get a single employee by ID
// @Tags         Employees
// @Security     BearerAuth
// @Produce      json
// @Param        id   path     string true "Employee ID"
// @Success      200  {object}  map[string]interface{}
// @Failure      404  {object}  map[string]string
// @Router       /employees/{id} [get]
func (h *EmployeeHandler) GetEmployee(c *gin.Context) {
	id := c.Param("id")
	var emp models.Employee
	if err := database.DB.Preload("User").Preload("Shift").First(&emp, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "employee not found"})
		return
	}
	c.JSON(http.StatusOK, emp)
}

// DeleteEmployee godoc
//
// @Summary      Delete employee
// @Description  Soft delete an employee
// @Tags         Employees
// @Security     BearerAuth
// @Produce      json
// @Param        id   path     string true "Employee ID"
// @Success      200  {object}  map[string]string
// @Failure      404  {object}  map[string]string
// @Failure      500  {object}  map[string]string
// @Router       /employees/{id} [delete]
func (h *EmployeeHandler) DeleteEmployee(c *gin.Context) {
	id := c.Param("id")
	var emp models.Employee
	if err := database.DB.First(&emp, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "employee not found"})
		return
	}
	if err := database.DB.Delete(&emp).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "employee deleted"})
}
