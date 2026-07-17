package handlers

import (
	"bytes"
	"fmt"
	"io"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/shakil5281/hrhub-api/internal/models"
	"github.com/shakil5281/hrhub-api/internal/repository"
	"github.com/xuri/excelize/v2"
)

type EmployeeImportHandler struct {
	employeeRepo *repository.EmployeeRepository
}

func NewEmployeeImportHandler(employeeRepo *repository.EmployeeRepository) *EmployeeImportHandler {
	return &EmployeeImportHandler{employeeRepo: employeeRepo}
}

var importHeaders = []string{
	"employee_id", "name_en", "name_bn", "father_name", "mother_name",
	"date_of_birth", "gender", "blood_group", "marital_status", "nationality",
	"nid", "phone", "email", "present_address", "permanent_address",
	"designation", "section", "grade", "line", "group_name", "floor",
	"punch_number", "joining_date", "status",
	"gross_salary",
	"account_type", "account_number",
	"company_id",
}

var importDescriptions = []string{
	"Unique employee ID *", "Full name in English *", "Name in Bangla", "Father's name",
	"Mother's name", "Date of birth (YYYY-MM-DD)", "Male/Female/Other", "A+/A-/B+/B-/AB+/AB-/O+/O-",
	"Single/Married/Divorced/Widowed", "Bangladeshi", "National ID number",
	"Phone number", "Email address", "Present address", "Permanent address",
	"Designation name", "Section name", "Grade", "Production line", "Group name", "Floor",
	"Badge/punch number", "Joining date (YYYY-MM-DD) *", "active/inactive",
	"Gross salary",
	"mCash or Card", "Account number (12 for mCash, 17 for Card)",
	"Company ID *",
}

func (h *EmployeeImportHandler) DownloadTemplate(c *gin.Context) {
	f := excelize.NewFile()

	styleHeader, _ := f.NewStyle(&excelize.Style{
		Font: &excelize.Font{Bold: true, Color: "FFFFFF", Size: 11},
		Fill: excelize.Fill{Type: "pattern", Pattern: 1, Color: []string{"4472C4"}},
		Border: []excelize.Border{
			{Type: "left", Style: 1, Color: "000000"},
			{Type: "right", Style: 1, Color: "000000"},
			{Type: "top", Style: 1, Color: "000000"},
			{Type: "bottom", Style: 1, Color: "000000"},
		},
	})

	numCols := len(importHeaders)
	endCol := string(rune('A' + numCols - 1))

	writeHeaders := func(sheet string) {
		for i, hdr := range importHeaders {
			f.SetCellValue(sheet, fmt.Sprintf("%s1", string(rune('A'+i))), hdr)
		}
		f.SetCellStyle(sheet, "A1", fmt.Sprintf("%s1", endCol), styleHeader)
		for i := range importHeaders {
			width := 18.0
			if importHeaders[i] == "present_address" || importHeaders[i] == "permanent_address" {
				width = 30
			}
			f.SetColWidth(sheet, string(rune('A'+i)), string(rune('A'+i)), width)
		}
		f.SetPanes(sheet, &excelize.Panes{
			Freeze:      true,
			YSplit:      1,
			TopLeftCell: "A2",
			ActivePane:  "bottomLeft",
		})
	}

	// Sheet 1: Data Entry - empty headers for user data import
	dataEntry := "Data Entry"
	f.SetSheetName("Sheet1", dataEntry)
	writeHeaders(dataEntry)

	// Sheet 2: Demo - same design with 3 example rows
	demo := "Demo"
	f.NewSheet(demo)
	writeHeaders(demo)

	demoData := [][]interface{}{
		{
			"DEMO001", "Shakil Ahmed", "শাকিল আহমেদ", "Abdul Halim", "Rahima Khatun",
			"1995-06-15", "Male", "B+", "Married", "Bangladeshi",
			"1995123456", "01711111111", "shakil@example.com", "House 12, Road 5, Mirpur", "Village: Uttarpara, Thana: Sadar",
			"Assistant Manager", "IT", "Grade-5", "Line-2", "Group-B", "Floor-1",
			"2001", "2023-01-01", "active",
			"50000",
			"mCash", "012345678901",
			"UUID-OF-COMPANY",
		},
		{
			"DEMO002", "Fatima Begum", "ফাতিমা বেগম", "Mohammad Ali", "Saleha Begum",
			"1998-09-22", "Female", "O+", "Single", "Bangladeshi",
			"1998123456", "01722222222", "fatima@example.com", "Flat 3B, 45 Elephant Road", "23/1 Old Town, Cumilla",
			"Jr. Executive", "HR", "Grade-3", "Line-1", "Group-A", "Floor-2",
			"2002", "2023-06-01", "active",
			"36000",
			"Card", "12345678901234567",
			"UUID-OF-COMPANY",
		},
		{
			"DEMO003", "Rahim Uddin", "রহিম উদ্দিন", "Karim Uddin", "Jahanara Begum",
			"1992-03-08", "Male", "AB-", "Married", "Bangladeshi",
			"1992123456", "01733333333", "rahim@example.com", "456 New Market, Khulna", "87 Old Road, Barisal",
			"Manager", "Production", "Grade-8", "Line-3", "Group-C", "Floor-1",
			"2003", "2022-07-15", "active",
			"70000",
			"mCash", "987654321012",
			"UUID-OF-COMPANY",
		},
	}

	for rowIdx, rowData := range demoData {
		row := rowIdx + 2
		for colIdx, val := range rowData {
			col := string(rune('A' + colIdx))
			f.SetCellValue(demo, fmt.Sprintf("%s%d", col, row), val)
		}
	}

	if idx, _ := f.GetSheetIndex(dataEntry); idx > 0 {
		f.SetActiveSheet(idx)
	}

	c.Header("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
	c.Header("Content-Disposition", "attachment; filename=employee_import_template.xlsx")
	f.Write(c.Writer)
}

// ImportExcel godoc
//
// @Summary      Import employees from Excel
// @Description  Bulk import employees from uploaded Excel file. Matches on employee_id for upsert.
// @Tags         Employees
// @Security     BearerAuth
// @Accept       multipart/form-data
// @Produce      json
// @Param        file formData file true "Excel file (.xlsx)"
// @Success      200  {object}  map[string]interface{}
// @Failure      400  {object}  map[string]string
// @Failure      500  {object}  map[string]string
// @Router       /employees/import [post]
func (h *EmployeeImportHandler) ImportExcel(c *gin.Context) {
	file, header, err := c.Request.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "file is required"})
		return
	}
	defer file.Close()

	if !strings.HasSuffix(header.Filename, ".xlsx") {
		c.JSON(http.StatusBadRequest, gin.H{"error": "only .xlsx files are supported"})
		return
	}

	data, err := io.ReadAll(file)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "failed to read file"})
		return
	}

	f, err := excelize.OpenReader(bytes.NewReader(data))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "failed to parse Excel file"})
		return
	}
	defer f.Close()

	sheetName := f.GetSheetName(f.GetActiveSheetIndex())
	// Prefer "Data Entry" sheet, fallback to active
	if idx, _ := f.GetSheetIndex("Data Entry"); idx > 0 {
		sheetName = "Data Entry"
	}

	rows, err := f.GetRows(sheetName)
	if err != nil || len(rows) < 2 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "no data rows found in sheet"})
		return
	}

	headerRow := rows[0]
	colMap := make(map[string]int)
	for i, h := range headerRow {
		h = strings.TrimSpace(strings.ToLower(h))
		colMap[h] = i
	}

	requiredFields := []string{"employee_id", "name_en", "joining_date"}
	for _, rf := range requiredFields {
		if _, ok := colMap[rf]; !ok {
			c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("required column '%s' not found", rf)})
			return
		}
	}

	var parsed []parsedRow
	var errors []string

	for rowIdx := 1; rowIdx < len(rows); rowIdx++ {
		row := rows[rowIdx]
		if len(row) == 0 || allEmpty(row) {
			continue
		}
		empID := getCell(row, colMap, "employee_id")
		if empID == "" {
			errors = append(errors, fmt.Sprintf("Row %d: employee_id is required", rowIdx+1))
			continue
		}

		dateOfBirth := getCell(row, colMap, "date_of_birth")
		if dateOfBirth != "" && !isValidDate(dateOfBirth) {
			errors = append(errors, fmt.Sprintf("Row %d: invalid date_of_birth format '%s' (use YYYY-MM-DD)", rowIdx+1, dateOfBirth))
			continue
		}

		joiningDate := getCell(row, colMap, "joining_date")
		if joiningDate != "" && !isValidDate(joiningDate) {
			errors = append(errors, fmt.Sprintf("Row %d: invalid joining_date format '%s' (use YYYY-MM-DD)", rowIdx+1, joiningDate))
			continue
		}

		parsed = append(parsed, parsedRow{
			row:    row,
			index:  rowIdx + 1,
			code:   empID,
			colMap: colMap,
		})
	}

	if len(errors) > 0 {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":  fmt.Sprintf("Validation errors in %d row(s)", len(errors)),
			"errors": errors,
		})
		return
	}

	if len(parsed) == 0 {
		c.JSON(http.StatusOK, gin.H{"message": "No data rows to import", "created": 0, "updated": 0, "total": 0})
		return
	}

	userID := c.GetString("user_id")
	companyID := c.GetString("company_id")
	if companyID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "company_id not found in auth context"})
		return
	}

	existingMap, err := h.employeeRepo.MapByID(companyID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to lookup existing employees"})
		return
	}

	var toCreate []models.Employee
	var toUpdate []models.Employee

	for _, p := range parsed {
		emp := rowToEmployee(p.row, p.colMap, companyID, userID)
		if _, exists := existingMap[p.code]; exists {
			emp.ID = existingMap[p.code].ID
			toUpdate = append(toUpdate, emp)
		} else {
			toCreate = append(toCreate, emp)
		}
	}

	created := len(toCreate)
	updated := len(toUpdate)

	if created > 0 {
		if err := h.employeeRepo.BatchCreate(toCreate); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create employees: " + err.Error()})
			return
		}
	}

	if updated > 0 {
		if err := h.employeeRepo.BulkUpdateByID(toUpdate); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update employees: " + err.Error()})
			return
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"message": fmt.Sprintf("Import complete. %d created, %d updated", created, updated),
		"created": created,
		"updated": updated,
		"total":   created + updated,
	})
}

type parsedRow struct {
	row    []string
	index  int
	code   string
	colMap map[string]int
}

func getCell(row []string, colMap map[string]int, key string) string {
	if idx, ok := colMap[key]; ok && idx < len(row) {
		return strings.TrimSpace(row[idx])
	}
	return ""
}

func getCellFloat(row []string, colMap map[string]int, key string) float64 {
	s := getCell(row, colMap, key)
	if s == "" {
		return 0
	}
	v, _ := strconv.ParseFloat(s, 64)
	return v
}

func allEmpty(row []string) bool {
	for _, cell := range row {
		if strings.TrimSpace(cell) != "" {
			return false
		}
	}
	return true
}

func isValidDate(dateStr string) bool {
	_, err := time.Parse("2006-01-02", dateStr)
	return err == nil
}

func rowToEmployee(row []string, colMap map[string]int, companyID, userID string) models.Employee {
	joiningDate := getCell(row, colMap, "joining_date")
	parsedJoining, _ := time.Parse("2006-01-02", joiningDate)

	dateOfBirth := getCell(row, colMap, "date_of_birth")

	empCompanyID := getCell(row, colMap, "company_id")
	if empCompanyID == "" {
		empCompanyID = companyID
	}

	return models.Employee{
		CompanyID:          empCompanyID,
		EmployeeID:         getCell(row, colMap, "employee_id"),
		NameEn:             getCell(row, colMap, "name_en"),
		NameBn:             getCell(row, colMap, "name_bn"),
		FatherName:         getCell(row, colMap, "father_name"),
		MotherName:         getCell(row, colMap, "mother_name"),
		DateOfBirth:        dateOfBirth,
		Gender:             getCell(row, colMap, "gender"),
		BloodGroup:         getCell(row, colMap, "blood_group"),
		MaritalStatus:      getCell(row, colMap, "marital_status"),
		Nationality:        getCell(row, colMap, "nationality"),
		NID:                getCell(row, colMap, "nid"),
		Phone:              getCell(row, colMap, "phone"),
		Email:              getCell(row, colMap, "email"),
		PresentAddress:     getCell(row, colMap, "present_address"),
		PermanentAddress:   getCell(row, colMap, "permanent_address"),
		Grade:              getCell(row, colMap, "grade"),
		PunchNumber:        getCell(row, colMap, "punch_number"),
		JoiningDate:        parsedJoining,
		Status:             getCell(row, colMap, "status"),
		GrossSalary:        getCellFloat(row, colMap, "gross_salary"),
		TransportAllowance: getCellFloat(row, colMap, "transport_allowance"),
		FoodAllowance:      getCellFloat(row, colMap, "food_allowance"),
		OtherAllowance:     getCellFloat(row, colMap, "other_allowance"),
		AccountType:        getCell(row, colMap, "account_type"),
		AccountNumber:      getCell(row, colMap, "account_number"),
		CreatedBy:          &userID,
	}
}
