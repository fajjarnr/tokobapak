package service

import (
	"context"

	"github.com/google/uuid"
	"github.com/tokobapak/inventory-service/internal/domain"
	"github.com/tokobapak/inventory-service/internal/repository"
)

type InventoryService struct {
	repo *repository.InventoryRepository
}

func NewInventoryService(repo *repository.InventoryRepository) *InventoryService {
	return &InventoryService{repo: repo}
}

func (s *InventoryService) GetStock(ctx context.Context, productID uuid.UUID) (*domain.Inventory, error) {
	return s.repo.GetByProductID(ctx, productID)
}

func (s *InventoryService) AddStock(ctx context.Context, productID uuid.UUID, qty int, reason string) error {
	return s.repo.UpdateStock(ctx, productID, qty, reason)
}

func (s *InventoryService) RemoveStock(ctx context.Context, productID uuid.UUID, qty int, reason string) error {
	return s.repo.UpdateStock(ctx, productID, -qty, reason)
}

func (s *InventoryService) ReserveStock(ctx context.Context, req *domain.ReserveStockRequest) error {
	return s.repo.ReserveStock(ctx, req.ProductID, req.Quantity, req.OrderID)
}

func (s *InventoryService) ReleaseStock(ctx context.Context, productID uuid.UUID, qty int, orderID uuid.UUID) error {
	return s.repo.ReleaseStock(ctx, productID, qty, orderID)
}

func (s *InventoryService) CheckAvailability(ctx context.Context, productID uuid.UUID, qty int) (bool, error) {
	inv, err := s.repo.GetByProductID(ctx, productID)
	if err != nil {
		return false, err
	}
	return inv.AvailableQty >= qty, nil
}
