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
	groupRepo := repository.NewGroupRepository(database.DB)
	floorRepo := repository.NewFloorRepository(database.DB)
	deptRepo := repository.NewDepartmentRepository(database.DB)
	sectionRepo := repository.NewSectionRepository(database.DB)
	desigRepo := repository.NewDesignationRepository(database.DB)
	lineRepo := repository.NewLineRepository(database.DB)
	divisionRepo := repository.NewDivisionRepository(database.DB)
	districtRepo := repository.NewDistrictRepository(database.DB)
	upazilaRepo := repository.NewUpazilaRepository(database.DB)
	unionRepo := repository.NewUnionRepository(database.DB)
	attendanceRepo := repository.NewAttendanceRepository(database.DB)
	dataLogRepo := repository.NewDataLogRepository(database.DB)
	employeeRepo := repository.NewEmployeeRepository(database.DB)
	requirementRepo := repository.NewRequirementRepository(database.DB)
	separationRepo := repository.NewSeparationRepository(database.DB)
	idCardRepo := repository.NewIdCardRepository(database.DB)

	authService := service.NewAuthService(userRepo, authRepo, jwtCfg)
	authHandler := handlers.NewAuthHandler(authService)
	employeeHandler := handlers.NewEmployeeHandler()
	companyHandler := handlers.NewCompanyHandler(companyRepo)
	shiftHandler := handlers.NewShiftHandler(shiftRepo)
	groupHandler := handlers.NewGroupHandler(groupRepo)
	floorHandler := handlers.NewFloorHandler(floorRepo)
	deptHandler := handlers.NewDepartmentHandler(deptRepo)
	sectionHandler := handlers.NewSectionHandler(sectionRepo)
	desigHandler := handlers.NewDesignationHandler(desigRepo)
	lineHandler := handlers.NewLineHandler(lineRepo)
	requirementHandler := handlers.NewRequirementHandler(requirementRepo)
	separationHandler := handlers.NewSeparationHandler(separationRepo)
	idCardHandler := handlers.NewIdCardHandler(idCardRepo)
	divisionHandler := handlers.NewDivisionHandler(divisionRepo)
	districtHandler := handlers.NewDistrictHandler(districtRepo)
	upazilaHandler := handlers.NewUpazilaHandler(upazilaRepo)
	unionHandler := handlers.NewUnionHandler(unionRepo)
	attendanceHandler := handlers.NewAttendanceHandler(attendanceRepo, employeeRepo, dataLogRepo)

	mdbReader := service.NewMDBReader()
	leaveRepo := repository.NewLeaveRepository(database.DB)
	tempShiftRepo := repository.NewTemporaryShiftRepository(database.DB)
	dataLogHandler := handlers.NewDataLogHandler(dataLogRepo, attendanceRepo, employeeRepo, shiftRepo, leaveRepo, tempShiftRepo, mdbReader)
	leaveHandler := handlers.NewLeaveHandler(leaveRepo, employeeRepo, attendanceRepo)
	salaryRepo := repository.NewSalaryRepository(database.DB)
	salaryHandler := handlers.NewSalaryHandler(salaryRepo, employeeRepo, attendanceRepo)
	employeeImportHandler := handlers.NewEmployeeImportHandler(employeeRepo)
	tempShiftHandler := handlers.NewTemporaryShiftHandler(tempShiftRepo, employeeRepo)

	r := gin.Default()

	r.Use(middleware.CORSMiddleware())
	r.Use(middleware.Logger())

	// Serve uploaded files
	r.Static("/uploads", "./uploads")

	// Swagger UI
	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	routes.Setup(r, authHandler, employeeHandler, companyHandler, shiftHandler, groupHandler, floorHandler, deptHandler, sectionHandler, desigHandler, lineHandler, attendanceHandler, dataLogHandler, divisionHandler, districtHandler, upazilaHandler, unionHandler, requirementHandler, separationHandler, idCardHandler, leaveHandler, salaryHandler, employeeImportHandler, tempShiftHandler, cfg.JWTSecret)

	return r
}
