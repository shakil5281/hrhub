package repository

import (
	"github.com/shakil5281/hrhub-api/internal/models"
	"gorm.io/gorm"
)

type AttendanceRepository struct {
	db *gorm.DB
}

func NewAttendanceRepository(db *gorm.DB) *AttendanceRepository {
	return &AttendanceRepository{db: db}
}

func (r *AttendanceRepository) Create(attendance *models.Attendance) error {
	return r.db.Create(attendance).Error
}

func (r *AttendanceRepository) FindByID(id string) (*models.Attendance, error) {
	var attendance models.Attendance
	err := r.db.Preload("Employee").Preload("Shift").Where("id = ? AND deleted_at IS NULL", id).First(&attendance).Error
	return &attendance, err
}

func (r *AttendanceRepository) ListByDate(date string) ([]models.Attendance, error) {
	var attendances []models.Attendance
	err := r.db.Preload("Employee").Preload("Shift").Where("date = ? AND deleted_at IS NULL", date).Order("created_at ASC").Find(&attendances).Error
	return attendances, err
}

func (r *AttendanceRepository) FindByEmployeeAndDate(employeeID, date string) (*models.Attendance, error) {
	var attendance models.Attendance
	err := r.db.Where("employee_id = ? AND date = ? AND deleted_at IS NULL", employeeID, date).First(&attendance).Error
	if err != nil {
		return nil, err
	}
	return &attendance, nil
}

func (r *AttendanceRepository) ListByDateAndEmployeeIDs(date string, employeeIDs []string) ([]models.Attendance, error) {
	var attendances []models.Attendance
	err := r.db.Where("date = ? AND employee_id IN ? AND deleted_at IS NULL", date, employeeIDs).Find(&attendances).Error
	return attendances, err
}

func (r *AttendanceRepository) ListByDateFiltered(date, companyID, departmentID, sectionID, designationID, lineID, groupID, shiftID, status, employeeID string) ([]models.Attendance, error) {
	var attendances []models.Attendance
	query := r.db.Preload("Employee").Preload("Shift").Where("date = ? AND deleted_at IS NULL", date)
	if companyID != "" {
		query = query.Where("company_id = ?", companyID)
	}
	if departmentID != "" {
		query = query.Where("employee_id IN (SELECT id FROM employees WHERE department_id = ?)", departmentID)
	}
	if sectionID != "" {
		query = query.Where("employee_id IN (SELECT id FROM employees WHERE section_id = ?)", sectionID)
	}
	if designationID != "" {
		query = query.Where("employee_id IN (SELECT id FROM employees WHERE designation_id = ?)", designationID)
	}
	if lineID != "" {
		query = query.Where("employee_id IN (SELECT id FROM employees WHERE line_id = ?)", lineID)
	}
	if groupID != "" {
		query = query.Where("employee_id IN (SELECT id FROM employees WHERE group_id = ?)", groupID)
	}
	if shiftID != "" {
		query = query.Where("shift_id = ?", shiftID)
	}
	if status != "" {
		query = query.Where("status = ?", status)
	}
	if employeeID != "" {
		query = query.Where("employee_id = ?", employeeID)
	}
	err := query.Order("created_at ASC").Find(&attendances).Error
	return attendances, err
}

func (r *AttendanceRepository) Summary(startDate, endDate, companyID, departmentID, sectionID, designationID, lineID, groupID, shiftID, statusFilter string) ([]map[string]interface{}, error) {
	query := r.db.Table("attendances").
		Select("date, company_id, status, COUNT(*) as count").
		Where("attendances.date BETWEEN ? AND ? AND attendances.deleted_at IS NULL", startDate, endDate)
	if companyID != "" {
		query = query.Where("attendances.company_id = ?", companyID)
	}
	if departmentID != "" {
		query = query.Where("attendances.employee_id IN (SELECT id FROM employees WHERE department_id = ?)", departmentID)
	}
	if sectionID != "" {
		query = query.Where("attendances.employee_id IN (SELECT id FROM employees WHERE section_id = ?)", sectionID)
	}
	if designationID != "" {
		query = query.Where("attendances.employee_id IN (SELECT id FROM employees WHERE designation_id = ?)", designationID)
	}
	if lineID != "" {
		query = query.Where("attendances.employee_id IN (SELECT id FROM employees WHERE line_id = ?)", lineID)
	}
	if groupID != "" {
		query = query.Where("attendances.employee_id IN (SELECT id FROM employees WHERE group_id = ?)", groupID)
	}
	if shiftID != "" {
		query = query.Where("attendances.shift_id = ?", shiftID)
	}
	if statusFilter != "" {
		query = query.Where("attendances.status = ?", statusFilter)
	}
	rows, err := query.Group("attendances.date, attendances.company_id, attendances.status").Order("attendances.date ASC").Rows()
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	summaryMap := make(map[string]map[string]interface{})
	for rows.Next() {
		var date, companyID, status string
		var count int64
		rows.Scan(&date, &companyID, &status, &count)
		key := date + "|" + companyID
		if _, ok := summaryMap[key]; !ok {
			summaryMap[key] = map[string]interface{}{
				"date":       date,
				"company_id": companyID,
				"present":    0, "late": 0, "absent": 0, "half_day": 0, "total": 0,
			}
		}
		entry := summaryMap[key]
		entry[status] = count
		entry["total"] = entry["total"].(int64) + count
	}

	var result []map[string]interface{}
	for _, v := range summaryMap {
		result = append(result, v)
	}
	return result, nil
}

func (r *AttendanceRepository) Overtime(startDate, endDate, companyID, departmentID, sectionID, designationID, lineID, groupID, shiftID, statusFilter string) ([]map[string]interface{}, error) {
	query := r.db.Table("attendances").
		Select("attendances.id, attendances.employee_id, attendances.date, attendances.check_in, attendances.check_out, attendances.total_hours, employees.name_en as employee_name, employees.employee_code").
		Joins("JOIN employees ON employees.id = attendances.employee_id").
		Where("attendances.date BETWEEN ? AND ? AND attendances.deleted_at IS NULL AND attendances.check_in IS NOT NULL AND attendances.check_out IS NOT NULL", startDate, endDate)
	if companyID != "" {
		query = query.Where("attendances.company_id = ?", companyID)
	}
	if departmentID != "" {
		query = query.Where("employees.department_id = ?", departmentID)
	}
	if sectionID != "" {
		query = query.Where("employees.section_id = ?", sectionID)
	}
	if designationID != "" {
		query = query.Where("employees.designation_id = ?", designationID)
	}
	if lineID != "" {
		query = query.Where("employees.line_id = ?", lineID)
	}
	if groupID != "" {
		query = query.Where("employees.group_id = ?", groupID)
	}
	if shiftID != "" {
		query = query.Where("attendances.shift_id = ?", shiftID)
	}
	if statusFilter != "" {
		query = query.Where("attendances.status = ?", statusFilter)
	}
	var results []map[string]interface{}
	err := query.Order("attendances.date ASC").Find(&results).Error
	return results, err
}

func (r *AttendanceRepository) OvertimeSummary(startDate, endDate, companyID, departmentID, sectionID, designationID, lineID, groupID, shiftID, statusFilter string) ([]map[string]interface{}, error) {
	query := r.db.Table("attendances").
		Select("employees.department_id, departments.name as department_name, COUNT(DISTINCT attendances.employee_id) as employee_count").
		Joins("JOIN employees ON employees.id = attendances.employee_id").
		Joins("JOIN departments ON departments.id = employees.department_id").
		Where("attendances.date BETWEEN ? AND ? AND attendances.deleted_at IS NULL AND attendances.check_in IS NOT NULL AND attendances.check_out IS NOT NULL", startDate, endDate)
	if companyID != "" {
		query = query.Where("attendances.company_id = ?", companyID)
	}
	if departmentID != "" {
		query = query.Where("employees.department_id = ?", departmentID)
	}
	if sectionID != "" {
		query = query.Where("employees.section_id = ?", sectionID)
	}
	if designationID != "" {
		query = query.Where("employees.designation_id = ?", designationID)
	}
	if lineID != "" {
		query = query.Where("employees.line_id = ?", lineID)
	}
	if groupID != "" {
		query = query.Where("employees.group_id = ?", groupID)
	}
	if shiftID != "" {
		query = query.Where("attendances.shift_id = ?", shiftID)
	}
	if statusFilter != "" {
		query = query.Where("attendances.status = ?", statusFilter)
	}
	var results []map[string]interface{}
	err := query.Group("employees.department_id, departments.name").Find(&results).Error
	return results, err
}

func (r *AttendanceRepository) Update(attendance *models.Attendance) error {
	return r.db.Save(attendance).Error
}

func (r *AttendanceRepository) Delete(id string) error {
	return r.db.Where("id = ?", id).Delete(&models.Attendance{}).Error
}

func (r *AttendanceRepository) DeleteAll() error {
	return r.db.Unscoped().Where("1 = 1").Delete(&models.Attendance{}).Error
}

func (r *AttendanceRepository) UpdateStatusByEmployeeAndDateRange(employeeID, fromDate, toDate, status string) error {
	return r.db.Model(&models.Attendance{}).
		Where("employee_id = ? AND date >= ? AND date <= ? AND deleted_at IS NULL", employeeID, fromDate, toDate).
		Update("status", status).Error
}

func (r *AttendanceRepository) CountByDate(date string) (int64, error) {
	var count int64
	err := r.db.Model(&models.Attendance{}).Where("date = ? AND deleted_at IS NULL", date).Count(&count).Error
	return count, err
}

func (r *AttendanceRepository) ListJobCard(startDate, endDate, companyID, employeeID, departmentID, sectionID, designationID, lineID, groupID, shiftID, status string) ([]models.Attendance, error) {
	var attendances []models.Attendance
	query := r.db.Preload("Employee.User").Preload("Employee.Department").Preload("Shift").Where("date BETWEEN ? AND ? AND deleted_at IS NULL", startDate, endDate)
	if companyID != "" {
		query = query.Where("company_id = ?", companyID)
	}
	if employeeID != "" {
		query = query.Where("employee_id = ?", employeeID)
	}
	if departmentID != "" {
		query = query.Where("employee_id IN (SELECT id FROM employees WHERE department_id = ?)", departmentID)
	}
	if sectionID != "" {
		query = query.Where("employee_id IN (SELECT id FROM employees WHERE section_id = ?)", sectionID)
	}
	if designationID != "" {
		query = query.Where("employee_id IN (SELECT id FROM employees WHERE designation_id = ?)", designationID)
	}
	if lineID != "" {
		query = query.Where("employee_id IN (SELECT id FROM employees WHERE line_id = ?)", lineID)
	}
	if groupID != "" {
		query = query.Where("employee_id IN (SELECT id FROM employees WHERE group_id = ?)", groupID)
	}
	if shiftID != "" {
		query = query.Where("shift_id = ?", shiftID)
	}
	if status != "" {
		query = query.Where("status = ?", status)
	}
	err := query.Order("date ASC, created_at ASC").Find(&attendances).Error
	return attendances, err
}

func (r *AttendanceRepository) ListByStatus(startDate, endDate, status, companyID, departmentID, sectionID, designationID, lineID, groupID, shiftID, employeeID string) ([]models.Attendance, error) {
	var attendances []models.Attendance
	query := r.db.Preload("Employee").Where("date BETWEEN ? AND ? AND status = ? AND deleted_at IS NULL", startDate, endDate, status)
	if companyID != "" {
		query = query.Where("company_id = ?", companyID)
	}
	if departmentID != "" {
		query = query.Where("employee_id IN (SELECT id FROM employees WHERE department_id = ?)", departmentID)
	}
	if sectionID != "" {
		query = query.Where("employee_id IN (SELECT id FROM employees WHERE section_id = ?)", sectionID)
	}
	if designationID != "" {
		query = query.Where("employee_id IN (SELECT id FROM employees WHERE designation_id = ?)", designationID)
	}
	if lineID != "" {
		query = query.Where("employee_id IN (SELECT id FROM employees WHERE line_id = ?)", lineID)
	}
	if groupID != "" {
		query = query.Where("employee_id IN (SELECT id FROM employees WHERE group_id = ?)", groupID)
	}
	if shiftID != "" {
		query = query.Where("shift_id = ?", shiftID)
	}
	if employeeID != "" {
		query = query.Where("employee_id = ?", employeeID)
	}
	err := query.Order("date ASC, created_at ASC").Find(&attendances).Error
	return attendances, err
}
