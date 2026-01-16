package domain

import (
	"context"
	"time"
)

type Category struct {
	ID          string     `json:"id"`
	Name        string     `json:"name"`
	Slug        string     `json:"slug"`
	Description string     `json:"description,omitempty"`
	ParentID    *string    `json:"parentId,omitempty"`
	ImageURL    *string    `json:"imageUrl,omitempty"`
	IconURL     *string    `json:"iconUrl,omitempty"`
	DisplayOrder int       `json:"displayOrder"`
	IsActive    bool       `json:"isActive"`
	CreatedAt   time.Time  `json:"createdAt"`
	UpdatedAt   time.Time  `json:"updatedAt"`
}

type CategoryRepository interface {
	Fetch(ctx context.Context, cursor string, num int64) ([]Category, string, error)
	GetByID(ctx context.Context, id string) (Category, error)
	GetBySlug(ctx context.Context, slug string) (Category, error)
	GetByParentID(ctx context.Context, parentID *string) ([]Category, error)
	Store(ctx context.Context, c *Category) error
	Update(ctx context.Context, c *Category) error
	Delete(ctx context.Context, id string) error
}

type CategoryUsecase interface {
	Fetch(ctx context.Context, cursor string, num int64) ([]Category, string, error)
	GetByID(ctx context.Context, id string) (Category, error)
	GetBySlug(ctx context.Context, slug string) (Category, error)
	GetTree(ctx context.Context) ([]Category, error)
	Store(ctx context.Context, c *Category) error
	Update(ctx context.Context, c *Category) error
	Delete(ctx context.Context, id string) error
}
