package port

import (
	"context"
	"github.com/tokobapak/order-service/internal/domain/model"
)

type OrderRepository interface {
	Create(ctx context.Context, o *model.Order, items []model.OrderItem) error
	GetByID(ctx context.Context, id string) (*model.Order, error)
	UpdateStatus(ctx context.Context, id string, status model.OrderStatus) error
}

type ProductStockPort interface {
	Reserve(ctx context.Context, productID string, qty int64) error
	Release(ctx context.Context, productID string, qty int64) error
}

type EventPublisher interface {
	Publish(ctx context.Context, topic string, payload []byte) error
}
