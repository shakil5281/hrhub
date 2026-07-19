package repository

import (
	"github.com/shakil5281/hrhub-api/internal/models"
	"gorm.io/gorm"
)

type SeparationRepository struct {
	db *gorm.DB
}

func NewSeparationRepository(db *gorm.DB) *SeparationRepository {
	return &SeparationRepository{db: db}
}

func (r *SeparationRepository) Create(sep *models.Separation) error {
	return r.db.Create(sep).Error
}

func (r *SeparationRepository) FindByID(id string) (*models.Separation, error) {
	var sep models.Separation
	err := r.db.Preload("Department").Where("id = ? AND deleted_at IS NULL", id).First(&sep).Error
	return &sep, err
}

func (r *SeparationRepository) List(page, limit int) ([]models.Separation, int64, error) {
	base := r.db.Model(&models.Separation{}).Where("deleted_at IS NULL")
	var total int64
	if err := base.Count(&total).Error; err != nil {
		return nil, 0, err
	}
	var seps []models.Separation
	err := base.Preload("Department").Order("created_at DESC").Offset((page - 1) * limit).Limit(limit).Find(&seps).Error
	return seps, total, err
}

func (r *SeparationRepository) ListFiltered(employee, employeeID, departmentID, sepType, status string, page, limit int) ([]models.Separation, int64, error) {
	base := r.db.Model(&models.Separation{}).Where("deleted_at IS NULL").Order("created_at DESC")
	if employee != "" {
		base = base.Where("employee ILIKE ?", "%"+employee+"%")
	}
	if employeeID != "" {
		base = base.Where("employee_id ILIKE ?", "%"+employeeID+"%")
	}
	if departmentID != "" {
		base = base.Where("department_id = ?", departmentID)
	}
	if sepType != "" {
		base = base.Where("type = ?", sepType)
	}
	if status != "" {
		base = base.Where("status = ?", status)
	}
	var total int64
	if err := base.Count(&total).Error; err != nil {
		return nil, 0, err
	}
	var seps []models.Separation
	err := base.Preload("Department").Offset((page - 1) * limit).Limit(limit).Find(&seps).Error
	return seps, total, err
}

func (r *SeparationRepository) Update(sep *models.Separation) error {
	return r.db.Save(sep).Error
}

func (r *SeparationRepository) Delete(id string) error {
	return r.db.Where("id = ?", id).Delete(&models.Separation{}).Error
}
