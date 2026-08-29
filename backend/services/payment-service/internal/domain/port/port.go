package port

import (
	"context"
	"github.com/tokobapak/payment-service/internal/domain/model"
)

type PaymentRepository interface {
	Create(ctx context.Context, p *model.Payment) error
	GetByOrderID(ctx context.Context, orderID string) (*model.Payment, error)
	GetByIdempotencyKey(ctx context.Context, key string) (*model.Payment, error)
	UpdateStatus(ctx context.Context, id string, status model.PaymentStatus, payuRef *string) error
}

type PayUClient interface {
	CreateTransaction(ctx context.Context, orderID string, amount int64, idempotencyKey string) (string, error)
}

type EventPublisher interface {
	Publish(ctx context.Context, topic string, payload []byte) error
}
