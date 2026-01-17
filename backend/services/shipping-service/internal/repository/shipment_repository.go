package repository

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/tokobapak/shipping-service/internal/domain"
)

type ShipmentRepository struct {
	db *pgxpool.Pool
}

func NewShipmentRepository(db *pgxpool.Pool) *ShipmentRepository {
	return &ShipmentRepository{db: db}
}

func (r *ShipmentRepository) Create(ctx context.Context, shipment *domain.Shipment) error {
	query := `
		INSERT INTO shipments (id, order_id, user_id, status, courier_code, tracking_number, shipping_address, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
	`
	shipment.ID = uuid.New()
	shipment.CreatedAt = time.Now()
	shipment.UpdatedAt = time.Now()

	_, err := r.db.Exec(ctx, query,
		shipment.ID,
		shipment.OrderID,
		shipment.UserID,
		shipment.Status,
		shipment.CourierCode,
		shipment.TrackingNumber,
		shipment.ShippingAddress,
		shipment.CreatedAt,
		shipment.UpdatedAt,
	)
	return err
}

func (r *ShipmentRepository) GetByID(ctx context.Context, id uuid.UUID) (*domain.Shipment, error) {
	query := `
		SELECT id, order_id, user_id, status, courier_code, tracking_number, shipping_address, 
		       estimated_date, shipped_at, delivered_at, created_at, updated_at
		FROM shipments WHERE id = $1
	`
	var shipment domain.Shipment
	err := r.db.QueryRow(ctx, query, id).Scan(
		&shipment.ID,
		&shipment.OrderID,
		&shipment.UserID,
		&shipment.Status,
		&shipment.CourierCode,
		&shipment.TrackingNumber,
		&shipment.ShippingAddress,
		&shipment.EstimatedDate,
		&shipment.ShippedAt,
		&shipment.DeliveredAt,
		&shipment.CreatedAt,
		&shipment.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &shipment, nil
}

func (r *ShipmentRepository) GetByOrderID(ctx context.Context, orderID uuid.UUID) (*domain.Shipment, error) {
	query := `
		SELECT id, order_id, user_id, status, courier_code, tracking_number, shipping_address, 
		       estimated_date, shipped_at, delivered_at, created_at, updated_at
		FROM shipments WHERE order_id = $1
	`
	var shipment domain.Shipment
	err := r.db.QueryRow(ctx, query, orderID).Scan(
		&shipment.ID,
		&shipment.OrderID,
		&shipment.UserID,
		&shipment.Status,
		&shipment.CourierCode,
		&shipment.TrackingNumber,
		&shipment.ShippingAddress,
		&shipment.EstimatedDate,
		&shipment.ShippedAt,
		&shipment.DeliveredAt,
		&shipment.CreatedAt,
		&shipment.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &shipment, nil
}

func (r *ShipmentRepository) UpdateStatus(ctx context.Context, id uuid.UUID, status domain.ShipmentStatus, trackingNumber string) error {
	query := `
		UPDATE shipments 
		SET status = $1, tracking_number = COALESCE(NULLIF($2, ''), tracking_number), updated_at = $3,
		    shipped_at = CASE WHEN $1 = 'SHIPPED' THEN $3 ELSE shipped_at END,
		    delivered_at = CASE WHEN $1 = 'DELIVERED' THEN $3 ELSE delivered_at END
		WHERE id = $4
	`
	_, err := r.db.Exec(ctx, query, status, trackingNumber, time.Now(), id)
	return err
}
