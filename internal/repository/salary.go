package repository

import (
	"github.com/shakil5281/hrhub-api/internal/models"
	"gorm.io/gorm"
)

type SalaryRepository struct {
	db *gorm.DB
}

func NewSalaryRepository(db *gorm.DB) *SalaryRepository {
	return &SalaryRepository{db: db}
}

func (r *SalaryRepository) Create(salary *models.Salary) error {
	return r.db.Create(salary).Error
}

func (r *SalaryRepository) Upsert(salary *models.Salary) error {
	return r.db.Where("employee_id = ? AND month = ? AND year = ? AND company_id = ?",
		salary.EmployeeID, salary.Month, salary.Year, salary.CompanyID).
		Assign(salary).
		FirstOrCreate(salary).Error
}

func (r *SalaryRepository) FindByEmployeeMonth(employeeID string, month, year int) (*models.Salary, error) {
	var s models.Salary
	err := r.db.Preload("Employee.Department").Preload("Employee.DesignationRef").Where("employee_id = ? AND month = ? AND year = ? AND deleted_at IS NULL",
		employeeID, month, year).First(&s).Error
	return &s, err
}

func (r *SalaryRepository) ListByMonth(companyID string, month, year int, departmentID string, page, limit int) ([]models.Salary, int64, error) {
	base := r.db.Model(&models.Salary{}).Where("company_id = ? AND month = ? AND year = ? AND deleted_at IS NULL", companyID, month, year)
	if departmentID != "" {
		base = base.Where("employee_id IN (SELECT id FROM employees WHERE department_id = ?)", departmentID)
	}
	var total int64
	if err := base.Count(&total).Error; err != nil {
		return nil, 0, err
	}
	var salaries []models.Salary
	err := base.Preload("Employee.Department").Preload("Employee.DesignationRef").Order("created_at ASC").Offset((page - 1) * limit).Limit(limit).Find(&salaries).Error
	return salaries, total, err
}

func (r *SalaryRepository) ListAllByMonth(companyID string, month, year int, departmentID string) ([]models.Salary, error) {
	query := r.db.Preload("Employee.Department").Preload("Employee.DesignationRef").
		Where("company_id = ? AND month = ? AND year = ? AND deleted_at IS NULL", companyID, month, year)
	if departmentID != "" {
		query = query.Where("employee_id IN (SELECT id FROM employees WHERE department_id = ?)", departmentID)
	}
	var salaries []models.Salary
	err := query.Order("created_at ASC").Find(&salaries).Error
	return salaries, err
}

func (r *SalaryRepository) DeleteByMonth(companyID string, month, year int) error {
	return r.db.Unscoped().Where("company_id = ? AND month = ? AND year = ?", companyID, month, year).
		Delete(&models.Salary{}).Error
}
