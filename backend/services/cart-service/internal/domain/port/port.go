package port

import (
	"context"
	"github.com/tokobapak/cart-service/internal/domain/model"
)

type CartRepository interface {
	Get(ctx context.Context, userID string) (*model.Cart, error)
	Set(ctx context.Context, cart *model.Cart) error
	Delete(ctx context.Context, userID string) error
	Merge(ctx context.Context, userID, guestID string) error
}
