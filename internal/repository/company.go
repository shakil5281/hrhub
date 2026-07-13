package repository

import (
	"github.com/shakil5281/hrhub-api/internal/models"
	"gorm.io/gorm"
)

type CompanyRepository struct {
	db *gorm.DB
}

func NewCompanyRepository(db *gorm.DB) *CompanyRepository {
	return &CompanyRepository{db: db}
}

func (r *CompanyRepository) Create(company *models.Company) error {
	return r.db.Create(company).Error
}

func (r *CompanyRepository) FindByID(id string) (*models.Company, error) {
	var company models.Company
	err := r.db.Where("id = ? AND deleted_at IS NULL", id).First(&company).Error
	return &company, err
}

func (r *CompanyRepository) FindBySlug(slug string) (*models.Company, error) {
	var company models.Company
	err := r.db.Where("slug = ? AND deleted_at IS NULL", slug).First(&company).Error
	return &company, err
}

func (r *CompanyRepository) List() ([]models.Company, error) {
	var companies []models.Company
	err := r.db.Where("deleted_at IS NULL").Order("created_at DESC").Find(&companies).Error
	return companies, err
}

func (r *CompanyRepository) Update(company *models.Company) error {
	return r.db.Save(company).Error
}

func (r *CompanyRepository) Delete(id string) error {
	return r.db.Where("id = ?", id).Delete(&models.Company{}).Error
}
