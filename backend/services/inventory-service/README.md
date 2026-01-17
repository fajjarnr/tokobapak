# Inventory Service

Stock Management Microservice built with Go for TokoBapak.

## Features

- **Stock Management**: Track product quantities across warehouses
- **Stock Reservation**: Reserve stock for pending orders
- **Stock Movements**: Audit trail of all stock changes
- **Low Stock Alerts**: Automatic status calculation
- **Transactional Safety**: All operations are atomic

## Tech Stack

- Go 1.22
- Chi Router
- PostgreSQL (pgx with transactions)

## API Endpoints

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| GET | `/api/v1/inventory/products/{productId}` | Get stock info |
| POST | `/api/v1/inventory/products/{productId}/add` | Add stock |
| POST | `/api/v1/inventory/products/{productId}/remove` | Remove stock |
| POST | `/api/v1/inventory/reserve` | Reserve stock for order |
| POST | `/api/v1/inventory/release` | Release reserved stock |
| GET | `/api/v1/inventory/products/{productId}/availability?quantity=N` | Check availability |

## Stock Status

- `IN_STOCK` - Available quantity > threshold
- `LOW_STOCK` - Available quantity <= threshold
- `OUT_OF_STOCK` - Available quantity = 0

## Running Locally

```bash
export DATABASE_URL="postgres://postgres:postgres@localhost:5432/tokobapak_inventory?sslmode=disable"
export PORT="3011"

go run cmd/server/main.go
```
