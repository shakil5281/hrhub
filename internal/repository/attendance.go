package repository

import (
	"fmt"

	"github.com/shakil5281/hrhub-api/internal/models"
	"gorm.io/gorm"
)

type AttendanceRepository struct {
	db *gorm.DB
}

func NewAttendanceRepository(db *gorm.DB) *AttendanceRepository {
	return &AttendanceRepository{db: db}
}

// WithTx returns a new AttendanceRepository using the provided transaction
func (r *AttendanceRepository) WithTx(tx *gorm.DB) *AttendanceRepository {
	return &AttendanceRepository{db: tx}
}

func (r *AttendanceRepository) Create(attendance *models.Attendance) error {
	return r.db.Create(attendance).Error
}

func (r *AttendanceRepository) FindByID(id string) (*models.Attendance, error) {
	var attendance models.Attendance
	err := r.db.Preload("Employee").Preload("Shift").Where("id = ? AND deleted_at IS NULL", id).First(&attendance).Error
	return &attendance, err
}

func (r *AttendanceRepository) ListByDate(date string, page, limit int) ([]models.Attendance, int64, error) {
	base := r.db.Model(&models.Attendance{}).Where("date = ? AND deleted_at IS NULL", date)
	var total int64
	if err := base.Count(&total).Error; err != nil {
		return nil, 0, err
	}
	var attendances []models.Attendance
	err := base.Preload("Employee.DesignationRef").Preload("Employee").Preload("Shift").Order("created_at ASC").Offset((page - 1) * limit).Limit(limit).Find(&attendances).Error
	return attendances, total, err
}

func (r *AttendanceRepository) ListAllByDate(date string) ([]models.Attendance, error) {
	var attendances []models.Attendance
	err := r.db.Preload("Employee.DesignationRef").Preload("Employee").Preload("Shift").Where("date = ? AND deleted_at IS NULL", date).Order("created_at ASC").Find(&attendances).Error
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

func (r *AttendanceRepository) ListByDateFiltered(date, companyID, departmentID, sectionID, designationID, lineID, groupID, shiftID, status, employeeID string, page, limit int) ([]models.Attendance, int64, error) {
	base := r.db.Model(&models.Attendance{}).Where("date = ? AND deleted_at IS NULL", date)
	if companyID != "" {
		base = base.Where("company_id = ?", companyID)
	}
	if departmentID != "" {
		base = base.Where("employee_id IN (SELECT employee_id FROM employees WHERE department_id = ?)", departmentID)
	}
	if sectionID != "" {
		base = base.Where("employee_id IN (SELECT employee_id FROM employees WHERE section_id = ?)", sectionID)
	}
	if designationID != "" {
		base = base.Where("employee_id IN (SELECT employee_id FROM employees WHERE designation_id = ?)", designationID)
	}
	if lineID != "" {
		base = base.Where("employee_id IN (SELECT employee_id FROM employees WHERE line_id = ?)", lineID)
	}
	if groupID != "" {
		base = base.Where("employee_id IN (SELECT employee_id FROM employees WHERE group_id = ?)", groupID)
	}
	if shiftID != "" {
		base = base.Where("shift_id = ?", shiftID)
	}
	if status != "" {
		base = base.Where("status = ?", status)
	}
	if employeeID != "" {
		base = base.Where("employee_id = ?", employeeID)
	}
	var total int64
	if err := base.Count(&total).Error; err != nil {
		return nil, 0, err
	}
	var attendances []models.Attendance
	err := base.Preload("Employee.DesignationRef").Preload("Employee").Preload("Shift").Order("created_at ASC").Offset((page - 1) * limit).Limit(limit).Find(&attendances).Error
	return attendances, total, err
}

func (r *AttendanceRepository) Summary(startDate, endDate, companyID, departmentID, sectionID, designationID, lineID, groupID, shiftID, statusFilter string) ([]map[string]interface{}, error) {
	query := r.db.Table("attendances").
		Select("date, company_id, status, COUNT(*) as count").
		Where("attendances.date BETWEEN ? AND ? AND attendances.deleted_at IS NULL", startDate, endDate)
	if companyID != "" {
		query = query.Where("attendances.company_id = ?", companyID)
	}
	if departmentID != "" {
		query = query.Where("attendances.employee_id IN (SELECT employee_id FROM employees WHERE department_id = ?)", departmentID)
	}
	if sectionID != "" {
		query = query.Where("attendances.employee_id IN (SELECT employee_id FROM employees WHERE section_id = ?)", sectionID)
	}
	if designationID != "" {
		query = query.Where("attendances.employee_id IN (SELECT employee_id FROM employees WHERE designation_id = ?)", designationID)
	}
	if lineID != "" {
		query = query.Where("attendances.employee_id IN (SELECT employee_id FROM employees WHERE line_id = ?)", lineID)
	}
	if groupID != "" {
		query = query.Where("attendances.employee_id IN (SELECT employee_id FROM employees WHERE group_id = ?)", groupID)
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
				"present":    int64(0), "late": int64(0), "absent": int64(0), "half_day": int64(0), "total": int64(0),
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

func (r *AttendanceRepository) SummaryByGroup(startDate, endDate, groupBy, companyID, departmentID, sectionID, designationID, lineID, groupFilter, shiftID, statusFilter string) ([]map[string]interface{}, error) {
	var selectCols, joinClause, groupCols, orderCol string
	switch groupBy {
	case "department":
		selectCols = "d.id as entity_id, d.name"
		joinClause = "LEFT JOIN departments d ON d.id = e.department_id"
		groupCols = "d.id, d.name"
		orderCol = "d.name"
	case "section":
		selectCols = "s.id as entity_id, s.name"
		joinClause = "LEFT JOIN sections s ON s.id = e.section_id"
		groupCols = "s.id, s.name"
		orderCol = "s.name"
	case "designation":
		selectCols = "des.id as entity_id, des.name"
		joinClause = "LEFT JOIN designations des ON des.id = e.designation_id"
		groupCols = "des.id, des.name"
		orderCol = "des.name"
	case "line":
		selectCols = "l.id as entity_id, l.name"
		joinClause = "LEFT JOIN lines l ON l.id = e.line_id"
		groupCols = "l.id, l.name"
		orderCol = "l.name"
	case "group":
		selectCols = "g.id as entity_id, g.name"
		joinClause = "LEFT JOIN \"groups\" g ON g.id = e.group_id"
		groupCols = "g.id, g.name"
		orderCol = "g.name"
	default:
		return nil, fmt.Errorf("invalid group_by: %s", groupBy)
	}

	query := r.db.Table("attendances a").
		Select(fmt.Sprintf(`
			%s,
			SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) as present,
			SUM(CASE WHEN a.status = 'late' THEN 1 ELSE 0 END) as late,
			SUM(CASE WHEN a.status = 'absent' THEN 1 ELSE 0 END) as absent,
			SUM(CASE WHEN a.status = 'half_day' THEN 1 ELSE 0 END) as half_day,
			SUM(CASE WHEN a.status = 'on_leave' THEN 1 ELSE 0 END) as on_leave,
			SUM(CASE WHEN a.status = 'weekend' THEN 1 ELSE 0 END) as weekend,
			COUNT(*) as total
		`, selectCols)).
		Joins("JOIN employees e ON e.employee_id = a.employee_id").
		Joins(joinClause).
		Where("a.date BETWEEN ? AND ? AND a.deleted_at IS NULL", startDate, endDate)

	if companyID != "" {
		query = query.Where("a.company_id = ?", companyID)
	}
	if departmentID != "" {
		query = query.Where("e.department_id = ?", departmentID)
	}
	if sectionID != "" {
		query = query.Where("e.section_id = ?", sectionID)
	}
	if designationID != "" {
		query = query.Where("e.designation_id = ?", designationID)
	}
	if lineID != "" {
		query = query.Where("e.line_id = ?", lineID)
	}
	if groupFilter != "" {
		query = query.Where("e.group_id = ?", groupFilter)
	}
	if shiftID != "" {
		query = query.Where("a.shift_id = ?", shiftID)
	}
	if statusFilter != "" {
		query = query.Where("a.status = ?", statusFilter)
	}

	var results []map[string]interface{}
	err := query.Group(groupCols).Order(orderCol + " ASC").Find(&results).Error
	return results, err
}

func (r *AttendanceRepository) Overtime(startDate, endDate, companyID, departmentID, sectionID, designationID, lineID, groupID, shiftID, statusFilter string) ([]map[string]interface{}, error) {
	query := r.db.Table("attendances").
		Select("attendances.id, attendances.employee_id, attendances.date, attendances.check_in, attendances.check_out, attendances.over_time, employees.name_en as employee_name, employees.employee_id as emp_id, employees.over_time_status").
		Joins("JOIN employees ON employees.employee_id = attendances.employee_id").
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
		Joins("JOIN employees ON employees.employee_id = attendances.employee_id").
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

func (r *AttendanceRepository) ListJobCard(startDate, endDate, companyID, employeeID, departmentID, sectionID, designationID, lineID, groupID, shiftID, status string, page, limit int) ([]models.Attendance, int64, error) {
	base := r.db.Model(&models.Attendance{}).Where("date BETWEEN ? AND ? AND deleted_at IS NULL", startDate, endDate)
	if companyID != "" {
		base = base.Where("company_id = ?", companyID)
	}
	if employeeID != "" {
		base = base.Where("employee_id = ?", employeeID)
	}
	if departmentID != "" {
		base = base.Where("employee_id IN (SELECT employee_id FROM employees WHERE department_id = ?)", departmentID)
	}
	if sectionID != "" {
		base = base.Where("employee_id IN (SELECT employee_id FROM employees WHERE section_id = ?)", sectionID)
	}
	if designationID != "" {
		base = base.Where("employee_id IN (SELECT employee_id FROM employees WHERE designation_id = ?)", designationID)
	}
	if lineID != "" {
		base = base.Where("employee_id IN (SELECT employee_id FROM employees WHERE line_id = ?)", lineID)
	}
	if groupID != "" {
		base = base.Where("employee_id IN (SELECT employee_id FROM employees WHERE group_id = ?)", groupID)
	}
	if shiftID != "" {
		base = base.Where("shift_id = ?", shiftID)
	}
	if status != "" {
		base = base.Where("status = ?", status)
	}
	var total int64
	if err := base.Count(&total).Error; err != nil {
		return nil, 0, err
	}
	var attendances []models.Attendance
	err := base.Preload("Employee.User").Preload("Employee.Department").Preload("Shift").Order("date ASC, created_at ASC").Offset((page - 1) * limit).Limit(limit).Find(&attendances).Error
	return attendances, total, err
}

func (r *AttendanceRepository) MonthlyReport(startDate, endDate, companyID, departmentID, sectionID, designationID, lineID, groupID string) ([]map[string]interface{}, error) {
	query := r.db.Table("attendances").
		Select(`
			attendances.employee_id,
			employees.employee_id as emp_id,
			employees.name_en as employee_name,
			COALESCE(designations.name, '') as designation_name,
			COALESCE(departments.name, '') as department_name,
			COALESCE(SUM(CASE WHEN attendances.status = 'present' THEN 1 ELSE 0 END), 0) as present,
			COALESCE(SUM(CASE WHEN attendances.status = 'absent' THEN 1 ELSE 0 END), 0) as absent,
			COALESCE(SUM(CASE WHEN attendances.status = 'late' THEN 1 ELSE 0 END), 0) as late,
			COALESCE(SUM(CASE WHEN attendances.status = 'on_leave' THEN 1 ELSE 0 END), 0) as leave,
			COALESCE(SUM(CASE WHEN attendances.status = 'weekend' THEN 1 ELSE 0 END), 0) as weekend,
			COALESCE(SUM(CASE WHEN attendances.status = 'half_day' THEN 1 ELSE 0 END), 0) as half_day,
			COUNT(*) as total_days
		`).
		Joins("JOIN employees ON employees.employee_id = attendances.employee_id").
		Joins("LEFT JOIN departments ON departments.id = employees.department_id").
		Joins("LEFT JOIN designations ON designations.id = employees.designation_id").
		Where("attendances.date BETWEEN ? AND ? AND attendances.deleted_at IS NULL", startDate, endDate)
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
	var results []map[string]interface{}
	err := query.Group("attendances.employee_id, employees.employee_id, employees.name_en, designations.name, departments.name").
		Order("employees.name_en ASC").
		Find(&results).Error
	return results, err
}

func (r *AttendanceRepository) ListByStatus(startDate, endDate, status, companyID, departmentID, sectionID, designationID, lineID, groupID, shiftID, employeeID string, page, limit int) ([]models.Attendance, int64, error) {
	base := r.db.Model(&models.Attendance{}).Where("date BETWEEN ? AND ? AND status = ? AND deleted_at IS NULL", startDate, endDate, status)
	if companyID != "" {
		base = base.Where("company_id = ?", companyID)
	}
	if departmentID != "" {
		base = base.Where("employee_id IN (SELECT employee_id FROM employees WHERE department_id = ?)", departmentID)
	}
	if sectionID != "" {
		base = base.Where("employee_id IN (SELECT employee_id FROM employees WHERE section_id = ?)", sectionID)
	}
	if designationID != "" {
		base = base.Where("employee_id IN (SELECT employee_id FROM employees WHERE designation_id = ?)", designationID)
	}
	if lineID != "" {
		base = base.Where("employee_id IN (SELECT employee_id FROM employees WHERE line_id = ?)", lineID)
	}
	if groupID != "" {
		base = base.Where("employee_id IN (SELECT employee_id FROM employees WHERE group_id = ?)", groupID)
	}
	if shiftID != "" {
		base = base.Where("shift_id = ?", shiftID)
	}
	if employeeID != "" {
		base = base.Where("employee_id = ?", employeeID)
	}
	var total int64
	if err := base.Count(&total).Error; err != nil {
		return nil, 0, err
	}
	var attendances []models.Attendance
	err := base.Preload("Employee").Order("date ASC, created_at ASC").Offset((page - 1) * limit).Limit(limit).Find(&attendances).Error
	return attendances, total, err
}

func (r *AttendanceRepository) GetMonthlyOvertimeHours(companyID, startDate, endDate string) (map[string]float64, error) {
	var records []struct {
		EmployeeID string  `gorm:"column:employee_id"`
		OtHours    float64 `gorm:"column:overtime_hours"`
	}
	err := r.db.Table("attendances a").
		Select(`
			a.employee_id,
			COALESCE(SUM(
				CASE
					WHEN e.over_time_status = false THEN 0
					WHEN a.check_out IS NOT NULL AND s.end_time IS NOT NULL THEN
						CASE
							WHEN s.start_time < s.end_time AND a.check_out > s.end_time
								THEN EXTRACT(EPOCH FROM (a.check_out::time - s.end_time::time)) / 3600
							WHEN s.start_time > s.end_time AND a.check_out < s.start_time AND a.check_out > s.end_time
								THEN EXTRACT(EPOCH FROM (a.check_out::time - s.end_time::time)) / 3600
							ELSE 0
						END
					ELSE 0
				END
			), 0) as overtime_hours
		`).
		Joins("JOIN employees e ON e.employee_id = a.employee_id").
		Joins("LEFT JOIN shifts s ON s.id = COALESCE(a.shift_id, e.shift_id)").
		Where("a.company_id = ? AND a.date BETWEEN ? AND ? AND a.deleted_at IS NULL AND a.check_in IS NOT NULL AND a.check_out IS NOT NULL",
			companyID, startDate, endDate).
		Group("a.employee_id").
		Find(&records).Error
	if err != nil {
		return nil, err
	}
	result := make(map[string]float64)
	for _, r := range records {
		result[r.EmployeeID] = r.OtHours
	}
	return result, nil
}
