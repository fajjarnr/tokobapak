package repository

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/tokobapak/inventory-service/internal/domain"
)

type InventoryRepository struct {
	db *pgxpool.Pool
}

func NewInventoryRepository(db *pgxpool.Pool) *InventoryRepository {
	return &InventoryRepository{db: db}
}

func (r *InventoryRepository) GetByProductID(ctx context.Context, productID uuid.UUID) (*domain.Inventory, error) {
	query := `
		SELECT id, product_id, warehouse_id, quantity, reserved_qty, low_stock_threshold, created_at, updated_at
		FROM inventory WHERE product_id = $1
	`
	var inv domain.Inventory
	err := r.db.QueryRow(ctx, query, productID).Scan(
		&inv.ID,
		&inv.ProductID,
		&inv.WarehouseID,
		&inv.Quantity,
		&inv.ReservedQty,
		&inv.LowStockThreshold,
		&inv.CreatedAt,
		&inv.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	inv.AvailableQty = inv.Quantity - inv.ReservedQty
	inv.Status = calculateStatus(inv.AvailableQty, inv.LowStockThreshold)
	return &inv, nil
}

func (r *InventoryRepository) UpdateStock(ctx context.Context, productID uuid.UUID, delta int, reason string) error {
	return pgx.BeginFunc(ctx, r.db, func(tx pgx.Tx) error {
		// Update inventory
		_, err := tx.Exec(ctx, `
			UPDATE inventory 
			SET quantity = quantity + $1, updated_at = $2
			WHERE product_id = $3
		`, delta, time.Now(), productID)
		if err != nil {
			return err
		}

		// Record movement
		movementType := "IN"
		if delta < 0 {
			movementType = "OUT"
		}
		_, err = tx.Exec(ctx, `
			INSERT INTO stock_movements (id, inventory_id, type, quantity, reason, created_at)
			SELECT $1, id, $2, $3, $4, $5 FROM inventory WHERE product_id = $6
		`, uuid.New(), movementType, abs(delta), reason, time.Now(), productID)
		return err
	})
}

func (r *InventoryRepository) ReserveStock(ctx context.Context, productID uuid.UUID, qty int, orderID uuid.UUID) error {
	return pgx.BeginFunc(ctx, r.db, func(tx pgx.Tx) error {
		// Check available stock
		var availableQty int
		err := tx.QueryRow(ctx, `
			SELECT quantity - reserved_qty FROM inventory WHERE product_id = $1 FOR UPDATE
		`, productID).Scan(&availableQty)
		if err != nil {
			return err
		}
		if availableQty < qty {
			return pgx.ErrNoRows // Insufficient stock
		}

		// Reserve stock
		_, err = tx.Exec(ctx, `
			UPDATE inventory SET reserved_qty = reserved_qty + $1, updated_at = $2 WHERE product_id = $3
		`, qty, time.Now(), productID)
		if err != nil {
			return err
		}

		// Record movement
		_, err = tx.Exec(ctx, `
			INSERT INTO stock_movements (id, inventory_id, type, quantity, order_id, reason, created_at)
			SELECT $1, id, 'RESERVE', $2, $3, 'Order reservation', $4 FROM inventory WHERE product_id = $5
		`, uuid.New(), qty, orderID, time.Now(), productID)
		return err
	})
}

func (r *InventoryRepository) ReleaseStock(ctx context.Context, productID uuid.UUID, qty int, orderID uuid.UUID) error {
	return pgx.BeginFunc(ctx, r.db, func(tx pgx.Tx) error {
		_, err := tx.Exec(ctx, `
			UPDATE inventory SET reserved_qty = reserved_qty - $1, updated_at = $2 WHERE product_id = $3
		`, qty, time.Now(), productID)
		if err != nil {
			return err
		}

		_, err = tx.Exec(ctx, `
			INSERT INTO stock_movements (id, inventory_id, type, quantity, order_id, reason, created_at)
			SELECT $1, id, 'RELEASE', $2, $3, 'Order cancelled', $4 FROM inventory WHERE product_id = $5
		`, uuid.New(), qty, orderID, time.Now(), productID)
		return err
	})
}

func calculateStatus(available, threshold int) domain.StockStatus {
	if available <= 0 {
		return domain.StatusOutOfStock
	}
	if available <= threshold {
		return domain.StatusLowStock
	}
	return domain.StatusInStock
}

func abs(n int) int {
	if n < 0 {
		return -n
	}
	return n
}
