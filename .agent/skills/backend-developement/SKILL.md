---
name: Backend Development
description: Skills for developing microservices with NestJS, Spring Boot, Go, and FastAPI
---

# Backend Development Skills

> Panduan lengkap skill untuk Backend Development di TokoBapak E-commerce Platform

---

## 📖 Table of Contents

1. [Overview](#overview)
2. [Technology Stack](#technology-stack)
3. [NestJS (TypeScript)](#nestjs-typescript)
4. [Spring Boot (Java)](#spring-boot-java)
5. [Go (Clean Architecture)](#go-clean-architecture)
6. [FastAPI (Python)](#fastapi-python)
7. [Microservices Patterns](#microservices-patterns)
8. [DevOps & Infrastructure](#devops--infrastructure)
9. [Testing & Quality Assurance](#testing--quality-assurance)
10. [Best Practices](#best-practices)

---

## Overview

AI Assistant harus mampu membantu developer dalam:

- ⚙️ Building microservices dengan berbagai bahasa
- 🏗️ Implementing Clean Architecture / Hexagonal patterns
- 📨 Event-driven communication dengan Kafka
- 🗄️ Database design dan optimizations
- 🐳 Docker dan Kubernetes deployments
- 🧪 Unit dan integration testing

---

## Technology Stack

| Service Type            | Technology  | Purpose                                           |
| ----------------------- | ----------- | ------------------------------------------------- |
| **TypeScript Services** | NestJS      | Product, Cart, Notification, Search, Chat, Seller |
| **Java Services**       | Spring Boot | User, Auth, Order, Payment, Promotion             |
| **Go Services**         | Gin/Echo    | Catalog, Inventory, Shipping, Review, Media       |
| **Python Services**     | FastAPI     | Recommendation, Analytics                         |

---

## NestJS (TypeScript)

### Must Know

- ✅ Module-based architecture
- ✅ Dependency injection
- ✅ Guards, Interceptors, Pipes
- ✅ TypeORM / Prisma integration
- ✅ Kafka event handlers
- ✅ Swagger documentation

### Generate NestJS CRUD Module

```bash
# AI should run these commands:
nest g module products
nest g controller products
nest g service products
```

### Example: Products Service

```typescript
// products.service.ts
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Product } from "./entities/product.entity";
import { CreateProductDto } from "./dto/create-product.dto";

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}

  async create(dto: CreateProductDto): Promise<Product> {
    const product = this.productRepo.create(dto);
    return this.productRepo.save(product);
  }

  async findAll(): Promise<Product[]> {
    return this.productRepo.find();
  }
}
```

### Example: Controller with Swagger

```typescript
// NestJS Controller dengan Swagger
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";

@ApiTags("products")
@Controller("products")
export class ProductsController {
  @Get()
  @ApiOperation({ summary: "Get all products" })
  @ApiResponse({ status: 200, description: "Returns list of products" })
  async findAll(@Query() filters: ProductFiltersDto) {
    return this.productsService.findAll(filters);
  }
}
```

### Commands

```bash
cd backend/services/product-service
npm install
npm run start:dev         # Development
npm run build             # Build
```

---

## Spring Boot (Java)

### Must Know

- ✅ Spring MVC controllers
- ✅ Spring Data JPA
- ✅ Bean validation
- ✅ Exception handling
- ✅ Kafka integration
- ✅ JUnit testing

### Commands

```bash
cd backend/services/user-service
./mvnw spring-boot:run    # Development
./mvnw clean package      # Build
```

---

## Go (Clean Architecture)

### Must Know

- ✅ Hexagonal architecture (ports & adapters)
- ✅ Interface-based design
- ✅ GORM for database
- ✅ Gin/Echo framework
- ✅ Proper error handling
- ✅ Table-driven tests

### Commands

```bash
cd backend/services/catalog-service
go mod download
go run cmd/server/main.go  # Development
go build -o bin/server cmd/server/main.go  # Build
```

---

## FastAPI (Python)

### Must Know

- ✅ Pydantic models
- ✅ Async endpoints
- ✅ Dependency injection
- ✅ Background tasks
- ✅ OpenAPI docs generation

### Commands

```bash
cd backend/services/recommendation-service
pip install -r requirements.txt
uvicorn app.main:app --reload  # Development
```

---

## Microservices Patterns

### Skill: Implement Event-Driven Communication

**Scenario**: Order service perlu notify inventory service ketika order dibuat

**Producer (Order Service - NestJS)**:

```typescript
import { Injectable } from "@nestjs/common";
import { KafkaService } from "./kafka.service";

@Injectable()
export class OrderService {
  constructor(private kafka: KafkaService) {}

  async createOrder(dto: CreateOrderDto) {
    const order = await this.orderRepo.save(dto);

    // Publish event
    await this.kafka.publish("order.created", {
      orderId: order.id,
      items: order.items,
      customerId: order.customerId,
      timestamp: new Date().toISOString(),
    });

    return order;
  }
}
```

**Consumer (Inventory Service - Go)**:

```go
package event

import (
    "context"
    "encoding/json"
    "github.com/segmentio/kafka-go"
)

type OrderCreatedEvent struct {
    OrderID    string `json:"orderId"`
    Items      []Item `json:"items"`
    CustomerID string `json:"customerId"`
    Timestamp  string `json:"timestamp"`
}

func (c *Consumer) HandleOrderCreated(ctx context.Context, msg kafka.Message) error {
    var event OrderCreatedEvent
    if err := json.Unmarshal(msg.Value, &event); err != nil {
        return err
    }

    // Reserve stock
    for _, item := range event.Items {
        if err := c.inventoryService.ReserveStock(ctx, item.ProductID, item.Quantity); err != nil {
            // Publish compensating event
            c.publishStockReservationFailed(event.OrderID)
            return err
        }
    }

    return nil
}
```

### Skill: Implement Saga Pattern

**Scenario**: Distributed transaction untuk checkout flow

**AI harus bisa**:

- Design saga orchestration
- Implement compensating transactions
- Handle partial failures
- Generate sequence diagrams

---

## DevOps & Infrastructure

### Docker Skills

#### Multi-stage Dockerfile (NestJS)

```dockerfile
# Build stage
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY --from=builder /app/dist ./dist
EXPOSE 3001
CMD ["node", "dist/main"]
```

#### Docker Compose untuk Development

```yaml
version: "3.8"

services:
  product-service:
    build: ./backend/services/product-service
    ports:
      - "3001:3001"
    environment:
      DATABASE_URL: postgresql://postgres:postgres@postgres:5432/tokobapak_products
      KAFKA_BROKERS: kafka:9092
    depends_on:
      - postgres
      - kafka

  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: tokobapak_products
    volumes:
      - postgres_data:/var/lib/postgresql/data

  kafka:
    image: confluentinc/cp-kafka:7.5.0
    environment:
      KAFKA_BROKER_ID: 1
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181

volumes:
  postgres_data:
```

### Kubernetes Skills

#### Deployment Manifest

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: product-service
  namespace: tokobapak-prod
spec:
  replicas: 3
  selector:
    matchLabels:
      app: product-service
  template:
    metadata:
      labels:
        app: product-service
    spec:
      containers:
        - name: product-service
          image: tokobapak/product-service:latest
          ports:
            - containerPort: 3001
          env:
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: database-credentials
                  key: url
          resources:
            requests:
              memory: "256Mi"
              cpu: "250m"
            limits:
              memory: "512Mi"
              cpu: "500m"
          livenessProbe:
            httpGet:
              path: /health
              port: 3001
            initialDelaySeconds: 30
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /health
              port: 3001
            initialDelaySeconds: 5
            periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: product-service
spec:
  selector:
    app: product-service
  ports:
    - port: 3001
      targetPort: 3001
  type: ClusterIP
```

---

## Testing & Quality Assurance

### NestJS Unit Tests

```typescript
import { Test, TestingModule } from "@nestjs/testing";
import { ProductsService } from "./products.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Product } from "./entities/product.entity";

describe("ProductsService", () => {
  let service: ProductsService;
  let mockRepository: any;

  beforeEach(async () => {
    mockRepository = {
      find: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getRepositoryToken(Product),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
  });

  it("should return all products", async () => {
    const products = [{ id: "1", name: "Test" }];
    mockRepository.find.mockResolvedValue(products);

    expect(await service.findAll()).toEqual(products);
  });
});
```

---

## Best Practices

### Code Quality Checklist

- ✅ No hardcoded secrets
- ✅ Proper error handling with structured responses
- ✅ Logging with context (traceId, userId)
- ✅ Input validation (class-validator, Zod, Pydantic)
- ✅ API versioning (`/v1/`, `/v2/`)
- ✅ Database migrations (Flyway, TypeORM, GORM)
- ✅ Health check endpoints

### Security Best Practices

- ✅ Never log sensitive data (passwords, tokens)
- ✅ Always validate input
- ✅ Use parameterized queries
- ✅ Implement rate limiting
- ✅ CORS configuration
- ✅ HTTPS only
- ✅ JWT token expiry
- ✅ Input sanitization

### Architecture Patterns

- ✅ Hexagonal / Ports & Adapters
- ✅ Clean Architecture layers
- ✅ Event-driven communication
- ✅ Saga pattern for distributed transactions
- ✅ Circuit breaker for resilience

---

## Context7 Integration

Untuk dokumentasi terbaru, gunakan Context7 MCP:

| Library         | Context7 ID                    | Use Case         |
| --------------- | ------------------------------ | ---------------- |
| **NestJS**      | `/nestjs/nest`                 | Backend services |
| **Spring Boot** | `/spring-projects/spring-boot` | Java services    |
| **TypeScript**  | `/microsoft/typescript`        | Type definitions |

---

_Last Updated: January 2026_
