package database

import (
	"fmt"
	"log"

	"github.com/shakil5281/hrhub-api/internal/config"
	"github.com/shakil5281/hrhub-api/internal/models"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
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

	// GORM v1.31.2 forces UUID on *_id columns, overriding type:varchar(50) tags.
	// Use a silent session to suppress expected ALTER errors; then fix types below.
	_ = db.Session(&gorm.Session{Logger: logger.Default.LogMode(logger.Silent)}).AutoMigrate(
		&models.User{}, &models.Role{}, &models.Permission{}, &models.UserRole{},
		&models.RolePermission{}, &models.RefreshToken{}, &models.LoginHistory{},
		&models.PasswordHistory{}, &models.AuditLog{}, &models.EmailVerification{},
		&models.PasswordReset{}, &models.Company{},
		&models.Department{}, &models.Section{}, &models.Designation{}, &models.Line{},
		&models.Group{}, &models.Floor{}, &models.Division{}, &models.District{},
		&models.Upazila{}, &models.Union{}, &models.Employee{}, &models.Requirement{},
		&models.Separation{}, &models.IdCard{}, &models.Shift{}, &models.LeaveType{},
		&models.LeaveAllocation{}, &models.Leave{}, &models.TemporaryShift{},
		&models.Attendance{}, &models.DataLog{}, &models.Salary{}, &models.Session{},
		&models.SystemSetting{},
	)

	// Ensure employee_id is varchar(50) in all tables that reference it
	_ = db.Exec("ALTER TABLE employees ALTER COLUMN employee_id TYPE varchar(50) USING employee_id::varchar(50)")
	_ = db.Exec("ALTER TABLE attendances ALTER COLUMN employee_id TYPE varchar(50) USING employee_id::varchar(50)")
	_ = db.Exec("ALTER TABLE leaves ALTER COLUMN employee_id TYPE varchar(50) USING employee_id::varchar(50)")
	_ = db.Exec("ALTER TABLE leave_allocations ALTER COLUMN employee_id TYPE varchar(50) USING employee_id::varchar(50)")
	_ = db.Exec("ALTER TABLE salaries ALTER COLUMN employee_id TYPE varchar(50) USING employee_id::varchar(50)")
	_ = db.Exec("ALTER TABLE temporary_shifts ALTER COLUMN employee_id TYPE varchar(50) USING employee_id::varchar(50)")

	// Add performance indexes for high-frequency queries
	_ = db.Exec("CREATE INDEX IF NOT EXISTS idx_salaries_company_month_year ON salaries(company_id, year, month)")
	_ = db.Exec("CREATE INDEX IF NOT EXISTS idx_employees_company_status ON employees(company_id, status) WHERE deleted_at IS NULL")
	_ = db.Exec("CREATE INDEX IF NOT EXISTS idx_employees_department ON employees(department_id) WHERE deleted_at IS NULL")
	_ = db.Exec("CREATE INDEX IF NOT EXISTS idx_leave_allocations_emp_year ON leave_allocations(employee_id, year)")
	_ = db.Exec("CREATE INDEX IF NOT EXISTS idx_temporary_shifts_company_date ON temporary_shifts(company_id, date)")
	_ = db.Exec("CREATE INDEX IF NOT EXISTS idx_data_logs_date_processed ON data_logs(date, processed) WHERE deleted_at IS NULL")
	_ = db.Exec("CREATE INDEX IF NOT EXISTS idx_attendances_date_status ON attendances(date, status)")
	_ = db.Exec("CREATE INDEX IF NOT EXISTS idx_leaves_status_dates ON leaves(status, from_date, to_date)")
	_ = db.Exec("CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id) WHERE deleted_at IS NULL")

	DB = db
	fmt.Println("Database connected successfully")
}
