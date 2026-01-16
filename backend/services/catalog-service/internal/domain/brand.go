package domain

import (
	"context"
	"time"
)

type Brand struct {
	ID        string    `json:"id"`
	Name      string    `json:"name"`
	Slug      string    `json:"slug"`
	LogoURL   *string   `json:"logoUrl,omitempty"`
	IsActive  bool      `json:"isActive"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

type BrandRepository interface {
	Fetch(ctx context.Context, cursor string, num int64) ([]Brand, string, error)
	GetByID(ctx context.Context, id string) (Brand, error)
	GetBySlug(ctx context.Context, slug string) (Brand, error)
	Store(ctx context.Context, b *Brand) error
	Update(ctx context.Context, b *Brand) error
	Delete(ctx context.Context, id string) error
}

type BrandUsecase interface {
	Fetch(ctx context.Context, cursor string, num int64) ([]Brand, string, error)
	GetByID(ctx context.Context, id string) (Brand, error)
	GetBySlug(ctx context.Context, slug string) (Brand, error)
	Store(ctx context.Context, b *Brand) error
	Update(ctx context.Context, b *Brand) error
	Delete(ctx context.Context, id string) error
}
