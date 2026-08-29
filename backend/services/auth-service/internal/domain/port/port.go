package port

import (
	"context"
	"github.com/tokobapak/auth-service/internal/domain/model"
)

type UserRepository interface {
	FindByEmail(ctx context.Context, email string) (*model.User, error)
	FindByID(ctx context.Context, id string) (*model.User, error)
	Create(ctx context.Context, u *model.User) error
}

type TokenIssuer interface {
	Issue(ctx context.Context, userID, role string) (*model.TokenPair, error)
	Validate(ctx context.Context, token string) (string, error)
}
