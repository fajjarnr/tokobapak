package model

import "time"

type ShipmentStatus string

const (
	ShipmentPending   ShipmentStatus = "PENDING"
	ShipmentShipped   ShipmentStatus = "SHIPPED"
	ShipmentDelivered ShipmentStatus = "DELIVERED"
)

type Shipment struct {
	ID        string         `json:"id"`
	OrderID   string         `json:"order_id"`
	Address   string         `json:"address"`
	Cost      int64          `json:"cost"`
	Status    ShipmentStatus `json:"status"`
	CreatedAt time.Time      `json:"created_at"`
}
