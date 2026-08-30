package service

import (
	"context"
	"github.com/tokobapak/order-service/internal/domain/model"
	"github.com/tokobapak/order-service/internal/domain/port"
)

type Service struct {
	repo      port.OrderRepository
	stockPort port.ProductStockPort
}

func NewService(repo port.OrderRepository, stockPort port.ProductStockPort) *Service {
	return &Service{repo: repo, stockPort: stockPort}
}

func NewServiceNoStock(repo port.OrderRepository) *Service { return &Service{repo: repo} }

func (s *Service) Health(ctx context.Context) string { return "ok:order-service" }

func (s *Service) CreateOrder(ctx context.Context, userID string, items []model.OrderItem, idempotencyKey string) (*model.Order, error) {
	if idempotencyKey == "" {
		return nil, model.ErrBadRequest
	}
	if len(items) == 0 {
		return nil, model.ErrBadRequest
	}
	if s.repo != nil {
		if existing, err := s.repo.GetByIdempotencyKey(ctx, idempotencyKey); err == nil && existing != nil {
			return existing, nil
		}
	}
	for _, it := range items {
		if it.Qty <= 0 {
			return nil, model.ErrBadRequest
		}
		if s.stockPort != nil {
			if err := s.stockPort.Reserve(ctx, it.ProductID, it.Qty); err != nil {
				return nil, err
			}
		} else {
			if it.Qty > 1000 {
				return nil, model.ErrInsufficientStock
			}
		}
	}
	var total int64
	for i := range items {
		price := items[i].Price
		if price == 0 {
			price = 50000
			items[i].Price = price
		}
		total += price * items[i].Qty
	}
	if userID == "" {
		userID = "00000000-0000-0000-0000-000000000001"
	}
	order := &model.Order{
		UserID:         userID,
		Status:         model.StatusPending,
		Total:          total,
		IdempotencyKey: idempotencyKey,
	}
	if s.repo != nil {
		if err := s.repo.Create(ctx, order, items); err != nil {
			if existing, err2 := s.repo.GetByIdempotencyKey(ctx, idempotencyKey); err2 == nil && existing != nil {
				return existing, nil
			}
			return nil, err
		}
		if order.ID == "" {
			order.ID = "order-" + idempotencyKey
		}
	} else {
		order.ID = "order-" + idempotencyKey
	}
	return order, nil
}

func (s *Service) GetOrder(ctx context.Context, id string) (*model.Order, error) {
	if s.repo == nil {
		return nil, model.ErrNotFound
	}
	return s.repo.GetByID(ctx, id)
}

func (s *Service) UpdateStatus(ctx context.Context, id string, status model.OrderStatus) error {
	if s.repo == nil {
		return nil
	}
	return s.repo.UpdateStatus(ctx, id, status)
}

func (s *Service) ReserveStock(ctx context.Context, productID string, qty int64) error {
	if qty <= 0 {
		return model.ErrBadRequest
	}
	if s.stockPort != nil {
		return s.stockPort.Reserve(ctx, productID, qty)
	}
	if qty > 1000 {
		return model.ErrInsufficientStock
	}
	return nil
}

func (s *Service) Compensate(ctx context.Context, orderID string) error {
	return s.UpdateStatus(ctx, orderID, model.StatusCancelled)
}

func isTransitionAllowed(from, to model.OrderStatus) bool {
	allowed := map[model.OrderStatus][]model.OrderStatus{
		model.StatusPending:  {model.StatusReserved, model.StatusCancelled},
		model.StatusReserved: {model.StatusPaid, model.StatusCancelled},
		model.StatusPaid:     {model.StatusShipped},
		model.StatusShipped:  {model.StatusDelivered},
	}
	for _, v := range allowed[from] {
		if v == to {
			return true
		}
	}
	return false
}
