package handlers

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/shakil5281/hrhub-api/internal/models"
	"github.com/shakil5281/hrhub-api/internal/repository"
)

type CompanyHandler struct {
	companyRepo *repository.CompanyRepository
}

func NewCompanyHandler(companyRepo *repository.CompanyRepository) *CompanyHandler {
	return &CompanyHandler{companyRepo: companyRepo}
}

// CreateCompanyRequest represents the request body for creating a company
type CreateCompanyRequest struct {
	CompanyNameBn string `json:"company_name_bn"`
	CompanyNameEn string `json:"company_name_en" binding:"required"`
	Address      string `json:"address"`
	Phone        string `json:"phone"`
	Status       string `json:"status"`
}

// UpdateCompanyRequest represents the request body for updating a company
type UpdateCompanyRequest struct {
	CompanyNameBn string `json:"company_name_bn"`
	CompanyNameEn string `json:"company_name_en" binding:"required"`
	Address      string `json:"address"`
	Phone        string `json:"phone"`
	Status       string `json:"status"`
}

// ListCompanies godoc
//
// @Summary      List companies
// @Description  Get all companies
// @Tags         Companies
// @Security     BearerAuth
// @Produce      json
// @Success      200  {array}   map[string]interface{}
// @Failure      401  {object}  map[string]string
// @Failure      500  {object}  map[string]string
// @Router       /companies [get]
func (h *CompanyHandler) List(c *gin.Context) {
	companies, err := h.companyRepo.List()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, companies)
}

// GetCompany godoc
//
// @Summary      Get company by ID
// @Description  Get a company by its ID
// @Tags         Companies
// @Security     BearerAuth
// @Produce      json
// @Param        id   path     string true "Company ID"
// @Success      200  {object}  map[string]interface{}
// @Failure      401  {object}  map[string]string
// @Failure      404  {object}  map[string]string
// @Router       /companies/{id} [get]
func (h *CompanyHandler) GetByID(c *gin.Context) {
	id := c.Param("id")
	company, err := h.companyRepo.FindByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "company not found"})
		return
	}
	c.JSON(http.StatusOK, company)
}

// CreateCompany godoc
//
// @Summary      Create company
// @Description  Create a new company
// @Tags         Companies
// @Security     BearerAuth
// @Accept       json
// @Produce      json
// @Param        request body CreateCompanyRequest true "Company details"
// @Success      201  {object}  map[string]interface{}
// @Failure      400  {object}  map[string]string
// @Failure      401  {object}  map[string]string
// @Failure      409  {object}  map[string]string
// @Router       /companies [post]
func (h *CompanyHandler) Create(c *gin.Context) {
	var req CreateCompanyRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	slug := strings.ToLower(strings.ReplaceAll(req.CompanyNameEn, " ", "-"))

	existing, err := h.companyRepo.FindBySlug(slug)
	if err == nil && existing != nil {
		c.JSON(http.StatusConflict, gin.H{"error": "company with this name already exists"})
		return
	}

	userID := c.GetString("user_id")
	status := req.Status
	if status == "" {
		status = "active"
	}
	company := &models.Company{
		CompanyNameBn: req.CompanyNameBn,
		CompanyNameEn: req.CompanyNameEn,
		Slug:          slug,
		Address:       req.Address,
		Phone:         req.Phone,
		OwnerID:       &userID,
		Status:        status,
		CreatedBy:     &userID,
	}

	if err := h.companyRepo.Create(company); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, company)
}

// UpdateCompany godoc
//
// @Summary      Update company
// @Description  Update an existing company
// @Tags         Companies
// @Security     BearerAuth
// @Accept       json
// @Produce      json
// @Param        id      path     string true "Company ID"
// @Param        request body UpdateCompanyRequest true "Updated company details"
// @Success      200  {object}  map[string]interface{}
// @Failure      400  {object}  map[string]string
// @Failure      401  {object}  map[string]string
// @Failure      404  {object}  map[string]string
// @Failure      409  {object}  map[string]string
// @Router       /companies/{id} [put]
func (h *CompanyHandler) Update(c *gin.Context) {
	id := c.Param("id")
	company, err := h.companyRepo.FindByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "company not found"})
		return
	}

	var req UpdateCompanyRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	slug := strings.ToLower(strings.ReplaceAll(req.CompanyNameEn, " ", "-"))
	existing, err := h.companyRepo.FindBySlug(slug)
	if err == nil && existing != nil && existing.ID != company.ID {
		c.JSON(http.StatusConflict, gin.H{"error": "company with this name already exists"})
		return
	}

	userID := c.GetString("user_id")
	company.CompanyNameBn = req.CompanyNameBn
	company.CompanyNameEn = req.CompanyNameEn
	company.Slug = slug
	company.Address = req.Address
	company.Phone = req.Phone
	if req.Status != "" {
		company.Status = req.Status
	}
	company.UpdatedBy = &userID

	if err := h.companyRepo.Update(company); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, company)
}

// DeleteCompany godoc
//
// @Summary      Delete company
// @Description  Soft delete a company
// @Tags         Companies
// @Security     BearerAuth
// @Produce      json
// @Param        id   path     string true "Company ID"
// @Success      200  {object}  map[string]string
// @Failure      401  {object}  map[string]string
// @Failure      404  {object}  map[string]string
// @Failure      500  {object}  map[string]string
// @Router       /companies/{id} [delete]
func (h *CompanyHandler) Delete(c *gin.Context) {
	id := c.Param("id")
	company, err := h.companyRepo.FindByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "company not found"})
		return
	}

	userID := c.GetString("user_id")
	company.DeletedBy = &userID

	if err := h.companyRepo.Update(company); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if err := h.companyRepo.Delete(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "company deleted"})
}
