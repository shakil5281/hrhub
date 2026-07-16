package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/shakil5281/hrhub-api/internal/models"
	"github.com/shakil5281/hrhub-api/internal/repository"
)

type RequirementHandler struct {
	repo *repository.RequirementRepository
}

func NewRequirementHandler(repo *repository.RequirementRepository) *RequirementHandler {
	return &RequirementHandler{repo: repo}
}

type CreateRequirementRequest struct {
	Position     string `json:"position" binding:"required"`
	DepartmentID string `json:"department_id" binding:"required"`
	Vacancies    int    `json:"vacancies" binding:"required"`
	Applicants   int    `json:"applicants"`
	Status       string `json:"status"`
	Priority     string `json:"priority"`
	Description  string `json:"description"`
}

type UpdateRequirementRequest struct {
	Position     string `json:"position" binding:"required"`
	DepartmentID string `json:"department_id" binding:"required"`
	Vacancies    int    `json:"vacancies" binding:"required"`
	Applicants   int    `json:"applicants"`
	Status       string `json:"status"`
	Priority     string `json:"priority"`
	Description  string `json:"description"`
}

func (h *RequirementHandler) List(c *gin.Context) {
	departmentID := c.Query("department_id")
	status := c.Query("status")
	priority := c.Query("priority")
	position := c.Query("position")

	if departmentID != "" || status != "" || priority != "" || position != "" {
		items, err := h.repo.ListFiltered(departmentID, status, priority, position)
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

func (h *RequirementHandler) GetByID(c *gin.Context) {
	id := c.Param("id")
	item, err := h.repo.FindByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "requirement not found"})
		return
	}
	c.JSON(http.StatusOK, item)
}

func (h *RequirementHandler) Create(c *gin.Context) {
	var req CreateRequirementRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	status := req.Status
	if status == "" {
		status = "Open"
	}
	priority := req.Priority
	if priority == "" {
		priority = "Medium"
	}

	item := &models.Requirement{
		Position:     req.Position,
		DepartmentID: req.DepartmentID,
		Vacancies:    req.Vacancies,
		Applicants:   req.Applicants,
		Status:       status,
		Priority:     priority,
		Description:  req.Description,
	}

	if err := h.repo.Create(item); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	result, _ := h.repo.FindByID(item.ID)
	c.JSON(http.StatusCreated, result)
}

func (h *RequirementHandler) Update(c *gin.Context) {
	id := c.Param("id")
	item, err := h.repo.FindByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "requirement not found"})
		return
	}

	var req UpdateRequirementRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	item.Position = req.Position
	item.DepartmentID = req.DepartmentID
	item.Vacancies = req.Vacancies
	item.Applicants = req.Applicants
	item.Description = req.Description
	if req.Status != "" {
		item.Status = req.Status
	}
	if req.Priority != "" {
		item.Priority = req.Priority
	}

	if err := h.repo.Update(item); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	result, _ := h.repo.FindByID(item.ID)
	c.JSON(http.StatusOK, result)
}

func (h *RequirementHandler) Delete(c *gin.Context) {
	id := c.Param("id")
	_, err := h.repo.FindByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "requirement not found"})
		return
	}

	if err := h.repo.Delete(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "requirement deleted"})
}
