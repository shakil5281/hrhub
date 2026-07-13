package repository

import (
	"github.com/shakil5281/hrhub-api/internal/models"
	"gorm.io/gorm"
)

type AttendanceRepository struct {
	db *gorm.DB
}

func NewAttendanceRepository(db *gorm.DB) *AttendanceRepository {
	return &AttendanceRepository{db: db}
}

func (r *AttendanceRepository) Create(attendance *models.Attendance) error {
	return r.db.Create(attendance).Error
}

func (r *AttendanceRepository) FindByID(id string) (*models.Attendance, error) {
	var attendance models.Attendance
	err := r.db.Preload("Employee").Preload("Shift").Where("id = ? AND deleted_at IS NULL", id).First(&attendance).Error
	return &attendance, err
}

func (r *AttendanceRepository) ListByDate(date string) ([]models.Attendance, error) {
	var attendances []models.Attendance
	err := r.db.Preload("Employee").Preload("Shift").Where("date = ? AND deleted_at IS NULL", date).Order("created_at ASC").Find(&attendances).Error
	return attendances, err
}

func (r *AttendanceRepository) FindByEmployeeAndDate(employeeID, date string) (*models.Attendance, error) {
	var attendance models.Attendance
	err := r.db.Where("employee_id = ? AND date = ? AND deleted_at IS NULL", employeeID, date).First(&attendance).Error
	return &attendance, err
}

func (r *AttendanceRepository) Update(attendance *models.Attendance) error {
	return r.db.Save(attendance).Error
}

func (r *AttendanceRepository) Delete(id string) error {
	return r.db.Where("id = ?", id).Delete(&models.Attendance{}).Error
}

func (r *AttendanceRepository) ListJobCard(startDate, endDate, companyID, employeeID, departmentID, status string) ([]models.Attendance, error) {
	var attendances []models.Attendance
	query := r.db.Preload("Employee.User").Preload("Employee.Department").Preload("Shift").Where("date BETWEEN ? AND ? AND deleted_at IS NULL", startDate, endDate)
	if companyID != "" {
		query = query.Where("company_id = ?", companyID)
	}
	if employeeID != "" {
		query = query.Where("employee_id = ?", employeeID)
	}
	if departmentID != "" {
		query = query.Where("employee_id IN (SELECT id FROM employees WHERE department_id = ?)", departmentID)
	}
	if status != "" {
		query = query.Where("status = ?", status)
	}
	err := query.Order("date ASC, created_at ASC").Find(&attendances).Error
	return attendances, err
}
