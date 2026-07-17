package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/shakil5281/hrhub-api/internal/models"
	"github.com/shakil5281/hrhub-api/internal/repository"
)

type SeparationHandler struct {
	repo *repository.SeparationRepository
}

func NewSeparationHandler(repo *repository.SeparationRepository) *SeparationHandler {
	return &SeparationHandler{repo: repo}
}

type CreateSeparationRequest struct {
	Employee     string `json:"employee" binding:"required"`
	EmployeeID   string `json:"employee_id"`
	DepartmentID string `json:"department_id" binding:"required"`
	Type         string `json:"type" binding:"required"`
	Date         string `json:"date"`
	Status       string `json:"status"`
	Reason       string `json:"reason"`
}

type UpdateSeparationRequest struct {
	Employee     string `json:"employee" binding:"required"`
	EmployeeID   string `json:"employee_id"`
	DepartmentID string `json:"department_id" binding:"required"`
	Type         string `json:"type" binding:"required"`
	Date         string `json:"date"`
	Status       string `json:"status"`
	Reason       string `json:"reason"`
}

func (h *SeparationHandler) List(c *gin.Context) {
	employee := c.Query("employee")
	employeeID := c.Query("employee_id")
	departmentID := c.Query("department_id")
	sepType := c.Query("type")
	status := c.Query("status")

	if employee != "" || employeeID != "" || departmentID != "" || sepType != "" || status != "" {
		items, err := h.repo.ListFiltered(employee, employeeID, departmentID, sepType, status)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, items)
		return
	}

	items, err := h.repo.List()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, items)
}

func (h *SeparationHandler) GetByID(c *gin.Context) {
	id := c.Param("id")
	item, err := h.repo.FindByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "separation not found"})
		return
	}
	c.JSON(http.StatusOK, item)
}

func (h *SeparationHandler) Create(c *gin.Context) {
	var req CreateSeparationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	status := req.Status
	if status == "" {
		status = "Pending"
	}

	item := &models.Separation{
		Employee:     req.Employee,
		EmployeeID:   req.EmployeeID,
		DepartmentID: req.DepartmentID,
		Type:         req.Type,
		Date:         req.Date,
		Status:       status,
		Reason:       req.Reason,
	}

	if err := h.repo.Create(item); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	result, _ := h.repo.FindByID(item.ID)
	c.JSON(http.StatusCreated, result)
}

func (h *SeparationHandler) Update(c *gin.Context) {
	id := c.Param("id")
	item, err := h.repo.FindByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "separation not found"})
		return
	}

	var req UpdateSeparationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	item.Employee = req.Employee
	item.EmployeeID = req.EmployeeID
	item.DepartmentID = req.DepartmentID
	item.Type = req.Type
	item.Date = req.Date
	item.Reason = req.Reason
	if req.Status != "" {
		item.Status = req.Status
	}

	if err := h.repo.Update(item); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	result, _ := h.repo.FindByID(item.ID)
	c.JSON(http.StatusOK, result)
}

func (h *SeparationHandler) Delete(c *gin.Context) {
	id := c.Param("id")
	_, err := h.repo.FindByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "separation not found"})
		return
	}

	if err := h.repo.Delete(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "separation deleted"})
}
