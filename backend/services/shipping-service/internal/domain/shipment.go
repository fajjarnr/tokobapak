package domain

import (
	"time"

	"github.com/google/uuid"
)

type ShipmentStatus string

const (
	StatusPending    ShipmentStatus = "PENDING"
	StatusProcessing ShipmentStatus = "PROCESSING"
	StatusShipped    ShipmentStatus = "SHIPPED"
	StatusInTransit  ShipmentStatus = "IN_TRANSIT"
	StatusDelivered  ShipmentStatus = "DELIVERED"
	StatusFailed     ShipmentStatus = "FAILED"
)

type Shipment struct {
	ID              uuid.UUID      `json:"id"`
	OrderID         uuid.UUID      `json:"orderId"`
	UserID          uuid.UUID      `json:"userId"`
	Status          ShipmentStatus `json:"status"`
	CourierCode     string         `json:"courierCode"`
	TrackingNumber  string         `json:"trackingNumber"`
	ShippingAddress string         `json:"shippingAddress"`
	EstimatedDate   *time.Time     `json:"estimatedDate,omitempty"`
	ShippedAt       *time.Time     `json:"shippedAt,omitempty"`
	DeliveredAt     *time.Time     `json:"deliveredAt,omitempty"`
	CreatedAt       time.Time      `json:"createdAt"`
	UpdatedAt       time.Time      `json:"updatedAt"`
}

type CreateShipmentRequest struct {
	OrderID         uuid.UUID `json:"orderId"`
	UserID          uuid.UUID `json:"userId"`
	CourierCode     string    `json:"courierCode"`
	ShippingAddress string    `json:"shippingAddress"`
}

type UpdateShipmentStatusRequest struct {
	Status         ShipmentStatus `json:"status"`
	TrackingNumber string         `json:"trackingNumber,omitempty"`
}
