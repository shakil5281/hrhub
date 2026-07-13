package models

import (
	"time"

	"gorm.io/gorm"
)

type Employee struct {
	ID           string         `json:"id" gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
	UserID       *string        `json:"user_id" gorm:"type:uuid"`
	CompanyID    string         `json:"company_id" gorm:"type:uuid;not null"`
	BranchID     *string        `json:"branch_id" gorm:"type:uuid"`
	DepartmentID *string        `json:"department_id" gorm:"type:uuid"`
	Designation  string         `json:"designation" gorm:"type:varchar(100)"`
	EmployeeCode string         `json:"employee_code" gorm:"type:varchar(50);not null"`
	PunchNumber  string         `json:"punch_number" gorm:"type:varchar(50)"`
	JoiningDate  time.Time      `json:"joining_date" gorm:"not null"`
	Salary       float64        `json:"salary" gorm:"type:decimal(12,2)"`
	Status       string         `json:"status" gorm:"type:varchar(20);default:active"`
	ShiftID      *string        `json:"shift_id" gorm:"type:uuid"`
	ReportsTo    *string        `json:"reports_to" gorm:"type:uuid"`
	CreatedAt    time.Time      `json:"created_at"`
	UpdatedAt    time.Time      `json:"updated_at"`
	DeletedAt    gorm.DeletedAt `json:"-" gorm:"index"`
	CreatedBy    *string        `json:"created_by" gorm:"type:uuid"`
	UpdatedBy    *string        `json:"updated_by" gorm:"type:uuid"`
	DeletedBy    *string        `json:"deleted_by" gorm:"type:uuid"`

	User       *User       `json:"user,omitempty" gorm:"foreignKey:UserID"`
	Company    Company     `json:"company" gorm:"foreignKey:CompanyID"`
	Branch     *Branch     `json:"branch,omitempty" gorm:"foreignKey:BranchID"`
	Department *Department `json:"department,omitempty" gorm:"foreignKey:DepartmentID"`
	Shift    *Shift      `json:"shift,omitempty" gorm:"foreignKey:ShiftID"`
	Manager  *Employee   `json:"manager,omitempty" gorm:"foreignKey:ReportsTo"`
}
