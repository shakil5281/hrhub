package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/shakil5281/hrhub-api/internal/models"
	"github.com/shakil5281/hrhub-api/internal/repository"
)

// --- Division ---

type DivisionHandler struct{ repo *repository.DivisionRepository }

func NewDivisionHandler(repo *repository.DivisionRepository) *DivisionHandler {
	return &DivisionHandler{repo: repo}
}

func (h *DivisionHandler) List(c *gin.Context) {
	list, err := h.repo.List()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, list)
}

func (h *DivisionHandler) GetByID(c *gin.Context) {
	m, err := h.repo.FindByID(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
		return
	}
	c.JSON(http.StatusOK, m)
}

func (h *DivisionHandler) Create(c *gin.Context) {
	var req OrgNameRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	m := &models.Division{Name: req.Name, NameBn: req.NameBn}
	if err := h.repo.Create(m); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, m)
}

func (h *DivisionHandler) Update(c *gin.Context) {
	m, err := h.repo.FindByID(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
		return
	}
	var req OrgNameRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	m.Name = req.Name
	m.NameBn = req.NameBn
	if err := h.repo.Update(m); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, m)
}

func (h *DivisionHandler) Delete(c *gin.Context) {
	if _, err := h.repo.FindByID(c.Param("id")); err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
		return
	}
	if err := h.repo.Delete(c.Param("id")); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "deleted"})
}

// --- District ---

type DistrictHandler struct{ repo *repository.DistrictRepository }

func NewDistrictHandler(repo *repository.DistrictRepository) *DistrictHandler {
	return &DistrictHandler{repo: repo}
}

type DistrictRequest struct {
	Name       string `json:"name" binding:"required"`
	NameBn     string `json:"name_bn"`
	DivisionID string `json:"division_id" binding:"required"`
}

func (h *DistrictHandler) List(c *gin.Context) {
	divisionID := c.Query("division_id")
	list, err := h.repo.List(divisionID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, list)
}

func (h *DistrictHandler) GetByID(c *gin.Context) {
	m, err := h.repo.FindByID(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
		return
	}
	c.JSON(http.StatusOK, m)
}

func (h *DistrictHandler) Create(c *gin.Context) {
	var req DistrictRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	m := &models.District{Name: req.Name, NameBn: req.NameBn, DivisionID: req.DivisionID}
	if err := h.repo.Create(m); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, m)
}

func (h *DistrictHandler) Update(c *gin.Context) {
	m, err := h.repo.FindByID(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
		return
	}
	var req DistrictRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	m.Name = req.Name
	m.NameBn = req.NameBn
	m.DivisionID = req.DivisionID
	if err := h.repo.Update(m); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, m)
}

func (h *DistrictHandler) Delete(c *gin.Context) {
	if _, err := h.repo.FindByID(c.Param("id")); err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
		return
	}
	if err := h.repo.Delete(c.Param("id")); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "deleted"})
}

// --- Upazila ---

type UpazilaHandler struct{ repo *repository.UpazilaRepository }

func NewUpazilaHandler(repo *repository.UpazilaRepository) *UpazilaHandler {
	return &UpazilaHandler{repo: repo}
}

type UpazilaRequest struct {
	Name       string `json:"name" binding:"required"`
	NameBn     string `json:"name_bn"`
	DistrictID string `json:"district_id" binding:"required"`
}

func (h *UpazilaHandler) List(c *gin.Context) {
	districtID := c.Query("district_id")
	list, err := h.repo.List(districtID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, list)
}

func (h *UpazilaHandler) GetByID(c *gin.Context) {
	m, err := h.repo.FindByID(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
		return
	}
	c.JSON(http.StatusOK, m)
}

func (h *UpazilaHandler) Create(c *gin.Context) {
	var req UpazilaRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	m := &models.Upazila{Name: req.Name, NameBn: req.NameBn, DistrictID: req.DistrictID}
	if err := h.repo.Create(m); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, m)
}

func (h *UpazilaHandler) Update(c *gin.Context) {
	m, err := h.repo.FindByID(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
		return
	}
	var req UpazilaRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	m.Name = req.Name
	m.NameBn = req.NameBn
	m.DistrictID = req.DistrictID
	if err := h.repo.Update(m); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, m)
}

func (h *UpazilaHandler) Delete(c *gin.Context) {
	if _, err := h.repo.FindByID(c.Param("id")); err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
		return
	}
	if err := h.repo.Delete(c.Param("id")); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "deleted"})
}

// --- Union ---

type UnionHandler struct{ repo *repository.UnionRepository }

func NewUnionHandler(repo *repository.UnionRepository) *UnionHandler {
	return &UnionHandler{repo: repo}
}

type UnionRequest struct {
	Name      string `json:"name" binding:"required"`
	NameBn    string `json:"name_bn"`
	UpazilaID string `json:"upazila_id" binding:"required"`
}

func (h *UnionHandler) List(c *gin.Context) {
	upazilaID := c.Query("upazila_id")
	list, err := h.repo.List(upazilaID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, list)
}

func (h *UnionHandler) GetByID(c *gin.Context) {
	m, err := h.repo.FindByID(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
		return
	}
	c.JSON(http.StatusOK, m)
}

func (h *UnionHandler) Create(c *gin.Context) {
	var req UnionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	m := &models.Union{Name: req.Name, NameBn: req.NameBn, UpazilaID: req.UpazilaID}
	if err := h.repo.Create(m); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, m)
}

func (h *UnionHandler) Update(c *gin.Context) {
	m, err := h.repo.FindByID(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
		return
	}
	var req UnionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	m.Name = req.Name
	m.NameBn = req.NameBn
	m.UpazilaID = req.UpazilaID
	if err := h.repo.Update(m); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, m)
}

func (h *UnionHandler) Delete(c *gin.Context) {
	if _, err := h.repo.FindByID(c.Param("id")); err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
		return
	}
	if err := h.repo.Delete(c.Param("id")); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "deleted"})
}
