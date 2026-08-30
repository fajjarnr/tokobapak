package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/redis/go-redis/v9"
	httpAdapter "github.com/tokobapak/cart-service/internal/adapter/http"
	"github.com/tokobapak/cart-service/config"
)

func main() {
	cfg := config.Load()
	port := os.Getenv("PORT")
	if port == "" {
		port = cfg.Port
	}
	if port == "" {
		port = "3003"
	}
	redisAddr := cfg.RedisHost + ":" + cfg.RedisPort
	rdb := redis.NewClient(&redis.Options{Addr: redisAddr})
	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()
	if err := rdb.Ping(ctx).Err(); err != nil {
		log.Printf("redis ping failed %s: %v (starting without redis)", redisAddr, err)
		rdb = nil
	} else {
		log.Printf("connected to redis %s", redisAddr)
	}
	var handler http.Handler
	if rdb != nil {
		handler = httpAdapter.NewRouter(rdb)
	} else {
		handler = httpAdapter.NewRouter()
	}
	log.Printf("cart-service listening on :%s redis:%s", port, redisAddr)
	if err := http.ListenAndServe(":"+port, handler); err != nil {
		log.Fatal(err)
	}
}
