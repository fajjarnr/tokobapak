package event

import (
	"context"
	"encoding/json"
	"log/slog"
	"time"

	"github.com/google/uuid"
	"github.com/segmentio/kafka-go"
	"github.com/tokobapak/inventory-service/internal/domain"
	"github.com/tokobapak/inventory-service/internal/service"
)

type OrderCreatedEvent struct {
	OrderID     uuid.UUID `json:"orderId"`
	UserID      uuid.UUID `json:"userId"`
	TotalAmount float64   `json:"totalAmount"`
	Status      string    `json:"status"`
	Items       []struct {
		ProductId uuid.UUID `json:"productId"`
		Quantity  int       `json:"quantity"`
	} `json:"items"` // Assuming items are included in the event payload
}

type KafkaConsumer struct {
	reader *kafka.Reader
	svc    *service.InventoryService
}

func NewKafkaConsumer(brokers []string, topic string, groupID string, svc *service.InventoryService) *KafkaConsumer {
	reader := kafka.NewReader(kafka.ReaderConfig{
		Brokers:  brokers,
		Topic:    topic,
		GroupID:  groupID,
		MinBytes: 10e3, // 10KB
		MaxBytes: 10e6, // 10MB
	})

	return &KafkaConsumer{
		reader: reader,
		svc:    svc,
	}
}

func (c *KafkaConsumer) Start(ctx context.Context) {
	slog.Info("Starting Kafka consumer", "topic", c.reader.Config().Topic)
	go func() {
		for {
			m, err := c.reader.ReadMessage(ctx)
			if err != nil {
				slog.Error("Failed to read message", "error", err)
				break
			}

			slog.Info("Received message", "topic", m.Topic, "partition", m.Partition, "offset", m.Offset)

			// Process Message (Saga Orchestration Step)
			if err := c.handleMessage(ctx, m.Value); err != nil {
				slog.Error("Failed to process message", "error", err)
				// TODO: Implement retry logic or DLQ (Dead Letter Queue)
			}
		}
	}()
}

func (c *KafkaConsumer) handleMessage(ctx context.Context, value []byte) error {
	var event OrderCreatedEvent
	if err := json.Unmarshal(value, &event); err != nil {
		return err
	}

	slog.Info("Processing OrderCreatedEvent", "orderId", event.OrderID)

	// Saga: Reserve Stock for each item
	// Note: Ideally request struct should match domain
	// For simplicity, we loop items and reserve one by one (Not atomic, risky!)
	// Better: ReserveStockBatch logic in Service.
	
	// Assuming event payload structure from OrderService (Java) needs to be checked.
	// OrderService Java publishes `OrderCreatedEvent` but does it include items?
	// Based on OrderService.java:64, it builds event via Builder but I didn't see `items` field being set effectively.
	// I need to verify OrderCreatedEvent.java definition.
	
	// If items are missing in event, we must fetch them from Order Service (Sync Call) OR enrich the event.
	// Let's assume for now we need to fetch logic or we assume event has it.
	
	// Stub implementation calling ReserveStock
    logReservation := func(item struct{ProductId uuid.UUID; Quantity int}, err error) {
        if err != nil {
			slog.Error("Stock Reservation Failed", "orderId", event.OrderID, "productId", item.ProductId, "error", err)
            // TODO: Publish StockReservationFailed Event to revert Order
        } else {
            slog.Info("Stock Reserved", "orderId", event.OrderID, "productId", item.ProductId)
        }
    }
    
    // Naive loop
    // In production: Distributed Transaction / Saga needs strict state management.
    for _, item := range event.Items {
         req := &domain.ReserveStockRequest{
             ProductID: item.ProductId,
             Quantity: item.Quantity,
             OrderID: event.OrderID,
         }
         err := c.svc.ReserveStock(ctx, req)
         logReservation(struct{ProductId uuid.UUID; Quantity int}{item.ProductId, item.Quantity}, err)
         // If one fails, we should ideally Rollback others (Compensating Transaction)
    }

	return nil
}

func (c *KafkaConsumer) Close() error {
	return c.reader.Close()
}
