package repository

import (
	"github.com/shakil5281/hrhub-api/internal/models"
	"gorm.io/gorm"
)

type EmployeeFilter struct {
	CompanyID     string
	DepartmentID  string
	SectionID     string
	DesignationID string
	LineID        string
	GroupID       string
	EmployeeID    string
}

type EmployeeRepository struct {
	db *gorm.DB
}

func NewEmployeeRepository(db *gorm.DB) *EmployeeRepository {
	return &EmployeeRepository{db: db}
}

func (r *EmployeeRepository) ListFiltered(f EmployeeFilter) ([]models.Employee, error) {
	var employees []models.Employee
	query := r.db.Where("status = ?", "active")
	if f.CompanyID != "" {
		query = query.Where("company_id = ?", f.CompanyID)
	}
	if f.DepartmentID != "" {
		query = query.Where("department_id = ?", f.DepartmentID)
	}
	if f.SectionID != "" {
		query = query.Where("section_id = ?", f.SectionID)
	}
	if f.DesignationID != "" {
		query = query.Where("designation_id = ?", f.DesignationID)
	}
	if f.LineID != "" {
		query = query.Where("line_id = ?", f.LineID)
	}
	if f.GroupID != "" {
		query = query.Where("group_id = ?", f.GroupID)
	}
	if f.EmployeeID != "" {
		query = query.Where("id = ? OR employee_code = ?", f.EmployeeID, f.EmployeeID)
	}
	err := query.Find(&employees).Error
	return employees, err
}

func (r *EmployeeRepository) FindByEmployeeCode(code string) (*models.Employee, error) {
	var emp models.Employee
	err := r.db.Where("employee_code = ?", code).First(&emp).Error
	return &emp, err
}

func (r *EmployeeRepository) FindByEmployeeCodes(codes []string) ([]models.Employee, error) {
	var employees []models.Employee
	err := r.db.Where("employee_code IN ?", codes).Find(&employees).Error
	return employees, err
}

func (r *EmployeeRepository) FindByPunchNumbers(punches []string) ([]models.Employee, error) {
	var employees []models.Employee
	err := r.db.Where("punch_number IN ?", punches).Find(&employees).Error
	return employees, err
}

func (r *EmployeeRepository) ListActivePtr(companyID string) ([]*models.Employee, error) {
	var employees []*models.Employee
	query := r.db.Where("status = ?", "active")
	if companyID != "" {
		query = query.Where("company_id = ?", companyID)
	}
	err := query.Find(&employees).Error
	return employees, err
}

func (r *EmployeeRepository) FindByPunchNumber(punch string) (*models.Employee, error) {
	var emp models.Employee
	err := r.db.Where("punch_number = ?", punch).First(&emp).Error
	return &emp, err
}

func (r *EmployeeRepository) ListByCompany(companyID string) ([]models.Employee, error) {
	var employees []models.Employee
	err := r.db.Where("company_id = ?", companyID).Find(&employees).Error
	return employees, err
}

func (r *EmployeeRepository) ListActive(companyID string) ([]models.Employee, error) {
	var employees []models.Employee
	query := r.db.Where("status = ?", "active")
	if companyID != "" {
		query = query.Where("company_id = ?", companyID)
	}
	err := query.Find(&employees).Error
	return employees, err
}
