package port

import (
	"context"
	"github.com/tokobapak/shipping-service/internal/domain/model"
)

type ShipmentRepository interface {
	Create(ctx context.Context, s *model.Shipment) error
	GetByOrderID(ctx context.Context, orderID string) (*model.Shipment, error)
}

type EventPublisher interface {
	Publish(ctx context.Context, topic string, payload []byte) error
}
