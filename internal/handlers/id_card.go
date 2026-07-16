package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/shakil5281/hrhub-api/internal/models"
	"github.com/shakil5281/hrhub-api/internal/repository"
)

type IdCardHandler struct {
	repo *repository.IdCardRepository
}

func NewIdCardHandler(repo *repository.IdCardRepository) *IdCardHandler {
	return &IdCardHandler{repo: repo}
}

type CreateIdCardRequest struct {
	Employee      string `json:"employee" binding:"required"`
	EmployeeCode  string `json:"employee_code"`
	DesignationID string `json:"designation_id"`
	DepartmentID  string `json:"department_id" binding:"required"`
	CardNo        string `json:"card_no" binding:"required"`
	Issued        string `json:"issued"`
	Expiry        string `json:"expiry"`
	Status        string `json:"status"`
}

type UpdateIdCardRequest struct {
	Employee      string `json:"employee" binding:"required"`
	EmployeeCode  string `json:"employee_code"`
	DesignationID string `json:"designation_id"`
	DepartmentID  string `json:"department_id" binding:"required"`
	CardNo        string `json:"card_no" binding:"required"`
	Issued        string `json:"issued"`
	Expiry        string `json:"expiry"`
	Status        string `json:"status"`
}

func (h *IdCardHandler) List(c *gin.Context) {
	employee := c.Query("employee")
	employeeCode := c.Query("employee_code")
	departmentID := c.Query("department_id")
	designationID := c.Query("designation_id")
	status := c.Query("status")
	cardNo := c.Query("card_no")

	if employee != "" || employeeCode != "" || departmentID != "" || designationID != "" || status != "" || cardNo != "" {
		items, err := h.repo.ListFiltered(employee, employeeCode, departmentID, designationID, status, cardNo)
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

func (h *IdCardHandler) GetByID(c *gin.Context) {
	id := c.Param("id")
	item, err := h.repo.FindByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "id card not found"})
		return
	}
	c.JSON(http.StatusOK, item)
}

func (h *IdCardHandler) Create(c *gin.Context) {
	var req CreateIdCardRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	status := req.Status
	if status == "" {
		status = "Active"
	}

	item := &models.IdCard{
		Employee:      req.Employee,
		EmployeeCode:  req.EmployeeCode,
		DesignationID: req.DesignationID,
		DepartmentID:  req.DepartmentID,
		CardNo:        req.CardNo,
		Issued:        req.Issued,
		Expiry:        req.Expiry,
		Status:        status,
	}

	if err := h.repo.Create(item); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	result, _ := h.repo.FindByID(item.ID)
	c.JSON(http.StatusCreated, result)
}

func (h *IdCardHandler) Update(c *gin.Context) {
	id := c.Param("id")
	item, err := h.repo.FindByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "id card not found"})
		return
	}

	var req UpdateIdCardRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	item.Employee = req.Employee
	item.EmployeeCode = req.EmployeeCode
	item.DesignationID = req.DesignationID
	item.DepartmentID = req.DepartmentID
	item.CardNo = req.CardNo
	item.Issued = req.Issued
	item.Expiry = req.Expiry
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

func (h *IdCardHandler) Delete(c *gin.Context) {
	id := c.Param("id")
	_, err := h.repo.FindByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "id card not found"})
		return
	}

	if err := h.repo.Delete(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "id card deleted"})
}
