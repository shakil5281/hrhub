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

func (r *SeparationRepository) List() ([]models.Separation, error) {
	var seps []models.Separation
	err := r.db.Preload("Department").Where("deleted_at IS NULL").Order("created_at DESC").Find(&seps).Error
	return seps, err
}

func (r *SeparationRepository) ListFiltered(employee, employeeCode, departmentID, sepType, status string) ([]models.Separation, error) {
	query := r.db.Preload("Department").Where("deleted_at IS NULL").Order("created_at DESC")
	if employee != "" {
		query = query.Where("employee ILIKE ?", "%"+employee+"%")
	}
	if employeeCode != "" {
		query = query.Where("employee_code ILIKE ?", "%"+employeeCode+"%")
	}
	if departmentID != "" {
		query = query.Where("department_id = ?", departmentID)
	}
	if sepType != "" {
		query = query.Where("type = ?", sepType)
	}
	if status != "" {
		query = query.Where("status = ?", status)
	}
	var seps []models.Separation
	err := query.Find(&seps).Error
	return seps, err
}

func (r *SeparationRepository) Update(sep *models.Separation) error {
	return r.db.Save(sep).Error
}

func (r *SeparationRepository) Delete(id string) error {
	return r.db.Where("id = ?", id).Delete(&models.Separation{}).Error
}
