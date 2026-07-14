package repository

import (
	"github.com/shakil5281/hrhub-api/internal/models"
	"gorm.io/gorm"
)

type GroupRepository struct {
	db *gorm.DB
}

func NewGroupRepository(db *gorm.DB) *GroupRepository {
	return &GroupRepository{db: db}
}

func (r *GroupRepository) Create(group *models.Group) error {
	return r.db.Create(group).Error
}

func (r *GroupRepository) FindByID(id string) (*models.Group, error) {
	var group models.Group
	err := r.db.Where("id = ? AND deleted_at IS NULL", id).First(&group).Error
	return &group, err
}

func (r *GroupRepository) List() ([]models.Group, error) {
	var groups []models.Group
	err := r.db.Where("deleted_at IS NULL").Order("created_at DESC").Find(&groups).Error
	return groups, err
}

func (r *GroupRepository) Update(group *models.Group) error {
	return r.db.Save(group).Error
}

func (r *GroupRepository) Delete(id string) error {
	return r.db.Where("id = ?", id).Delete(&models.Group{}).Error
}
