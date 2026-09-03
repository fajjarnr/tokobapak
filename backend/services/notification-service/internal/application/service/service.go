package service

import (
	"context"
	"encoding/json"
	"errors"
	"log"
)

var errBadEvent = errors.New("bad event: order_id required")

type Service struct{}

func NewService() *Service { return &Service{} }

func (s *Service) Health(ctx context.Context) string { return "ok:notification-service" }

// Notify handles one consumed event. Sink is structured log until product
// picks an email/WA provider (ponytail: swap log.Printf with provider call).
func (s *Service) Notify(ctx context.Context, topic string, payload []byte) error {
	var evt struct {
		OrderID       string `json:"order_id"`
		PayUReference string `json:"payu_reference"`
		Status        string `json:"status"`
	}
	if err := json.Unmarshal(payload, &evt); err != nil {
		return err
	}
	if evt.OrderID == "" {
		return errBadEvent
	}
	log.Printf("notif topic=%s order=%s ref=%s status=%s", topic, evt.OrderID, evt.PayUReference, evt.Status)
	return nil
}
