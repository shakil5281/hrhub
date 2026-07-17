package database

import (
	"fmt"
	"log"

	"github.com/shakil5281/hrhub-api/internal/config"
	"github.com/shakil5281/hrhub-api/internal/models"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func Connect(cfg *config.Config) {
	dsn := cfg.GetDSN()

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		DisableForeignKeyConstraintWhenMigrating: true,
	})
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	// GORM v1.31.2 ignores type:varchar(50) on _id columns and forces UUID.
	// We run AutoMigrate knowing the employee_id ALTER may fail; we fix the column after.
	if err := db.AutoMigrate(
		&models.User{}, &models.Role{}, &models.Permission{}, &models.UserRole{},
		&models.RolePermission{}, &models.RefreshToken{}, &models.LoginHistory{},
		&models.PasswordHistory{}, &models.AuditLog{}, &models.EmailVerification{},
		&models.PasswordReset{}, &models.Company{}, &models.Branch{},
		&models.Department{}, &models.Section{}, &models.Designation{}, &models.Line{},
		&models.Group{}, &models.Floor{}, &models.Division{}, &models.District{},
		&models.Upazila{}, &models.Union{}, &models.Employee{}, &models.Requirement{},
		&models.Separation{}, &models.IdCard{}, &models.Shift{}, &models.LeaveType{},
		&models.LeaveAllocation{}, &models.Leave{}, &models.TemporaryShift{},
		&models.Attendance{}, &models.DataLog{}, &models.Salary{}, &models.Session{},
	); err != nil {
		log.Println("Warning: migration error (may be expected for employee_id):", err)
	}

	// Ensure employee_id is varchar(50) regardless of what GORM did
	_ = db.Exec("ALTER TABLE employees ALTER COLUMN employee_id TYPE varchar(50) USING employee_id::varchar(50)")

	DB = db
	fmt.Println("Database connected successfully")
}
