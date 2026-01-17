# Shipping Service

Shipping & Courier Management Microservice built with Go and Kafka.

## Features

- **Shipment Management**: Create and track shipments
- **Status Tracking**: Update shipment status (PENDING → SHIPPED → DELIVERED)
- **Event Driven**: Publishes events to `shipment.events` topic
- **Courier Integration**: Support for multiple courier codes

## Tech Stack

- Go 1.22
- Chi Router
- PostgreSQL (pgx)
- Kafka (segmentio/kafka-go)

## API Endpoints

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| POST | `/api/v1/shipments` | Create shipment |
| GET | `/api/v1/shipments/{id}` | Get shipment by ID |
| GET | `/api/v1/shipments/order/{orderId}` | Get shipment by order |
| PATCH | `/api/v1/shipments/{id}/status` | Update status |

## Shipment Status Flow

```text
PENDING → PROCESSING → SHIPPED → IN_TRANSIT → DELIVERED
                                           ↓
                                        FAILED
```

## Running Locally

```bash
# Set environment variables
export DATABASE_URL="postgres://postgres:postgres@localhost:5432/tokobapak_shipping?sslmode=disable"
export KAFKA_BROKERS="localhost:9092"
export PORT="3008"

# Run
go run cmd/server/main.go
```

## Docker

```bash
docker build -t shipping-service .
docker run -p 3008:3008 shipping-service
```
