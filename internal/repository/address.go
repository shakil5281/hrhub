package repository

import (
	"github.com/shakil5281/hrhub-api/internal/models"
	"gorm.io/gorm"
)

type DivisionRepository struct{ db *gorm.DB }

func NewDivisionRepository(db *gorm.DB) *DivisionRepository {
	return &DivisionRepository{db: db}
}

func (r *DivisionRepository) Create(m *models.Division) error { return r.db.Create(m).Error }

func (r *DivisionRepository) FindByID(id string) (*models.Division, error) {
	var m models.Division
	err := r.db.Where("id = ? AND deleted_at IS NULL", id).First(&m).Error
	return &m, err
}

func (r *DivisionRepository) List() ([]models.Division, error) {
	var list []models.Division
	err := r.db.Where("deleted_at IS NULL").Order("created_at DESC").Find(&list).Error
	return list, err
}

func (r *DivisionRepository) Update(m *models.Division) error { return r.db.Save(m).Error }

func (r *DivisionRepository) Delete(id string) error {
	return r.db.Where("id = ?", id).Delete(&models.Division{}).Error
}

type DistrictRepository struct{ db *gorm.DB }

func NewDistrictRepository(db *gorm.DB) *DistrictRepository {
	return &DistrictRepository{db: db}
}

func (r *DistrictRepository) Create(m *models.District) error { return r.db.Create(m).Error }

func (r *DistrictRepository) FindByID(id string) (*models.District, error) {
	var m models.District
	err := r.db.Where("id = ? AND deleted_at IS NULL", id).First(&m).Error
	return &m, err
}

func (r *DistrictRepository) List(divisionID string) ([]models.District, error) {
	var list []models.District
	q := r.db.Where("deleted_at IS NULL")
	if divisionID != "" {
		q = q.Where("division_id = ?", divisionID)
	}
	err := q.Order("created_at DESC").Find(&list).Error
	return list, err
}

func (r *DistrictRepository) Update(m *models.District) error { return r.db.Save(m).Error }

func (r *DistrictRepository) Delete(id string) error {
	return r.db.Where("id = ?", id).Delete(&models.District{}).Error
}

type UpazilaRepository struct{ db *gorm.DB }

func NewUpazilaRepository(db *gorm.DB) *UpazilaRepository {
	return &UpazilaRepository{db: db}
}

func (r *UpazilaRepository) Create(m *models.Upazila) error { return r.db.Create(m).Error }

func (r *UpazilaRepository) FindByID(id string) (*models.Upazila, error) {
	var m models.Upazila
	err := r.db.Where("id = ? AND deleted_at IS NULL", id).First(&m).Error
	return &m, err
}

func (r *UpazilaRepository) List(districtID string) ([]models.Upazila, error) {
	var list []models.Upazila
	q := r.db.Where("deleted_at IS NULL")
	if districtID != "" {
		q = q.Where("district_id = ?", districtID)
	}
	err := q.Order("created_at DESC").Find(&list).Error
	return list, err
}

func (r *UpazilaRepository) Update(m *models.Upazila) error { return r.db.Save(m).Error }

func (r *UpazilaRepository) Delete(id string) error {
	return r.db.Where("id = ?", id).Delete(&models.Upazila{}).Error
}

type UnionRepository struct{ db *gorm.DB }

func NewUnionRepository(db *gorm.DB) *UnionRepository {
	return &UnionRepository{db: db}
}

func (r *UnionRepository) Create(m *models.Union) error { return r.db.Create(m).Error }

func (r *UnionRepository) FindByID(id string) (*models.Union, error) {
	var m models.Union
	err := r.db.Where("id = ? AND deleted_at IS NULL", id).First(&m).Error
	return &m, err
}

func (r *UnionRepository) List(upazilaID string) ([]models.Union, error) {
	var list []models.Union
	q := r.db.Where("deleted_at IS NULL")
	if upazilaID != "" {
		q = q.Where("upazila_id = ?", upazilaID)
	}
	err := q.Order("created_at DESC").Find(&list).Error
	return list, err
}

func (r *UnionRepository) Update(m *models.Union) error { return r.db.Save(m).Error }

func (r *UnionRepository) Delete(id string) error {
	return r.db.Where("id = ?", id).Delete(&models.Union{}).Error
}
