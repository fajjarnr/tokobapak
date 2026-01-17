package service

import (
	"context"
	"encoding/json"
	"log"
	"strings"

	"github.com/google/uuid"
	"github.com/segmentio/kafka-go"
	"github.com/tokobapak/shipping-service/internal/domain"
	"github.com/tokobapak/shipping-service/internal/repository"
)

type ShipmentService struct {
	repo        *repository.ShipmentRepository
	kafkaWriter *kafka.Writer
}

func NewShipmentService(repo *repository.ShipmentRepository, kafkaBrokers string) *ShipmentService {
	writer := &kafka.Writer{
		Addr:     kafka.TCP(strings.Split(kafkaBrokers, ",")...),
		Topic:    "shipment.events",
		Balancer: &kafka.LeastBytes{},
	}
	return &ShipmentService{repo: repo, kafkaWriter: writer}
}

type PaymentProcessedEvent struct {
	PaymentID uuid.UUID `json:"paymentId"`
	OrderID   uuid.UUID `json:"orderId"`
	Status    string    `json:"status"`
}

type ShipmentCreatedEvent struct {
	ShipmentID uuid.UUID `json:"shipmentId"`
	OrderID    uuid.UUID `json:"orderId"`
	Status     string    `json:"status"`
	CourierCode string   `json:"courierCode"`
}

func (s *ShipmentService) CreateShipment(ctx context.Context, req *domain.CreateShipmentRequest) (*domain.Shipment, error) {
	shipment := &domain.Shipment{
		OrderID:         req.OrderID,
		UserID:          req.UserID,
		Status:          domain.StatusPending,
		CourierCode:     req.CourierCode,
		ShippingAddress: req.ShippingAddress,
	}

	if err := s.repo.Create(ctx, shipment); err != nil {
		return nil, err
	}

	// Publish event
	event := ShipmentCreatedEvent{
		ShipmentID:  shipment.ID,
		OrderID:     shipment.OrderID,
		Status:      string(shipment.Status),
		CourierCode: shipment.CourierCode,
	}
	eventData, _ := json.Marshal(event)
	
	err := s.kafkaWriter.WriteMessages(ctx, kafka.Message{
		Key:   []byte(shipment.OrderID.String()),
		Value: eventData,
	})
	if err != nil {
		log.Printf("Failed to publish shipment event: %v", err)
	}

	return shipment, nil
}

func (s *ShipmentService) GetShipment(ctx context.Context, id uuid.UUID) (*domain.Shipment, error) {
	return s.repo.GetByID(ctx, id)
}

func (s *ShipmentService) GetShipmentByOrder(ctx context.Context, orderID uuid.UUID) (*domain.Shipment, error) {
	return s.repo.GetByOrderID(ctx, orderID)
}

func (s *ShipmentService) UpdateStatus(ctx context.Context, id uuid.UUID, req *domain.UpdateShipmentStatusRequest) error {
	return s.repo.UpdateStatus(ctx, id, req.Status, req.TrackingNumber)
}

func (s *ShipmentService) Close() error {
	return s.kafkaWriter.Close()
}
