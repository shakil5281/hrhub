package repository

import (
	"github.com/shakil5281/hrhub-api/internal/models"
	"gorm.io/gorm"
)

type FloorRepository struct {
	db *gorm.DB
}

func NewFloorRepository(db *gorm.DB) *FloorRepository {
	return &FloorRepository{db: db}
}

func (r *FloorRepository) Create(floor *models.Floor) error {
	return r.db.Create(floor).Error
}

func (r *FloorRepository) FindByID(id string) (*models.Floor, error) {
	var floor models.Floor
	err := r.db.Where("id = ? AND deleted_at IS NULL", id).First(&floor).Error
	return &floor, err
}

func (r *FloorRepository) List() ([]models.Floor, error) {
	var floors []models.Floor
	err := r.db.Where("deleted_at IS NULL").Order("created_at DESC").Find(&floors).Error
	return floors, err
}

func (r *FloorRepository) Update(floor *models.Floor) error {
	return r.db.Save(floor).Error
}

func (r *FloorRepository) Delete(id string) error {
	return r.db.Where("id = ?", id).Delete(&models.Floor{}).Error
}
