package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/tokobapak/payment-service/config"
	httpAdapter "github.com/tokobapak/payment-service/internal/adapter/http"
	"github.com/tokobapak/payment-service/internal/adapter/client/payu"
	pgAdapter "github.com/tokobapak/payment-service/internal/adapter/postgres"
	"github.com/tokobapak/payment-service/internal/application/service"
)

func main() {
	cfg := config.Load()
	port := os.Getenv("PORT")
	if port == "" {
		port = cfg.Port
	}
	if port == "" {
		port = "3005"
	}
	payuURL := os.Getenv("PAYU_BASE_URL")
	if payuURL == "" {
		payuURL = os.Getenv("PAYU_GATEWAY_URL")
	}
	if payuURL == "" {
		payuURL = "http://payu-gateway:8080"
	}
	payuSecret := os.Getenv("PAYU_SECRET")
	if payuSecret == "" {
		payuSecret = os.Getenv("PAYU_HMAC_SECRET")
	}
	if payuSecret == "" {
		payuSecret = "dev-secret"
	}
	payuClient := payu.New(payuURL, payuSecret)
	dsn := "postgres://" + cfg.DBUser + ":" + cfg.DBPassword + "@" + cfg.DBHost + ":" + cfg.DBPort + "/" + cfg.DBName + "?sslmode=disable"
	pool, err := pgxpool.New(context.Background(), dsn)
	if err != nil {
		log.Printf("db pool error: %v (no DB)", err)
		handler := httpAdapter.NewRouter(nil, payuClient)
		log.Printf("payment-service listening on :%s payu:%s (no DB)", port, payuURL)
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
		log.Printf("connected to DB %s payu %s", cfg.DBName, payuURL)
	}
	repo := pgAdapter.New(pool)
	svc := service.NewService(repo, payuClient)
	handler := httpAdapter.NewRouter(svc, payuClient)
	log.Printf("payment-service listening on :%s payu:%s", port, payuURL)
	if err := http.ListenAndServe(":"+port, handler); err != nil {
		log.Fatal(err)
	}
}
