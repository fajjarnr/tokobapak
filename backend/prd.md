# Product Requirements Document (PRD)

## TokoBapak - Backend Services

---

## 1. Executive Summary

**Product Name:** TokoBapak Backend Platform  
**Document Version:** 1.0  
**Created:** January 2026  
**Last Updated:** January 2026  
**Status:** Active  
**Owners:** Backend Team Lead, Tech Lead, Product Manager  

### 1.1 Document Purpose

Dokumen ini mendefinisikan spesifikasi teknis dan arsitektur lengkap untuk semua backend services TokoBapak. PRD ini berfungsi sebagai single source of truth untuk tim pengembangan backend.

### 1.2 Scope

Dokumen ini mencakup:

1. **API Gateway** - Kong/Nginx untuk routing dan rate limiting
2. **Core Services** - Microservices untuk domain bisnis utama
3. **Supporting Services** - Services pendukung (notification, search, dll)
4. **Infrastructure** - Database, cache, message queue, storage

### 1.3 Target Audience

- Backend Engineers
- DevOps Engineers
- System Architects
- Database Administrators
- QA Engineers
- Security Engineers

### 1.4 Related Documents

| Document | Description |
|----------|-------------|
| `frontend/prd.md` | Frontend Applications PRD |
| `docs/ARCHITECTURE.md` | System Architecture |
| `docs/API_DOCUMENTATION.md` | API Specifications |
| `docs/DATABASE_SCHEMA.md` | Database Design |
| `docs/DEPLOYMENT.md` | Deployment Guide |

---

## 2. Architecture Overview

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Web App     │  │  Mobile App  │  │ Admin Panel  │  │ Seller Panel │     │
│  │  (Next.js)   │  │(React Native)│  │  (Next.js)   │  │  (Next.js)   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘     │
└────────────────────────────────┬────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            EDGE LAYER                                         │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                     CDN (Cloudflare)                                   │   │
│  │              - Static Assets, Image Caching, DDoS Protection          │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
└────────────────────────────────┬────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          API GATEWAY LAYER                                    │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                        Kong API Gateway                                │   │
│  │   - Authentication, Rate Limiting, Load Balancing, Request Routing    │   │
│  │   - JWT Validation, API Key Management, Request/Response Transform    │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
└────────────────────────────────┬────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         MICROSERVICES LAYER                                   │
│                                                                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │    User     │  │    Auth     │  │   Product   │  │   Catalog   │        │
│  │   Service   │  │   Service   │  │   Service   │  │   Service   │        │
│  │  (Java/     │  │  (Java/     │  │  (NestJS)   │  │   (Go)      │        │
│  │Spring Boot) │  │Spring Boot) │  │             │  │             │        │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘        │
│                                                                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │  Inventory  │  │    Cart     │  │    Order    │  │   Payment   │        │
│  │   Service   │  │   Service   │  │   Service   │  │   Service   │        │
│  │    (Go)     │  │  (NestJS)   │  │  (Java/     │  │  (Java/     │        │
│  │             │  │             │  │Spring Boot) │  │Spring Boot) │        │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘        │
│                                                                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │  Shipping   │  │Notification │  │   Review    │  │   Search    │        │
│  │   Service   │  │   Service   │  │   Service   │  │   Service   │        │
│  │    (Go)     │  │  (NestJS)   │  │    (Go)     │  │  (NestJS)   │        │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘        │
│                                                                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │Recommendation│  │  Analytics  │  │    Chat     │  │  Promotion  │        │
│  │   Service   │  │   Service   │  │   Service   │  │   Service   │        │
│  │  (Python)   │  │  (Python)   │  │  (NestJS)   │  │(Spring Boot)│        │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘        │
│                                                                               │
│  ┌─────────────┐  ┌─────────────┐                                           │
│  │   Seller    │  │    Media    │                                           │
│  │   Service   │  │   Service   │                                           │
│  │  (NestJS)   │  │    (Go)     │                                           │
│  └─────────────┘  └─────────────┘                                           │
│                                                                               │
└────────────────────────────────┬────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                       DATA & MESSAGING LAYER                                  │
│                                                                               │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                        MESSAGE BROKER                                   │  │
│  │  ┌─────────────────────┐        ┌─────────────────────┐               │  │
│  │  │   Apache Kafka      │        │     RabbitMQ        │               │  │
│  │  │ (Event Streaming)   │        │ (Task Queues)       │               │  │
│  │  └─────────────────────┘        └─────────────────────┘               │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                               │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                          DATABASES                                      │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐      │  │
│  │  │ PostgreSQL │  │  MongoDB   │  │   Redis    │  │Elasticsearch│      │  │
│  │  │  (Primary) │  │ (Documents)│  │  (Cache)   │  │  (Search)  │      │  │
│  │  └────────────┘  └────────────┘  └────────────┘  └────────────┘      │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                               │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                          STORAGE                                        │  │
│  │  ┌─────────────────────┐        ┌─────────────────────┐               │  │
│  │  │   SeaweedFS         │        │   Cloudflare R2     │               │  │
│  │  │ (Primary Storage)   │        │ (CDN + Backup)      │               │  │
│  │  └─────────────────────┘        └─────────────────────┘               │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                               │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Technology Stack Summary

| Category | Technology | Use Case |
|----------|------------|----------|
| **API Gateway** | Kong | Routing, Auth, Rate Limiting |
| **Service - Java** | Spring Boot 3.2+ | User, Auth, Order, Payment, Promotion |
| **Service - Node.js** | NestJS 10+ | Product, Cart, Notification, Search, Chat, Seller |
| **Service - Go** | Go 1.22+ | Catalog, Inventory, Shipping, Review, Media |
| **Service - Python** | FastAPI | Recommendation, Analytics |
| **Primary Database** | PostgreSQL 16 | Transactional data |
| **Document Store** | MongoDB 7 | Logs, sessions, flexible schemas |
| **Cache** | Redis 7 (Cluster) | Caching, sessions, rate limiting |
| **Search Engine** | Elasticsearch 8 | Product search, autocomplete |
| **Message Broker** | Apache Kafka | Event streaming, CDC |
| **Task Queue** | RabbitMQ | Async task processing |
| **Object Storage** | SeaweedFS + Cloudflare R2 | Media files |
| **Container** | Docker + Kubernetes | Orchestration |
| **CI/CD** | GitHub Actions | Automation |
| **Monitoring** | Prometheus + Grafana | Metrics |
| **Logging** | ELK Stack | Centralized logging |
| **Tracing** | Jaeger | Distributed tracing |

---

## 3. API Gateway

### 3.1 Kong Configuration

```yaml
# kong.yml - Declarative Configuration

_format_version: "3.0"
_transform: true

services:
  # User Service
  - name: user-service
    url: http://user-service:8080
    routes:
      - name: user-routes
        paths:
          - /api/v1/users
        strip_path: false
    plugins:
      - name: rate-limiting
        config:
          minute: 100
          policy: redis
      - name: jwt
        config:
          claims_to_verify:
            - exp

  # Auth Service
  - name: auth-service
    url: http://auth-service:8080
    routes:
      - name: auth-routes
        paths:
          - /api/v1/auth
        strip_path: false
    plugins:
      - name: rate-limiting
        config:
          minute: 30  # Stricter rate limit for auth
          policy: redis

  # Product Service
  - name: product-service
    url: http://product-service:3000
    routes:
      - name: product-routes
        paths:
          - /api/v1/products
        strip_path: false
    plugins:
      - name: rate-limiting
        config:
          minute: 500
          policy: redis
      - name: response-transformer
        config:
          add:
            headers:
              - "X-Service:product-service"

  # ... (other services follow similar pattern)

# Global Plugins
plugins:
  - name: correlation-id
    config:
      header_name: X-Request-ID
      generator: uuid
      echo_downstream: true

  - name: prometheus
    config:
      status_code_metrics: true
      latency_metrics: true

  - name: cors
    config:
      origins:
        - https://tokobapak.com
        - https://admin.tokobapak.com
        - https://seller.tokobapak.com
      methods:
        - GET
        - POST
        - PUT
        - PATCH
        - DELETE
        - OPTIONS
      headers:
        - Accept
        - Authorization
        - Content-Type
        - X-Request-ID
        - X-CSRF-Token
      credentials: true
      max_age: 3600
```

### 3.2 Rate Limiting Strategy

| Endpoint Category | Rate Limit | Window | Notes |
|-------------------|------------|--------|-------|
| Authentication | 30 req | 1 minute | Prevent brute force |
| Public Read APIs | 500 req | 1 minute | Product listing, etc. |
| Authenticated APIs | 200 req | 1 minute | User-specific actions |
| Write APIs | 60 req | 1 minute | Create/Update operations |
| Checkout | 10 req | 1 minute | Prevent cart manipulation |
| Payment | 5 req | 1 minute | Highest security |

### 3.3 Load Balancing

```yaml
# Upstream configuration with health checks
upstreams:
  - name: user-service-upstream
    algorithm: round-robin
    healthchecks:
      active:
        type: http
        http_path: /health
        healthy:
          interval: 5
          successes: 2
        unhealthy:
          interval: 5
          http_failures: 3
    targets:
      - target: user-service-1:8080
        weight: 100
      - target: user-service-2:8080
        weight: 100
```

---

## 4. Core Microservices

### 4.1 User Service

**Technology:** Java 21 + Spring Boot 3.2 (Hexagonal Architecture)

**Responsibilities:**
- User registration and profile management
- Address management
- User preferences
- Account verification

**Domain Model:**

```java
// domain/model/User.java
public record User(
    UserId id,
    Email email,
    Phone phone,
    UserProfile profile,
    List<Address> addresses,
    UserStatus status,
    Instant createdAt,
    Instant updatedAt
) {
    public User verify() {
        return new User(id, email, phone, profile, addresses, 
                        UserStatus.VERIFIED, createdAt, Instant.now());
    }
}

public record UserProfile(
    String firstName,
    String lastName,
    LocalDate dateOfBirth,
    Gender gender,
    String avatarUrl
) {}

public record Address(
    AddressId id,
    String label,
    String recipientName,
    String phone,
    String street,
    String city,
    String province,
    String postalCode,
    GeoLocation location,
    boolean isPrimary
) {}
```

**API Endpoints:**

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/users` | Register new user |
| GET | `/api/v1/users/me` | Get current user profile |
| PUT | `/api/v1/users/me` | Update profile |
| DELETE | `/api/v1/users/me` | Delete account |
| GET | `/api/v1/users/me/addresses` | List addresses |
| POST | `/api/v1/users/me/addresses` | Add address |
| PUT | `/api/v1/users/me/addresses/{id}` | Update address |
| DELETE | `/api/v1/users/me/addresses/{id}` | Delete address |
| POST | `/api/v1/users/verify-email` | Verify email |
| POST | `/api/v1/users/verify-phone` | Verify phone |

**Database Schema:**

```sql
-- PostgreSQL
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    date_of_birth DATE,
    gender VARCHAR(10),
    avatar_url TEXT,
    status VARCHAR(20) DEFAULT 'PENDING',
    email_verified_at TIMESTAMPTZ,
    phone_verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    label VARCHAR(50),
    recipient_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    street TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    province VARCHAR(100) NOT NULL,
    postal_code VARCHAR(10) NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_user_addresses_user_id ON user_addresses(user_id);
```

---

### 4.2 Auth Service

**Technology:** Java 21 + Spring Boot 3.2 + Spring Security

**Responsibilities:**
- Authentication (login/logout)
- JWT token management
- OAuth2 social login
- Password management
- Session management
- MFA (future)

**API Endpoints:**

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/login` | Login with credentials |
| POST | `/api/v1/auth/logout` | Logout (invalidate token) |
| POST | `/api/v1/auth/refresh` | Refresh access token |
| POST | `/api/v1/auth/forgot-password` | Request password reset |
| POST | `/api/v1/auth/reset-password` | Reset password with token |
| POST | `/api/v1/auth/change-password` | Change password (authenticated) |
| GET | `/api/v1/auth/oauth/{provider}` | OAuth2 redirect |
| GET | `/api/v1/auth/oauth/{provider}/callback` | OAuth2 callback |
| GET | `/api/v1/auth/sessions` | List active sessions |
| DELETE | `/api/v1/auth/sessions/{id}` | Revoke session |

**JWT Token Structure:**

```json
{
  "header": {
    "alg": "RS256",
    "typ": "JWT",
    "kid": "key-id-001"
  },
  "payload": {
    "sub": "user-uuid",
    "iss": "tokobapak.com",
    "aud": ["api.tokobapak.com"],
    "exp": 1704067200,
    "iat": 1704063600,
    "jti": "unique-token-id",
    "roles": ["user"],
    "permissions": ["read:profile", "write:profile"]
  }
}
```

**Security Configuration:**

```yaml
# application.yml
security:
  jwt:
    access-token:
      expiration: 15m
      algorithm: RS256
    refresh-token:
      expiration: 7d
      rotation: true
  password:
    bcrypt-strength: 12
    min-length: 8
    require-uppercase: true
    require-lowercase: true
    require-number: true
    require-special: true
  rate-limiting:
    login:
      max-attempts: 5
      lockout-duration: 15m
    password-reset:
      max-requests: 3
      cooldown: 1h
```

---

### 4.3 Product Service

**Technology:** NestJS 10 + TypeScript + TypeORM

**Responsibilities:**
- Product CRUD operations
- Product variants management
- Product media management
- Price management
- Stock updates (sync with Inventory)

**API Endpoints:**

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/products` | List products (paginated) |
| GET | `/api/v1/products/:id` | Get product details |
| GET | `/api/v1/products/:id/variants` | Get product variants |
| POST | `/api/v1/products` | Create product (seller) |
| PUT | `/api/v1/products/:id` | Update product (seller) |
| DELETE | `/api/v1/products/:id` | Delete product (seller) |
| POST | `/api/v1/products/:id/media` | Upload product media |
| DELETE | `/api/v1/products/:id/media/:mediaId` | Delete media |
| PATCH | `/api/v1/products/:id/status` | Update product status |

**Module Structure:**

```typescript
// src/modules/products/products.module.ts
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Product,
      ProductVariant,
      ProductMedia,
      ProductAttribute,
    ]),
    CacheModule.registerAsync({
      useClass: RedisCacheConfig,
    }),
    EventEmitterModule.forRoot(),
  ],
  controllers: [ProductsController],
  providers: [
    ProductsService,
    ProductsRepository,
    ProductEventHandler,
    ProductCacheService,
  ],
  exports: [ProductsService],
})
export class ProductsModule {}
```

**Entity Definition:**

```typescript
// src/modules/products/entities/product.entity.ts
@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  sellerId: string;

  @Column({ length: 255 })
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column('text')
  description: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  price: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  discountPrice: number;

  @Column()
  categoryId: string;

  @Column({ nullable: true })
  brandId: string;

  @Column({ type: 'enum', enum: ProductStatus, default: ProductStatus.DRAFT })
  status: ProductStatus;

  @Column({ type: 'jsonb', nullable: true })
  attributes: Record<string, any>;

  @Column({ type: 'decimal', precision: 8, scale: 2 })
  weight: number;

  @Column({ type: 'jsonb', nullable: true })
  dimensions: { length: number; width: number; height: number };

  @OneToMany(() => ProductVariant, variant => variant.product)
  variants: ProductVariant[];

  @OneToMany(() => ProductMedia, media => media.product)
  media: ProductMedia[];

  @Column({ type: 'tsvector', select: false })
  searchVector: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Index()
  @Column({ default: 0 })
  viewCount: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  rating: number;

  @Column({ default: 0 })
  reviewCount: number;
}
```

---

### 4.4 Catalog Service

**Technology:** Go 1.22 (Clean Architecture)

**Responsibilities:**
- Category management
- Brand management
- Attribute definitions
- Category hierarchy

**Project Structure:**

```
catalog-service/
├── cmd/
│   └── server/
│       └── main.go
├── internal/
│   ├── domain/
│   │   ├── category.go
│   │   ├── brand.go
│   │   ├── attribute.go
│   │   └── errors.go
│   ├── usecase/
│   │   ├── category_uc.go
│   │   └── brand_uc.go
│   ├── delivery/
│   │   ├── http/
│   │   │   ├── handler.go
│   │   │   ├── middleware/
│   │   │   └── router.go
│   │   └── grpc/
│   │       └── server.go
│   └── repository/
│       ├── postgres/
│       │   └── category_repo.go
│       └── redis/
│           └── category_cache.go
├── pkg/
│   ├── database/
│   ├── logger/
│   └── validator/
└── migrations/
```

**API Endpoints:**

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/categories` | List all categories |
| GET | `/api/v1/categories/:id` | Get category details |
| GET | `/api/v1/categories/:id/children` | Get child categories |
| POST | `/api/v1/categories` | Create category (admin) |
| PUT | `/api/v1/categories/:id` | Update category (admin) |
| DELETE | `/api/v1/categories/:id` | Delete category (admin) |
| GET | `/api/v1/brands` | List all brands |
| GET | `/api/v1/brands/:id` | Get brand details |
| GET | `/api/v1/attributes` | List attribute definitions |

---

### 4.5 Inventory Service

**Technology:** Go 1.22 (Clean Architecture)

**Responsibilities:**
- Stock level management
- Stock reservations
- Stock alerts (low stock)
- Warehouse management

**API Endpoints:**

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/inventory/:productId` | Get stock level |
| PUT | `/api/v1/inventory/:productId` | Update stock |
| POST | `/api/v1/inventory/reserve` | Reserve stock |
| POST | `/api/v1/inventory/release` | Release reservation |
| POST | `/api/v1/inventory/confirm` | Confirm reservation |
| GET | `/api/v1/inventory/alerts` | Get low stock alerts |

**Stock Management Flow:**

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   Customer   │───▶│  Cart/Order  │───▶│  Inventory   │
│ Adds to Cart │    │   Service    │    │   Service    │
└──────────────┘    └──────────────┘    └──────────────┘
                           │                    │
                           ▼                    ▼
                    ┌──────────────┐    ┌──────────────┐
                    │   Reserve    │    │  Check Stock │
                    │    Stock     │◀───│   Available  │
                    └──────────────┘    └──────────────┘
                           │
           ┌───────────────┼───────────────┐
           ▼               ▼               ▼
    ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
    │   Payment    │ │   Payment    │ │  Reservation │
    │   Success    │ │   Failed     │ │   Timeout    │
    │              │ │              │ │  (15 min)    │
    └──────────────┘ └──────────────┘ └──────────────┘
           │               │               │
           ▼               ▼               ▼
    ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
    │   Confirm    │ │   Release    │ │   Release    │
    │  Reservation │ │  Reservation │ │  Reservation │
    └──────────────┘ └──────────────┘ └──────────────┘
```

---

### 4.6 Cart Service

**Technology:** NestJS 10 + Redis

**Responsibilities:**
- Shopping cart management
- Cart persistence
- Cart item validation
- Price calculation

**API Endpoints:**

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/cart` | Get current cart |
| POST | `/api/v1/cart/items` | Add item to cart |
| PUT | `/api/v1/cart/items/:id` | Update item quantity |
| DELETE | `/api/v1/cart/items/:id` | Remove item |
| DELETE | `/api/v1/cart` | Clear cart |
| POST | `/api/v1/cart/validate` | Validate cart items |
| GET | `/api/v1/cart/summary` | Get cart summary with totals |

**Cart Storage (Redis):**

```typescript
// Cart key structure: cart:{userId}
interface CartItem {
  productId: string;
  variantId?: string;
  quantity: number;
  price: number;
  addedAt: string;
  selected: boolean;
}

interface Cart {
  userId: string;
  items: CartItem[];
  updatedAt: string;
  expiresAt: string; // TTL: 30 days
}
```

---

### 4.7 Order Service

**Technology:** Java 21 + Spring Boot 3.2 (Event Sourcing)

**Responsibilities:**
- Order creation and management
- Order status workflow
- Order history
- Invoice generation

**Order Status Flow:**

```
┌─────────────────────────────────────────────────────────────────────┐
│                         ORDER STATE MACHINE                          │
└─────────────────────────────────────────────────────────────────────┘

     ┌──────────┐
     │  DRAFT   │
     └────┬─────┘
          │ checkout
          ▼
     ┌──────────┐
     │ PENDING  │◀───────────────────────┐
     │ PAYMENT  │                        │
     └────┬─────┘                        │
          │                              │
    ┌─────┴─────┐                        │
    ▼           ▼                        │
┌────────┐ ┌─────────┐              ┌────────┐
│ PAID   │ │ EXPIRED │              │CANCELLED│
└────┬───┘ └─────────┘              └────────┘
     │                                   ▲
     ▼                                   │
┌────────────┐                           │
│ PROCESSING │───────────────────────────┤
└────┬───────┘    cancel                 │
     │                                   │
     ▼                                   │
┌────────────┐                           │
│  SHIPPED   │───────────────────────────┘
└────┬───────┘    cancel (before delivery)
     │
     ▼
┌────────────┐
│ DELIVERED  │
└────┬───────┘
     │
     ├────────────────┐
     ▼                ▼
┌────────────┐   ┌────────────┐
│ COMPLETED  │   │  RETURNED  │
└────────────┘   └────────────┘
                       │
                       ▼
                 ┌────────────┐
                 │  REFUNDED  │
                 └────────────┘
```

**API Endpoints:**

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/orders` | Create order |
| GET | `/api/v1/orders` | List user orders |
| GET | `/api/v1/orders/:id` | Get order details |
| PATCH | `/api/v1/orders/:id/status` | Update order status |
| POST | `/api/v1/orders/:id/cancel` | Cancel order |
| GET | `/api/v1/orders/:id/timeline` | Get order timeline |
| GET | `/api/v1/orders/:id/invoice` | Download invoice |

**Event Publishing:**

```java
// Order events published to Kafka
@DomainEvents
public class Order extends AggregateRoot {
    
    public static Order create(OrderId id, UserId userId, List<OrderItem> items) {
        Order order = new Order(id, userId, items);
        order.registerEvent(new OrderCreatedEvent(id, userId, items, Instant.now()));
        return order;
    }
    
    public void markAsPaid(PaymentId paymentId) {
        this.status = OrderStatus.PAID;
        this.paymentId = paymentId;
        registerEvent(new OrderPaidEvent(this.id, paymentId, Instant.now()));
    }
    
    public void ship(ShippingInfo shippingInfo) {
        this.status = OrderStatus.SHIPPED;
        this.shippingInfo = shippingInfo;
        registerEvent(new OrderShippedEvent(this.id, shippingInfo, Instant.now()));
    }
}
```

---

### 4.8 Payment Service

**Technology:** Java 21 + Spring Boot 3.2

**Responsibilities:**
- Payment processing
- Payment gateway integration (Midtrans, Xendit)
- Payment status management
- Refund processing

**Supported Payment Methods:**

| Category | Methods |
|----------|---------|
| Bank Transfer | BCA, BNI, BRI, Mandiri, Permata |
| E-Wallet | GoPay, OVO, DANA, ShopeePay, LinkAja |
| Credit Card | Visa, Mastercard, JCB |
| Retail | Alfamart, Indomaret |
| QRIS | QRIS Standard |

**API Endpoints:**

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/payments` | Create payment |
| GET | `/api/v1/payments/:id` | Get payment status |
| GET | `/api/v1/payments/:id/instructions` | Get payment instructions |
| POST | `/api/v1/payments/:id/verify` | Verify payment (manual) |
| POST | `/api/v1/payments/:id/refund` | Request refund |
| POST | `/api/v1/payments/webhook/midtrans` | Midtrans callback |
| POST | `/api/v1/payments/webhook/xendit` | Xendit callback |

**Payment Flow:**

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  Order   │────▶│ Payment  │────▶│ Gateway  │────▶│  Notify  │
│ Service  │     │ Service  │     │(Midtrans)│     │  Order   │
└──────────┘     └──────────┘     └──────────┘     └──────────┘
                      │                 │
                      │                 │ webhook
                      │                 ▼
                      │           ┌──────────┐
                      └──────────▶│  Update  │
                                  │  Status  │
                                  └──────────┘
```

---

### 4.9 Shipping Service

**Technology:** Go 1.22

**Responsibilities:**
- Shipping cost calculation
- Courier integration (JNE, J&T, SiCepat, AnterAja, GoSend)
- Tracking updates
- Shipping label generation

**API Endpoints:**

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/shipping/rates` | Calculate shipping rates |
| POST | `/api/v1/shipping/orders` | Create shipping order |
| GET | `/api/v1/shipping/orders/:id` | Get shipping details |
| GET | `/api/v1/shipping/orders/:id/track` | Track shipment |
| POST | `/api/v1/shipping/orders/:id/label` | Generate shipping label |
| GET | `/api/v1/shipping/couriers` | List available couriers |

**Shipping Rate Request:**

```go
type RateRequest struct {
    Origin      Address `json:"origin"`
    Destination Address `json:"destination"`
    Weight      float64 `json:"weight"` // in kg
    Dimensions  *Dimensions `json:"dimensions,omitempty"`
    Insurance   bool    `json:"insurance"`
}

type RateResponse struct {
    Courier     string  `json:"courier"`
    Service     string  `json:"service"`
    Description string  `json:"description"`
    Cost        int64   `json:"cost"`
    ETD         string  `json:"etd"` // e.g., "1-2 days"
    Insurance   int64   `json:"insurance,omitempty"`
}
```

---

### 4.10 Notification Service

**Technology:** NestJS 10 + Bull (Redis Queue)

**Responsibilities:**
- Email notifications
- SMS notifications
- Push notifications
- WhatsApp notifications
- In-app notifications

**Notification Types:**

| Category | Types |
|----------|-------|
| Order | Order created, Payment success, Shipped, Delivered |
| Account | Welcome, Verify email, Password reset |
| Promotion | Flash sale, Voucher expiring, Price drop |
| Chat | New message |
| System | Security alert, Account changes |

**API Endpoints:**

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/notifications` | List notifications |
| GET | `/api/v1/notifications/unread-count` | Get unread count |
| PUT | `/api/v1/notifications/:id/read` | Mark as read |
| PUT | `/api/v1/notifications/read-all` | Mark all as read |
| GET | `/api/v1/notifications/preferences` | Get preferences |
| PUT | `/api/v1/notifications/preferences` | Update preferences |

**Queue Processing:**

```typescript
// Email queue processor
@Processor('email-queue')
export class EmailProcessor {
  @Process('send-email')
  async handleSendEmail(job: Job<EmailJob>) {
    const { to, subject, template, data } = job.data;
    
    const html = await this.templateService.render(template, data);
    
    await this.emailProvider.send({
      to,
      subject,
      html,
    });
  }
}
```

---

### 4.11 Search Service

**Technology:** NestJS 10 + Elasticsearch 8

**Responsibilities:**
- Product search
- Autocomplete suggestions
- Search analytics
- Index management

**Search Features:**

| Feature | Description |
|---------|-------------|
| Full-text search | Product name, description, brand |
| Filters | Category, price range, rating, location |
| Sorting | Relevance, price, newest, best selling |
| Facets | Dynamic filter counts |
| Suggestions | Autocomplete, typo correction |
| Synonyms | "HP" → "Handphone", "Laptop" |

**API Endpoints:**

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/search` | Search products |
| GET | `/api/v1/search/suggestions` | Get search suggestions |
| GET | `/api/v1/search/autocomplete` | Autocomplete |
| POST | `/api/v1/search/reindex` | Trigger reindex (admin) |

**Elasticsearch Index Mapping:**

```json
{
  "mappings": {
    "properties": {
      "id": { "type": "keyword" },
      "name": {
        "type": "text",
        "analyzer": "indonesian",
        "fields": {
          "keyword": { "type": "keyword" },
          "suggest": {
            "type": "completion",
            "analyzer": "simple"
          }
        }
      },
      "description": {
        "type": "text",
        "analyzer": "indonesian"
      },
      "category": {
        "type": "nested",
        "properties": {
          "id": { "type": "keyword" },
          "name": { "type": "keyword" },
          "path": { "type": "keyword" }
        }
      },
      "brand": { "type": "keyword" },
      "price": { "type": "long" },
      "discountPrice": { "type": "long" },
      "rating": { "type": "float" },
      "reviewCount": { "type": "integer" },
      "soldCount": { "type": "integer" },
      "seller": {
        "properties": {
          "id": { "type": "keyword" },
          "name": { "type": "text" },
          "city": { "type": "keyword" }
        }
      },
      "status": { "type": "keyword" },
      "createdAt": { "type": "date" }
    }
  }
}
```

---

### 4.12 Review Service

**Technology:** Go 1.22

**Responsibilities:**
- Product reviews & ratings
- Seller reviews
- Review moderation
- Rating aggregation

**API Endpoints:**

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/products/:id/reviews` | Get product reviews |
| POST | `/api/v1/products/:id/reviews` | Create review |
| PUT | `/api/v1/reviews/:id` | Update review |
| DELETE | `/api/v1/reviews/:id` | Delete review |
| POST | `/api/v1/reviews/:id/helpful` | Mark as helpful |
| POST | `/api/v1/reviews/:id/report` | Report review |
| GET | `/api/v1/sellers/:id/reviews` | Get seller reviews |

---

### 4.13 Chat Service

**Technology:** NestJS 10 + Socket.IO + Redis

**Responsibilities:**
- Real-time messaging
- Message persistence
- Online status
- Chat history

**WebSocket Events:**

```typescript
// Server events
interface ServerEvents {
  'message:new': (message: Message) => void;
  'message:delivered': (messageId: string) => void;
  'message:read': (messageId: string) => void;
  'typing:start': (roomId: string, userId: string) => void;
  'typing:stop': (roomId: string, userId: string) => void;
  'user:online': (userId: string) => void;
  'user:offline': (userId: string) => void;
}

// Client events
interface ClientEvents {
  'message:send': (data: SendMessageDto) => void;
  'message:read': (messageId: string) => void;
  'typing:start': (roomId: string) => void;
  'typing:stop': (roomId: string) => void;
  'room:join': (roomId: string) => void;
  'room:leave': (roomId: string) => void;
}
```

---

### 4.14 Recommendation Service

**Technology:** Python 3.12 + FastAPI

**Responsibilities:**
- Personalized recommendations
- "Customers also bought"
- Similar products
- Trending products

**API Endpoints:**

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/recommendations/personal` | User-based recommendations |
| GET | `/api/v1/recommendations/similar/:productId` | Similar products |
| GET | `/api/v1/recommendations/bought-together/:productId` | Frequently bought together |
| GET | `/api/v1/recommendations/trending` | Trending products |

---

### 4.15 Media Service

**Technology:** Go 1.22

**Responsibilities:**
- Image upload & processing
- Video transcoding
- CDN integration
- Storage management

**API Endpoints:**

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/media/upload` | Upload file |
| POST | `/api/v1/media/upload/multiple` | Upload multiple files |
| GET | `/api/v1/media/:id` | Get media info |
| DELETE | `/api/v1/media/:id` | Delete media |
| GET | `/api/v1/media/:id/thumbnail` | Get thumbnail |

**Image Processing:**

```go
type ImageProcessingConfig struct {
    Formats    []string // webp, avif, jpeg
    Sizes      []Size   // thumbnail, small, medium, large, original
    Quality    int      // 80
    MaxWidth   int      // 2048
    MaxHeight  int      // 2048
    MaxFileSize int64   // 10MB
}

type Size struct {
    Name   string
    Width  int
    Height int
}

var DefaultSizes = []Size{
    {Name: "thumbnail", Width: 150, Height: 150},
    {Name: "small", Width: 300, Height: 300},
    {Name: "medium", Width: 600, Height: 600},
    {Name: "large", Width: 1200, Height: 1200},
}
```

---

## 5. Event-Driven Architecture

### 5.1 Event Topics (Kafka)

| Topic | Publisher | Consumers | Description |
|-------|-----------|-----------|-------------|
| `user.created` | User Service | Notification, Analytics | New user registered |
| `user.verified` | User Service | Analytics | User verified email/phone |
| `product.created` | Product Service | Search, Analytics | New product created |
| `product.updated` | Product Service | Search, Inventory | Product updated |
| `product.deleted` | Product Service | Search, Inventory | Product deleted |
| `order.created` | Order Service | Inventory, Notification | New order placed |
| `order.paid` | Order Service | Inventory, Notification, Seller | Payment confirmed |
| `order.shipped` | Order Service | Notification | Order shipped |
| `order.delivered` | Order Service | Notification, Review | Order delivered |
| `order.cancelled` | Order Service | Inventory, Notification | Order cancelled |
| `payment.success` | Payment Service | Order, Notification | Payment successful |
| `payment.failed` | Payment Service | Order, Notification | Payment failed |
| `inventory.low` | Inventory Service | Notification | Low stock alert |
| `review.created` | Review Service | Product, Notification | New review posted |

### 5.2 Event Schema (Avro)

```json
{
  "type": "record",
  "name": "OrderCreatedEvent",
  "namespace": "com.tokobapak.events.order",
  "fields": [
    {"name": "eventId", "type": "string"},
    {"name": "eventType", "type": "string"},
    {"name": "eventTime", "type": "long"},
    {"name": "aggregateId", "type": "string"},
    {"name": "aggregateType", "type": "string"},
    {"name": "version", "type": "int"},
    {"name": "payload", "type": {
      "type": "record",
      "name": "OrderCreatedPayload",
      "fields": [
        {"name": "orderId", "type": "string"},
        {"name": "userId", "type": "string"},
        {"name": "items", "type": {"type": "array", "items": "OrderItem"}},
        {"name": "totalAmount", "type": "long"},
        {"name": "currency", "type": "string"}
      ]
    }}
  ]
}
```

---

## 6. Database Design

### 6.1 Database per Service

| Service | Database | Type | Notes |
|---------|----------|------|-------|
| User Service | user_db | PostgreSQL | User data, addresses |
| Auth Service | auth_db | PostgreSQL | Sessions, tokens |
| Product Service | product_db | PostgreSQL | Products, variants, media |
| Catalog Service | catalog_db | PostgreSQL | Categories, brands |
| Inventory Service | inventory_db | PostgreSQL | Stock levels |
| Cart Service | Redis | Redis | Cart data (TTL: 30d) |
| Order Service | order_db | PostgreSQL | Orders, order items |
| Payment Service | payment_db | PostgreSQL | Transactions, refunds |
| Review Service | review_db | PostgreSQL | Reviews, ratings |
| Chat Service | chat_db | MongoDB | Messages, rooms |
| Notification Service | notification_db | PostgreSQL | Notifications |
| Analytics Service | analytics_db | ClickHouse | Analytics data |

### 6.2 PostgreSQL Configuration

```yaml
# PostgreSQL 16 Configuration
postgresql:
  version: 16
  max_connections: 200
  shared_buffers: 2GB
  effective_cache_size: 6GB
  maintenance_work_mem: 512MB
  checkpoint_completion_target: 0.9
  wal_buffers: 64MB
  default_statistics_target: 100
  random_page_cost: 1.1
  effective_io_concurrency: 200
  work_mem: 10MB
  min_wal_size: 1GB
  max_wal_size: 4GB
  max_worker_processes: 8
  max_parallel_workers_per_gather: 4
  max_parallel_workers: 8
  max_parallel_maintenance_workers: 4

# Replication
replication:
  mode: streaming
  replicas: 2
  synchronous_commit: on

# Connection pooling (PgBouncer)
pgbouncer:
  pool_mode: transaction
  max_client_conn: 1000
  default_pool_size: 20
```

---

## 7. Caching Strategy

### 7.1 Redis Configuration

```yaml
# Redis Cluster Configuration
redis:
  mode: cluster
  nodes: 6  # 3 masters, 3 replicas
  maxmemory: 8gb
  maxmemory-policy: allkeys-lru
  
# Cache Layers
cache_layers:
  - name: L1 (In-Memory)
    type: local
    ttl: 60s
    max_size: 100MB
    
  - name: L2 (Redis)
    type: distributed
    ttl: varies
    
# Cache Keys & TTL
cache_keys:
  user_session: 
    pattern: "session:{sessionId}"
    ttl: 7d
    
  user_profile:
    pattern: "user:{userId}"
    ttl: 1h
    
  product_detail:
    pattern: "product:{productId}"
    ttl: 5m
    
  product_list:
    pattern: "products:{categoryId}:{page}:{sort}"
    ttl: 1m
    
  cart:
    pattern: "cart:{userId}"
    ttl: 30d
    
  rate_limit:
    pattern: "ratelimit:{ip}:{endpoint}"
    ttl: 1m
```

### 7.2 Cache Invalidation

```typescript
// Cache invalidation patterns

// 1. Time-based (TTL)
await redis.set('product:123', data, 'EX', 300); // 5 minutes

// 2. Event-driven invalidation
@OnEvent('product.updated')
async handleProductUpdated(event: ProductUpdatedEvent) {
  await redis.del(`product:${event.productId}`);
  await redis.del(`products:*`); // Pattern delete
}

// 3. Cache-aside with stale-while-revalidate
async getProduct(id: string) {
  const cached = await redis.get(`product:${id}`);
  if (cached) {
    // Async refresh if stale
    if (isStale(cached)) {
      this.refreshProductCache(id);
    }
    return cached;
  }
  const product = await this.productRepo.findById(id);
  await redis.set(`product:${id}`, product, 'EX', 300);
  return product;
}
```

---

## 8. Security

### 8.1 Authentication & Authorization

```yaml
# Security Configuration
security:
  authentication:
    jwt:
      algorithm: RS256
      access_token_ttl: 15m
      refresh_token_ttl: 7d
      issuer: tokobapak.com
      audience: api.tokobapak.com
      
    oauth2:
      providers:
        - google
        - facebook
        
  authorization:
    model: RBAC
    roles:
      - name: customer
        permissions:
          - read:own_profile
          - write:own_profile
          - read:products
          - create:orders
          - read:own_orders
          
      - name: seller
        permissions:
          - all:customer
          - create:products
          - update:own_products
          - read:own_orders
          - update:order_status
          
      - name: admin
        permissions:
          - all:*
          
  password:
    hash_algorithm: bcrypt
    rounds: 12
    min_length: 8
    require_complexity: true
    
  rate_limiting:
    enabled: true
    storage: redis
    
  cors:
    allowed_origins:
      - https://tokobapak.com
      - https://admin.tokobapak.com
    allowed_methods:
      - GET
      - POST
      - PUT
      - PATCH
      - DELETE
    max_age: 3600
```

### 8.2 API Security Headers

```nginx
# Security headers
add_header X-Content-Type-Options "nosniff" always;
add_header X-Frame-Options "DENY" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' https://cdn.tokobapak.com data:; font-src 'self'; connect-src 'self' https://api.tokobapak.com wss://ws.tokobapak.com" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;
```

### 8.3 Data Protection

```yaml
# Data protection measures
data_protection:
  encryption:
    at_rest:
      algorithm: AES-256-GCM
      key_rotation: 90d
    in_transit:
      tls_version: "1.3"
      cipher_suites:
        - TLS_AES_256_GCM_SHA384
        - TLS_CHACHA20_POLY1305_SHA256
        
  pii:
    fields:
      - email
      - phone
      - address
      - payment_info
    handling:
      masking: true
      audit_logging: true
      access_control: strict
      
  gdpr:
    data_export: supported
    data_deletion: supported
    consent_management: required
```

---

## 9. Observability

### 9.1 Monitoring Stack

```yaml
# Monitoring configuration
monitoring:
  metrics:
    provider: prometheus
    scrape_interval: 15s
    retention: 30d
    
  logging:
    provider: elk
    format: json
    level: info
    retention: 14d
    
  tracing:
    provider: jaeger
    sampling_rate: 0.1  # 10%
    retention: 7d
    
  alerting:
    provider: alertmanager
    channels:
      - slack
      - pagerduty
      - email
```

### 9.2 Key Metrics

| Category | Metric | Alert Threshold |
|----------|--------|-----------------|
| Availability | Uptime | < 99.9% |
| Latency | P99 Response Time | > 500ms |
| Error Rate | 5xx Errors | > 0.1% |
| Throughput | Requests/sec | Based on capacity |
| Resources | CPU Usage | > 80% |
| Resources | Memory Usage | > 85% |
| Resources | Disk Usage | > 90% |
| Database | Connection Pool | > 80% utilization |
| Cache | Hit Rate | < 80% |
| Queue | Message Lag | > 1000 messages |

### 9.3 Logging Format

```json
{
  "timestamp": "2026-01-13T12:00:00.000Z",
  "level": "INFO",
  "service": "order-service",
  "traceId": "abc123",
  "spanId": "def456",
  "userId": "user-uuid",
  "requestId": "req-uuid",
  "method": "POST",
  "path": "/api/v1/orders",
  "statusCode": 201,
  "duration": 125,
  "message": "Order created successfully",
  "metadata": {
    "orderId": "order-uuid",
    "amount": 150000
  }
}
```

---

## 10. Deployment

### 10.1 Kubernetes Configuration

```yaml
# Deployment example
apiVersion: apps/v1
kind: Deployment
metadata:
  name: user-service
  namespace: tokobapak
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      app: user-service
  template:
    metadata:
      labels:
        app: user-service
    spec:
      containers:
        - name: user-service
          image: tokobapak/user-service:v1.0.0
          ports:
            - containerPort: 8080
          resources:
            requests:
              cpu: "250m"
              memory: "512Mi"
            limits:
              cpu: "1000m"
              memory: "1Gi"
          livenessProbe:
            httpGet:
              path: /health/live
              port: 8080
            initialDelaySeconds: 30
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /health/ready
              port: 8080
            initialDelaySeconds: 5
            periodSeconds: 5
          env:
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: user-service-secrets
                  key: database-url
```

### 10.2 CI/CD Pipeline

```yaml
# GitHub Actions workflow
name: Deploy Service

on:
  push:
    branches: [main]
    paths:
      - 'backend/services/user-service/**'

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Run tests
        run: |
          cd backend/services/user-service
          ./mvnw test
          
      - name: Build Docker image
        run: |
          docker build -t tokobapak/user-service:${{ github.sha }} .
          
      - name: Push to registry
        run: |
          docker push tokobapak/user-service:${{ github.sha }}
          
      - name: Deploy to Kubernetes
        run: |
          kubectl set image deployment/user-service \
            user-service=tokobapak/user-service:${{ github.sha }}
```

---

## 11. Performance Requirements

### 11.1 SLA Targets

| Metric | Target | Critical |
|--------|--------|----------|
| Availability | 99.9% | 99.5% |
| Response Time (P50) | < 100ms | < 200ms |
| Response Time (P99) | < 500ms | < 1s |
| Error Rate | < 0.1% | < 1% |
| Throughput | 10,000 RPS | 5,000 RPS |

### 11.2 Capacity Planning

```yaml
# Expected load
traffic:
  peak_rps: 10000
  average_rps: 3000
  peak_concurrent_users: 50000
  average_concurrent_users: 15000
  
# Service scaling
scaling:
  user_service:
    min_replicas: 3
    max_replicas: 20
    target_cpu: 70%
    
  product_service:
    min_replicas: 5
    max_replicas: 30
    target_cpu: 70%
    
  order_service:
    min_replicas: 3
    max_replicas: 15
    target_cpu: 70%
```

---

## 12. Development Timeline

### Phase 1: Foundation (Month 1-2)
- Infrastructure setup (K8s, databases, message queues)
- API Gateway configuration
- Auth Service
- User Service

### Phase 2: Core Services (Month 3-4)
- Product Service
- Catalog Service
- Inventory Service
- Cart Service

### Phase 3: Transaction Services (Month 5-6)
- Order Service
- Payment Service
- Shipping Service
- Notification Service

### Phase 4: Supporting Services (Month 7-8)
- Search Service
- Review Service
- Chat Service
- Media Service

### Phase 5: Intelligence & Polish (Month 9-10)
- Recommendation Service
- Analytics Service
- Performance optimization
- Security audit

---

## 13. Conclusion

PRD ini mendefinisikan arsitektur backend yang:

1. **Scalable** - Microservices dengan Kubernetes
2. **Resilient** - Event-driven, circuit breakers, retries
3. **Secure** - JWT, RBAC, encryption
4. **Observable** - Metrics, logs, traces
5. **Maintainable** - Clean architecture, domain-driven design

### Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Jan 2026 | Backend Team | Initial draft |

---

**Related Documents:**
- [Frontend PRD](../frontend/prd.md)
- [Architecture Documentation](../docs/ARCHITECTURE.md)
- [API Documentation](../docs/API_DOCUMENTATION.md)
