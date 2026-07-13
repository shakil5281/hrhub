package models

import (
	"time"

	"gorm.io/gorm"
)

type Shift struct {
	ID               string         `json:"id" gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
	CompanyID        string         `json:"company_id" gorm:"type:uuid;not null"`
	Name             string         `json:"name" gorm:"type:varchar(255);not null"`
	StartTime        string         `json:"start_time" gorm:"type:varchar(5);not null"`
	EndTime          string         `json:"end_time" gorm:"type:varchar(5);not null"`
	LateGraceMinutes int            `json:"late_grace_minutes" gorm:"type:int;default:0"`
	Status           string         `json:"status" gorm:"type:varchar(20);default:active"`
	CreatedAt        time.Time      `json:"created_at"`
	UpdatedAt        time.Time      `json:"updated_at"`
	DeletedAt        gorm.DeletedAt `json:"-" gorm:"index"`
	CreatedBy        *string        `json:"created_by" gorm:"type:uuid"`
	UpdatedBy        *string        `json:"updated_by" gorm:"type:uuid"`

	Company Company `json:"company" gorm:"foreignKey:CompanyID"`
}
