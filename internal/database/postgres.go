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

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	err = db.AutoMigrate(
		&models.User{},
		&models.Role{},
		&models.Permission{},
		&models.UserRole{},
		&models.RolePermission{},
		&models.Company{},
		&models.Branch{},
		&models.Department{},
		&models.Employee{},
		&models.Shift{},
		&models.Attendance{},
		&models.DataLog{},
		&models.RefreshToken{},
		&models.LoginHistory{},
		&models.PasswordHistory{},
		&models.AuditLog{},
		&models.EmailVerification{},
		&models.PasswordReset{},
		&models.Session{},
	)
	if err != nil {
		log.Fatal("Failed to migrate database:", err)
	}

	DB = db
	fmt.Println("Database connected successfully")
}
