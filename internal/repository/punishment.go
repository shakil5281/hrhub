package repository

import (
	"github.com/shakil5281/peoplehub-api/internal/models"
	"gorm.io/gorm"
)

type PunishmentRepository struct {
	db *gorm.DB
}

func NewPunishmentRepository(db *gorm.DB) *PunishmentRepository {
	return &PunishmentRepository{db: db}
}

func (r *PunishmentRepository) List(companyID string) ([]models.Punishment, error) {
	var items []models.Punishment
	q := r.db.Preload("Employee.Department").Preload("Employee.DesignationRef").Where("deleted_at IS NULL")
	if companyID != "" {
		q = q.Where("company_id = ?", companyID)
	}
	err := q.Order("created_at DESC").Find(&items).Error
	return items, err
}

func (r *PunishmentRepository) Create(item *models.Punishment) error {
	return r.db.Create(item).Error
}

func (r *PunishmentRepository) FindByID(id string) (*models.Punishment, error) {
	var item models.Punishment
	err := r.db.Preload("Employee.Department").
		Preload("Employee.DesignationRef").
		Where("id = ? AND deleted_at IS NULL", id).
		First(&item).Error
	return &item, err
}

func (r *PunishmentRepository) Update(item *models.Punishment) error {
	return r.db.Save(item).Error
}

func (r *PunishmentRepository) Delete(item *models.Punishment) error {
	return r.db.Delete(item).Error
}
