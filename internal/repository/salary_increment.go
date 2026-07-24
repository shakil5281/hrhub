package repository

import (
	"github.com/shakil5281/peoplehub-api/internal/models"
	"gorm.io/gorm"
)

type SalaryIncrementRepository struct {
	db *gorm.DB
}

func NewSalaryIncrementRepository(db *gorm.DB) *SalaryIncrementRepository {
	return &SalaryIncrementRepository{db: db}
}

func (r *SalaryIncrementRepository) List(companyID string) ([]models.SalaryIncrement, error) {
	var incs []models.SalaryIncrement
	err := r.db.Preload("Employee.Department").
		Preload("Employee.DesignationRef").
		Where("company_id = ? AND deleted_at IS NULL", companyID).
		Order("created_at DESC").
		Find(&incs).Error
	return incs, err
}

func (r *SalaryIncrementRepository) Create(inc *models.SalaryIncrement) error {
	return r.db.Create(inc).Error
}

func (r *SalaryIncrementRepository) FindByID(id string) (*models.SalaryIncrement, error) {
	var inc models.SalaryIncrement
	err := r.db.Preload("Employee.Department").
		Preload("Employee.DesignationRef").
		Where("id = ? AND deleted_at IS NULL", id).
		First(&inc).Error
	return &inc, err
}

func (r *SalaryIncrementRepository) Update(inc *models.SalaryIncrement) error {
	return r.db.Save(inc).Error
}
