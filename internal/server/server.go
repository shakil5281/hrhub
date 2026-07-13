package server

import (
	"time"

	"github.com/gin-gonic/gin"
	_ "github.com/shakil5281/hrhub-api/docs"
	"github.com/shakil5281/hrhub-api/internal/auth"
	"github.com/shakil5281/hrhub-api/internal/config"
	"github.com/shakil5281/hrhub-api/internal/database"
	"github.com/shakil5281/hrhub-api/internal/handlers"
	"github.com/shakil5281/hrhub-api/internal/middleware"
	"github.com/shakil5281/hrhub-api/internal/repository"
	"github.com/shakil5281/hrhub-api/internal/routes"
	"github.com/shakil5281/hrhub-api/internal/service"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

func New(cfg *config.Config) *gin.Engine {
	database.Connect(cfg)

	jwtCfg := auth.JWTConfig{
		Secret:          cfg.JWTSecret,
		AccessTokenTTL:  15 * time.Minute,
		RefreshTokenTTL: 7 * 24 * time.Hour,
		Issuer:          "hrhub-api",
	}

	userRepo := repository.NewUserRepository(database.DB)
	authRepo := repository.NewAuthRepository(database.DB)
	companyRepo := repository.NewCompanyRepository(database.DB)
	shiftRepo := repository.NewShiftRepository(database.DB)
	attendanceRepo := repository.NewAttendanceRepository(database.DB)
	dataLogRepo := repository.NewDataLogRepository(database.DB)
	employeeRepo := repository.NewEmployeeRepository(database.DB)

	authService := service.NewAuthService(userRepo, authRepo, jwtCfg)
	authHandler := handlers.NewAuthHandler(authService)
	employeeHandler := handlers.NewEmployeeHandler()
	companyHandler := handlers.NewCompanyHandler(companyRepo)
	shiftHandler := handlers.NewShiftHandler(shiftRepo)
	attendanceHandler := handlers.NewAttendanceHandler(attendanceRepo)

	mdbReader := service.NewMDBReader()
	dataLogHandler := handlers.NewDataLogHandler(dataLogRepo, attendanceRepo, employeeRepo, shiftRepo, mdbReader)

	r := gin.Default()

	r.Use(middleware.CORSMiddleware())
	r.Use(middleware.Logger())

	// Swagger UI
	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	routes.Setup(r, authHandler, employeeHandler, companyHandler, shiftHandler, attendanceHandler, dataLogHandler, cfg.JWTSecret)

	return r
}
