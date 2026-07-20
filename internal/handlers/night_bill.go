package handlers

import (
    "net/http"
    "strconv"

    "github.com/gin-gonic/gin"
    "github.com/shakil5281/hrhub-api/internal/models"
    "github.com/shakil5281/hrhub-api/internal/repository"
)

type NightBillHandler struct {
    nightBillRepo *repository.NightBillRepository
}

func NewNightBillHandler(nightBillRepo *repository.NightBillRepository) *NightBillHandler {
    return &NightBillHandler{nightBillRepo: nightBillRepo}
}

type CreateNightBillRequest struct {
    CompanyID  string  "json:\"company_id\" binding:\"required\""
    EmployeeID string  "json:\"employee_id\" binding:\"required\""
    Date       string  "json:\"date\" binding:\"required\""
    NightHours float64 "json:\"night_hours\""
    Rate       float64 "json:\"rate\""
    Amount     float64 "json:\"amount\""
    Month      int     "json:\"month\" binding:\"required\""
    Year       int     "json:\"year\" binding:\"required\""
    Remarks    string  "json:\"remarks\""
}

// ListNightBills godoc
//
//  @Summary      List night bills
//  @Description  Get all night bills for a company, optionally filtered by month/year
//  @Tags         Payroll
//  @Security     BearerAuth
//  @Produce      json
//  @Param        company_id query string false "Company ID"
//  @Param        month      query int    false "Month (1-12)"
//  @Param        year       query int    false "Year"
//  @Success      200  {object}  map[string]interface{}
//  @Failure      500  {object}  map[string]string
//  @Router       /night-bills [get]
func (h *NightBillHandler) List(c *gin.Context) {
    companyID := c.Query("company_id")
    if companyID == "" {
        companyID = c.GetString("company_id")
    }

    monthStr := c.Query("month")
    yearStr := c.Query("year")

    var items []models.NightBill
    var err error

    if monthStr != "" && yearStr != "" {
        month, _ := strconv.Atoi(monthStr)
        year, _ := strconv.Atoi(yearStr)
        items, err = h.nightBillRepo.ListByMonth(companyID, month, year)
    } else {
        items, err = h.nightBillRepo.List(companyID)
    }

    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

    c.JSON(http.StatusOK, gin.H{
        "night_bills": items,
        "total":       len(items),
    })
}

// CreateNightBill godoc
//
//  @Summary      Create night bill
//  @Description  Create a new night bill entry for an employee
//  @Tags         Payroll
//  @Security     BearerAuth
//  @Accept       json
//  @Produce      json
//  @Param        request body CreateNightBillRequest true "Night bill details"
//  @Success      201  {object}  map[string]interface{}
//  @Failure      400  {object}  map[string]string
//  @Failure      500  {object}  map[string]string
//  @Router       /night-bills [post]
func (h *NightBillHandler) Create(c *gin.Context) {
    var req CreateNightBillRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    item := &models.NightBill{
        CompanyID:  req.CompanyID,
        EmployeeID: req.EmployeeID,
        Date:       req.Date,
        NightHours: req.NightHours,
        Rate:       req.Rate,
        Amount:     req.Amount,
        Month:      req.Month,
        Year:       req.Year,
        Status:     "pending",
        Remarks:    req.Remarks,
        CreatedBy:  c.GetString("user_id"),
    }

    if err := h.nightBillRepo.Create(item); err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

    c.JSON(http.StatusCreated, item)
}

// UpdateNightBill godoc
//
//  @Summary      Update night bill
//  @Description  Update an existing night bill
//  @Tags         Payroll
//  @Security     BearerAuth
//  @Accept       json
//  @Produce      json
//  @Param        id      path string true "Night Bill ID"
//  @Param        request body CreateNightBillRequest false "Updated fields"
//  @Success      200  {object}  map[string]interface{}
//  @Failure      404  {object}  map[string]string
//  @Failure      500  {object}  map[string]string
//  @Router       /night-bills/{id} [put]
func (h *NightBillHandler) Update(c *gin.Context) {
    id := c.Param("id")

    item, err := h.nightBillRepo.FindByID(id)
    if err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "Night bill not found"})
        return
    }

    var req CreateNightBillRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    item.Date = req.Date
    item.NightHours = req.NightHours
    item.Rate = req.Rate
    item.Amount = req.Amount
    item.Month = req.Month
    item.Year = req.Year
    item.Remarks = req.Remarks
    userID := c.GetString("user_id")
    item.UpdatedBy = &userID

    if err := h.nightBillRepo.Update(item); err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

    c.JSON(http.StatusOK, item)
}

// DeleteNightBill godoc
//
//  @Summary      Delete night bill
//  @Description  Soft delete a night bill
//  @Tags         Payroll
//  @Security     BearerAuth
//  @Produce      json
//  @Param        id path string true "Night Bill ID"
//  @Success      200  {object}  map[string]interface{}
//  @Failure      404  {object}  map[string]string
//  @Failure      500  {object}  map[string]string
//  @Router       /night-bills/{id} [delete]
func (h *NightBillHandler) Delete(c *gin.Context) {
    id := c.Param("id")

    item, err := h.nightBillRepo.FindByID(id)
    if err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "Night bill not found"})
        return
    }

    if err := h.nightBillRepo.Delete(item); err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

    c.JSON(http.StatusOK, gin.H{"message": "Night bill deleted successfully"})
}
