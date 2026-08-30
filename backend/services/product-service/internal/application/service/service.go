package service

import (
	"context"
	"github.com/tokobapak/product-service/internal/domain/model"
	"github.com/tokobapak/product-service/internal/domain/port"
)

type Service struct {
	repo port.ProductRepository
}

func NewService(repo port.ProductRepository) *Service { return &Service{repo: repo} }

func (s *Service) Health(ctx context.Context) string { return "ok:product-service" }

func (s *Service) List(ctx context.Context, limit, offset int) ([]*model.Product, error) {
	return s.repo.List(ctx, limit, offset)
}

func (s *Service) GetByID(ctx context.Context, id string) (*model.Product, error) {
	return s.repo.GetByID(ctx, id)
}

func (s *Service) Create(ctx context.Context, p *model.Product) error {
	if p.Name == "" {
		return model.ErrBadRequest
	}
	if p.Price < 0 {
		return model.ErrBadRequest
	}
	if p.Stock < 0 {
		return model.ErrBadRequest
	}
	return s.repo.Create(ctx, p)
}

func (s *Service) DecrementStock(ctx context.Context, id string, qty int64) error {
	return s.repo.DecrementStock(ctx, id, qty)
}
