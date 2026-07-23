package repository

import (
	"math"
	"strconv"
	"time"

	"github.com/shakil5281/hrhub-api/internal/models"
	"gorm.io/gorm"
)

type NightBillRepository struct {
	db *gorm.DB
}

func NewNightBillRepository(db *gorm.DB) *NightBillRepository {
	return &NightBillRepository{db: db}
}

type NightBillFilter struct {
	CompanyID     string
	DepartmentID  string
	SectionID     string
	DesignationID string
	LineID        string
	GroupID       string
	FloorID       string
	EmployeeID    string
	Status        string
	DateFrom      string
	DateTo        string
	Month         int
	Year          int
	Page          int
	Limit         int
}

type PaginatedNightBills struct {
	Data       []models.NightBill
	Total      int64
	Page       int
	Limit      int
	TotalPages int
}

func (r *NightBillRepository) ListPaginated(filter NightBillFilter) (*PaginatedNightBills, error) {
	var items []models.NightBill
	var total int64

	q := r.db.Model(&models.NightBill{}).
		Preload("Employee", func(db *gorm.DB) *gorm.DB {
			return db.Select("employee_id, name_en, name_bn, department_id, section_id, designation_id, line_id, group_id, floor_id")
		}).
		Preload("Employee.Department").
		Preload("Employee.DesignationRef").
		Where("night_bills.deleted_at IS NULL")

	if filter.CompanyID != "" {
		q = q.Where("night_bills.company_id = ?", filter.CompanyID)
	}
	if filter.DepartmentID != "" {
		q = q.Where("night_bills.department_id = ?", filter.DepartmentID)
	}
	if filter.SectionID != "" {
		q = q.Where("night_bills.section_id = ?", filter.SectionID)
	}
	if filter.DesignationID != "" {
		q = q.Where("night_bills.designation_id = ?", filter.DesignationID)
	}
	if filter.LineID != "" {
		q = q.Where("night_bills.line_id = ?", filter.LineID)
	}
	if filter.GroupID != "" {
		q = q.Where("night_bills.group_id = ?", filter.GroupID)
	}
	if filter.FloorID != "" {
		q = q.Where("night_bills.floor_id = ?", filter.FloorID)
	}
	if filter.EmployeeID != "" {
		q = q.Where("night_bills.employee_id = ?", filter.EmployeeID)
	}
	if filter.Status != "" {
		q = q.Where("night_bills.status = ?", filter.Status)
	}
	if filter.DateFrom != "" {
		q = q.Where("night_bills.date >= ?", filter.DateFrom)
	}
	if filter.DateTo != "" {
		q = q.Where("night_bills.date <= ?", filter.DateTo)
	}
	if filter.Month > 0 {
		q = q.Where("night_bills.month = ?", filter.Month)
	}
	if filter.Year > 0 {
		q = q.Where("night_bills.year = ?", filter.Year)
	}

	if err := q.Count(&total).Error; err != nil {
		return nil, err
	}

	page := filter.Page
	if page < 1 {
		page = 1
	}
	limit := filter.Limit
	if limit < 1 || limit > 100 {
		limit = 20
	}
	offset := (page - 1) * limit

	err := q.Order("night_bills.date DESC, night_bills.created_at DESC").
		Offset(offset).Limit(limit).
		Find(&items).Error
	if err != nil {
		return nil, err
	}

	totalPages := int(math.Ceil(float64(total) / float64(limit)))

	return &PaginatedNightBills{
		Data:       items,
		Total:      total,
		Page:       page,
		Limit:      limit,
		TotalPages: totalPages,
	}, nil
}

func (r *NightBillRepository) List(companyID string) ([]models.NightBill, error) {
	var items []models.NightBill
	q := r.db.Preload("Employee.Department").Preload("Employee.DesignationRef").Where("deleted_at IS NULL")
	if companyID != "" {
		q = q.Where("company_id = ?", companyID)
	}
	err := q.Order("created_at DESC").Find(&items).Error
	return items, err
}

func (r *NightBillRepository) ListByMonth(companyID string, month, year int) ([]models.NightBill, error) {
	var items []models.NightBill
	q := r.db.Preload("Employee.Department").Preload("Employee.DesignationRef").Where("month = ? AND year = ? AND deleted_at IS NULL", month, year)
	if companyID != "" {
		q = q.Where("company_id = ?", companyID)
	}
	err := q.Order("created_at DESC").Find(&items).Error
	return items, err
}

func (r *NightBillRepository) Create(item *models.NightBill) error {
	return r.db.Create(item).Error
}

func (r *NightBillRepository) BulkCreate(items []models.NightBill) error {
	if len(items) == 0 {
		return nil
	}
	return r.db.CreateInBatches(items, 100).Error
}

func (r *NightBillRepository) FindByID(id string) (*models.NightBill, error) {
	var item models.NightBill
	err := r.db.Preload("Employee.Department").
		Preload("Employee.DesignationRef").
		Preload("Department").
		Preload("Designation").
		Where("id = ? AND deleted_at IS NULL", id).
		First(&item).Error
	return &item, err
}

func (r *NightBillRepository) Update(item *models.NightBill) error {
	return r.db.Save(item).Error
}

func (r *NightBillRepository) UpdateStatus(id, status, userID string) error {
	return r.db.Model(&models.NightBill{}).Where("id = ?", id).Updates(map[string]interface{}{
		"status":     status,
		"updated_by": userID,
	}).Error
}

func (r *NightBillRepository) Delete(item *models.NightBill) error {
	return r.db.Delete(item).Error
}

func (r *NightBillRepository) ListEligibleEmployees(companyID string, departmentID, sectionID, designationID, dateFrom, dateTo string) ([]models.Employee, error) {
	var employees []models.Employee
	q := r.db.Where("company_id = ? AND status = 'active' AND deleted_at IS NULL", companyID)
	if departmentID != "" {
		q = q.Where("department_id = ?", departmentID)
	}
	if sectionID != "" {
		q = q.Where("section_id = ?", sectionID)
	}
	if designationID != "" {
		q = q.Where("designation_id = ?", designationID)
	}
	q = q.Preload("Department").Preload("DesignationRef").Preload("SectionRef")
	err := q.Find(&employees).Error
	return employees, err
}

func (r *NightBillRepository) GetAttendanceNightHours(employeeID, dateFrom, dateTo string) (map[string]float64, error) {
	type Result struct {
		EmployeeID string
		Date       string
		NightHours float64
	}
	var results []Result

	err := r.db.Table("attendances").
		Select("employee_id, date, COALESCE(EXTRACT(EPOCH FROM (check_out - check_in)) / 3600, 0) as night_hours").
		Where("employee_id = ? AND date BETWEEN ? AND ? AND status = 'present'", employeeID, dateFrom, dateTo).
		Find(&results).Error
	if err != nil {
		return nil, err
	}

	nightHoursMap := make(map[string]float64)
	for _, r := range results {
		nightHoursMap[r.Date] = r.NightHours
	}
	return nightHoursMap, nil
}

func (r *NightBillRepository) CreateProcess(process *models.NightBillProcess) error {
	return r.db.Create(process).Error
}

func (r *NightBillRepository) ListProcesses(companyID string, month, year int) ([]models.NightBillProcess, error) {
	var processes []models.NightBillProcess
	q := r.db.Where("deleted_at IS NULL")
	if companyID != "" {
		q = q.Where("company_id = ?", companyID)
	}
	if month > 0 {
		q = q.Where("month = ?", month)
	}
	if year > 0 {
		q = q.Where("year = ?", year)
	}
	err := q.Order("created_at DESC").Find(&processes).Error
	return processes, err
}

func (r *NightBillRepository) FindOrCreateNightBill(companyID, employeeID, date string, month, year int) (*models.NightBill, bool, error) {
	var existing models.NightBill
	err := r.db.Where("company_id = ? AND employee_id = ? AND date = ? AND deleted_at IS NULL", companyID, employeeID, date).First(&existing).Error
	if err == nil {
		return &existing, false, nil
	}
	if err != gorm.ErrRecordNotFound {
		return nil, false, err
	}

	item := &models.NightBill{
		CompanyID:  companyID,
		EmployeeID: employeeID,
		Date:       date,
		Month:      month,
		Year:       year,
		Status:     "pending",
		CreatedAt:  time.Now(),
	}
	return item, true, nil
}

func (r *NightBillRepository) GetAttendanceNightHoursByDate(employeeID, date string) (float64, float64, error) {
	var attendance models.Attendance
	err := r.db.Where("employee_id = ? AND date = ? AND status = 'present' AND deleted_at IS NULL", employeeID, date).
		First(&attendance).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return 0, 0, nil
		}
		return 0, 0, err
	}

	if attendance.CheckOut == nil {
		return 0, 0, nil
	}

	hours := attendance.CheckOut.Sub(*attendance.CheckIn).Hours()
	nightHours := math.Max(0, hours)

	return math.Round(nightHours*100) / 100, 0, nil
}

func (r *NightBillRepository) GetDefaultNightRate() float64 {
	var setting models.SystemSetting
	err := r.db.Where("key = 'night_bill_rate'").First(&setting).Error
	if err == nil {
		rate, parseErr := strconv.ParseFloat(setting.Value, 64)
		if parseErr == nil && rate > 0 {
			return rate
		}
	}
	return 80.0
}

type EmployeeNightBillInfo struct {
	EmployeeID  string  `json:"employee_id"`
	NameEn      string  `json:"name_en"`
	NameBn      string  `json:"name_bn"`
	PunchNumber string  `json:"punch_number"`
	Department  string  `json:"department"`
	Designation string  `json:"designation"`
	NightHours  float64 `json:"night_hours"`
	Rate        float64 `json:"rate"`
	Amount      float64 `json:"amount"`
}

func (r *NightBillRepository) ListEligibleWithRates(companyID, departmentID, sectionID, designationID, date string) ([]EmployeeNightBillInfo, error) {
	rate := r.GetDefaultNightRate()

	var employees []models.Employee
	q := r.db.Where("company_id = ? AND status = 'active' AND deleted_at IS NULL", companyID)
	if departmentID != "" {
		q = q.Where("department_id = ?", departmentID)
	}
	if sectionID != "" {
		q = q.Where("section_id = ?", sectionID)
	}
	if designationID != "" {
		q = q.Where("designation_id = ?", designationID)
	}
	q = q.Preload("Department").Preload("DesignationRef")
	if err := q.Find(&employees).Error; err != nil {
		return nil, err
	}

	type AttendanceResult struct {
		EmployeeID string
		CheckIn    *time.Time
		CheckOut   *time.Time
	}
	var attRecords []AttendanceResult
	r.db.Table("attendances").
		Select("employee_id, check_in, check_out").
		Where("employee_id IN (?) AND date = ? AND status = 'present' AND deleted_at IS NULL",
			r.db.Table("employees").Select("employee_id").Where("company_id = ? AND status = 'active' AND deleted_at IS NULL", companyID),
			date,
		).
		Find(&attRecords)

	nightMap := make(map[string]float64)
	for _, a := range attRecords {
		if a.CheckOut != nil && a.CheckIn != nil {
			h := a.CheckOut.Sub(*a.CheckIn).Hours()
			if h > 0 {
				nightMap[a.EmployeeID] = math.Round(h*100) / 100
			}
		}
	}

	result := make([]EmployeeNightBillInfo, 0, len(employees))
	for _, emp := range employees {
		nh := nightMap[emp.EmployeeID]
		amt := math.Round(nh*rate*100) / 100
		deptName := ""
		if emp.Department != nil {
			deptName = emp.Department.Name
		}
		desigName := ""
		if emp.DesignationRef != nil {
			desigName = emp.DesignationRef.Name
		}
		result = append(result, EmployeeNightBillInfo{
			EmployeeID:  emp.EmployeeID,
			NameEn:      emp.NameEn,
			NameBn:      emp.NameBn,
			PunchNumber: emp.PunchNumber,
			Department:  deptName,
			Designation: desigName,
			NightHours:  nh,
			Rate:        rate,
			Amount:      amt,
		})
	}

	return result, nil
}

func (r *NightBillRepository) GetSummary(companyID string, month, year int) (totalEmployees int64, totalAmount float64, err error) {
	q := r.db.Model(&models.NightBill{}).Where("company_id = ? AND month = ? AND year = ? AND deleted_at IS NULL", companyID, month, year)
	if err := q.Count(&totalEmployees).Error; err != nil {
		return 0, 0, err
	}
	q.Select("COALESCE(SUM(amount), 0)").Scan(&totalAmount)
	return
}
