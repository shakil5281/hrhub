package handlers

import (
	"fmt"
	"io"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/shakil5281/hrhub-api/internal/config"
	"github.com/shakil5281/hrhub-api/internal/database"
	"github.com/shakil5281/hrhub-api/internal/models"
)

type DatabaseHandler struct {
	cfg *config.Config
}

func NewDatabaseHandler(cfg *config.Config) *DatabaseHandler {
	return &DatabaseHandler{cfg: cfg}
}

func (h *DatabaseHandler) buildEnv() []string {
	return []string{
		fmt.Sprintf("PGPASSWORD=%s", h.cfg.DBPass),
	}
}

func (h *DatabaseHandler) pgDumpArgs() []string {
	return []string{
		"-h", h.cfg.DBHost,
		"-p", h.cfg.DBPort,
		"-U", h.cfg.DBUser,
		"-d", h.cfg.DBName,
		"--no-owner",
		"--no-acl",
		"--verbose",
	}
}

func (h *DatabaseHandler) psqlArgs(file string) []string {
	return []string{
		"-h", h.cfg.DBHost,
		"-p", h.cfg.DBPort,
		"-U", h.cfg.DBUser,
		"-d", h.cfg.DBName,
		"-f", file,
	}
}

// Backup godoc
//
//	@Summary      Create database backup
//	@Description  Create a PostgreSQL dump backup file
//	@Tags         Database
//	@Security     BearerAuth
//	@Produce      json
//	@Success      200  {object}  map[string]string
//	@Failure      500  {object}  map[string]string
//	@Router       /database/backup [post]
func (h *DatabaseHandler) Backup(c *gin.Context) {
	backupDir := "backups"
	if err := os.MkdirAll(backupDir, 0755); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create backup directory"})
		return
	}

	filename := fmt.Sprintf("hrhub_backup_%s.sql", time.Now().Format("20060102_150405"))
	filepath := filepath.Join(backupDir, filename)

	cmd := exec.Command("pg_dump", h.pgDumpArgs()...)
	cmd.Env = append(os.Environ(), h.buildEnv()...)

	outFile, err := os.Create(filepath)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create backup file"})
		return
	}
	defer outFile.Close()

	cmd.Stdout = outFile
	cmd.Stderr = os.Stderr

	if err := cmd.Run(); err != nil {
		os.Remove(filepath)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "backup failed: " + err.Error()})
		return
	}

	info, _ := os.Stat(filepath)
	size := int64(0)
	if info != nil {
		size = info.Size()
	}

	c.JSON(http.StatusOK, gin.H{
		"message":  "Backup created successfully",
		"filename": filename,
		"size_kb":  size / 1024,
	})
}

// ListBackups godoc
//
//	@Summary      List database backups
//	@Description  List all backup files in the backups directory
//	@Tags         Database
//	@Security     BearerAuth
//	@Produce      json
//	@Success      200  {array}  map[string]interface{}
//	@Router       /database/backups [get]
func (h *DatabaseHandler) ListBackups(c *gin.Context) {
	backupDir := "backups"
	entries, err := os.ReadDir(backupDir)
	if err != nil {
		c.JSON(http.StatusOK, []interface{}{})
		return
	}

	var files []map[string]interface{}
	for _, e := range entries {
		if !e.IsDir() && strings.HasSuffix(e.Name(), ".sql") {
			info, _ := e.Info()
			files = append(files, map[string]interface{}{
				"name":     e.Name(),
				"size_kb":  info.Size() / 1024,
				"modified": info.ModTime().Format("2006-01-02 15:04:05"),
			})
		}
	}
	c.JSON(http.StatusOK, files)
}

// Export godoc
//
//	@Summary      Download a backup file
//	@Description  Download a specific backup SQL file
//	@Tags         Database
//	@Security     BearerAuth
//	@Produce      application/octet-stream
//	@Param        filename query string true "Backup filename"
//	@Success      200  {file}  file
//	@Failure      404  {object}  map[string]string
//	@Router       /database/export [get]
func (h *DatabaseHandler) Export(c *gin.Context) {
	filename := c.Query("filename")
	if filename == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "filename is required"})
		return
	}

	// Basic security: prevent path traversal
	if strings.Contains(filename, "..") || strings.Contains(filename, "/") || strings.Contains(filename, "\\") {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid filename"})
		return
	}

	filepath := filepath.Join("backups", filename)
	if _, err := os.Stat(filepath); os.IsNotExist(err) {
		c.JSON(http.StatusNotFound, gin.H{"error": "backup file not found"})
		return
	}

	c.Header("Content-Disposition", fmt.Sprintf("attachment; filename=%s", filename))
	c.Header("Content-Type", "application/octet-stream")
	c.File(filepath)
}

// Import godoc
//
//	@Summary      Import database from SQL file
//	@Description  Upload and execute a SQL backup file to restore the database
//	@Tags         Database
//	@Security     BearerAuth
//	@Accept       multipart/form-data
//	@Produce      json
//	@Param        file formData file true "SQL backup file"
//	@Success      200  {object}  map[string]string
//	@Failure      400  {object}  map[string]string
//	@Failure      500  {object}  map[string]string
//	@Router       /database/import [post]
func (h *DatabaseHandler) Import(c *gin.Context) {
	file, header, err := c.Request.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Required field 'file' is missing. Please upload a .sql file using a multipart/form-data request with field name 'file'."})
		return
	}
	defer file.Close()

	if !strings.HasSuffix(header.Filename, ".sql") {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Only .sql files are supported. Received: " + header.Filename})
		return
	}

	tmpFile, err := os.CreateTemp("", "import_*.sql")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create temp file"})
		return
	}
	defer os.Remove(tmpFile.Name())
	defer tmpFile.Close()

	if _, err := io.Copy(tmpFile, file); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to save uploaded file"})
		return
	}
	tmpFile.Close()

	cmd := exec.Command("psql", h.psqlArgs(tmpFile.Name())...)
	cmd.Env = append(os.Environ(), h.buildEnv()...)
	cmd.Stderr = os.Stderr

	output, err := cmd.Output()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":  "import failed: " + err.Error(),
			"output": string(output),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Database import completed successfully",
		"output":  string(output),
	})
}

// DeleteBackup godoc
//
//	@Summary      Delete a backup file
//	@Description  Delete a specific backup SQL file from the backups directory
//	@Tags         Database
//	@Security     BearerAuth
//	@Produce      json
//	@Param        filename query string true "Backup filename to delete"
//	@Success      200  {object}  map[string]string
//	@Failure      400  {object}  map[string]string
//	@Failure      404  {object}  map[string]string
//	@Failure      500  {object}  map[string]string
//	@Router       /database/backups [delete]
func (h *DatabaseHandler) DeleteBackup(c *gin.Context) {
	filename := c.Query("filename")
	if filename == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "filename is required"})
		return
	}

	if strings.Contains(filename, "..") || strings.Contains(filename, "/") || strings.Contains(filename, "\\") {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid filename"})
		return
	}

	filepath := filepath.Join("backups", filename)
	if _, err := os.Stat(filepath); os.IsNotExist(err) {
		c.JSON(http.StatusNotFound, gin.H{"error": "backup file not found"})
		return
	}

	if err := os.Remove(filepath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to delete backup: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":  "Backup deleted successfully",
		"filename": filename,
	})
}

// Reset godoc
//
//	@Summary      Reset database
//	@Description  Drop all tables and re-run auto-migration
//	@Tags         Database
//	@Security     BearerAuth
//	@Produce      json
//	@Success      200  {object}  map[string]string
//	@Failure      500  {object}  map[string]string
//	@Router       /database/reset [post]
func (h *DatabaseHandler) Reset(c *gin.Context) {
	db := database.DB

	// Drop all tables
	if err := db.Migrator().DropTable(
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
	); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to drop tables: " + err.Error()})
		return
	}

	// Re-run auto-migration
	if err := db.AutoMigrate(
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
	); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "migration failed: " + err.Error()})
		return
	}

	// Re-apply the employee_id column type fixes
	_ = db.Exec("ALTER TABLE employees ALTER COLUMN employee_id TYPE varchar(50) USING employee_id::varchar(50)")

	c.JSON(http.StatusOK, gin.H{
		"message": "Database reset completed — all tables dropped and re-created",
	})
}
