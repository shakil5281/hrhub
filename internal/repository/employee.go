package repository

import (
	"github.com/shakil5281/hrhub-api/internal/models"
	"gorm.io/gorm"
)

type EmployeeRepository struct {
	db *gorm.DB
}

func NewEmployeeRepository(db *gorm.DB) *EmployeeRepository {
	return &EmployeeRepository{db: db}
}

func (r *EmployeeRepository) FindByEmployeeCode(code string) (*models.Employee, error) {
	var emp models.Employee
	err := r.db.Where("employee_code = ?", code).First(&emp).Error
	return &emp, err
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
