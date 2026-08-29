package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	httpAdapter "github.com/tokobapak/product-service/internal/adapter/http"
	pgAdapter "github.com/tokobapak/product-service/internal/adapter/postgres"
	"github.com/tokobapak/product-service/internal/application/service"
	"github.com/tokobapak/product-service/config"
)

func main() {
	cfg := config.Load()
	port := os.Getenv("PORT")
	if port == "" {
		port = cfg.Port
	}
	if port == "" {
		port = "3001"
	}
	dsn := "postgres://" + cfg.DBUser + ":" + cfg.DBPassword + "@" + cfg.DBHost + ":" + cfg.DBPort + "/" + cfg.DBName + "?sslmode=disable"
	pool, err := pgxpool.New(context.Background(), dsn)
	if err != nil {
		log.Printf("db pool error: %v (starting without DB, health only)", err)
		handler := httpAdapter.NewRouter(nil)
		log.Printf("product-service listening on :%s (no DB)", port)
		if err := http.ListenAndServe(":"+port, handler); err != nil {
			log.Fatal(err)
		}
		return
	}
	defer pool.Close()
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := pool.Ping(ctx); err != nil {
		log.Printf("db ping failed: %v", err)
	} else {
		log.Printf("connected to DB %s", cfg.DBName)
	}
	repo := pgAdapter.New(pool)
	svc := service.NewService(repo)
	handler := httpAdapter.NewRouter(svc)
	log.Printf("product-service listening on :%s", port)
	if err := http.ListenAndServe(":"+port, handler); err != nil {
		log.Fatal(err)
	}
}
