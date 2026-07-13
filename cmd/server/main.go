package main

import (
	"log"

	"github.com/shakil5281/hrhub-api/internal/config"
	"github.com/shakil5281/hrhub-api/internal/server"
)

// @title           HRHub API
// @version         1.0
// @description     Enterprise HR Management & Payroll System API.
//
// @contact.name   HRHub Team
// @contact.email  support@hrhub.com
//
// @license.name  MIT
// @license.url   https://opensource.org/licenses/MIT
//
// @host      localhost:3000
// @BasePath  /api/v1
//
// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization
//
// @schemes http https
func main() {
	cfg := config.Load()

	r := server.New(cfg)

	log.Printf("Server starting on :%s", cfg.Port)
	if err := r.Run(":" + cfg.Port); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}
