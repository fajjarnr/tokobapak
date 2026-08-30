package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/tokobapak/order-service/config"
	httpAdapter "github.com/tokobapak/order-service/internal/adapter/http"
	"github.com/tokobapak/order-service/internal/adapter/kafka"
	pgAdapter "github.com/tokobapak/order-service/internal/adapter/postgres"
	"github.com/tokobapak/order-service/internal/application/service"
)

func main() {
	cfg := config.Load()
	port := os.Getenv("PORT")
	if port == "" {
		port = cfg.Port
	}
	if port == "" {
		port = "3004"
	}
	dsn := "postgres://" + cfg.DBUser + ":" + cfg.DBPassword + "@" + cfg.DBHost + ":" + cfg.DBPort + "/" + cfg.DBName + "?sslmode=disable"
	pool, err := pgxpool.New(context.Background(), dsn)
	if err != nil {
		log.Printf("db pool error: %v (starting without DB, health only)", err)
		handler := httpAdapter.NewRouter(nil)
		log.Printf("order-service listening on :%s (no DB)", port)
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
	svc := service.NewService(repo, nil)
	// start outbox poller
	brokers := strings.Split(cfg.KafkaBrokers, ",")
	poller := kafka.NewOutboxPoller(pool, brokers)
	go func() {
		if err := poller.Start(context.Background()); err != nil {
			log.Printf("outbox poller stopped: %v", err)
		}
	}()
	log.Printf("outbox poller started for %s", cfg.KafkaBrokers)
	handler := httpAdapter.NewRouter(svc)
	log.Printf("order-service listening on :%s", port)
	if err := http.ListenAndServe(":"+port, handler); err != nil {
		log.Fatal(err)
	}
}
