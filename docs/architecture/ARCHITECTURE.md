# TokoBapak Architecture Documentation

## Table of Contents

1. [System Overview](#system-overview)
2. [High-Level Architecture](#high-level-architecture)
3. [Microservices Architecture](#microservices-architecture)
4. [Service Catalog](#service-catalog)
5. [Data Architecture](#data-architecture)
6. [Event-Driven Architecture](#event-driven-architecture)
7. [Security Architecture](#security-architecture)
8. [Infrastructure & Deployment](#infrastructure--deployment)
9. [Monitoring & Observability](#monitoring--observability)
10. [Scalability Considerations](#scalability-considerations)

---

## System Overview

TokoBapak is a multi-vendor e-commerce marketplace built with a **microservices architecture** to ensure scalability, maintainability, and independent deployment.

### Key Characteristics

| Aspect | Choice |
|--------|--------|
| **Architecture Style** | Microservices + Event-Driven |
| **API Protocol** | REST + gRPC (internal) |
| **Message Broker** | Apache Kafka |
| **Container Runtime** | Docker / Podman |
| **Orchestration** | Kubernetes |
| **Languages** | TypeScript, Java, Go, Python |

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                    CLIENTS                                        │
├────────────────────┬────────────────────┬────────────────────────────────────────┤
│                    │                    │                                         │
│   ┌────────────┐   │   ┌────────────┐   │   ┌────────────┐                       │
│   │ Web App    │   │   │ Mobile App │   │   │ Admin      │                       │
│   │ (Next.js)  │   │   │ (React     │   │   │ Dashboard  │                       │
│   │ :3000      │   │   │  Native)   │   │   │ :3100      │                       │
│   └─────┬──────┘   │   └─────┬──────┘   │   └─────┬──────┘                       │
│         │          │         │          │         │                              │
└─────────┼──────────┴─────────┼──────────┴─────────┼──────────────────────────────┘
          │                    │                    │
          └────────────────────┼────────────────────┘
                               │ HTTPS
                    ┌──────────▼──────────┐
                    │   Load Balancer     │
                    │   (AWS ALB / Nginx) │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │    API Gateway      │
                    │   (Nginx / Kong)    │
                    │      :8080          │
                    └──────────┬──────────┘
                               │
         ┌─────────────────────┼─────────────────────┐
         │                     │                     │
         ▼                     ▼                     ▼
┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐
│  Auth Cluster   │   │  Core Services  │   │ Support Services│
│  ─────────────  │   │  ─────────────  │   │  ─────────────  │
│  • Auth         │   │  • Product      │   │  • Search       │
│  • User         │   │  • Catalog      │   │  • Notification │
│                 │   │  • Cart         │   │  • Media        │
│                 │   │  • Order        │   │  • Chat         │
│                 │   │  • Payment      │   │  • Analytics    │
│                 │   │  • Shipping     │   │                 │
│                 │   │  • Inventory    │   │                 │
│                 │   │  • Seller       │   │                 │
│                 │   │  • Review       │   │                 │
│                 │   │  • Promotion    │   │                 │
└────────┬────────┘   └────────┬────────┘   └────────┬────────┘
         │                     │                     │
         └─────────────────────┼─────────────────────┘
                               │
         ┌─────────────────────┼─────────────────────┐
         │                     │                     │
         ▼                     ▼                     ▼
┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐
│   PostgreSQL    │   │     Redis       │   │  Elasticsearch  │
│     :5432       │   │     :6379       │   │     :9200       │
└─────────────────┘   └─────────────────┘   └─────────────────┘
                               │
                    ┌──────────▼──────────┐
                    │   Apache Kafka      │
                    │     :9092           │
                    └─────────────────────┘
```

---

## Microservices Architecture

### Design Principles

| Principle | Description |
|-----------|-------------|
| **Single Responsibility** | Each service handles one business domain |
| **Loose Coupling** | Services communicate via APIs, no shared database |
| **Independent Deployment** | Each service deployed independently |
| **Technology Agnostic** | Best tool for each job |
| **Resilience** | Graceful degradation on failures |
| **Observability** | Logs, metrics, traces for all services |

### Communication Patterns

```
┌─────────────────────────────────────────────────────────────────┐
│                    SYNCHRONOUS (REST/HTTP)                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ┌──────────┐     Request/Response     ┌──────────┐            │
│   │ Frontend │ ◄──────────────────────► │ Service  │            │
│   └──────────┘                          └──────────┘            │
│                                                                  │
│   Use Case: Real-time queries, immediate responses              │
│   Example: GET /products, POST /orders                          │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                  ASYNCHRONOUS (Kafka Events)                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ┌──────────┐  Publish   ┌───────┐  Subscribe  ┌──────────┐   │
│   │ Service A│ ─────────► │ Kafka │ ─────────► │ Service B│    │
│   └──────────┘            └───────┘             └──────────┘    │
│                                                                  │
│   Use Case: Distributed transactions, eventual consistency      │
│   Example: order.created → payment.pending → inventory.reserve  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Service Catalog

### Overview

| Service | Technology | Port | Database | Description |
|---------|------------|------|----------|-------------|
| **auth-service** | Java (Spring Boot) | 3005 | PostgreSQL | JWT authentication, OAuth |
| **user-service** | Java (Spring Boot) | 3006 | PostgreSQL | User profiles, addresses |
| **product-service** | NestJS | 3001 | PostgreSQL | Products, variants, media |
| **catalog-service** | Go | 3002 | PostgreSQL | Categories, brands |
| **cart-service** | NestJS | 3003 | Redis | Shopping cart management |
| **order-service** | Java (Spring Boot) | 3007 | PostgreSQL | Order processing |
| **payment-service** | Java (Spring Boot) | 3008 | PostgreSQL | Payment gateway integration |
| **shipping-service** | Go | 3009 | PostgreSQL | Courier integration |
| **inventory-service** | Go | 3011 | PostgreSQL | Stock management |
| **seller-service** | NestJS | 3012 | PostgreSQL | Seller management |
| **promotion-service** | Java (Spring Boot) | 3013 | PostgreSQL | Vouchers, promotions |
| **review-service** | Go | 3014 | PostgreSQL | Product reviews |
| **search-service** | NestJS | 3010 | Elasticsearch | Full-text search |
| **notification-service** | NestJS | 3004 | Redis | Email, SMS, Push |
| **chat-service** | NestJS | 3015 | MongoDB | Real-time messaging |
| **media-service** | Go | 3016 | S3/R2 | Image/video storage |
| **recommendation-service** | Python (FastAPI) | 3017 | - | ML recommendations |
| **analytics-service** | Python (FastAPI) | 3018 | ClickHouse | Business analytics |

### Service Architecture Patterns

#### NestJS Services (TypeScript)

```
src/
├── main.ts                     # Bootstrap application
├── app.module.ts               # Root module
├── config/                     # Configuration
│   ├── database.config.ts
│   └── kafka.config.ts
├── common/                     # Shared utilities
│   ├── filters/               # Exception filters
│   ├── guards/                # Auth guards
│   ├── interceptors/          # Logging, transform
│   └── decorators/            # Custom decorators
└── modules/
    └── <feature>/
        ├── dto/               # Request/Response DTOs
        ├── entities/          # TypeORM entities
        ├── <feature>.controller.ts
        ├── <feature>.service.ts
        └── <feature>.module.ts
```

#### Go Services (Clean Architecture)

```
cmd/
└── server/
    └── main.go                # Entry point

internal/
├── domain/                    # Business entities & interfaces
│   ├── category.go
│   └── errors.go
├── usecase/                   # Business logic (application layer)
│   └── category_uc.go
├── repository/                # Data access (infrastructure)
│   └── postgres/
│       └── category_repo.go
└── delivery/                  # Transport layer
    └── http/
        └── handler.go

pkg/                           # Shared packages
└── utils/
```

#### Java Services (Spring Boot)

```
src/main/java/id/tokobapak/<service>/
├── <Service>Application.java    # Main class
├── config/                      # Configuration
│   ├── SecurityConfig.java
│   └── KafkaConfig.java
├── controller/                  # REST controllers
├── service/                     # Business logic
├── repository/                  # JPA repositories
├── domain/                      # Entities
├── dto/                         # Data transfer objects
├── event/                       # Kafka events
└── exception/                   # Custom exceptions
```

---

## Data Architecture

### Database Strategy (Database per Service)

```
┌─────────────────────────────────────────────────────────────────┐
│                    PostgreSQL Databases                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ tokobapak_   │  │ tokobapak_   │  │ tokobapak_   │          │
│  │ users        │  │ products     │  │ catalog      │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ tokobapak_   │  │ tokobapak_   │  │ tokobapak_   │          │
│  │ orders       │  │ payments     │  │ shipping     │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ tokobapak_   │  │ tokobapak_   │  │ tokobapak_   │          │
│  │ inventory    │  │ sellers      │  │ promotions   │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                  │
│  ┌──────────────┐                                               │
│  │ tokobapak_   │                                               │
│  │ reviews      │                                               │
│  └──────────────┘                                               │
└─────────────────────────────────────────────────────────────────┘
```

### Data Storage Types

| Storage Type | Technology | Use Case |
|--------------|------------|----------|
| **Relational** | PostgreSQL 16 | Transactional data (users, orders) |
| **Key-Value** | Redis | Caching, sessions, cart |
| **Document** | MongoDB | Chat messages |
| **Search** | Elasticsearch 8 | Full-text product search |
| **Object Storage** | S3 / Cloudflare R2 | Images, videos |
| **Analytics** | ClickHouse | Event analytics |

### Caching Strategy

```
┌──────────────┐     Cache Check    ┌──────────────┐
│    Client    │ ─────────────────► │    Redis     │
└──────────────┘                    └──────┬───────┘
                                           │
                              ┌────────────┼────────────┐
                              │ HIT        │           │ MISS
                              ▼            │           ▼
                       ┌──────────┐        │    ┌──────────────┐
                       │  Return  │        │    │  PostgreSQL  │
                       └──────────┘        │    └──────┬───────┘
                                          │           │
                                          │    ┌──────▼───────┐
                                          │    │ Cache Result │
                                          │    └──────┬───────┘
                                          │           │
                                          └───────────┘
```

**Cache TTLs:**
- Categories: 5 minutes
- Product details: 1 minute
- User session: 24 hours
- Cart: Until checkout

---

## Event-Driven Architecture

### Kafka Topics

| Topic | Producer | Consumers | Purpose |
|-------|----------|-----------|---------|
| `user.registered` | auth-service | notification-service | Welcome email |
| `order.created` | order-service | payment-service, cart-service | Create payment, clear cart |
| `order.confirmed` | order-service | inventory-service, notification-service | Reserve stock, notify user |
| `payment.completed` | payment-service | order-service, notification-service | Confirm order, send receipt |
| `order.shipped` | order-service | inventory-service, notification-service | Deduct stock, send tracking |
| `seller.approved` | seller-service | auth-service, notification-service | Upgrade role, notify |
| `review.created` | review-service | product-service | Update product rating |
| `product.updated` | product-service | search-service | Re-index search |

### Saga Pattern (Checkout Flow)

```
┌──────────────────────────────────────────────────────────────────┐
│                     CHECKOUT SAGA ORCHESTRATION                   │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│   ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐      │
│   │ Create  │───►│ Reserve │───►│ Create  │───►│ Clear   │      │
│   │ Order   │    │ Stock   │    │ Payment │    │ Cart    │      │
│   └────┬────┘    └────┬────┘    └────┬────┘    └────┬────┘      │
│        │              │              │              │            │
│        │              │              │              ▼            │
│        │              │              │         ┌─────────┐       │
│        │              │              └────────►│ SUCCESS │       │
│        │              │                        └─────────┘       │
│        │              │                                          │
│   ─────┼──────────────┼──────────── ON FAILURE ─────────────     │
│        │              │                                          │
│        │              ▼                                          │
│        │         ┌─────────┐                                     │
│        │         │ Release │  (Compensating Transaction)         │
│        │         │ Stock   │                                     │
│        │         └────┬────┘                                     │
│        │              │                                          │
│        ▼              ▼                                          │
│   ┌─────────┐    ┌─────────┐                                     │
│   │ Cancel  │───►│ FAILED  │                                     │
│   │ Order   │    └─────────┘                                     │
│   └─────────┘                                                    │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

---

## Security Architecture

### Authentication Flow

```
┌────────────┐                                    ┌────────────┐
│   Client   │                                    │Auth Service│
└─────┬──────┘                                    └─────┬──────┘
      │                                                 │
      │  1. POST /auth/login {email, password}         │
      │────────────────────────────────────────────────►│
      │                                                 │
      │                          2. Verify credentials  │
      │                          3. Generate JWT tokens │
      │                                                 │
      │  4. {accessToken, refreshToken, user}          │
      │◄────────────────────────────────────────────────│
      │                                                 │
      │  5. Request + Authorization: Bearer {token}     │
      │────────────────────────────────────────────────►│ API Gateway
      │                                                 │
      │                          6. Validate JWT        │
      │                          7. Forward to service  │
      │                                                 │
      │  8. Response                                    │
      │◄────────────────────────────────────────────────│
```

### Security Measures

| Layer | Implementation |
|-------|----------------|
| **Transport** | TLS 1.3 (HTTPS everywhere) |
| **Authentication** | JWT with RS256 signing |
| **Authorization** | Role-based access control (RBAC) |
| **API Gateway** | Rate limiting, IP whitelist |
| **Input Validation** | Zod (frontend), class-validator (NestJS) |
| **SQL Injection** | Parameterized queries, ORM |
| **XSS** | Content Security Policy |
| **CORS** | Strict origin configuration |
| **Secrets** | Kubernetes Secrets / Vault |

### User Roles

| Role | Description | Permissions |
|------|-------------|-------------|
| `CUSTOMER` | Regular buyer | Browse, purchase, review |
| `SELLER` | Store owner | + Manage products, process orders |
| `ADMIN` | Platform staff | + Manage users, approve sellers |
| `SUPER_ADMIN` | System admin | Full access |

---

## Infrastructure & Deployment

### Container Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                      Kubernetes Cluster                           │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                 Namespace: tokobapak-prod                    │ │
│  │                                                              │ │
│  │  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐   │ │
│  │  │  Deployment   │  │  Deployment   │  │  Deployment   │   │ │
│  │  │ product-svc   │  │ order-svc     │  │ payment-svc   │   │ │
│  │  │ replicas: 3   │  │ replicas: 3   │  │ replicas: 2   │   │ │
│  │  └───────────────┘  └───────────────┘  └───────────────┘   │ │
│  │                                                              │ │
│  │  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐   │ │
│  │  │ Service       │  │ Service       │  │ Service       │   │ │
│  │  │ ClusterIP     │  │ ClusterIP     │  │ ClusterIP     │   │ │
│  │  └───────────────┘  └───────────────┘  └───────────────┘   │ │
│  │                                                              │ │
│  │  ┌─────────────────────────────────────────────────────┐    │ │
│  │  │           Ingress (nginx-ingress-controller)         │    │ │
│  │  └─────────────────────────────────────────────────────┘    │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                 Namespace: tokobapak-data                    │ │
│  │                                                              │ │
│  │  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐   │ │
│  │  │ StatefulSet   │  │ StatefulSet   │  │ StatefulSet   │   │ │
│  │  │ PostgreSQL    │  │ Redis         │  │ Kafka         │   │ │
│  │  │ (HA Patroni)  │  │ (Sentinel)    │  │ (Strimzi)     │   │ │
│  │  └───────────────┘  └───────────────┘  └───────────────┘   │ │
│  └─────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
```

### Docker Image Strategy

| Service Type | Base Image | Final Size |
|--------------|------------|------------|
| NestJS | node:22-alpine | ~180MB |
| Go | scratch / alpine | ~15MB |
| Java | eclipse-temurin:21-jre-alpine | ~200MB |
| Python | python:3.12-slim | ~150MB |

### CI/CD Pipeline

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│    Push     │───►│    Build    │───►│    Test     │───►│   Deploy    │
│  (GitHub)   │    │  (Docker)   │    │ (Unit/E2E)  │    │ (Kubernetes)│
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
                          │                  │
                          ▼                  ▼
                   ┌─────────────┐    ┌─────────────┐
                   │   Push to   │    │   Quality   │
                   │   Registry  │    │    Gate     │
                   └─────────────┘    └─────────────┘
```

---

## Monitoring & Observability

### Observability Stack

```
┌─────────────────────────────────────────────────────────────────┐
│                        OBSERVABILITY                             │
├──────────────────┬──────────────────┬────────────────────────────┤
│     METRICS      │      LOGS        │         TRACES             │
├──────────────────┼──────────────────┼────────────────────────────┤
│                  │                  │                            │
│  ┌────────────┐  │  ┌────────────┐  │  ┌────────────┐           │
│  │ Prometheus │  │  │ Fluent Bit │  │  │   Jaeger   │           │
│  └─────┬──────┘  │  └─────┬──────┘  │  └─────┬──────┘           │
│        │         │        │         │        │                   │
│        ▼         │        ▼         │        ▼                   │
│  ┌────────────┐  │  ┌────────────┐  │  ┌────────────┐           │
│  │  Grafana   │  │  │   Loki     │  │  │   Tempo    │           │
│  │ Dashboards │  │  │  (Storage) │  │  │  (Storage) │           │
│  └────────────┘  │  └────────────┘  │  └────────────┘           │
│                  │                  │                            │
└──────────────────┴──────────────────┴────────────────────────────┘
```

### Key Metrics

| Category | Metrics |
|----------|---------|
| **Latency** | p50, p95, p99 request duration |
| **Traffic** | Requests per second |
| **Errors** | Error rate, 4xx, 5xx |
| **Saturation** | CPU, Memory, Disk usage |
| **Business** | Orders/hour, GMV, Active users |

### Alerting Rules

| Alert | Condition | Severity |
|-------|-----------|----------|
| High Error Rate | 5xx > 1% for 5min | Critical |
| High Latency | p99 > 3s for 5min | Warning |
| Service Down | Health check fail | Critical |
| Low Disk Space | < 10% available | Warning |
| Database Connections | Pool > 80% | Warning |

---

## Scalability Considerations

### Horizontal Scaling

| Service | Scaling Trigger | Min/Max Pods |
|---------|-----------------|--------------|
| product-service | CPU > 70% | 2 / 10 |
| order-service | CPU > 70% | 3 / 15 |
| cart-service | Connections > 1000 | 2 / 8 |
| search-service | CPU > 60% | 2 / 10 |
| API Gateway | RPS > 10000 | 3 / 20 |

### Database Scaling

| Strategy | Implementation |
|----------|----------------|
| **Read Replicas** | PostgreSQL streaming replication |
| **Connection Pooling** | PgBouncer |
| **Partitioning** | Orders by date, Products by category |
| **Sharding** | Future: by seller_id for large datasets |

### Performance Targets

| Metric | Target |
|--------|--------|
| API Latency (p95) | < 200ms |
| Homepage Load | < 2s |
| Search Results | < 500ms |
| Checkout Complete | < 3s |
| System Uptime | 99.9% |

---

## Related Documentation

- **[Sequence Diagrams](./SEQUENCE_DIAGRAMS.md)** - Detailed flow diagrams
- **[Database ERD](../database/DATABASE.md)** - Entity relationships
- **[Environment Variables](../ENVIRONMENT_VARIABLES.md)** - Configuration reference
- **[API Documentation](../api/API_DOCUMENTATION.md)** - API endpoints

---

*Document Version: 2.0 | Last Updated: January 2026*
