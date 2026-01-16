# TokoBapak Backend Services Documentation

## Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Services](#services)
4. [Getting Started](#getting-started)
5. [API Reference](#api-reference)
6. [Development Guidelines](#development-guidelines)
7. [Deployment](#deployment)
8. [Troubleshooting](#troubleshooting)

---

## Overview

TokoBapak is a multi-vendor e-commerce marketplace platform built with a microservices architecture. The backend consists of three core MVP services:

| Service | Technology | Port | Purpose |
|---------|------------|------|---------|
| **Product Service** | NestJS + TypeORM | 3001 | Product catalog management |
| **Catalog Service** | Go + Chi | 3002 | Categories and brands |
| **Cart Service** | NestJS + Redis | 3003 | Shopping cart operations |

### Technology Stack

- **Runtime**: Node.js 22, Go 1.25
- **Frameworks**: NestJS 11, Chi v5
- **Databases**: PostgreSQL 16, Redis
- **Documentation**: Swagger/OpenAPI 3.0
- **Container**: Docker, Docker Compose

---

## Architecture

### Microservices Design

```
┌─────────────────────────────────────────────────────────────────┐
│                        API Gateway (Kong)                       │
└───────────────┬────────────────┬────────────────┬───────────────┘
                │                │                │
    ┌───────────▼───────┐ ┌──────▼──────┐ ┌──────▼──────┐
    │  Product Service  │ │   Catalog   │ │    Cart     │
    │   (NestJS:3001)   │ │  (Go:3002)  │ │ (NestJS:3003)│
    └─────────┬─────────┘ └──────┬──────┘ └──────┬──────┘
              │                  │               │
    ┌─────────▼─────────────────▼───────┐ ┌─────▼──────┐
    │           PostgreSQL              │ │   Redis    │
    │  (products, catalog databases)    │ │  (cache)   │
    └───────────────────────────────────┘ └────────────┘
```

### Clean Architecture (Catalog Service)

```
internal/
├── domain/          # Business entities & interfaces
├── usecase/         # Application business logic
├── repository/      # Data access layer (PostgreSQL)
└── delivery/http/   # HTTP handlers (Chi router)
```

### NestJS Module Structure

```
src/
├── modules/
│   └── products/
│       ├── dto/           # Data Transfer Objects
│       ├── entities/      # TypeORM entities
│       ├── products.controller.ts
│       ├── products.service.ts
│       └── products.module.ts
├── common/
│   └── filters/           # Exception filters
├── config/                # Configuration
└── main.ts               # Bootstrap
```

---

## Services

### 1. Product Service (NestJS)

**Location:** `backend/services/product-service/`

#### Entities
- **Product**: Main product entity with name, price, description, status
- **ProductVariant**: Size/color variations with SKU and stock
- **ProductMedia**: Images and videos associated with products

#### Key Features
- Full CRUD operations with pagination
- Slug-based product lookup
- View count tracking
- Product status management (DRAFT, ACTIVE, INACTIVE, OUT_OF_STOCK)

#### Configuration
```bash
# .env
PORT=3001
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=tokobapak_products
CORS_ORIGIN=http://localhost:3000
```

---

### 2. Catalog Service (Go)

**Location:** `backend/services/catalog-service/`

#### Entities
- **Category**: Hierarchical categories with parent-child relationships
- **Brand**: Product brands with logo support

#### Key Features
- Clean Architecture pattern
- Cursor-based pagination
- Category tree structure
- Swag-generated OpenAPI documentation

#### Configuration
```bash
# .env
PORT=3002
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASS=postgres
DB_NAME=tokobapak_catalog
NODE_ENV=development
```

---

### 3. Cart Service (NestJS)

**Location:** `backend/services/cart-service/`

#### Data Model
```typescript
interface Cart {
  userId: string;
  items: CartItem[];
  updatedAt: string;
}

interface CartItem {
  productId: string;
  variantId?: string;
  quantity: number;
  price: number;
  addedAt: string;
}
```

#### Key Features
- Redis-backed persistence (30-day TTL)
- Add/update/remove items
- Clear entire cart
- User-scoped carts

#### Configuration
```bash
# .env
PORT=3003
REDIS_HOST=localhost
REDIS_PORT=6379
CORS_ORIGIN=http://localhost:3000
```

---

## Getting Started

### Prerequisites

- Docker & Docker Compose
- Node.js 22+ (or use Docker)
- Go 1.22+ (for Catalog Service development)

### 1. Start Infrastructure

```bash
cd infrastructure/docker
docker compose up -d
```

This starts:
- PostgreSQL on port 5432
- Redis on port 6379

### 2. Start Product Service

```bash
cd backend/services/product-service
cp .env.example .env
npm install
npm run start:dev
```

### 3. Start Catalog Service

```bash
cd backend/services/catalog-service
cp .env.example .env
go run cmd/server/main.go
```

### 4. Start Cart Service

```bash
cd backend/services/cart-service
cp .env.example .env
npm install
npm run start:dev
```

### Verify Services

| Service | Health Check | Swagger UI |
|---------|--------------|------------|
| Product | http://localhost:3001 | http://localhost:3001/api/docs |
| Catalog | http://localhost:3002 | http://localhost:3002/swagger/index.html |
| Cart | http://localhost:3003 | http://localhost:3003/api/docs |

---

## API Reference

### Product Service API

#### List Products
```http
GET /api/v1/products?page=1&limit=12&categoryId=xxx&status=ACTIVE
```

**Response:**
```json
{
  "data": [...],
  "total": 100,
  "page": 1,
  "limit": 12
}
```

#### Get Product by ID
```http
GET /api/v1/products/:id
```

#### Get Product by Slug
```http
GET /api/v1/products/slug/:slug
```

#### Create Product
```http
POST /api/v1/products
Content-Type: application/json

{
  "name": "Product Name",
  "description": "Description",
  "price": 99000,
  "categoryId": "uuid",
  "status": "ACTIVE"
}
```

#### Update Product
```http
PUT /api/v1/products/:id
```

#### Delete Product
```http
DELETE /api/v1/products/:id
```

---

### Catalog Service API

#### List Categories
```http
GET /api/v1/categories?cursor=&num=10
```

**Response:**
```json
{
  "data": [...],
  "nextCursor": "2024-01-16T10:00:00Z"
}
```

#### CRUD Operations
```http
GET    /api/v1/categories/:id
POST   /api/v1/categories
PUT    /api/v1/categories/:id
DELETE /api/v1/categories/:id
```

#### Brands
```http
GET    /api/v1/brands
GET    /api/v1/brands/:id
POST   /api/v1/brands
PUT    /api/v1/brands/:id
DELETE /api/v1/brands/:id
```

---

### Cart Service API

#### Get Cart
```http
GET /api/v1/cart?userId=user-123
```

**Response:**
```json
{
  "userId": "user-123",
  "items": [
    {
      "productId": "uuid",
      "quantity": 2,
      "price": 99000,
      "addedAt": "2024-01-16T10:00:00Z"
    }
  ],
  "updatedAt": "2024-01-16T10:00:00Z"
}
```

#### Add Item
```http
POST /api/v1/cart/items?userId=user-123
Content-Type: application/json

{
  "productId": "uuid",
  "quantity": 1,
  "price": 99000
}
```

#### Update Quantity
```http
PUT /api/v1/cart/items/:productId?userId=user-123
Content-Type: application/json

{
  "quantity": 3
}
```

#### Remove Item
```http
DELETE /api/v1/cart/items/:productId?userId=user-123
```

#### Clear Cart
```http
DELETE /api/v1/cart?userId=user-123
```

---

## Development Guidelines

### Code Style

| Language | Style Guide |
|----------|-------------|
| TypeScript | ESLint + Prettier |
| Go | `gofmt` + `golint` |

### Git Commit Convention

```
<type>(<scope>): <description>

Types: feat, fix, docs, style, refactor, test, chore
Scope: backend, frontend, infra, docs
```

Examples:
```
feat(backend): implement product search
fix(cart): resolve quantity update bug
docs: update API documentation
```

### Testing Commands

```bash
# NestJS services
npm run test          # Unit tests
npm run test:e2e      # E2E tests
npm run test:cov      # Coverage

# Go service
go test ./...
```

### Linting

```bash
# NestJS
npm run lint

# Go
go vet ./...
golint ./...
```

---

## Deployment

### Docker Build

Each service has a multi-stage Dockerfile:

```bash
# Product Service
cd backend/services/product-service
docker build -t tokobapak/product-service .

# Catalog Service
cd backend/services/catalog-service
docker build -t tokobapak/catalog-service .

# Cart Service
cd backend/services/cart-service
docker build -t tokobapak/cart-service .
```

### Environment Variables (Production)

```bash
NODE_ENV=production
DB_HOST=<production-db-host>
DB_PASSWORD=<secure-password>
CORS_ORIGIN=https://tokobapak.id
```

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use secure database credentials
- [ ] Configure proper CORS origins
- [ ] Enable SSL/TLS
- [ ] Set up health checks
- [ ] Configure logging aggregation
- [ ] Set up monitoring (Prometheus/Grafana)

---

## Troubleshooting

### Common Issues

#### Database Connection Failed
```
Error: Cannot connect to database
```
**Solution:** Ensure PostgreSQL is running and credentials are correct.

```bash
docker compose ps  # Check if postgres container is running
docker compose logs postgres  # View logs
```

#### Redis Connection Failed
```
Error: Redis connection refused
```
**Solution:** Ensure Redis is running.

```bash
docker compose ps
redis-cli ping  # Should return PONG
```

#### Port Already in Use
```
Error: listen EADDRINUSE :::3001
```
**Solution:** Kill the process using the port or change port in `.env`.

```bash
lsof -i :3001
kill -9 <PID>
```

### Logs

- **NestJS**: Console output with timestamp
- **Go Chi**: Middleware logger with request details
- **Docker**: `docker compose logs -f <service>`

---

## Support

- **Documentation**: This file
- **API Docs**: Swagger UI (see links above)
- **Issues**: GitHub Issues
- **Email**: backend-team@tokobapak.id

---

*Last Updated: January 2026*
