# TokoBapak Backend Services

This directory contains all backend microservices for the TokoBapak e-commerce platform.

## Services

| Service | Technology | Port | Description |
|---------|------------|------|-------------|
| **product-service** | NestJS + TypeORM | 3001 | Product catalog management |
| **catalog-service** | Go + Chi | 3002 | Categories and brands |
| **cart-service** | NestJS + Redis | 3003 | Shopping cart operations |

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
