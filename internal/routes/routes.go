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
	attendanceHandler *handlers.AttendanceHandler,
	dataLogHandler *handlers.DataLogHandler,
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
	}

	// Protected auth routes
	protectedAuth := api.Group("/auth")
	protectedAuth.Use(middleware.AuthMiddleware(jwtSecret))
	{
		protectedAuth.POST("/logout-all", authHandler.LogoutAll)
		protectedAuth.PUT("/change-password", authHandler.ChangePassword)
		protectedAuth.GET("/me", authHandler.GetProfile)
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

	// Protected attendance routes
	attendance := api.Group("/attendance")
	attendance.Use(middleware.AuthMiddleware(jwtSecret))
	{
		attendance.GET("", attendanceHandler.List)
		attendance.GET("/:id", attendanceHandler.GetByID)
		attendance.GET("/job-card", attendanceHandler.ListJobCard)
		attendance.POST("", attendanceHandler.Create)
		attendance.PUT("/:id", attendanceHandler.Update)
		attendance.DELETE("/:id", attendanceHandler.Delete)
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
	}
}
