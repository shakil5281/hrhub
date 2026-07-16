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

func (r *RequirementRepository) List() ([]models.Requirement, error) {
	var reqs []models.Requirement
	err := r.db.Preload("Department").Where("deleted_at IS NULL").Order("created_at DESC").Find(&reqs).Error
	return reqs, err
}

func (r *RequirementRepository) ListFiltered(departmentID, status, priority, position string) ([]models.Requirement, error) {
	query := r.db.Preload("Department").Where("deleted_at IS NULL").Order("created_at DESC")
	if departmentID != "" {
		query = query.Where("department_id = ?", departmentID)
	}
	if status != "" {
		query = query.Where("status = ?", status)
	}
	if priority != "" {
		query = query.Where("priority = ?", priority)
	}
	if position != "" {
		query = query.Where("position ILIKE ?", "%"+position+"%")
	}
	var reqs []models.Requirement
	err := query.Find(&reqs).Error
	return reqs, err
}

func (r *RequirementRepository) Update(req *models.Requirement) error {
	return r.db.Save(req).Error
}

func (r *RequirementRepository) Delete(id string) error {
	return r.db.Where("id = ?", id).Delete(&models.Requirement{}).Error
}
