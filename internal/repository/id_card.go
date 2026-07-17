package repository

import (
	"github.com/shakil5281/hrhub-api/internal/models"
	"gorm.io/gorm"
)

type IdCardRepository struct {
	db *gorm.DB
}

func NewIdCardRepository(db *gorm.DB) *IdCardRepository {
	return &IdCardRepository{db: db}
}

func (r *IdCardRepository) Create(card *models.IdCard) error {
	return r.db.Create(card).Error
}

func (r *IdCardRepository) FindByID(id string) (*models.IdCard, error) {
	var card models.IdCard
	err := r.db.Preload("Department").Preload("Designation").Where("id = ? AND deleted_at IS NULL", id).First(&card).Error
	return &card, err
}

func (r *IdCardRepository) List() ([]models.IdCard, error) {
	var cards []models.IdCard
	err := r.db.Preload("Department").Preload("Designation").Where("deleted_at IS NULL").Order("created_at DESC").Find(&cards).Error
	return cards, err
}

func (r *IdCardRepository) ListFiltered(employee, employeeID, departmentID, designationID, status, cardNo string) ([]models.IdCard, error) {
	query := r.db.Preload("Department").Preload("Designation").Where("deleted_at IS NULL").Order("created_at DESC")
	if employee != "" {
		query = query.Where("employee ILIKE ?", "%"+employee+"%")
	}
	if employeeID != "" {
		query = query.Where("employee_id ILIKE ?", "%"+employeeID+"%")
	}
	if departmentID != "" {
		query = query.Where("department_id = ?", departmentID)
	}
	if designationID != "" {
		query = query.Where("designation_id = ?", designationID)
	}
	if status != "" {
		query = query.Where("status = ?", status)
	}
	if cardNo != "" {
		query = query.Where("card_no ILIKE ?", "%"+cardNo+"%")
	}
	var cards []models.IdCard
	err := query.Find(&cards).Error
	return cards, err
}

func (r *IdCardRepository) Update(card *models.IdCard) error {
	return r.db.Save(card).Error
}

func (r *IdCardRepository) Delete(id string) error {
	return r.db.Where("id = ?", id).Delete(&models.IdCard{}).Error
}
