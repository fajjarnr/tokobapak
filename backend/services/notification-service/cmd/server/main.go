package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/tokobapak/notification-service/config"
	httpAdapter "github.com/tokobapak/notification-service/internal/adapter/http"
	"github.com/tokobapak/notification-service/internal/adapter/kafka"
	"github.com/tokobapak/notification-service/internal/application/service"
)

func main() {
	cfg := config.Load()
	port := os.Getenv("PORT")
	if port == "" {
		port = cfg.Port
	}
	if port == "" {
		port = "3009"
	}
	svc := service.NewService()
	brokers := strings.Split(cfg.KafkaBrokers, ",")
	for _, topic := range []string{"tokobapak.payment.completed.v1", "tokobapak.shipment.created.v1"} {
		c := kafka.NewConsumer(brokers, topic, "tokobapak-notification")
		go func() {
			if err := c.Consume(context.Background(), func(t string, p []byte) error {
				return svc.Notify(context.Background(), t, p)
			}); err != nil {
				log.Printf("consumer %s stopped: %v", topic, err)
			}
		}()
	}
	log.Printf("notification-service listening on :%s brokers=%s", port, cfg.KafkaBrokers)
	if err := http.ListenAndServe(":"+port, httpAdapter.NewRouter()); err != nil {
		log.Fatal(err)
	}
}
