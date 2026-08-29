package port

import (
	"context"
	"github.com/tokobapak/product-service/internal/domain/model"
)

type ProductRepository interface {
	Create(ctx context.Context, p *model.Product) error
	GetByID(ctx context.Context, id string) (*model.Product, error)
	List(ctx context.Context, limit, offset int) ([]*model.Product, error)
	DecrementStock(ctx context.Context, id string, qty int64) error
}

type EventPublisher interface {
	Publish(ctx context.Context, topic string, payload []byte) error
}
