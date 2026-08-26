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

| Aspect | Choice (MVP 26 Aug 2026) |
|--------|--------------------------|
| **Architecture Style** | Microservices + Event-Driven (Saga) |
| **API Protocol** | REST (MVP) + gRPC future |
| **Message Broker** | Apache Kafka self-host 1 broker (Strimzi) → MSK Serverless later |
| **Container Runtime** | Podman (local) / Docker |
| **Orchestration** | AWS EKS EC2 (ALB + Traefik Ingress) — MVP hemat |
| **Languages** | Go 1.27.0 uniform untuk 9 service MVP (hide 9 lain) |
| **Infra Local** | Podman Compose di m6a.4xlarge (postgres:16, redis:alpine, kafka:7.5.0) — tanpa LocalStack |
| **Infra Cloud** | Full AWS (EKS + RDS PostgreSQL 18 t4g.micro + ElastiCache t4g.micro + self-host Kafka) — hemat ~$70/bulan |
| **Frontend** | TanStack Start + TanStack Router + TanStack Query (Vite) — buang Next.js 15 (ADR 0004) |

---

## High-Level Architecture (MVP)

> **MVP 26 Aug 2026**: `Web App (Next.js)` → `Web App (TanStack Start + Vite)`, `Kong` → `Traefik` (migrate to Kong jika butuh 3scale), `PostgreSQL HA Patroni` → `RDS PostgreSQL 18 t4g.micro`, `Redis Sentinel` → `ElastiCache t4g.micro`, `Kafka Strimzi 3 broker` → `Kafka self-host 1 broker`.

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                    CLIENTS                                        │
├────────────────────┬────────────────────┬────────────────────────────────────────┤
│                    │                    │                                         │
│   ┌────────────┐   │   ┌────────────┐   │   ┌────────────┐                       │
│   │ Web App    │   │   │ Mobile App │   │   │ Admin      │                       │
│   │(TanStack   │   │   │ (React     │   │   │ Dashboard  │                       │
│   │ Start+Vite)│   │   │  Native)   │   │   │(TanStack)  │                       │
│   │ :3000      │   │   │            │   │   │ :3100      │                       │
│   └─────┬──────┘   │   └─────┬──────┘   │   └─────┬──────┘                       │
│         │          │         │          │         │                              │
└─────────┼──────────┴─────────┼──────────┴─────────┼──────────────────────────────┘
          │                    │                    │
          └────────────────────┼────────────────────┘
                               │ HTTPS
                    ┌──────────▼──────────┐
                    │   AWS ALB           │
                    │ (TLS + WAF)         │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │  Traefik Ingress    │
                    │  (EKS) :8080        │
                    │  note: migrate → Kong if 3scale needed |
                    └──────────┬──────────┘
                               │
         ┌─────────────────────┼─────────────────────┐
         │                     │                     │
         ▼                     ▼                     ▼
┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐
│  Auth Cluster   │   │  Core Services  │   │ Support Services│
│  (Go 1.27)      │   │  (Go 1.27)      │   │  (Go 1.27)      │
│  • Auth :3007   │   │  • Product :3001│   │  • Search :3010 │
│  • User :3006   │   │  • Cart :3003   │   │  • Notification:3004 |
│                 │   │  • Order :3004  │   │  • Shipping :3008 |
│                 │   │  • Payment :3005│   │                 │
│                 │   │    ↕ PayU SNAP-BI (public HTTPS)     │
│                 │   │  • Inventory→merge Product.stock      │
└────────┬────────┘   └────────┬────────┘   └────────┬────────┘
         │                     │                     │
         └─────────────────────┼─────────────────────┘
                               │
         ┌─────────────────────┼─────────────────────┐
         │                     │                     │
         ▼                     ▼                     ▼
┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐
│ RDS PostgreSQL  │   │  ElastiCache    │   │  Kafka self-host│
│  t4g.micro      │   │  t4g.micro      │   │  1 broker (EKS) │
│  single-AZ MVP  │   │  single node    │   │  → MSK Serverless later |
└─────────────────┘   └─────────────────┘   └─────────────────┘
         ┌─────────────────────┼─────────────────────┐
         │  Local: postgres:18-alpine / redis:alpine / cp-kafka:7.5.0 (podman m6a.4xlarge) |
         │  Cloud: EKS EC2 m6i.large + Terraform + ArgoCD |
         └─────────────────────────────────────────────┘
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

| Service | Technology | Port | Database | Description | Status |
|---------|------------|------|----------|-------------|--------|
| **auth-service** | Go 1.27 (chi + golang-jwt) | 3007 | RDS PostgreSQL 18 t4g.micro | JWT + BFF HttpOnly+CSRF | **MVP keep** |
| **user-service** | Go 1.27 | 3006 | RDS PostgreSQL 18 t4g.micro | Users + role SELLER | **MVP keep** |
| **product-service** | Go 1.27 (sqlc+pgx) | 3001 | RDS PostgreSQL 18 t4g.micro `products(stock)` | Products + merge catalog+inventory | **MVP keep** |
| **cart-service** | Go 1.27 (go-redis) | 3003 | ElastiCache t4g.micro | Cart TTL 7 hari merge sum | **MVP keep** |
| **order-service** | Go 1.27 (Saga) | 3004 | RDS PostgreSQL 18 t4g.micro | Order Saga reserve | **MVP keep** |
| **payment-service** | Go 1.27 → PayU SNAP-BI | 3005 | RDS PostgreSQL 18 t4g.micro `payments` | Thin adapter PayU transaction-service | **MVP keep** |
| **shipping-service** | Go 1.27 | 3008 | RDS PostgreSQL 18 t4g.micro | Mock flat ongkir | **MVP keep** |
| **search-service** | Go 1.27 (go-elasticsearch) | 3010 | Elasticsearch 1 index | Search products | **MVP keep** |
| **notification-service** | Go 1.27 | 3009 | — (Kafka consumer) | Kafka `tokobapak.payment.completed.v1` | **MVP keep** |
| ~~catalog-service~~ | Go | — | — | Merge ke product | hide |
| ~~inventory-service~~ | Go | — | — | Merge ke product.stock | hide |
| ~~seller-service~~ | NestJS | — | — | Merge ke users.role | hide |
| ~~promotion-service~~ | Java | — | — | — | hide |
| ~~review-service~~ | Go | — | — | — | hide |
| ~~chat-service~~ | NestJS | — | — | — | hide |
| ~~media-service~~ | Go | — | — | Langsung R2 | hide |
| ~~recommendation-service~~ | Python | — | — | ML | hide |
| ~~analytics-service~~ | Python | — | — | — | hide |

### Service Architecture Patterns

#### NestJS Services (TypeScript) — HIDE MVP (ADR 0001)

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

#### Go Services — Hexagonal Lightweight + Saga Choreography (tanpa starter, opsi b)

> **Parity PayU** `domain/port/adapter` + outbox manual + saga choreography, tanpa `shared/outbox-starter`/`saga-starter` Java. 9 service MVP Go 1.27.

```
cmd/server/main.go            # bootstrap, wire port → adapter

internal/
├── domain/
│   ├── model/                 # Product, Order, Payment, Shipment
│   │   └── errors.go
│   └── port/                  # interface — hexagonal boundary
│       ├── product_repository.go
│       └── event_publisher.go
├── application/service/       # use case, inject port
│   ├── product_service.go
│   └── order_service.go       # tx { insert order + outbox } → poller
└── adapter/
    ├── persistence/postgres/ # sqlc + pgx implement port
    │   └── product_repo.go
    ├── messaging/kafka/       # outbox poller SELECT FOR UPDATE SKIP LOCKED
    │   └── outbox_poller.go  # publish tokobapak.<domain>.<event>.v1 + DLQ .dlq
    ├── web/http/              # gin/chi handler → service (bukan repo)
    │   └── handler.go
    └── client/payu/           # SNAP-BI HMAC + X-Idempotency-Key
        └── payu_client.go

migrations/                   # Flyway V1 + outbox table
└── 001_create_outbox.sql     # id, topic, payload JSONB, created_at
```

#### Java Services (Spring Boot) — HIDE MVP (ADR 0001)

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

### Database Strategy (Database per Service) + Outbox Manual (opsi b)

> Tiap service MVP punya tabel `outbox` untuk exactly-once tanpa starter.

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
| **Relational** | PostgreSQL 18 | Transactional data (users, orders) |
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

## Infrastructure & Deployment — MVP (Podman Local vs Full AWS)

> **Keputusan infra 26 Aug 2026 (Q21–Q27)**: Local `Podman Compose` di `m6a.4xlarge` tanpa LocalStack (hemat, parity `postgres:18-alpine`/`redis:alpine`/`cp-kafka:7.5.0` single). Cloud full AWS `EKS EC2` + `RDS PostgreSQL 18 t4g.micro` + `ElastiCache t4g.micro` + `Kafka self-host 1 broker (Strimzi)` hemat ~$70/bulan (#MVP), `ALB → Traefik Ingress` (migrate → Kong jika butuh 3scale), `Terraform + Helm + ArgoCD`, `Prometheus/Grafana/Loki` self-host, PayU link `public HTTPS + HMAC SNAP-BI`.

### Local vs Cloud Parity

| Layer | Local (Podman `m6a.4xlarge`) | Cloud (AWS MVP) | Scale Path |
|-------|------------------------------|-----------------|------------|
| **Compute** | `infrastructure/local/podman-compose.yml` 9 service Go | `EKS EC2` managed node `m6i.large` | → `m6i.2xlarge` / Fargate |
| **DB** | `postgres:18-alpine` single 5432 | `RDS PostgreSQL` `db.t4g.micro` single-AZ | → `db.t4g.small` Multi-AZ / Aurora Serverless v2 |
| **Cache** | `redis:alpine` single 6379 | `ElastiCache` `cache.t4g.micro` single | → `cache.t4g.small` cluster / Serverless |
| **Queue** | `cp-kafka:7.5.0` 1 broker + zookeeper | `Kafka self-host 1 broker` (Strimzi `t3.small`) di EKS | → `MSK Serverless` pay-per-GB |
| **Search** | `elasticsearch:8` single | `AWS OpenSearch` `t3.small.search` atau ES di EKS | → managed OpenSearch |
| **Gateway** | — (direct `localhost:3001–3010`) | `AWS ALB (TLS+WAF) → Traefik Ingress :8080` | → `Kong` jika butuh 3scale/portal |
| **Frontend** | `vite dev :3000` TanStack Start | `S3 + CloudFront` + `ALB` | — |
| **IaC** | — | `Terraform` state `S3+ DynamoDB` + `Helm` + `ArgoCD` | — |
| **Secrets** | `.env` | `AWS Secrets Manager` | → Vault |
| **Cost est** | `m6a.4xlarge` on-demand ~$0.69/jam (dev only) | ~$70/bulan data layer + ~$80 EKS EC2 | — |

### Container Architecture (AWS EKS)

```
┌──────────────────────────────────────────────────────────────────┐
│  AWS Cloud — EKS EC2 (m6i.large) + ALB + Traefik                 │
├──────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  Namespace: tokobapak-prod (9 Go 1.27 services)             │ │
│  │  Traefik Ingress :8080 (ALB TLS terminates)                 │ │
│  │  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐   │ │
│  │  │ auth :3007    │  │ product :3001 │  │ order :3004   │   │ │
│  │  │ user :3006    │  │ cart :3003    │  │ payment :3005 │   │ │
│  │  │               │  │ search :3010  │  │ shipping:3008 │   │ │
│  │  │               │  │               │  │ notify:3009   │   │ │
│  │  └───────┬───────┘  └───────┬───────┘  └───────┬───────┘   │ │
│  │          │                  │                  │            │ │
│  │          └──────────────────┼──────────────────┘            │ │
│  │                             │  Kafka 1 broker (Strimzi)     │ │
│  └─────────────────────────────┼───────────────────────────────┘ │
│                │               │                                │
│  ┌─────────────▼───────────────▼──────────────────────────────┐ │
│  │  Data: RDS PostgreSQL 18 t4g.micro :5432 │ ElastiCache t4g.micro :6379  │ │
│  │  (single-AZ MVP)           │  (single node)               │ │
│  └────────────────────────────────────────────────────────────┘ │
│  PayU OpenShift ←──── public HTTPS + HMAC SNAP-BI + X-Idempotency (ADR 0003) |
└──────────────────────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────────────────────┐
│  Local — Podman m6a.4xlarge (tanpa LocalStack)                    │
│  postgres:18-alpine :5432 │ redis:alpine :6379 │ cp-kafka:7.5.0 :9092 |
│  9 Go services :3001–3010 │ vite :3000 TanStack Start            │
└──────────────────────────────────────────────────────────────────┘
```

### Docker Image Strategy (MVP Go Uniform)

| Service Type | Base Image | Final Size | Catatan |
|--------------|------------|------------|---------|
| **Go 1.27 MVP** | `golang:1.27-alpine` build → `scratch` / `alpine` | ~15MB | 9 service MVP |
| Legacy NestJS | `node:22-alpine` | ~180MB | hide |
| Legacy Java | `eclipse-temurin:21-jre-alpine` | ~200MB | hide |
| Legacy Python | `python:3.12-slim` | ~150MB | hide |

### CI/CD Pipeline (MVP — Terraform + ArgoCD)

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│    Push     │───►│  Build Go   │───►│  Test +     │───►│  ArgoCD     │
│  (GitHub)   │    │ 1.27 (Docker│    │  golangci   │    │  Sync EKS   │
│             │    │  scratch)   │    │  vet + E2E  │    │  (Helm)     │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
                          │                  │
                          ▼                  ▼
                   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
                   │   Push ECR  │    │  Terraform  │───►│  TF State   │
                   │   (9 svc)   │    │  Plan/Apply │    │  S3+DynamoDB│
                   └─────────────┘    └─────────────┘    └─────────────┘
```
> Local `infrastructure/local/podman-compose.yml` tanpa LocalStack; Cloud `Terraform` state `S3+ DynamoDB` + `Helm` + `ArgoCD` (parity PayU `infrastructure/foundation/`).

---

## Monitoring & Observability

### Observability Stack — MVP (Q26 Prometheus self-host)

> **Q26**: Tetap `Prometheus + Grafana + Loki + Tempo` self-host di EKS (murah, parity PayU `LokiStack`), CloudWatch hanya billing. `AMP + Managed Grafana` baru di scale.

```
┌─────────────────────────────────────────────────────────────────┐
│  OBSERVABILITY (EKS self-host)  + CloudWatch billing             │
├──────────────────┬──────────────────┬────────────────────────────┤
│     METRICS      │      LOGS        │         TRACES             │
├──────────────────┼──────────────────┼────────────────────────────┤
│  ┌────────────┐  │  ┌────────────┐  │  ┌────────────┐           │
│  │ Prometheus │  │  │ Fluent Bit │  │  │   Tempo    │           │
│  │ (kube-prom)│  │  │  → Loki    │  │  │  (Jaeger)  │           │
│  └─────┬──────┘  │  └─────┬──────┘  │  └─────┬──────┘           │
│        │         │        │         │        │                   │
│        ▼         │        ▼         │        ▼                   │
│  ┌────────────┐  │  ┌────────────┐  │  ┌────────────┐           │
│  │  Grafana   │  │  │   Loki     │  │  │   Tempo    │           │
│  │  (EKS)     │  │  │   (EKS)    │  │  │   (EKS)    │           │
│  └────────────┘  │  └────────────┘  │  └────────────┘           │
│  CloudWatch ───────── metrics billing + alert SNS ────────────── │
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
