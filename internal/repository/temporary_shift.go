package repository

import (
	"github.com/shakil5281/hrhub-api/internal/models"
	"gorm.io/gorm"
)

type TemporaryShiftRepository struct {
	db *gorm.DB
}

func NewTemporaryShiftRepository(db *gorm.DB) *TemporaryShiftRepository {
	return &TemporaryShiftRepository{db: db}
}

func (r *TemporaryShiftRepository) Create(ts *models.TemporaryShift) error {
	return r.db.Create(ts).Error
}

func (r *TemporaryShiftRepository) BatchCreate(shifts []models.TemporaryShift) error {
	if len(shifts) == 0 {
		return nil
	}
	return r.db.Create(shifts).Error
}

func (r *TemporaryShiftRepository) FindByID(id string) (*models.TemporaryShift, error) {
	var ts models.TemporaryShift
	err := r.db.Preload("Employee").Preload("Shift").Where("id = ?", id).First(&ts).Error
	if err != nil {
		return nil, err
	}
	return &ts, nil
}

func (r *TemporaryShiftRepository) List(companyID string) ([]models.TemporaryShift, error) {
	var list []models.TemporaryShift
	q := r.db.Preload("Employee").Preload("Shift").Order("created_at DESC")
	if companyID != "" {
		q = q.Where("company_id = ?", companyID)
	}
	err := q.Find(&list).Error
	return list, err
}

func (r *TemporaryShiftRepository) ListByEmployeeAndDateRange(employeeID, startDate, endDate string) ([]models.TemporaryShift, error) {
	var list []models.TemporaryShift
	err := r.db.Preload("Shift").Where("employee_id = ? AND date BETWEEN ? AND ?", employeeID, startDate, endDate).Find(&list).Error
	return list, err
}

func (r *TemporaryShiftRepository) FindByEmployeeAndDate(employeeID, date string) (*models.TemporaryShift, error) {
	var ts models.TemporaryShift
	err := r.db.Preload("Shift").Where("employee_id = ? AND date = ?", employeeID, date).First(&ts).Error
	if err != nil {
		return nil, err
	}
	return &ts, nil
}

func (r *TemporaryShiftRepository) Update(ts *models.TemporaryShift) error {
	return r.db.Save(ts).Error
}

func (r *TemporaryShiftRepository) ListByCompanyAndDateRange(companyID, startDate, endDate string) ([]models.TemporaryShift, error) {
	var list []models.TemporaryShift
	err := r.db.Preload("Shift").Where("company_id = ? AND date BETWEEN ? AND ?", companyID, startDate, endDate).Find(&list).Error
	return list, err
}

func (r *TemporaryShiftRepository) Delete(id string) error {
	return r.db.Where("id = ?", id).Delete(&models.TemporaryShift{}).Error
}
