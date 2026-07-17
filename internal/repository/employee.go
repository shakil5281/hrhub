package repository

import (
	"github.com/shakil5281/hrhub-api/internal/models"
	"gorm.io/gorm"
)

type EmployeeFilter struct {
	CompanyID     string
	DepartmentID  string
	SectionID     string
	DesignationID string
	LineID        string
	GroupID       string
	EmployeeID    string
}

type EmployeeRepository struct {
	db *gorm.DB
}

func NewEmployeeRepository(db *gorm.DB) *EmployeeRepository {
	return &EmployeeRepository{db: db}
}

func (r *EmployeeRepository) ListFiltered(f EmployeeFilter) ([]models.Employee, error) {
	var employees []models.Employee
	query := r.db.Where("status = ?", "active")
	if f.CompanyID != "" {
		query = query.Where("company_id = ?", f.CompanyID)
	}
	if f.DepartmentID != "" {
		query = query.Where("department_id = ?", f.DepartmentID)
	}
	if f.SectionID != "" {
		query = query.Where("section_id = ?", f.SectionID)
	}
	if f.DesignationID != "" {
		query = query.Where("designation_id = ?", f.DesignationID)
	}
	if f.LineID != "" {
		query = query.Where("line_id = ?", f.LineID)
	}
	if f.GroupID != "" {
		query = query.Where("group_id = ?", f.GroupID)
	}
	if f.EmployeeID != "" {
		query = query.Where("id = ? OR employee_id = ?", f.EmployeeID, f.EmployeeID)
	}
	err := query.Find(&employees).Error
	return employees, err
}

func (r *EmployeeRepository) FindByEmployeeID(code string) (*models.Employee, error) {
	var emp models.Employee
	err := r.db.Where("employee_id = ?", code).First(&emp).Error
	return &emp, err
}

func (r *EmployeeRepository) FindByEmployeeIDs(codes []string) ([]models.Employee, error) {
	var employees []models.Employee
	err := r.db.Where("employee_id IN ?", codes).Find(&employees).Error
	return employees, err
}

func (r *EmployeeRepository) FindByPunchNumbers(punches []string) ([]models.Employee, error) {
	var employees []models.Employee
	err := r.db.Where("punch_number IN ?", punches).Find(&employees).Error
	return employees, err
}

func (r *EmployeeRepository) ListActivePtr(companyID string) ([]*models.Employee, error) {
	var employees []*models.Employee
	query := r.db.Where("status = ?", "active")
	if companyID != "" {
		query = query.Where("company_id = ?", companyID)
	}
	err := query.Find(&employees).Error
	return employees, err
}

func (r *EmployeeRepository) FindByPunchNumber(punch string) (*models.Employee, error) {
	var emp models.Employee
	err := r.db.Where("punch_number = ?", punch).First(&emp).Error
	return &emp, err
}

func (r *EmployeeRepository) ListByCompany(companyID string) ([]models.Employee, error) {
	var employees []models.Employee
	err := r.db.Where("company_id = ?", companyID).Find(&employees).Error
	return employees, err
}

func (r *EmployeeRepository) ListActive(companyID string) ([]models.Employee, error) {
	var employees []models.Employee
	query := r.db.Where("status = ?", "active")
	if companyID != "" {
		query = query.Where("company_id = ?", companyID)
	}
	err := query.Find(&employees).Error
	return employees, err
}

func (r *EmployeeRepository) BatchCreate(employees []models.Employee) error {
	if len(employees) == 0 {
		return nil
	}
	return r.db.CreateInBatches(employees, 100).Error
}

func (r *EmployeeRepository) BulkUpdateByID(updates []models.Employee) error {
	if len(updates) == 0 {
		return nil
	}
	return r.db.Transaction(func(tx *gorm.DB) error {
		for _, emp := range updates {
			if err := tx.Model(&models.Employee{}).
				Where("employee_id = ? AND company_id = ?", emp.EmployeeID, emp.CompanyID).
				Updates(map[string]interface{}{
					"name_en": emp.NameEn, "name_bn": emp.NameBn,
					"father_name": emp.FatherName, "mother_name": emp.MotherName,
					"date_of_birth": emp.DateOfBirth, "gender": emp.Gender,
					"blood_group": emp.BloodGroup, "marital_status": emp.MaritalStatus,
					"nationality": emp.Nationality, "nid": emp.NID,
					"phone": emp.Phone, "email": emp.Email,
					"present_address": emp.PresentAddress, "permanent_address": emp.PermanentAddress,
					"spouse_name": emp.SpouseName, "emergency_contact": emp.EmergencyContact,
					"emergency_phone": emp.EmergencyPhone, "number_of_dependents": emp.NumberOfDependents,
					"punch_number": emp.PunchNumber, "grade": emp.Grade,
					"joining_date": emp.JoiningDate, "status": emp.Status,
					"gross_salary": emp.GrossSalary, "transport_allowance": emp.TransportAllowance,
					"food_allowance": emp.FoodAllowance, "other_allowance": emp.OtherAllowance,
					"account_type": emp.AccountType,
					"account_number": emp.AccountNumber,
				}).Error; err != nil {
				return err
			}
		}
		return nil
	})
}

func (r *EmployeeRepository) MapByID(companyID string) (map[string]models.Employee, error) {
	var employees []models.Employee
	if err := r.db.Where("company_id = ?", companyID).Find(&employees).Error; err != nil {
		return nil, err
	}
	m := make(map[string]models.Employee, len(employees))
	for _, e := range employees {
		m[e.EmployeeID] = e
	}
	return m, nil
}
