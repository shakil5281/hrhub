package handlers

import (
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/shakil5281/hrhub-api/internal/database"
	"github.com/shakil5281/hrhub-api/internal/models"
	"github.com/shakil5281/hrhub-api/internal/repository"
	"github.com/shakil5281/hrhub-api/internal/utils"
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

// ListSeparations godoc
//
// @Summary      List separations
// @Tags         Separations
// @Security     BearerAuth
// @Produce      json
// @Param        employee      query string false "Filter by employee name"
// @Param        employee_id   query string false "Filter by employee ID"
// @Param        department_id query string false "Filter by department"
// @Param        type          query string false "Filter by type"
// @Param        status        query string false "Filter by status"
// @Param        page          query int    false "Page number (default: 1)"
// @Param        limit         query int    false "Page size (default: 20, max: 100)"
// @Success      200  {object}  utils.PaginatedResponse
// @Router       /separations [get]
func (h *SeparationHandler) List(c *gin.Context) {
	employee := c.Query("employee")
	employeeID := c.Query("employee_id")
	departmentID := c.Query("department_id")
	sepType := c.Query("type")
	status := c.Query("status")

	p := utils.ParsePagination(c)
	if employee != "" || employeeID != "" || departmentID != "" || sepType != "" || status != "" {
		items, total, err := h.repo.ListFiltered(employee, employeeID, departmentID, sepType, status, p.Page, p.Limit)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, utils.NewPaginatedResponse(items, total, p))
		return
	}

	items, total, err := h.repo.List(p.Page, p.Limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, utils.NewPaginatedResponse(items, total, p))
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

// ProcessSeparation godoc
//
//	@Summary      Process separations
//	@Description  Check separations for today and update employee type (Resign/Lefty/Close)
//	@Tags         Separations
//	@Security     BearerAuth
//	@Produce      json
//	@Param        date query string false "Date to process (default: today)"
//	@Success      200  {object}  map[string]interface{}
//	@Router       /separations/process [post]
func (h *SeparationHandler) Process(c *gin.Context) {
	dateStr := c.DefaultQuery("date", time.Now().Format("2006-01-02"))

	var separations []models.Separation
	if err := database.DB.Where("date = ? AND status = ? AND deleted_at IS NULL", dateStr, "Pending").Find(&separations).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	processed := 0
	for _, sep := range separations {
		var emp models.Employee
		if err := database.DB.Where("employee_id = ? AND deleted_at IS NULL", sep.EmployeeID).First(&emp).Error; err != nil {
			continue
		}

		newType := ""
		switch sep.Type {
		case "Resignation", "Resign":
			newType = "Resign"
		case "Left", "Lefty":
			newType = "Lefty"
		case "Termination", "Close", "Contract End":
			newType = "Close"
		default:
			newType = "Close"
		}

		if newType != "" {
			database.DB.Model(&emp).Update("employee_type", newType)
		}
		database.DB.Model(&sep).Update("status", "Processed")
		processed++
	}

	c.JSON(http.StatusOK, gin.H{
		"message":   fmt.Sprintf("Processed %d separations for %s", processed, dateStr),
		"date":      dateStr,
		"processed": processed,
		"total":     len(separations),
	})
}
