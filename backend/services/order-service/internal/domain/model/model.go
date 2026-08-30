package model

import "time"

type OrderStatus string

const (
	StatusPending   OrderStatus = "PENDING"
	StatusReserved  OrderStatus = "RESERVED"
	StatusPaid      OrderStatus = "PAID"
	StatusShipped   OrderStatus = "SHIPPED"
	StatusDelivered OrderStatus = "DELIVERED"
	StatusCancelled OrderStatus = "CANCELLED"
)

type Order struct {
	ID             string      `json:"id"`
	UserID         string      `json:"user_id"`
	Status         OrderStatus `json:"status"`
	Total          int64       `json:"total"`
	IdempotencyKey string      `json:"idempotency_key,omitempty"`
	CreatedAt      time.Time   `json:"created_at"`
	UpdatedAt      time.Time   `json:"updated_at"`
}

type OrderItem struct {
	OrderID   string `json:"order_id"`
	ProductID string `json:"product_id"`
	Qty       int64  `json:"qty"`
	Price     int64  `json:"price"`
}
