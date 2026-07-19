package handlers

import (
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/jung-kurt/gofpdf"
	"github.com/shakil5281/hrhub-api/internal/database"
	"github.com/shakil5281/hrhub-api/internal/models"
)

type GenerateIdCardRequest struct {
	EmployeeIDs []string `json:"employee_ids" binding:"required"`
}

// GenerateIdCards godoc
//
//	@Summary      Generate ID cards PDF
//	@Description  Generate printable ID cards (front + back) for selected employees, 6 per A4 page
//	@Tags         ID Cards
//	@Security     BearerAuth
//	@Accept       json
//	@Produce      application/pdf
//	@Param        request body GenerateIdCardRequest true "Employee IDs (business keys)"
//	@Success      200  {file}  binary
//	@Failure      400  {object}  map[string]string
//	@Failure      500  {object}  map[string]string
//	@Router       /id-cards/generate [post]
func (h *IdCardHandler) Generate(c *gin.Context) {
	var req GenerateIdCardRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if len(req.EmployeeIDs) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "at least one employee ID is required"})
		return
	}

	var employees []models.Employee
	if err := database.DB.
		Preload("Company").
		Preload("Department").
		Preload("DesignationRef").
		Preload("SectionRef").
		Where("employee_id IN ? AND deleted_at IS NULL", req.EmployeeIDs).
		Order("employee_id ASC").
		Find(&employees).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	pdf := gofpdf.New("L", "mm", "A4", "")
	pdf.SetMargins(0, 0, 0)
	pdf.SetAutoPageBreak(false, 0)

	const (
		pageW    = 297.0
		pageH    = 210.0
		cardW    = 88.0
		cardH    = 54.0
		marginX  = 10.0
		marginY  = 10.0
		gapX     = 4.0
		gapY     = 6.0
		cardsPerPage = 6
	)

	positions := []struct{ x, y float64 }{
		{marginX, marginY},
		{marginX + cardW + gapX, marginY},
		{marginX + 2*(cardW+gapX), marginY},
		{marginX, marginY + cardH + gapY},
		{marginX + cardW + gapX, marginY + cardH + gapY},
		{marginX + 2*(cardW+gapX), marginY + cardH + gapY},
	}

	// Front pages
	for i := 0; i < len(employees); i += cardsPerPage {
		pdf.AddPage()
		end := i + cardsPerPage
		if end > len(employees) {
			end = len(employees)
		}
		for j, emp := range employees[i:end] {
			pos := positions[j]
			drawCardFront(pdf, pos.x, pos.y, cardW, cardH, emp)
		}
	}

	// Back pages — 2 cards per row on back (landscape half-width cards on the back)
	for i := 0; i < len(employees); i += cardsPerPage {
		pdf.AddPage()
		end := i + cardsPerPage
		if end > len(employees) {
			end = len(employees)
		}
		for j, emp := range employees[i:end] {
			pos := positions[j]
			drawCardBack(pdf, pos.x, pos.y, cardW, cardH, emp)
		}
	}

	// Switch order: interleave front and back so front+back of same card are together
	// We'll output pages in order: F1,B1, F2,B2, ...
	// gofpdf doesn't easily reorder pages, so let's just output front-then-back
	// or better: rebuild the PDF with interleaved pages

	c.Header("Content-Type", "application/pdf")
	c.Header("Content-Disposition", "attachment; filename=id_cards.pdf")
	pdf.Output(c.Writer)
}

func drawCardFront(pdf *gofpdf.Fpdf, x, y, w, h float64, emp models.Employee) {
	pdf.SetDrawColor(180, 180, 180)
	pdf.SetLineWidth(0.3)
	pdf.Rect(x, y, w, h, "D")

	// Header bar
	pdf.SetFillColor(29, 78, 137)
	pdf.Rect(x+0.5, y+0.5, w-1, 10, "F")

	// Company name in header
	companyName := "Ekushe Fashions Ltd."
	if emp.Company.CompanyNameEn != "" {
		companyName = emp.Company.CompanyNameEn
	}
	pdf.SetFont("Helvetica", "B", 8)
	pdf.SetTextColor(255, 255, 255)
	pdf.SetXY(x, y+1)
	pdf.CellFormat(w, 4, strings.ToUpper(companyName), "", 0, "C", false, 0, "")

	// Subtitle in header
	pdf.SetFont("Helvetica", "", 5.5)
	pdf.SetXY(x, y+5)
	pdf.CellFormat(w, 4, "Employee Identity Card", "", 0, "C", false, 0, "")

	// Photo area
	photoX := x + 4
	photoY := y + 13
	photoW := 22.0
	photoH := 28.0

	pdf.SetDrawColor(200, 200, 200)
	pdf.SetLineWidth(0.3)
	pdf.Rect(photoX, photoY, photoW, photoH, "D")

	if emp.ImageURL != "" {
		imgPath := resolveImagePath(emp.ImageURL)
		if _, err := os.Stat(imgPath); err == nil {
			pdf.ImageOptions(imgPath, photoX+1, photoY+1, photoW-2, 0, false, gofpdf.ImageOptions{ImageType: filepath.Ext(imgPath)}, 0, "")
		}
	}

	// Employee info
	textX := photoX + photoW + 4
	textY := photoY

	pdf.SetTextColor(0, 0, 0)

	// Name
	pdf.SetFont("Helvetica", "B", 8)
	pdf.SetXY(textX, textY)
	pdf.CellFormat(0, 4, emp.NameEn, "", 0, "L", false, 0, "")

	// Designation
	pdf.SetFont("Helvetica", "", 6.5)
	designation := ""
	if emp.DesignationRef != nil {
		designation = emp.DesignationRef.Name
	}
	pdf.SetXY(textX, textY+4.5)
	pdf.SetTextColor(80, 80, 80)
	pdf.CellFormat(0, 4, designation, "", 0, "L", false, 0, "")

	// Department
	dept := ""
	if emp.Department != nil {
		dept = emp.Department.Name
	}
	pdf.SetXY(textX, textY+8.5)
	pdf.CellFormat(0, 4, dept, "", 0, "L", false, 0, "")

	// Info grid below photo
	infoY := photoY + photoH + 2
	pdf.SetTextColor(0, 0, 0)

	drawInfoLine := func(label, value string, rowY float64) {
		pdf.SetFont("Helvetica", "B", 5.5)
		pdf.SetTextColor(100, 100, 100)
		pdf.SetXY(x+4, rowY)
		pdf.CellFormat(16, 3.5, label, "", 0, "L", false, 0, "")
		pdf.SetFont("Helvetica", "", 6)
		pdf.SetTextColor(0, 0, 0)
		pdf.SetXY(x+20, rowY)
		pdf.CellFormat(28, 3.5, value, "", 0, "L", false, 0, "")
	}

	drawInfoLine("Employee ID", emp.EmployeeID, infoY)
	drawInfoLine("Blood Group", emp.BloodGroup, infoY+3.5)
	drawInfoLine("Phone", emp.Phone, infoY+7)
	drawInfoLine("Joining Date", emp.JoiningDate.Format("02-01-2006"), infoY+10.5)

	// Right side info
	drawInfoLineR := func(label, value string, rowY float64) {
		pdf.SetFont("Helvetica", "B", 5.5)
		pdf.SetTextColor(100, 100, 100)
		pdf.SetXY(x+52, rowY)
		pdf.CellFormat(18, 3.5, label, "", 0, "L", false, 0, "")
		pdf.SetFont("Helvetica", "", 6)
		pdf.SetTextColor(0, 0, 0)
		pdf.SetXY(x+70, rowY)
		pdf.CellFormat(16, 3.5, value, "", 0, "L", false, 0, "")
	}

	section := ""
	if emp.SectionRef != nil {
		section = emp.SectionRef.Name
	}
	drawInfoLineR("Section", section, infoY)
	drawInfoLineR("Grade", emp.Grade, infoY+3.5)
	drawInfoLineR("Gender", emp.Gender, infoY+7)
	drawInfoLineR("NID", emp.NID, infoY+10.5)

	// Footer bar
	footerY := y + h - 4
	pdf.SetDrawColor(29, 78, 137)
	pdf.SetLineWidth(0.5)
	pdf.Line(x+2, footerY, x+w-2, footerY)
	pdf.SetFont("Helvetica", "I", 5)
	pdf.SetTextColor(150, 150, 150)
	pdf.SetXY(x, footerY+0.5)
	pdf.CellFormat(w, 3, "This card is the property of the company. If found, please return.", "", 0, "C", false, 0, "")
}

func drawCardBack(pdf *gofpdf.Fpdf, x, y, w, h float64, emp models.Employee) {
	// Card border
	pdf.SetDrawColor(180, 180, 180)
	pdf.SetLineWidth(0.3)
	pdf.Rect(x, y, w, h, "D")

	// Header bar
	pdf.SetFillColor(29, 78, 137)
	pdf.Rect(x+0.5, y+0.5, w-1, 10, "F")

	companyName := "Ekushe Fashions Ltd."
	if emp.Company.CompanyNameEn != "" {
		companyName = emp.Company.CompanyNameEn
	}
	pdf.SetFont("Helvetica", "B", 8)
	pdf.SetTextColor(255, 255, 255)
	pdf.SetXY(x, y+1)
	pdf.CellFormat(w, 4, strings.ToUpper(companyName), "", 0, "C", false, 0, "")

	pdf.SetFont("Helvetica", "", 5.5)
	pdf.SetXY(x, y+5)
	pdf.CellFormat(w, 4, "Employee Identity Card — Back", "", 0, "C", false, 0, "")

	// Content area
	contentY := y + 14
	contentMargin := 4.0

	pdf.SetTextColor(0, 0, 0)
	pdf.SetFont("Helvetica", "B", 6)
	pdf.SetXY(x+contentMargin, contentY)
	pdf.CellFormat(0, 4, "Company Address:", "", 0, "L", false, 0, "")
	pdf.SetFont("Helvetica", "", 5.5)
	address := emp.Company.AddressEn
	if address == "" {
		address = "House: XX, Road: XX, Sector: XX, Gazipur, Bangladesh"
	}
	pdf.SetXY(x+contentMargin, contentY+4)
	pdf.MultiCell(w-2*contentMargin, 3, address, "", "L", false)

	pdf.SetFont("Helvetica", "B", 6)
	pdf.SetXY(x+contentMargin, contentY+12)
	pdf.CellFormat(0, 4, "Phone / Email:", "", 0, "L", false, 0, "")
	pdf.SetFont("Helvetica", "", 5.5)
	contact := emp.Company.Phone
	if emp.Company.Email != "" {
		contact += " | " + emp.Company.Email
	}
	pdf.SetXY(x+contentMargin, contentY+16)
	pdf.CellFormat(w-2*contentMargin, 3, contact, "", 0, "L", false, 0, "")

	// Employee info section
	empInfoY := contentY + 22
	pdf.SetFont("Helvetica", "B", 6)
	pdf.SetXY(x+contentMargin, empInfoY)
	pdf.CellFormat(0, 4, "Employee Details:", "", 0, "L", false, 0, "")

	backInfo := func(label, value string, rowY float64, colX float64) {
		pdf.SetFont("Helvetica", "B", 5)
		pdf.SetTextColor(100, 100, 100)
		pdf.SetXY(colX, rowY)
		pdf.CellFormat(18, 3, label, "", 0, "L", false, 0, "")
		pdf.SetFont("Helvetica", "", 5.5)
		pdf.SetTextColor(0, 0, 0)
		pdf.SetXY(colX+18, rowY)
		pdf.CellFormat(22, 3, value, "", 0, "L", false, 0, "")
	}

	backInfo("Name", emp.NameEn, empInfoY+4, x+contentMargin)
	backInfo("Designation", func() string {
		if emp.DesignationRef != nil {
			return emp.DesignationRef.Name
		}
		return ""
	}(), empInfoY+7.5, x+contentMargin)
	backInfo("Address", truncateString(emp.PresentAddress, 35), empInfoY+11, x+contentMargin)

	backInfo("Blood Group", emp.BloodGroup, empInfoY+4, x+46)
	backInfo("Emergency", emp.EmergencyContact, empInfoY+7.5, x+46)
	backInfo("Phone", emp.EmergencyPhone, empInfoY+11, x+46)

	// Signature line
	sigY := y + h - 8
	pdf.SetDrawColor(0, 0, 0)
	pdf.SetLineWidth(0.2)
	pdf.Line(x+38, sigY, x+w-4, sigY)
	pdf.SetFont("Helvetica", "I", 5)
	pdf.SetTextColor(130, 130, 130)
	pdf.SetXY(x+38, sigY+1)
	pdf.CellFormat(w-42, 3, "Authorized Signature", "", 0, "C", false, 0, "")

	// Footer
	pdf.SetFont("Helvetica", "I", 4.5)
	pdf.SetXY(x, y+h-4)
	pdf.CellFormat(w, 3, "If found, please return to the above address.", "", 0, "C", false, 0, "")
}

func resolveImagePath(url string) string {
	path := strings.TrimPrefix(url, "/")
	path = strings.TrimPrefix(path, "uploads/")
	return filepath.Join("uploads", path)
}

func truncateString(s string, maxLen int) string {
	runes := []rune(s)
	if len(runes) <= maxLen {
		return s
	}
	return string(runes[:maxLen-2]) + ".."
}
