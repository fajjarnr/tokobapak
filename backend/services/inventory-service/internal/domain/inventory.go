package domain

import (
	"time"

	"github.com/google/uuid"
)

type StockStatus string

const (
	StatusInStock    StockStatus = "IN_STOCK"
	StatusLowStock   StockStatus = "LOW_STOCK"
	StatusOutOfStock StockStatus = "OUT_OF_STOCK"
)

type Inventory struct {
	ID            uuid.UUID   `json:"id"`
	ProductID     uuid.UUID   `json:"productId"`
	WarehouseID   uuid.UUID   `json:"warehouseId"`
	Quantity      int         `json:"quantity"`
	ReservedQty   int         `json:"reservedQty"`
	AvailableQty  int         `json:"availableQty"` // quantity - reservedQty
	LowStockThreshold int     `json:"lowStockThreshold"`
	Status        StockStatus `json:"status"`
	CreatedAt     time.Time   `json:"createdAt"`
	UpdatedAt     time.Time   `json:"updatedAt"`
}

type StockMovement struct {
	ID          uuid.UUID `json:"id"`
	InventoryID uuid.UUID `json:"inventoryId"`
	Type        string    `json:"type"` // IN, OUT, RESERVE, RELEASE
	Quantity    int       `json:"quantity"`
	OrderID     *uuid.UUID `json:"orderId,omitempty"`
	Reason      string    `json:"reason"`
	CreatedAt   time.Time `json:"createdAt"`
}

type UpdateStockRequest struct {
	Quantity int    `json:"quantity"`
	Reason   string `json:"reason"`
}

type ReserveStockRequest struct {
	ProductID uuid.UUID `json:"productId"`
	Quantity  int       `json:"quantity"`
	OrderID   uuid.UUID `json:"orderId"`
}
