# TokoBapak Backend Services

This directory contains all backend microservices for the TokoBapak e-commerce platform.

## Services

| Service | Technology | Port | Description |
|---------|------------|------|-------------|
| **product-service** | NestJS + TypeORM | 3001 | Product catalog management |
| **catalog-service** | Go + Chi | 3002 | Categories and brands |
| **cart-service** | NestJS + Redis | 3003 | Shopping cart operations |
| **order-service** | Spring Boot | 3004 | Order processing & Saga Orchestrator |
| **inventory-service** | Go | 3005 | Stock management & Saga Participant |

## Microservices Architecture

### Distributed Saga Pattern (Checkout Flow)

The checkout process uses a **Choreography-based Saga** to ensure data consistency across services without a central transaction manager.

![Checkout Saga Flow](../docs/images/saga_pattern_flow.png)

1. **Order Service** creates an order (PENDING) and publishes `OrderCreatedEvent`.
2. **Inventory Service** consumes the event, reserves stock, and publishes `StockReservedEvent` (or Failed).
3. **Order Service** updates the order status based on the reply.

## Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 22+ (for NestJS services)
- Go 1.22+ (for Go services)

### 1. Start Infrastructure
```bash
cd ../infrastructure/docker
docker compose up -d
```

### 2. Start Services

**Product Service:**
```bash
cd services/product-service
npm install
npm run start:dev
```

**Catalog Service:**
```bash
cd services/catalog-service
go run cmd/server/main.go
```

**Cart Service:**
```bash
cd services/cart-service
npm install
npm run start:dev
```

## Documentation

- **API Reference:** See [docs/api/API_DOCUMENTATION.md](/docs/api/API_DOCUMENTATION.md)
- **Architecture:** See [docs/architecture/ARCHITECTURE.md](/docs/architecture/ARCHITECTURE.md)
- **Backend Guide:** See [docs/backend/BACKEND_DOCUMENTATION.md](/docs/backend/BACKEND_DOCUMENTATION.md)

## Development

Each service has its own README with specific instructions.
