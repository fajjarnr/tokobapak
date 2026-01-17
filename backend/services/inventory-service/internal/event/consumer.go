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
	} `json:"items"`
}

type StockReservedEvent struct {
	OrderID uuid.UUID `json:"orderId"`
	Status  string    `json:"status"` // "RESERVED"
}

type StockReservationFailedEvent struct {
	OrderID uuid.UUID `json:"orderId"`
	Reason  string    `json:"reason"`
	Status  string    `json:"status"` // "FAILED"
}

type EventManager struct {
	reader *kafka.Reader
	writer *kafka.Writer
	svc    *service.InventoryService
}

func NewEventManager(brokers []string, topic string, groupID string, svc *service.InventoryService) *EventManager {
	reader := kafka.NewReader(kafka.ReaderConfig{
		Brokers:   brokers,
		Topic:     topic,
		GroupID:   groupID,
		MinBytes:  10e3, // 10KB
		MaxBytes:  10e6, // 10MB
        MaxWait:   1 * time.Second,
	})

	// Writer checks outgoing topic "inventory.events" (or similar)
	writer := &kafka.Writer{
		Addr:     kafka.TCP(brokers...),
		Topic:    "order.events", // Sending replies to a common order events topic for Order Service to consume
		Balancer: &kafka.LeastBytes{},
	}

	return &EventManager{
		reader: reader,
		writer: writer,
		svc:    svc,
	}
}

func (c *EventManager) Start(ctx context.Context) {
	slog.Info("Starting Kafka consumer", "topic", c.reader.Config().Topic)
	go func() {
		for {
			m, err := c.reader.ReadMessage(ctx)
			if err != nil {
				// slog.Error("Failed to read message", "error", err)
                // Continue or break based on error type. EOF means stop.
                if ctx.Err() != nil {
                    break
                }
                time.Sleep(1 * time.Second)
				continue
			}

			slog.Info("Received message", "topic", m.Topic, "partition", m.Partition, "offset", m.Offset)

			// Process Message (Saga Orchestration Step)
			if err := c.handleMessage(ctx, m.Value); err != nil {
				slog.Error("Failed to process message", "error", err)
			}
		}
	}()
}

func (c *EventManager) handleMessage(ctx context.Context, value []byte) error {
	var event OrderCreatedEvent
	if err := json.Unmarshal(value, &event); err != nil {
		return err
	}

	slog.Info("Processing OrderCreatedEvent", "orderId", event.OrderID)

    // Saga Logic:
    // 1. Try to reserve all items.
    // 2. If all success -> Publish StockReservedEvent
    // 3. If any fail -> Rollback successful ones (ReleaseStock) -> Publish StockReservationFailedEvent

    var reservedItems []struct{ProductID uuid.UUID; Quantity int}
    var reservationErr error

    for _, item := range event.Items {
         req := &domain.ReserveStockRequest{
             ProductID: item.ProductId,
             Quantity: item.Quantity,
             OrderID: event.OrderID,
         }
         err := c.svc.ReserveStock(ctx, req)
         if err != nil {
             reservationErr = err
             slog.Error("Stock Reservation Failed", "orderId", event.OrderID, "productId", item.ProductId, "error", err)
             break
         }
         reservedItems = append(reservedItems, struct{ProductID uuid.UUID; Quantity int}{item.ProductId, item.Quantity})
    }

    if reservationErr != nil {
        // Compensating Transaction: Rollback reserved items
        slog.Info("Rolling back reservations", "orderId", event.OrderID)
        for _, item := range reservedItems {
            // Best effort rollback
            _ = c.svc.ReleaseStock(ctx, item.ProductID, item.Quantity, event.OrderID)
        }
        
        // Publish Failure Event
        failEvent := StockReservationFailedEvent{
            OrderID: event.OrderID,
            Reason:  reservationErr.Error(),
            Status:  "STOCK_RESERVATION_FAILED",
        }
        return c.publishEvent(ctx, "StockReservationFailed", failEvent)
    }

    // Success
    successEvent := StockReservedEvent{
        OrderID: event.OrderID,
        Status:  "STOCK_RESERVED",
    }
    return c.publishEvent(ctx, "StockReserved", successEvent)
}

func (c *EventManager) publishEvent(ctx context.Context, key string, payload interface{}) error {
    val, err := json.Marshal(payload)
    if err != nil {
        return err
    }
    
    // We use a header or structure to differentiate event types if strictly strict, 
    // or just assume consumer knows schema based on status field.
    // Here sending basic JSON.
    
    return c.writer.WriteMessages(ctx, kafka.Message{
        Key:   []byte(key), // Use key related to OrderID ideally for partitioning
        Value: val,
    })
}

func (c *EventManager) Close() error {
    _ = c.writer.Close()
	return c.reader.Close()
}
