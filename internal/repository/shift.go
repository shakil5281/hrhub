package repository

import (
	"github.com/shakil5281/hrhub-api/internal/models"
	"gorm.io/gorm"
)

type ShiftRepository struct {
	db *gorm.DB
}

func NewShiftRepository(db *gorm.DB) *ShiftRepository {
	return &ShiftRepository{db: db}
}

func (r *ShiftRepository) Create(shift *models.Shift) error {
	return r.db.Create(shift).Error
}

func (r *ShiftRepository) FindByID(id string) (*models.Shift, error) {
	var shift models.Shift
	err := r.db.Where("id = ? AND deleted_at IS NULL", id).First(&shift).Error
	return &shift, err
}

func (r *ShiftRepository) List() ([]models.Shift, error) {
	var shifts []models.Shift
	err := r.db.Where("deleted_at IS NULL").Order("created_at DESC").Find(&shifts).Error
	return shifts, err
}

func (r *ShiftRepository) Update(shift *models.Shift) error {
	return r.db.Save(shift).Error
}

func (r *ShiftRepository) Delete(id string) error {
	return r.db.Where("id = ?", id).Delete(&models.Shift{}).Error
}
