package models

import (
	"time"

	"gorm.io/gorm"
)

type Attendance struct {
	ID          string         `json:"id" gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
	EmployeeID  string         `json:"employee_id" gorm:"type:uuid;not null;uniqueIndex:idx_attendance_date_employee"`
	CompanyID   string         `json:"company_id" gorm:"type:uuid;not null"`
	ShiftID     *string        `json:"shift_id" gorm:"type:uuid"`
	Date        string         `json:"date" gorm:"type:date;not null;uniqueIndex:idx_attendance_date_employee"`
	CheckIn     *string        `json:"check_in" gorm:"type:varchar(5)"`
	CheckOut    *string        `json:"check_out" gorm:"type:varchar(5)"`
	TotalHours  *string        `json:"total_hours" gorm:"type:varchar(5)"`
	Status      string         `json:"status" gorm:"type:varchar(20);default:present"`
	LateMinutes int            `json:"late_minutes" gorm:"type:int;default:0"`
	PunchNumber *string        `json:"punch_number" gorm:"type:varchar(50)"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `json:"-" gorm:"index"`
	CreatedBy   *string        `json:"created_by" gorm:"type:uuid"`
	UpdatedBy   *string        `json:"updated_by" gorm:"type:uuid"`

	Employee Employee `json:"employee" gorm:"foreignKey:EmployeeID"`
	Company  Company  `json:"company" gorm:"foreignKey:CompanyID"`
	Shift    *Shift   `json:"shift,omitempty" gorm:"foreignKey:ShiftID"`
}
