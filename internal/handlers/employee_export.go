package handlers

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/jung-kurt/gofpdf"
	"github.com/shakil5281/hrhub-api/internal/database"
	"github.com/shakil5281/hrhub-api/internal/models"
	"github.com/xuri/excelize/v2"
)

// ExportEmployeesExcel godoc
//
// @Summary      Export employees to Excel
// @Description  Export filtered employee list to Excel format
// @Tags         Employees
// @Security     BearerAuth
// @Produce      application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
// @Param        company_id query string false "Filter by company"
// @Param        department_id query string false "Filter by department"
// @Param        status query string false "Filter by status"
// @Success      200  {file}  binary
// @Router       /employees/export/excel [get]
func (h *EmployeeHandler) ExportExcel(c *gin.Context) {
	var employees []models.Employee
	query := database.DB.Preload("Company").Preload("Department").Preload("DesignationRef").Preload("SectionRef").Preload("LineRef").Preload("GroupRef").Preload("FloorRef")
	if v := c.Query("company_id"); v != "" {
		query = query.Where("company_id = ?", v)
	}
	if v := c.Query("department_id"); v != "" {
		query = query.Where("department_id = ?", v)
	}
	if v := c.Query("status"); v != "" {
		query = query.Where("status = ?", v)
	}
	if err := query.Order("employee_id ASC").Find(&employees).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	f := excelize.NewFile()
	sheet := "Employees"
	f.SetSheetName("Sheet1", sheet)

	styleHeader, _ := f.NewStyle(&excelize.Style{
		Font: &excelize.Font{Bold: true, Color: "FFFFFF", Size: 11},
		Fill: excelize.Fill{Type: "pattern", Pattern: 1, Color: []string{"4472C4"}},
	})
	styleDate, _ := f.NewStyle(&excelize.Style{NumFmt: 14})
	styleSalary, _ := f.NewStyle(&excelize.Style{NumFmt: 4})

	exportHeaders := []string{
		"Employee ID", "Name (English)", "Name (Bangla)", "Designation", "Department",
		"Section", "Grade", "Line", "Group", "Floor", "Punch No",
		"Phone", "Email", "NID", "Gender", "Blood Group",
		"Marital Status", "Religion", "Nationality", "Date of Birth", "Joining Date",
		"Present Address", "Permanent Address", "Father's Name", "Mother's Name",
		"Spouse Name", "Emergency Contact", "Emergency Phone",
		"Employee Type", "Gross Salary",
		"Account Type", "Account Number", "Status",
	}

	for i, h := range exportHeaders {
		col := string(rune('A' + i))
		f.SetCellValue(sheet, fmt.Sprintf("%s1", col), h)
	}
	endCol := string(rune('A' + len(exportHeaders) - 1))
	f.SetCellStyle(sheet, "A1", fmt.Sprintf("%s1", endCol), styleHeader)

	for rowIdx, emp := range employees {
		row := rowIdx + 2
		f.SetCellValue(sheet, fmt.Sprintf("A%d", row), emp.EmployeeID)
		f.SetCellValue(sheet, fmt.Sprintf("B%d", row), emp.NameEn)
		f.SetCellValue(sheet, fmt.Sprintf("C%d", row), emp.NameBn)
		if emp.DesignationRef != nil {
			f.SetCellValue(sheet, fmt.Sprintf("D%d", row), emp.DesignationRef.Name)
		}
		if emp.Department != nil {
			f.SetCellValue(sheet, fmt.Sprintf("E%d", row), emp.Department.Name)
		}
		if emp.SectionRef != nil {
			f.SetCellValue(sheet, fmt.Sprintf("F%d", row), emp.SectionRef.Name)
		}
		f.SetCellValue(sheet, fmt.Sprintf("G%d", row), emp.Grade)
		if emp.LineRef != nil {
			f.SetCellValue(sheet, fmt.Sprintf("H%d", row), emp.LineRef.Name)
		}
		if emp.GroupRef != nil {
			f.SetCellValue(sheet, fmt.Sprintf("I%d", row), emp.GroupRef.Name)
		}
		if emp.FloorRef != nil {
			f.SetCellValue(sheet, fmt.Sprintf("J%d", row), emp.FloorRef.Name)
		}
		f.SetCellValue(sheet, fmt.Sprintf("K%d", row), emp.PunchNumber)
		f.SetCellValue(sheet, fmt.Sprintf("L%d", row), emp.Phone)
		f.SetCellValue(sheet, fmt.Sprintf("M%d", row), emp.Email)
		f.SetCellValue(sheet, fmt.Sprintf("N%d", row), emp.NID)
		f.SetCellValue(sheet, fmt.Sprintf("O%d", row), emp.Gender)
		f.SetCellValue(sheet, fmt.Sprintf("P%d", row), emp.BloodGroup)
		f.SetCellValue(sheet, fmt.Sprintf("Q%d", row), emp.MaritalStatus)
		f.SetCellValue(sheet, fmt.Sprintf("R%d", row), emp.Religion)
		f.SetCellValue(sheet, fmt.Sprintf("S%d", row), emp.Nationality)
		if emp.DateOfBirth != "" {
			f.SetCellValue(sheet, fmt.Sprintf("T%d", row), emp.DateOfBirth)
		}
		f.SetCellStyle(sheet, fmt.Sprintf("U%d", row), fmt.Sprintf("U%d", row), styleDate)
		f.SetCellValue(sheet, fmt.Sprintf("U%d", row), emp.JoiningDate.Format("2006-01-02"))
		f.SetCellValue(sheet, fmt.Sprintf("V%d", row), emp.PresentAddress)
		f.SetCellValue(sheet, fmt.Sprintf("W%d", row), emp.PermanentAddress)
		f.SetCellValue(sheet, fmt.Sprintf("X%d", row), emp.FatherName)
		f.SetCellValue(sheet, fmt.Sprintf("Y%d", row), emp.MotherName)
		f.SetCellValue(sheet, fmt.Sprintf("Z%d", row), emp.SpouseName)
		f.SetCellValue(sheet, fmt.Sprintf("AA%d", row), emp.EmergencyContact)
		f.SetCellValue(sheet, fmt.Sprintf("AB%d", row), emp.EmergencyPhone)
		f.SetCellValue(sheet, fmt.Sprintf("AC%d", row), emp.EmployeeType)
		f.SetCellStyle(sheet, fmt.Sprintf("AD%d", row), fmt.Sprintf("AD%d", row), styleSalary)
		f.SetCellValue(sheet, fmt.Sprintf("AD%d", row), emp.GrossSalary)
		f.SetCellValue(sheet, fmt.Sprintf("AE%d", row), emp.AccountType)
		f.SetCellValue(sheet, fmt.Sprintf("AF%d", row), emp.AccountNumber)
		status := "Active"
		if emp.Status == "inactive" {
			status = "Inactive"
		}
		f.SetCellValue(sheet, fmt.Sprintf("AG%d", row), status)
	}

	f.SetColWidth(sheet, "B", "B", 25)
	f.SetColWidth(sheet, "C", "C", 20)
	f.SetColWidth(sheet, "T", "T", 30)
	f.SetColWidth(sheet, "U", "U", 30)

	c.Header("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
	c.Header("Content-Disposition", "attachment; filename=employees_export.xlsx")
	f.Write(c.Writer)
}

// ExportEmployeesPDF godoc
//
// @Summary      Export employees to PDF
// @Description  Export filtered employee list to PDF format
// @Tags         Employees
// @Security     BearerAuth
// @Produce      application/pdf
// @Param        company_id query string false "Filter by company"
// @Param        department_id query string false "Filter by department"
// @Param        status query string false "Filter by status"
// @Success      200  {file}  binary
// @Router       /employees/export/pdf [get]
func (h *EmployeeHandler) ExportPDF(c *gin.Context) {
	var employees []models.Employee
	query := database.DB.Preload("Company").Preload("Department").Preload("DesignationRef").Preload("SectionRef").Preload("LineRef").Preload("GroupRef").Preload("FloorRef")
	if v := c.Query("company_id"); v != "" {
		query = query.Where("company_id = ?", v)
	}
	if v := c.Query("department_id"); v != "" {
		query = query.Where("department_id = ?", v)
	}
	if v := c.Query("status"); v != "" {
		query = query.Where("status = ?", v)
	}
	if err := query.Order("employee_id ASC").Find(&employees).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	pdf := gofpdf.New("L", "mm", "A4", "")
	pdf.SetMargins(5, 10, 5)
	pdf.AddPage()

	pdf.SetFont("Arial", "B", 14)
	pdf.CellFormat(0, 10, "Employee List", "", 1, "C", false, 0, "")
	pdf.Ln(4)

	headers := []string{"Emp. ID", "Name", "Designation", "Department", "Phone", "Status"}
	colWidths := []float64{20, 50, 40, 35, 35, 20}

	pdf.SetFont("Arial", "B", 8)
	pdf.SetFillColor(68, 114, 196)
	pdf.SetTextColor(255, 255, 255)
	for i, h := range headers {
		pdf.CellFormat(colWidths[i], 7, h, "1", 0, "C", true, 0, "")
	}
	pdf.Ln(-1)

	pdf.SetTextColor(0, 0, 0)
	for _, emp := range employees {
		pageHeight := 297.0
		if pdf.GetY() > pageHeight-20 {
			pdf.AddPage()
			pdf.SetFont("Arial", "B", 8)
			pdf.SetFillColor(68, 114, 196)
			pdf.SetTextColor(255, 255, 255)
			for i, h := range headers {
				pdf.CellFormat(colWidths[i], 7, h, "1", 0, "C", true, 0, "")
			}
			pdf.Ln(-1)
			pdf.SetTextColor(0, 0, 0)
		}

		fill := false
		if pdf.GetY()/7/2 == 0 {
			fill = true
		}
		if fill {
			pdf.SetFillColor(240, 245, 255)
		}

		pdf.SetFont("Arial", "", 7)
		pdf.CellFormat(colWidths[0], 7, emp.EmployeeID, "1", 0, "C", fill, 0, "")
		pdf.CellFormat(colWidths[1], 7, truncate(emp.NameEn, 25), "1", 0, "L", fill, 0, "")
		desigName := ""
		if emp.DesignationRef != nil {
			desigName = emp.DesignationRef.Name
		}
		pdf.CellFormat(colWidths[2], 7, truncate(desigName, 20), "1", 0, "L", fill, 0, "")
		deptName := ""
		if emp.Department != nil {
			deptName = emp.Department.Name
		}
		pdf.CellFormat(colWidths[3], 7, truncate(deptName, 18), "1", 0, "L", fill, 0, "")
		pdf.CellFormat(colWidths[4], 7, emp.Phone, "1", 0, "L", fill, 0, "")
		status := "Active"
		if emp.Status == "inactive" {
			status = "Inactive"
		}
		pdf.CellFormat(colWidths[5], 7, status, "1", 0, "C", fill, 0, "")
		pdf.Ln(-1)
	}

	// Footer summary
	pdf.Ln(8)
	pdf.SetFont("Arial", "B", 10)
	pdf.CellFormat(0, 8, fmt.Sprintf("Total Employees: %d", len(employees)), "", 1, "R", false, 0, "")

	c.Header("Content-Type", "application/pdf")
	c.Header("Content-Disposition", "attachment; filename=employees_export.pdf")
	if err := pdf.Output(c.Writer); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate PDF"})
	}
}

func truncate(s string, maxLen int) string {
	if len([]rune(s)) > maxLen {
		return string([]rune(s)[:maxLen-3]) + "..."
	}
	return s
}


