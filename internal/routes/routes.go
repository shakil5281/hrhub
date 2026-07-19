package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/shakil5281/hrhub-api/internal/handlers"
	"github.com/shakil5281/hrhub-api/internal/middleware"
)

func Setup(
	r *gin.Engine,
	authHandler *handlers.AuthHandler,
	employeeHandler *handlers.EmployeeHandler,
	companyHandler *handlers.CompanyHandler,
	shiftHandler *handlers.ShiftHandler,
	groupHandler *handlers.GroupHandler,
	floorHandler *handlers.FloorHandler,
	deptHandler *handlers.DepartmentHandler,
	sectionHandler *handlers.SectionHandler,
	desigHandler *handlers.DesignationHandler,
	lineHandler *handlers.LineHandler,
	orgImportHandler *handlers.OrganizationImportHandler,
	dashboardHandler *handlers.DashboardHandler,
	databaseHandler *handlers.DatabaseHandler,
	attendanceHandler *handlers.AttendanceHandler,
	dataLogHandler *handlers.DataLogHandler,
	divisionHandler *handlers.DivisionHandler,
	districtHandler *handlers.DistrictHandler,
	upazilaHandler *handlers.UpazilaHandler,
	unionHandler *handlers.UnionHandler,
	requirementHandler *handlers.RequirementHandler,
	separationHandler *handlers.SeparationHandler,
	idCardHandler *handlers.IdCardHandler,
	leaveHandler *handlers.LeaveHandler,
	salaryHandler *handlers.SalaryHandler,
	employeeImportHandler *handlers.EmployeeImportHandler,
	tempShiftHandler *handlers.TemporaryShiftHandler,
	userHandler *handlers.UserHandler,
	roleHandler *handlers.RoleHandler,
	settingsHandler *handlers.SettingsHandler,
	jwtSecret string,
) {
	r.GET("/health", handlers.HealthCheck)

	api := r.Group("/api/v1")

	// Public auth routes
	auth := api.Group("/auth")
	{
		auth.POST("/register", authHandler.Register)
		auth.POST("/login", authHandler.Login)
		auth.POST("/refresh", authHandler.RefreshToken)
		auth.POST("/logout", authHandler.Logout)
		auth.POST("/forgot-password", userHandler.ForgotPassword)
		auth.POST("/reset-password", userHandler.ResetPassword)
	}

	// Protected auth routes
	protectedAuth := api.Group("/auth")
	protectedAuth.Use(middleware.AuthMiddleware(jwtSecret))
	{
		protectedAuth.POST("/logout-all", authHandler.LogoutAll)
		protectedAuth.PUT("/change-password", authHandler.ChangePassword)
		protectedAuth.GET("/me", authHandler.GetProfile)
		protectedAuth.PUT("/profile", authHandler.UpdateProfile)
		protectedAuth.GET("/sessions", authHandler.GetSessions)
	}

	// Protected company routes
	company := api.Group("/companies")
	company.Use(middleware.AuthMiddleware(jwtSecret))
	{
		company.GET("", companyHandler.List)
		company.GET("/:id", companyHandler.GetByID)
		company.POST("", companyHandler.Create)
		company.PUT("/:id", companyHandler.Update)
		company.DELETE("/:id", companyHandler.Delete)
	}

	// Protected employee routes
	employee := api.Group("/employees")
	employee.Use(middleware.AuthMiddleware(jwtSecret))
	{
		employee.GET("", employeeHandler.GetEmployees)
		employee.GET("/:id", employeeHandler.GetEmployee)
		employee.POST("", employeeHandler.CreateEmployee)
		employee.PUT("/:id", employeeHandler.UpdateEmployee)
		employee.DELETE("/:id", employeeHandler.DeleteEmployee)
		employee.GET("/by-code/:code", employeeHandler.GetEmployeeByCode)
		employee.GET("/import/template", employeeImportHandler.DownloadTemplate)
		employee.POST("/import", employeeImportHandler.ImportExcel)
		employee.GET("/export/excel", employeeHandler.ExportExcel)
		employee.GET("/export/pdf", employeeHandler.ExportPDF)
	}

	// Protected group routes
	group := api.Group("/groups")
	group.Use(middleware.AuthMiddleware(jwtSecret))
	{
		group.GET("", groupHandler.List)
		group.GET("/:id", groupHandler.GetByID)
		group.POST("", groupHandler.Create)
		group.PUT("/:id", groupHandler.Update)
		group.DELETE("/:id", groupHandler.Delete)
	}

	// Protected floor routes
	floor := api.Group("/floors")
	floor.Use(middleware.AuthMiddleware(jwtSecret))
	{
		floor.GET("", floorHandler.List)
		floor.GET("/:id", floorHandler.GetByID)
		floor.POST("", floorHandler.Create)
		floor.PUT("/:id", floorHandler.Update)
		floor.DELETE("/:id", floorHandler.Delete)
	}

	// Protected organization routes
	dept := api.Group("/departments")
	dept.Use(middleware.AuthMiddleware(jwtSecret))
	{
		dept.GET("", deptHandler.List)
		dept.GET("/:id", deptHandler.GetByID)
		dept.POST("", deptHandler.Create)
		dept.PUT("/:id", deptHandler.Update)
		dept.DELETE("/:id", deptHandler.Delete)
	}

	section := api.Group("/sections")
	section.Use(middleware.AuthMiddleware(jwtSecret))
	{
		section.GET("", sectionHandler.List)
		section.GET("/:id", sectionHandler.GetByID)
		section.POST("", sectionHandler.Create)
		section.PUT("/:id", sectionHandler.Update)
		section.DELETE("/:id", sectionHandler.Delete)
	}

	desig := api.Group("/designations")
	desig.Use(middleware.AuthMiddleware(jwtSecret))
	{
		desig.GET("", desigHandler.List)
		desig.GET("/:id", desigHandler.GetByID)
		desig.POST("", desigHandler.Create)
		desig.PUT("/:id", desigHandler.Update)
		desig.DELETE("/:id", desigHandler.Delete)
	}

	line := api.Group("/lines")
	line.Use(middleware.AuthMiddleware(jwtSecret))
	{
		line.GET("", lineHandler.List)
		line.GET("/:id", lineHandler.GetByID)
		line.POST("", lineHandler.Create)
		line.PUT("/:id", lineHandler.Update)
		line.DELETE("/:id", lineHandler.Delete)
	}

	// Protected organization import routes
	orgImport := api.Group("/organization")
	orgImport.Use(middleware.AuthMiddleware(jwtSecret))
	{
		orgImport.GET("/template", orgImportHandler.DownloadTemplate)
		orgImport.POST("/import", orgImportHandler.ImportExcel)
	}

	// Protected dashboard routes
	dashboard := api.Group("/dashboard")
	dashboard.Use(middleware.AuthMiddleware(jwtSecret))
	{
		dashboard.GET("/stats", dashboardHandler.GetStats)
	}

	// Protected database routes
	database := api.Group("/database")
	database.Use(middleware.AuthMiddleware(jwtSecret))
	{
		database.GET("/backups", databaseHandler.ListBackups)
		database.GET("/export", databaseHandler.Export)

		// Admin-only destructive database operations
		databaseAdmin := database.Group("")
		databaseAdmin.Use(middleware.RequireRole("super_admin"))
		{
			databaseAdmin.POST("/backup", databaseHandler.Backup)
			databaseAdmin.POST("/import", databaseHandler.Import)
			databaseAdmin.POST("/reset", databaseHandler.Reset)
		}
	}

	// Protected address routes
	division := api.Group("/divisions")
	division.Use(middleware.AuthMiddleware(jwtSecret))
	{
		division.GET("", divisionHandler.List)
		division.GET("/:id", divisionHandler.GetByID)
		division.POST("", divisionHandler.Create)
		division.PUT("/:id", divisionHandler.Update)
		division.DELETE("/:id", divisionHandler.Delete)
	}

	district := api.Group("/districts")
	district.Use(middleware.AuthMiddleware(jwtSecret))
	{
		district.GET("", districtHandler.List)
		district.GET("/:id", districtHandler.GetByID)
		district.POST("", districtHandler.Create)
		district.PUT("/:id", districtHandler.Update)
		district.DELETE("/:id", districtHandler.Delete)
	}

	upazila := api.Group("/upazilas")
	upazila.Use(middleware.AuthMiddleware(jwtSecret))
	{
		upazila.GET("", upazilaHandler.List)
		upazila.GET("/:id", upazilaHandler.GetByID)
		upazila.POST("", upazilaHandler.Create)
		upazila.PUT("/:id", upazilaHandler.Update)
		upazila.DELETE("/:id", upazilaHandler.Delete)
	}

	union := api.Group("/unions")
	union.Use(middleware.AuthMiddleware(jwtSecret))
	{
		union.GET("", unionHandler.List)
		union.GET("/:id", unionHandler.GetByID)
		union.POST("", unionHandler.Create)
		union.PUT("/:id", unionHandler.Update)
		union.DELETE("/:id", unionHandler.Delete)
	}

	// Protected shift routes
	shift := api.Group("/shifts")
	shift.Use(middleware.AuthMiddleware(jwtSecret))
	{
		shift.GET("", shiftHandler.List)
		shift.GET("/:id", shiftHandler.GetByID)
		shift.POST("", shiftHandler.Create)
		shift.PUT("/:id", shiftHandler.Update)
		shift.DELETE("/:id", shiftHandler.Delete)
	}

	// Protected temporary-shift routes
	tempShift := api.Group("/temporary-shifts")
	tempShift.Use(middleware.AuthMiddleware(jwtSecret))
	{
		tempShift.GET("", tempShiftHandler.List)
		tempShift.GET("/:id", tempShiftHandler.GetByID)
		tempShift.POST("", tempShiftHandler.Create)
		tempShift.PUT("/:id", tempShiftHandler.Update)
		tempShift.DELETE("/:id", tempShiftHandler.Delete)
	}

	// Protected attendance routes
	attendance := api.Group("/attendance")
	attendance.Use(middleware.AuthMiddleware(jwtSecret))
	{
		attendance.GET("", attendanceHandler.List)
		attendance.GET("/monthly-report", attendanceHandler.MonthlyReport)
		attendance.GET("/:id", attendanceHandler.GetByID)
		attendance.GET("/summary", attendanceHandler.Summary)
		attendance.GET("/overtime", attendanceHandler.Overtime)
		attendance.GET("/overtime-summary", attendanceHandler.OvertimeSummary)
		attendance.GET("/job-card", attendanceHandler.ListJobCard)
		attendance.GET("/stats", attendanceHandler.Stats)
		attendance.GET("/missing", attendanceHandler.MissingAttendance)
		attendance.GET("/absent", attendanceHandler.AbsentAttendance)
		attendance.POST("", attendanceHandler.Create)
		attendance.PUT("/:id", attendanceHandler.Update)
		attendance.DELETE("/:id", attendanceHandler.Delete)

		// Admin-only destructive attendance operations
		attendanceAdmin := attendance.Group("")
		attendanceAdmin.Use(middleware.RequireRole("super_admin"))
		{
			attendanceAdmin.DELETE("/delete-all", attendanceHandler.DeleteAll)
		}

		attendance.POST("/clock-in", attendanceHandler.ClockIn)
		attendance.POST("/clock-out", attendanceHandler.ClockOut)
	}

	// Protected data log routes
	dataLog := api.Group("/data-logs")
	dataLog.Use(middleware.AuthMiddleware(jwtSecret))
	{
		dataLog.GET("", dataLogHandler.List)
		dataLog.GET("/stats", dataLogHandler.Stats)
		dataLog.POST("/import", dataLogHandler.Import)
		dataLog.POST("/process", dataLogHandler.Process)

		// Admin-only destructive data-log operations
		dataLogAdmin := dataLog.Group("")
		dataLogAdmin.Use(middleware.RequireRole("super_admin"))
		{
			dataLogAdmin.DELETE("/delete-all", dataLogHandler.DeleteAll)
		}
	}

	// Protected requirement routes
	requirement := api.Group("/requirements")
	requirement.Use(middleware.AuthMiddleware(jwtSecret))
	{
		requirement.GET("", requirementHandler.List)
		requirement.GET("/:id", requirementHandler.GetByID)
		requirement.POST("", requirementHandler.Create)
		requirement.PUT("/:id", requirementHandler.Update)
		requirement.DELETE("/:id", requirementHandler.Delete)
	}

	// Protected separation routes
	separation := api.Group("/separations")
	separation.Use(middleware.AuthMiddleware(jwtSecret))
	{
		separation.GET("", separationHandler.List)
		separation.GET("/:id", separationHandler.GetByID)
		separation.POST("", separationHandler.Create)
		separation.PUT("/:id", separationHandler.Update)
		separation.DELETE("/:id", separationHandler.Delete)
	}

	// Protected id-card routes
	idCard := api.Group("/id-cards")
	idCard.Use(middleware.AuthMiddleware(jwtSecret))
	{
		idCard.GET("", idCardHandler.List)
		idCard.GET("/:id", idCardHandler.GetByID)
		idCard.POST("", idCardHandler.Create)
		idCard.PUT("/:id", idCardHandler.Update)
		idCard.DELETE("/:id", idCardHandler.Delete)
	}

	// Protected leave-type routes
	leaveType := api.Group("/leave-types")
	leaveType.Use(middleware.AuthMiddleware(jwtSecret))
	{
		leaveType.GET("", leaveHandler.ListLeaveTypes)
		leaveType.GET("/:id", leaveHandler.GetLeaveType)
		leaveType.POST("", leaveHandler.CreateLeaveType)
		leaveType.PUT("/:id", leaveHandler.UpdateLeaveType)
		leaveType.DELETE("/:id", leaveHandler.DeleteLeaveType)
	}

	// Protected leave routes
	leaves := api.Group("/leaves")
	leaves.Use(middleware.AuthMiddleware(jwtSecret))
	{
		leaves.GET("", leaveHandler.ListLeaves)
		leaves.GET("/:id", leaveHandler.GetLeave)
		leaves.POST("", leaveHandler.ApplyLeave)
		leaves.PUT("/:id", leaveHandler.UpdateLeave)
		leaves.DELETE("/:id", leaveHandler.DeleteLeave)
		leaves.PUT("/:id/approve", leaveHandler.ApproveLeave)
		leaves.PUT("/:id/reject", leaveHandler.RejectLeave)
	}

	// Protected leave-balance routes
	leaveBalance := api.Group("/leave-balance")
	leaveBalance.Use(middleware.AuthMiddleware(jwtSecret))
	{
		leaveBalance.GET("", leaveHandler.ListLeaveBalance)
	}

	// Protected leave-report routes
	leaveReport := api.Group("/leave-reports")
	leaveReport.Use(middleware.AuthMiddleware(jwtSecret))
	{
		leaveReport.GET("/monthly", leaveHandler.MonthlyLeaveReport)
	}

	// Protected salary routes
	salary := api.Group("/salary")
	salary.Use(middleware.AuthMiddleware(jwtSecret))
	{
		salary.POST("/process", salaryHandler.Process)
		salary.GET("/sheet", salaryHandler.Sheet)
		salary.GET("/payslip", salaryHandler.Payslip)
		salary.GET("/list", salaryHandler.List)
		salary.GET("/summary", salaryHandler.Summary)
	}

	// Protected upload routes
	upload := api.Group("/upload")
	upload.Use(middleware.AuthMiddleware(jwtSecret))
	{
		upload.POST("", handlers.UploadFile)
	}

	// Protected user management routes
	users := api.Group("/users")
	users.Use(middleware.AuthMiddleware(jwtSecret))
	{
		users.GET("", userHandler.ListUsers)
		users.GET("/:id", userHandler.GetUser)
		users.POST("", userHandler.CreateUser)
		users.PUT("/:id", userHandler.UpdateUser)
		users.DELETE("/:id", userHandler.DeleteUser)
		users.GET("/:id/roles", userHandler.GetUserRoles)
		users.PUT("/:id/roles", userHandler.AssignRoles)
		users.POST("/:id/reset-password", userHandler.AdminResetPassword)
	}

	// Protected role routes
	roleRoutes := api.Group("/roles")
	roleRoutes.Use(middleware.AuthMiddleware(jwtSecret))
	{
		roleRoutes.GET("", roleHandler.List)
		roleRoutes.GET("/:id", roleHandler.GetByID)
		roleRoutes.POST("", roleHandler.Create)
		roleRoutes.PUT("/:id", roleHandler.Update)
		roleRoutes.DELETE("/:id", roleHandler.Delete)
		roleRoutes.PUT("/:id/permissions", roleHandler.AssignPermissions)
	}

	// Protected permission routes
	permRoutes := api.Group("/permissions")
	permRoutes.Use(middleware.AuthMiddleware(jwtSecret))
	{
		permRoutes.GET("", roleHandler.ListPermissions)
	}

	// Protected settings routes
	settingsRoutes := api.Group("/settings")
	settingsRoutes.Use(middleware.AuthMiddleware(jwtSecret))
	{
		settingsRoutes.GET("", settingsHandler.List)
		settingsRoutes.PUT("", settingsHandler.Update)
	}
}
