package handlers

import (
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/shakil5281/hrhub-api/internal/models"
	"github.com/shakil5281/hrhub-api/internal/repository"
)

type SalaryHandler struct {
	salaryRepo    *repository.SalaryRepository
	employeeRepo  *repository.EmployeeRepository
	attendanceRepo *repository.AttendanceRepository
}

func NewSalaryHandler(
	salaryRepo *repository.SalaryRepository,
	employeeRepo *repository.EmployeeRepository,
	attendanceRepo *repository.AttendanceRepository,
) *SalaryHandler {
	return &SalaryHandler{
		salaryRepo:    salaryRepo,
		employeeRepo:  employeeRepo,
		attendanceRepo: attendanceRepo,
	}
}

type ProcessSalaryRequest struct {
	CompanyID string `json:"company_id" binding:"required"`
	Month     int    `json:"month" binding:"required"`
	Year      int    `json:"year" binding:"required"`
}

// ProcessSalary godoc
//
// @Summary      Process monthly salary
// @Description  Calculate and generate salary for all active employees for a given month/year
// @Tags         Salary
// @Security     BearerAuth
// @Accept       json
// @Produce      json
// @Param        request body ProcessSalaryRequest true "Salary process params"
// @Success      200  {object}  map[string]interface{}
// @Failure      400  {object}  map[string]string
// @Failure      500  {object}  map[string]string
// @Router       /salary/process [post]
func (h *SalaryHandler) Process(c *gin.Context) {
	var req ProcessSalaryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	startDate := time.Date(req.Year, time.Month(req.Month), 1, 0, 0, 0, 0, time.UTC)
	endDate := startDate.AddDate(0, 1, -1)
	startStr := startDate.Format("2006-01-02")
	endStr := endDate.Format("2006-01-02")

	employees, err := h.employeeRepo.ListActive(req.CompanyID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch employees"})
		return
	}

	if len(employees) == 0 {
		c.JSON(http.StatusOK, gin.H{"message": "No active employees found", "processed": 0})
		return
	}

	attendanceReport, err := h.attendanceRepo.MonthlyReport(startStr, endStr, req.CompanyID, "", "", "", "", "")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch attendance data"})
		return
	}

	attMap := make(map[string]map[string]interface{})
	for _, r := range attendanceReport {
		if empID, ok := r["employee_id"].(string); ok {
			attMap[empID] = r
		}
	}

	otHoursMap, err := h.attendanceRepo.GetMonthlyOvertimeHours(req.CompanyID, startStr, endStr)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch overtime data"})
		return
	}

	processed := 0
	userID := c.GetString("user_id")

	for _, emp := range employees {
		gross := emp.GrossSalary
		basic := gross * 0.5
		houseRent := gross * 0.25
		medical := gross * 0.1
		transport := emp.TransportAllowance
		food := emp.FoodAllowance
		other := emp.OtherAllowance
		pf := emp.ProvidentFund
		tax := emp.Tax

		presentDays := 0
		absentDays := 0
		lateDays := 0
		leaveDays := 0
		weekendDays := 0
		totalDays := 0

		if att, ok := attMap[emp.ID]; ok {
			presentDays = toInt(att["present"])
			absentDays = toInt(att["absent"])
			lateDays = toInt(att["late"])
			leaveDays = toInt(att["leave"])
			weekendDays = toInt(att["weekend"])
			totalDays = toInt(att["total_days"])
		}

		absentDeduction := float64(0)
		if totalDays > 0 {
			perDaySalary := gross / float64(totalDays)
			absentDeduction = perDaySalary * float64(absentDays)
		}

		otHours := otHoursMap[emp.ID]
		otRate := float64(0)
		if totalDays > 0 {
			otRate = basic / float64(totalDays) / 8
		}
		otAmount := otHours * otRate

		attBonus := float64(0)
		if absentDays == 0 && presentDays > 0 {
			attBonus = 500
		}

		totalDeductions := pf + tax + absentDeduction
		netSalary := gross - totalDeductions + otAmount + attBonus
		if netSalary < 0 {
			netSalary = 0
		}

		salary := &models.Salary{
			CompanyID:          req.CompanyID,
			EmployeeID:         emp.ID,
			Month:              req.Month,
			Year:               req.Year,
			BasicSalary:        basic,
			HouseRent:          houseRent,
			MedicalAllowance:   medical,
			TransportAllowance: transport,
			FoodAllowance:      food,
			OtherAllowance:     other,
			GrossSalary:        gross,
			ProvidentFund:      pf,
			Tax:                tax,
			AbsentDeduction:    absentDeduction,
			TotalDeductions:    totalDeductions,
			OvertimeHours:      otHours,
			OvertimeRate:       otRate,
			OvertimeAmount:     otAmount,
			AttendanceBonus:    attBonus,
			NetSalary:          netSalary,
			PresentDays:        presentDays,
			AbsentDays:         absentDays,
			LateDays:           lateDays,
			LeaveDays:          leaveDays,
			WeekendDays:        weekendDays,
			TotalDays:          totalDays,
			Status:             "processed",
			CreatedBy:          &userID,
		}

		if err := h.salaryRepo.Upsert(salary); err != nil {
			continue
		}
		processed++
	}

	c.JSON(http.StatusOK, gin.H{
		"message":   fmt.Sprintf("Salary processed for %d employees", processed),
		"processed": processed,
		"total":     len(employees),
		"month":     req.Month,
		"year":      req.Year,
	})
}

// ListSalarySheet godoc
//
// @Summary      List salary sheet
// @Description  Get salary records for all employees for a given month/year
// @Tags         Salary
// @Security     BearerAuth
// @Produce      json
// @Param        company_id    query string true  "Company ID"
// @Param        month         query int    true  "Month (1-12)"
// @Param        year          query int    true  "Year"
// @Param        department_id query string false "Filter by department"
// @Success      200  {object}  map[string]interface{}
// @Failure      500  {object}  map[string]string
// @Router       /salary/sheet [get]
func (h *SalaryHandler) Sheet(c *gin.Context) {
	companyID := c.Query("company_id")
	monthStr := c.Query("month")
	yearStr := c.Query("year")

	month, _ := strconv.Atoi(monthStr)
	year, _ := strconv.Atoi(yearStr)

	if companyID == "" || month == 0 || year == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "company_id, month, and year are required"})
		return
	}

	salaries, err := h.salaryRepo.ListByMonth(companyID, month, year, c.Query("department_id"))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	totals := map[string]float64{
		"basic_salary": 0, "house_rent": 0, "medical_allowance": 0,
		"transport_allowance": 0, "food_allowance": 0, "other_allowance": 0,
		"gross_salary": 0, "provident_fund": 0, "tax": 0,
		"absent_deduction": 0, "total_deductions": 0, "net_salary": 0,
		"overtime_hours": 0, "overtime_amount": 0, "attendance_bonus": 0,
		"total_days": 0, "present_days": 0, "absent_days": 0,
		"weekend_days": 0, "leave_days": 0,
	}
	for _, s := range salaries {
		totals["basic_salary"] += s.BasicSalary
		totals["house_rent"] += s.HouseRent
		totals["medical_allowance"] += s.MedicalAllowance
		totals["transport_allowance"] += s.TransportAllowance
		totals["food_allowance"] += s.FoodAllowance
		totals["other_allowance"] += s.OtherAllowance
		totals["gross_salary"] += s.GrossSalary
		totals["provident_fund"] += s.ProvidentFund
		totals["tax"] += s.Tax
		totals["absent_deduction"] += s.AbsentDeduction
		totals["total_deductions"] += s.TotalDeductions
		totals["net_salary"] += s.NetSalary
		totals["overtime_hours"] += s.OvertimeHours
		totals["overtime_amount"] += s.OvertimeAmount
		totals["attendance_bonus"] += s.AttendanceBonus
		totals["total_days"] += float64(s.TotalDays)
		totals["present_days"] += float64(s.PresentDays)
		totals["absent_days"] += float64(s.AbsentDays)
		totals["weekend_days"] += float64(s.WeekendDays)
		totals["leave_days"] += float64(s.LeaveDays)
	}

	c.JSON(http.StatusOK, gin.H{
		"salaries": salaries,
		"total":    len(salaries),
		"totals":   totals,
		"month":    month,
		"year":     year,
	})
}

// GetPayslip godoc
//
// @Summary      Get employee payslip
// @Description  Get salary record for a specific employee for a given month/year
// @Tags         Salary
// @Security     BearerAuth
// @Produce      json
// @Param        employee_id query string true "Employee ID"
// @Param        month       query int    true "Month (1-12)"
// @Param        year        query int    true "Year"
// @Success      200  {object}  map[string]interface{}
// @Failure      404  {object}  map[string]string
// @Failure      500  {object}  map[string]string
// @Router       /salary/payslip [get]
func (h *SalaryHandler) Payslip(c *gin.Context) {
	employeeID := c.Query("employee_id")
	monthStr := c.Query("month")
	yearStr := c.Query("year")

	month, _ := strconv.Atoi(monthStr)
	year, _ := strconv.Atoi(yearStr)

	if employeeID == "" || month == 0 || year == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "employee_id, month, and year are required"})
		return
	}

	salary, err := h.salaryRepo.FindByEmployeeMonth(employeeID, month, year)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Salary not found for this employee/month"})
		return
	}

	c.JSON(http.StatusOK, salary)
}

// ListSalaries godoc
//
// @Summary      List salary records
// @Description  Get salary records summary (grouped by department)
// @Tags         Salary
// @Security     BearerAuth
// @Produce      json
// @Param        company_id query string true  "Company ID"
// @Param        month      query int    true  "Month (1-12)"
// @Param        year       query int    true  "Year"
// @Success      200  {object}  map[string]interface{}
// @Failure      500  {object}  map[string]string
// @Router       /salary/list [get]
func (h *SalaryHandler) List(c *gin.Context) {
	companyID := c.Query("company_id")
	monthStr := c.Query("month")
	yearStr := c.Query("year")

	month, _ := strconv.Atoi(monthStr)
	year, _ := strconv.Atoi(yearStr)

	if companyID == "" || month == 0 || year == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "company_id, month, and year are required"})
		return
	}

	salaries, err := h.salaryRepo.ListByMonth(companyID, month, year, "")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	deptSummary := make(map[string]map[string]interface{})
	for _, s := range salaries {
		deptName := ""
		if s.Employee.Department != nil {
			deptName = s.Employee.Department.Name
		}
		if deptName == "" {
			deptName = "Unknown"
		}
		if _, ok := deptSummary[deptName]; !ok {
			deptSummary[deptName] = map[string]interface{}{
				"department":     deptName,
				"employees":      0,
				"basic_salary":   0.0,
				"house_rent":     0.0,
				"medical":        0.0,
				"transport":      0.0,
				"gross_salary":   0.0,
				"total_deductions": 0.0,
				"net_salary":     0.0,
			}
		}
		ds := deptSummary[deptName]
		ds["employees"] = ds["employees"].(int) + 1
		ds["basic_salary"] = ds["basic_salary"].(float64) + s.BasicSalary
		ds["house_rent"] = ds["house_rent"].(float64) + s.HouseRent
		ds["medical"] = ds["medical"].(float64) + s.MedicalAllowance
		ds["transport"] = ds["transport"].(float64) + s.TransportAllowance
		ds["gross_salary"] = ds["gross_salary"].(float64) + s.GrossSalary
		ds["total_deductions"] = ds["total_deductions"].(float64) + s.TotalDeductions
		ds["net_salary"] = ds["net_salary"].(float64) + s.NetSalary
	}

	var summaries []map[string]interface{}
	for _, v := range deptSummary {
		summaries = append(summaries, v)
	}

	c.JSON(http.StatusOK, gin.H{
		"summaries": summaries,
		"total":     len(summaries),
	})
}

// SalarySummary godoc
//
// @Summary      Salary summary by department
// @Description  Get salary summary grouped by department with grand totals
// @Tags         Salary
// @Security     BearerAuth
// @Produce      json
// @Param        company_id query string true  "Company ID"
// @Param        month      query int    true  "Month (1-12)"
// @Param        year       query int    true  "Year"
// @Success      200  {object}  map[string]interface{}
// @Failure      500  {object}  map[string]string
// @Router       /salary/summary [get]
func (h *SalaryHandler) Summary(c *gin.Context) {
	companyID := c.Query("company_id")
	monthStr := c.Query("month")
	yearStr := c.Query("year")

	month, _ := strconv.Atoi(monthStr)
	year, _ := strconv.Atoi(yearStr)

	if companyID == "" || month == 0 || year == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "company_id, month, and year are required"})
		return
	}

	salaries, err := h.salaryRepo.ListByMonth(companyID, month, year, "")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	deptMap := make(map[string]*struct {
		Employees     int
		BasicSalary   float64
		HouseRent     float64
		Medical       float64
		Transport     float64
		GrossSalary   float64
		Deductions    float64
		NetSalary     float64
	})

	for _, s := range salaries {
		deptName := "Unknown"
		if s.Employee.Department != nil && s.Employee.Department.Name != "" {
			deptName = s.Employee.Department.Name
		}
		if deptMap[deptName] == nil {
			deptMap[deptName] = &struct {
				Employees     int
				BasicSalary   float64
				HouseRent     float64
				Medical       float64
				Transport     float64
				GrossSalary   float64
				Deductions    float64
				NetSalary     float64
			}{}
		}
		d := deptMap[deptName]
		d.Employees++
		d.BasicSalary += s.BasicSalary
		d.HouseRent += s.HouseRent
		d.Medical += s.MedicalAllowance
		d.Transport += s.TransportAllowance
		d.GrossSalary += s.GrossSalary
		d.Deductions += s.TotalDeductions
		d.NetSalary += s.NetSalary
	}

	var summaries []map[string]interface{}
	var grandTotals = map[string]float64{
		"basic_salary": 0, "house_rent": 0, "medical": 0,
		"transport": 0, "gross_salary": 0, "deductions": 0, "net_salary": 0,
	}
	totalEmployees := 0

	for deptName, d := range deptMap {
		summaries = append(summaries, map[string]interface{}{
			"department":   deptName,
			"employees":    d.Employees,
			"basic_salary": d.BasicSalary,
			"house_rent":   d.HouseRent,
			"medical":      d.Medical,
			"transport":    d.Transport,
			"gross_salary": d.GrossSalary,
			"deductions":   d.Deductions,
			"net_salary":   d.NetSalary,
		})
		totalEmployees += d.Employees
		grandTotals["basic_salary"] += d.BasicSalary
		grandTotals["house_rent"] += d.HouseRent
		grandTotals["medical"] += d.Medical
		grandTotals["transport"] += d.Transport
		grandTotals["gross_salary"] += d.GrossSalary
		grandTotals["deductions"] += d.Deductions
		grandTotals["net_salary"] += d.NetSalary
	}

	c.JSON(http.StatusOK, gin.H{
		"summaries":    summaries,
		"total":        len(summaries),
		"total_employees": totalEmployees,
		"grand_totals": grandTotals,
	})
}

func toInt(v interface{}) int {
	switch val := v.(type) {
	case int64:
		return int(val)
	case float64:
		return int(val)
	case int:
		return val
	default:
		return 0
	}
}
