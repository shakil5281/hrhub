package repository

import (
	"github.com/shakil5281/hrhub-api/internal/models"
	"gorm.io/gorm"
)

type NightBillRepository struct {
	db *gorm.DB
}

func NewNightBillRepository(db *gorm.DB) *NightBillRepository {
	return &NightBillRepository{db: db}
}

func (r *NightBillRepository) List(companyID string) ([]models.NightBill, error) {
	var items []models.NightBill
	q := r.db.Preload("Employee.Department").Preload("Employee.DesignationRef").Where("deleted_at IS NULL")
	if companyID != "" {
		q = q.Where("company_id = ?", companyID)
	}
	err := q.Order("created_at DESC").Find(&items).Error
	return items, err
}

func (r *NightBillRepository) ListByMonth(companyID string, month, year int) ([]models.NightBill, error) {
	var items []models.NightBill
	q := r.db.Preload("Employee.Department").Preload("Employee.DesignationRef").Where("month = ? AND year = ? AND deleted_at IS NULL", month, year)
	if companyID != "" {
		q = q.Where("company_id = ?", companyID)
	}
	err := q.Order("created_at DESC").Find(&items).Error
	return items, err
}

func (r *NightBillRepository) Create(item *models.NightBill) error {
	return r.db.Create(item).Error
}

func (r *NightBillRepository) FindByID(id string) (*models.NightBill, error) {
	var item models.NightBill
	err := r.db.Preload("Employee.Department").
		Preload("Employee.DesignationRef").
		Where("id = ? AND deleted_at IS NULL", id).
		First(&item).Error
	return &item, err
}

func (r *NightBillRepository) Update(item *models.NightBill) error {
	return r.db.Save(item).Error
}

func (r *NightBillRepository) Delete(item *models.NightBill) error {
	return r.db.Delete(item).Error
}
