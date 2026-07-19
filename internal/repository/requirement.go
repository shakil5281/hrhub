package repository

import (
	"github.com/shakil5281/hrhub-api/internal/models"
	"gorm.io/gorm"
)

type RequirementRepository struct {
	db *gorm.DB
}

func NewRequirementRepository(db *gorm.DB) *RequirementRepository {
	return &RequirementRepository{db: db}
}

func (r *RequirementRepository) Create(req *models.Requirement) error {
	return r.db.Create(req).Error
}

func (r *RequirementRepository) FindByID(id string) (*models.Requirement, error) {
	var req models.Requirement
	err := r.db.Preload("Department").Where("id = ? AND deleted_at IS NULL", id).First(&req).Error
	return &req, err
}

func (r *RequirementRepository) List(page, limit int) ([]models.Requirement, int64, error) {
	base := r.db.Model(&models.Requirement{}).Where("deleted_at IS NULL")
	var total int64
	if err := base.Count(&total).Error; err != nil {
		return nil, 0, err
	}
	var reqs []models.Requirement
	err := base.Preload("Department").Order("created_at DESC").Offset((page - 1) * limit).Limit(limit).Find(&reqs).Error
	return reqs, total, err
}

func (r *RequirementRepository) ListFiltered(departmentID, status, priority, position string, page, limit int) ([]models.Requirement, int64, error) {
	base := r.db.Model(&models.Requirement{}).Where("deleted_at IS NULL").Order("created_at DESC")
	if departmentID != "" {
		base = base.Where("department_id = ?", departmentID)
	}
	if status != "" {
		base = base.Where("status = ?", status)
	}
	if priority != "" {
		base = base.Where("priority = ?", priority)
	}
	if position != "" {
		base = base.Where("position ILIKE ?", "%"+position+"%")
	}
	var total int64
	if err := base.Count(&total).Error; err != nil {
		return nil, 0, err
	}
	var reqs []models.Requirement
	err := base.Preload("Department").Offset((page - 1) * limit).Limit(limit).Find(&reqs).Error
	return reqs, total, err
}

func (r *RequirementRepository) Update(req *models.Requirement) error {
	return r.db.Save(req).Error
}

func (r *RequirementRepository) Delete(id string) error {
	return r.db.Where("id = ?", id).Delete(&models.Requirement{}).Error
}
