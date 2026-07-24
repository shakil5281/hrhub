package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/shakil5281/peoplehub-api/internal/models"
	"github.com/shakil5281/peoplehub-api/internal/repository"
)

type PunishmentHandler struct {
	punishmentRepo *repository.PunishmentRepository
}

func NewPunishmentHandler(punishmentRepo *repository.PunishmentRepository) *PunishmentHandler {
	return &PunishmentHandler{punishmentRepo: punishmentRepo}
}

type CreatePunishmentRequest struct {
	CompanyID  string  `json:"company_id" binding:"required"`
	EmployeeID string  `json:"employee_id" binding:"required"`
	Type       string  `json:"type" binding:"required"`
	Reason     string  `json:"reason"`
	Amount     float64 `json:"amount"`
	Date       string  `json:"date" binding:"required"`
	Remarks    string  `json:"remarks"`
}

// ListPunishments godoc
//
//	@Summary      List punishments
//	@Description  Get all punishments for a company
//	@Tags         HR
//	@Security     BearerAuth
//	@Produce      json
//	@Param        company_id query string false "Company ID"
//	@Success      200  {object}  map[string]interface{}
//	@Failure      500  {object}  map[string]string
//	@Router       /punishments [get]
func (h *PunishmentHandler) List(c *gin.Context) {
	companyID := c.Query("company_id")
	if companyID == "" {
		companyID = c.GetString("company_id")
	}

	items, err := h.punishmentRepo.List(companyID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"punishments": items,
		"total":       len(items),
	})
}

// CreatePunishment godoc
//
//	@Summary      Create punishment
//	@Description  Add a new punishment record for an employee
//	@Tags         HR
//	@Security     BearerAuth
//	@Accept       json
//	@Produce      json
//	@Param        request body CreatePunishmentRequest true "Punishment details"
//	@Success      201  {object}  map[string]interface{}
//	@Failure      400  {object}  map[string]string
//	@Failure      500  {object}  map[string]string
//	@Router       /punishments [post]
func (h *PunishmentHandler) Create(c *gin.Context) {
	var req CreatePunishmentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	item := &models.Punishment{
		CompanyID:  req.CompanyID,
		EmployeeID: req.EmployeeID,
		Type:       req.Type,
		Reason:     req.Reason,
		Amount:     req.Amount,
		Date:       req.Date,
		Status:     "active",
		Remarks:    req.Remarks,
		CreatedBy:  c.GetString("user_id"),
	}

	if err := h.punishmentRepo.Create(item); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, item)
}

// UpdatePunishment godoc
//
//	@Summary      Update punishment
//	@Description  Update an existing punishment record
//	@Tags         HR
//	@Security     BearerAuth
//	@Accept       json
//	@Produce      json
//	@Param        id      path string true "Punishment ID"
//	@Param        request body CreatePunishmentRequest false "Updated fields"
//	@Success      200  {object}  map[string]interface{}
//	@Failure      404  {object}  map[string]string
//	@Failure      500  {object}  map[string]string
//	@Router       /punishments/{id} [put]
func (h *PunishmentHandler) Update(c *gin.Context) {
	id := c.Param("id")

	item, err := h.punishmentRepo.FindByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Punishment not found"})
		return
	}

	var req CreatePunishmentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	item.Type = req.Type
	item.Reason = req.Reason
	item.Amount = req.Amount
	item.Date = req.Date
	item.Remarks = req.Remarks
	userID := c.GetString("user_id")
	item.UpdatedBy = &userID

	if err := h.punishmentRepo.Update(item); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, item)
}

// DeletePunishment godoc
//
//	@Summary      Delete punishment
//	@Description  Soft delete a punishment record
//	@Tags         HR
//	@Security     BearerAuth
//	@Produce      json
//	@Param        id path string true "Punishment ID"
//	@Success      200  {object}  map[string]interface{}
//	@Failure      404  {object}  map[string]string
//	@Failure      500  {object}  map[string]string
//	@Router       /punishments/{id} [delete]
func (h *PunishmentHandler) Delete(c *gin.Context) {
	id := c.Param("id")

	item, err := h.punishmentRepo.FindByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Punishment not found"})
		return
	}

	if err := h.punishmentRepo.Delete(item); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Punishment deleted successfully"})
}
