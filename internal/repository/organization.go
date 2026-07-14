package repository

import (
	"github.com/shakil5281/hrhub-api/internal/models"
	"gorm.io/gorm"
)

type DepartmentRepository struct{ db *gorm.DB }

func NewDepartmentRepository(db *gorm.DB) *DepartmentRepository {
	return &DepartmentRepository{db: db}
}

func (r *DepartmentRepository) Create(m *models.Department) error { return r.db.Create(m).Error }

func (r *DepartmentRepository) FindByID(id string) (*models.Department, error) {
	var m models.Department
	err := r.db.Where("id = ? AND deleted_at IS NULL", id).First(&m).Error
	return &m, err
}

func (r *DepartmentRepository) List() ([]models.Department, error) {
	var list []models.Department
	err := r.db.Where("deleted_at IS NULL").Order("created_at DESC").Find(&list).Error
	return list, err
}

func (r *DepartmentRepository) Update(m *models.Department) error { return r.db.Save(m).Error }

func (r *DepartmentRepository) Delete(id string) error {
	return r.db.Where("id = ?", id).Delete(&models.Department{}).Error
}

type SectionRepository struct{ db *gorm.DB }

func NewSectionRepository(db *gorm.DB) *SectionRepository {
	return &SectionRepository{db: db}
}

func (r *SectionRepository) Create(m *models.Section) error { return r.db.Create(m).Error }

func (r *SectionRepository) FindByID(id string) (*models.Section, error) {
	var m models.Section
	err := r.db.Where("id = ? AND deleted_at IS NULL", id).First(&m).Error
	return &m, err
}

func (r *SectionRepository) List(departmentID string) ([]models.Section, error) {
	var list []models.Section
	q := r.db.Where("deleted_at IS NULL")
	if departmentID != "" {
		q = q.Where("department_id = ?", departmentID)
	}
	err := q.Order("created_at DESC").Find(&list).Error
	return list, err
}

func (r *SectionRepository) Update(m *models.Section) error { return r.db.Save(m).Error }

func (r *SectionRepository) Delete(id string) error {
	return r.db.Where("id = ?", id).Delete(&models.Section{}).Error
}

type DesignationRepository struct{ db *gorm.DB }

func NewDesignationRepository(db *gorm.DB) *DesignationRepository {
	return &DesignationRepository{db: db}
}

func (r *DesignationRepository) Create(m *models.Designation) error { return r.db.Create(m).Error }

func (r *DesignationRepository) FindByID(id string) (*models.Designation, error) {
	var m models.Designation
	err := r.db.Where("id = ? AND deleted_at IS NULL", id).First(&m).Error
	return &m, err
}

func (r *DesignationRepository) List(sectionID string) ([]models.Designation, error) {
	var list []models.Designation
	q := r.db.Where("deleted_at IS NULL")
	if sectionID != "" {
		q = q.Where("section_id = ?", sectionID)
	}
	err := q.Order("created_at DESC").Find(&list).Error
	return list, err
}

func (r *DesignationRepository) Update(m *models.Designation) error { return r.db.Save(m).Error }

func (r *DesignationRepository) Delete(id string) error {
	return r.db.Where("id = ?", id).Delete(&models.Designation{}).Error
}

type LineRepository struct{ db *gorm.DB }

func NewLineRepository(db *gorm.DB) *LineRepository {
	return &LineRepository{db: db}
}

func (r *LineRepository) Create(m *models.Line) error { return r.db.Create(m).Error }

func (r *LineRepository) FindByID(id string) (*models.Line, error) {
	var m models.Line
	err := r.db.Where("id = ? AND deleted_at IS NULL", id).First(&m).Error
	return &m, err
}

func (r *LineRepository) List(sectionID string) ([]models.Line, error) {
	var list []models.Line
	q := r.db.Where("deleted_at IS NULL")
	if sectionID != "" {
		q = q.Where("section_id = ?", sectionID)
	}
	err := q.Order("created_at DESC").Find(&list).Error
	return list, err
}

func (r *LineRepository) Update(m *models.Line) error { return r.db.Save(m).Error }

func (r *LineRepository) Delete(id string) error {
	return r.db.Where("id = ?", id).Delete(&models.Line{}).Error
}
