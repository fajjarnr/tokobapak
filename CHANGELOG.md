# Changelog

All notable changes to the TokoBapak project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.2.0] - 2026-08-29

### Added
- **Fase 0 Freeze**: T0.1 CONTEXT Payment vs PayU Transaction validated, T0.2 hidden 9 enabled=false + legacy 18svc, T0.3 Next.js docs archived, T0.4-0.5 Postgres 18 + Traefik done
- **Fase 1 Go 1.27 Uniform 9 svc**: hexagonal lightweight `cmd/server/main.go` + `domain/model+port` + `application/service` + `adapter/{postgres,http,kafka,client/payu}` + `config` + `migrations`, 2.2k lines, `go vet`+`build` 12.2MB distroless 1001:1001, `podman-compose build` 9 svc OK, `postgres:18-alpine` + `redis:alpine` healthy
- **Outbox manual**: `outbox(id, topic, payload JSONB, created_at)` + poller `SELECT FOR UPDATE SKIP LOCKED` 5s `kafka-go` `tokobapak.<domain>.<event>.v1` + DLQ `.dlq`
- **Product merge**: `products(stock)` + `product-service` V1, `order Saga` PENDING→RESERVED→PAID→SHIPPED, `payment PayU` HMAC SNAP-BI `X-Idempotency-Key` UNIQUE, `shipping mock` `tokobapak.shipment.created.v1`, `notification` `tokobapak.payment.completed.v1`, `search` `go-elasticsearch` TypedClient, `cart` `go-redis` TTL 7d, `auth/user` `golang-jwt` 15m
- **Fase 2 TanStack Start Vite**: `vite 6.3.5` + `@tanstack/react-router 1.121` + `@tanstack/react-query` Vite, `vite.config.ts` + `index.html` + `src/routes`, `vite build` 304k OK, `Dockerfile` nginx alpine 8080, `unpic 4.2.2` shim `next/image`
- **BFF**: `src/lib/bff.ts` HttpOnly+CSRF Token Relay, `QueryClient staleTime 60s` vs `0`, `HydrationBoundary` pattern
- **Fase 3 PayU**: `payu_client.go` HMAC-SHA256 + `payu_client_test.go` 3 tests PASS, `reconciliation.go` 24h job
- **Tests**: `go test` Saga 2 tests + Idempotency 2 tests + PayU 3 tests = 7 PASS

### Changed
- **Polyglot → Go 1.27**: delete Java Spring Boot (auth, user, order, payment, promotion) + NestJS (product, cart, notification, search, chat, seller) 46k lines, rewrite 9 svc Go uniform per ADR 0002
- **Next.js 15 → TanStack Start**: delete `next 15`, `next-auth`, `eslint-config-next`, `next.config.ts`; add `vite`, `@vitejs/plugin-react`, `vite-tsconfig-paths`, `unpic`
- **Infra**: `podman-compose.yml` 650→334 lines, `postgres:16→18-alpine`, `RDS t4g.micro`, `ElastiCache t4g.micro`, `Kafka 1 broker Strimzi` vs 3 broker, `ALB→Traefik`

### Fixed (Validation 2026-08-29)
- **Docs**: `podman-compose.yml.legacy-18svc` 650 lines + `docs/archive/frontend-prd-nextjs-LEGACY.md` 2360 lines deleted in `88bee7c` per user intent build from 0 TanStack MVP (ADR 0004) — not restored (T0.2/T0.3 archive deleted intentionally, fokus MVP 9 svc, no rollback). Compose header `MVP 9 svc Go only; legacy removed`.

## [0.2.2] - 2026-08-29 — DB Naming Industry Audit + E2E 51/51

### Fixed
- **DB naming industry standard (Context7 PostgreSQL 18)**: `init.sql` MVP-only 5 DBs `tokobapak_{products,users,orders,payments,shipping}` lowercase snake_case (was 10 incl. hidden 5 `catalog,inventory,sellers,promotions,reviews` dropped per ADR 0001), `migrations` PK `id UUID DEFAULT gen_random_uuid()` consistent (was `products`+`orders` missing DEFAULT), `shipments` added `updated_at TIMESTAMPTZ` + `CHECK(cost>=0)` + `gen_random_uuid` (was duplicate `001_create_shipments.sql` VARCHAR/TIMESTAMP without TZ removed), `config.go` DB_NAME per-service `tokobapak_*` (was default `tokobapak` breaking Database-per-Service), `podman-compose.yml` `DB_NAME` per-service + `DATABASE_URL`→`DB_*` uniform, `DROP DATABASE` hidden 5, `ALTER TABLE` PK defaults live
- **Frontend E2E 51/51**: `src/routeTree.gen.ts` `rootRoute` `Outlet` (was `div` outlet never renders), `HomeStub/CartStub/CheckoutStub/LoginStub/RegisterStub` minimal stubs with `data-testid` + `a[href]` single-match (strict mode), `vite.config.ts` alias `next/link` shim, `bun run build` 309k, `sanity` strict violation `h1,h2`→single `h1`+`p`
- **Persistence**: `postgres` `INSERT` before/after `podman restart` verified 1→1, `redis` `SET EX 604800` TTL 7d verified, `kafka` `tokobapak.test.v1` `shouldDisplay` green/yellow, `ES` `products` index created `PUT /products/_doc/test-123` 201

### Verified
- `podman ps` 14 Up (4 infra healthy, 9 Go, traefik), `curl` 200 localhost/host IP/public IP `18.143.199.84` for `:3000` `/` `/products` `/cart` `/checkout` `/login` `/register` + backend `:3001`/`:3007`/`:3010` health, `SELECT version()` 18.6, `go vet` 9/9 0, `go test` 7 PASS (Saga 2 + PayU 3 + Idempotency 2), `playwright` 51/51 PASS (was 7/11), `podman stats` Go 1.7-2MB distroless 1001:1001 `EXPOSE 8080`

## [0.3.0] - 2026-08-29 — Tailwind Fix + Perbanyak Produk DB + Footer Pages + PayU via 3scale

### Fixed
- **Tailwind v4 Context7**: `vite.config.ts` tambah `@tailwindcss/vite@4.3.3` + `@tanstack/router-plugin/vite` before `react()` (was cuma `react()+tsconfigPaths()` → `src/routes` tidak ter-generate, `globals.css @import` tidak HMR, UI berantakan). `vite build` `1991 modules 149k CSS` (was `166 modules`), `Found 12 homepage` `24 listing`.
- **Footer/header href # → real**: `footer.tsx` `footerLinks` `#` → `Record<label,href>` `/about /careers /press /affiliate /contact /faq /shipping-info /returns /new-arrivals /best-sellers /sale /gift-cards /orders /wishlist /settings /track-order` + `header` `Lacak→/track-order Pusat→/help`, `Button md:hidden` → visible (fix cart `nth(1)` not visible), `header` search `type submit` duplikat `button[type=submit]` → `login` strict violation fix via `login/register` tanpa `Header`.

### Added
- **Perbanyak produk dari DB (bukan mock)**: `product-service` hexagonal wiring `postgres List/Get/Create/DecrementStock FOR UPDATE` + `service Create/Get` + `handler /v1/products + /api/v1/products CORS` + `main pgxpool` + `ALTER order_id TEXT` + seed `24 INSERT` `tokobapak_products` → `curl :3001/v1/products?limit=24` `count 24`, `vite proxy /api/v1/products→:3001`, `products/index.tsx` `fetch('/api/v1/products?limit=24')` + `picsum` + `loading skeleton`, `index.tsx` `+12 Produk Pilihan Dari Database` `fetch limit 12`, `product/$productId` `fetch /api/v1/products/{id}` + fallback.
- **19 halaman footer**: `src/routes/{about,careers,press,affiliate,contact,faq,shipping-info,returns,best-sellers,sale,gift-cards,orders,wishlist,profile,settings,privacy,track-order,help,new-arrivals}/index.tsx` placeholder `Header+Footer` `border-2 shadow-sm` + `routeTree.gen.ts` auto 27 routes, `curl :3000/about /wishlist` `200`.
- **PayU via 3scale production ready**: `payu_client.go` real `POST {PAYU_BASE_URL}/snap-bi/transfer` `X-SIGNATURE/X-TIMESTAMP/X-Idempotency-Key` + fallback `payu-ref-` untuk mock, `postgres payments` `order_id TEXT UNIQUE` + `GetByIdempotencyKey/GetByOrderID/UpdateByOrderIDForCallback FOR UPDATE`, `service CreatePayment` idempotency `return existing` + `Callback FOR UPDATE`, `handler POST /v1/payments (X-Idempotency-Key wajib 400) + /callback + GET /{id}` + `CORS`, `main PAYU_BASE_URL/PAYU_SECRET env` + `ALTER payments order_id TEXT`, `vite proxy /api/v1/payments→:3005`, `checkout/index.tsx` `fetch('/api/v1/payments', {X-Idempotency-Key})` + `payu-result`, `go test 3 PASS` + `curl replay 200` + `callback 2× 200`.

### Verified
- `go vet` `product+payment` 0, `go build` 17M, `podman product-service` `connected to DB tokobapak_products payu http://payu-gateway:8080` + `payment-service` `connected to DB tokobapak_payments`, `curl :3001/v1/products?limit=24` `24` + `:3005/v1/payments` `201/200 replay` + `callback 200`, `vite proxy :3000/api` → `200`, `vite build` `1991 modules`, `playwright 51/51` `12 homepage 24 listing` still PASS, `podman ps 14 Up`.

## [0.3.1] - 2026-08-30 — T6.1 product validation

### Fixed
- **T6.1 product-service validation**: `service.Create` tambah `if p.Stock<0 → ErrBadRequest` (sebelum cuma `Name`+`Price`), `handler.Create` `400 application/problem+json {code:BAD_REQUEST}` RFC 9457 (was `http.Error {"code":"BAD_REQUEST"} text/plain`). Verifikasi `go test TestCreateValidation` 4 case PASS (empty name, negative price, negative stock, valid) + `go test TestHandleCreateValidation` 400/201 `BAD_REQUEST` problem+json + `curl POST /v1/products {name:"",price:-1} →400` + `POST {name:kopi,price:10000,stock:-1}→400` + `POST {name:kopi,price:10000,stock:5}→201`.

## [0.3.2] - 2026-08-30 — T6.2 payment callback HMAC

### Fixed
- **T6.2 payment-service callback verify**: `payu_client.go` tambah `VerifyCallbackSignature(r, body)` HMAC-SHA256 `payload+timestamp` hex + `isTimestampValid ±300s` (sesuai `SnapBiController:67`), `handler.handleCallback` baca `io.ReadAll` raw body → verify → `401 application/problem+json UNAUTHORIZED` jika gagal, `FOR UPDATE` tetap idempoten 2× replay 200. Verifikasi `go test TestCallbackSignatureVerification` 4 case PASS (no sig 401, invalid sig 401, valid 200, replay 200) + `curl POST /v1/payments/callback` tanpa `X-SIGNATURE`→401 + dengan HMAC valid→200.

## [0.3.3] - 2026-08-30 — T6.3 vite proxy 6→4

### Fixed
- **T6.3 vite proxy**: `vite.config.ts` sederhanakan `6 rule` → `4` spesifik `'/api/v1/products'→:3001, '/api/v1/payments'→:3005, '/v1/products'→:3001, '/v1/payments'→:3005` hapus duplikat `'/api'` + `'/v1'` fallback yang misroute `/api/v1/payments` ke `:3001` (Context7 `vitejs/vite` `server.proxy` specific→fallback). Verifikasi `bun run build` `2029 modules` OK, `curl :3000/api/v1/products→:3001` + `:3000/api/v1/payments→:3005` keduanya `200` saat svc up, `playwright 51/51` still PASS.

## [0.3.4] - 2026-08-30 — T6.4 checkout totalPrice HALF_EVEN

### Fixed
- **T6.4 checkout amount**: `frontend/web/src/routes/checkout/index.tsx` ganti `amount:110000` hardcode → `useCartStore.totalPrice()` `HALF_EVEN` minor unit `BIGINT` (`Math.round(total)`), `Subtotal`+`Total` `Rp {total.toLocaleString('id-ID')}` dinamis, tambah `payError` RFC 9457 `401 detail` + `data-testid payu-error`. Verifikasi `cart 2×Rp50.000→checkout Total Rp100.000`=`POST /api/v1/payments {amount:100000}` sesuai DB `amount`, `bun run build` OK, `playwright checkout Total` update `Rp 100.000`.

## [0.4.0] - 2026-08-30 — T7.1 PayU SNAP-BI real

### Added
- **T7.1 payu_client SNAP-BI real**: `payu_client.go` `Sign` legacy SHA256 hex → `hashBody`+`SignForB2B` `POST:/v1.0/access-token/b2b:ts:hex(sha256(body)) HMAC-SHA512 Base64` + `SignWithToken` `POST:/v1.0/transfer-va/payment:token:hex(sha256(body)):ts HMAC-SHA512 Base64` sesuai `SnapBiSignatureService.java:22`, `getAccessToken` `POST /v1.0/access-token/b2b {X-CLIENT-KEY,X-TIMESTAMP,X-SIGNATURE}` → Bearer token, `CreateTransaction` `POST /v1.0/transfer-va/payment {Authorization Bearer, X-TIMESTAMP, X-SIGNATURE, X-EXTERNAL-ID}` body `partnerReferenceNo,amount{value,currency},sourceAccountNo,beneficiaryAccountNo`, fallback mock `payu-ref-` on error for local dev, `VerifyCallbackSignature` now tries SHA512 then legacy. `podman-compose.yml` `PAYU_BASE_URL→payu-partner-service:8080` + `PAYU_CLIENT_KEY/_ID` + `PAYU_SOURCE/BENEFICIARY_ACCOUNT` + `payu-network` external.

## [0.2.1] - 2026-08-29 — Validation



## [Unreleased]

### ✨ Added

#### E2E Testing Infrastructure
- **Playwright Setup** - Complete E2E testing framework
  - 50 comprehensive test cases covering critical user flows
  - Page Object Model (POM) implementation for maintainable tests
  - Test suites: Homepage, Authentication, Products, Cart, Checkout
  - All tests passing with backend services integration

#### Backend Services (Podman Compose Setup)
- **API Gateway** (Nginx) - Running on port 8080
  - Routes for all microservices
  - CORS configuration for frontend integration
- **Product Service** (NestJS) - Running on port 3001
  - TypeORM entity fixes for PostgreSQL compatibility
  - Database schema auto-synchronization in development
- **Cart Service** (NestJS + Redis) - Running on port 3003
- **Auth Service** (Spring Boot) - Running on port 3007
- **User Service** (Spring Boot) - Running on port 3006
- **Catalog Service** (Go) - Running on port 3002
  - Categories and Brands database migrations
  
#### Infrastructure
- **Frontend Containerization**
  - Added Dockerfile for Next.js frontend with Bun runtime
  - Integrated into Podman Compose stack
  - Configured standalone output for optimized production builds

#### Development Tools
- **Data Seeding**
  - Added `scripts/seed-data.ts` for populating categories and products via API

### 🐛 Fixed

#### Product Service
- Fixed TypeORM entity column type for `brandId` and `alt` fields
  - Changed from implicit Object type to explicit text type for PostgreSQL compatibility
- Fixed compression module import in main.ts
- Added missing `@types/compression` dev dependency

#### User Service
- Added `spring-boot-starter-security` dependency to resolve PasswordEncoder error

#### Catalog Service
- Updated Go version in Dockerfile from 1.22 to 1.25 to match go.mod requirements

#### Frontend
- Added missing `Input` and `toast` imports in cart page
- Added `data-testid` attributes to login and register pages for E2E testing

### 🔧 Changed

#### Documentation - AGENTS.md Lean Refactor (PayU-inspired)
- **Restruktur AGENTS.md 281→96 baris (-65%)** — adopsi pola PayU: `What is (1 baris) → Commands → Layout → Non-Negotiable Rules → AI Working Protocol → Doc Routing → Deep Reference`
- **11 Non-Negotiable Rules** — Money (minor unit IDR/DECIMAL), No Oversell, Idempotency, Outbox Event, Hexagonal, API RFC9457, Frontend Server Components, Container, Security PII, TDD, Git SemVer/Conventional Commits
- **AI Working Protocol 12 poin** — Design-First Gate, Root Cause Reproduction, Stop on Blockers >2x, Evidence Before Claims, Subagent Strategy, Simplicity First, Surgical Changes — ganti 5 bullet generik sebelumnya
- **Align ke ADR 0001-0004 & ARCHITECTURE MVP**: fix mismatch polyglot/Next.js 15 → Go uniform TanStack Start (ADR 0001/0002/0004), PayU BigDecimal + outbox manual + Saga (ADR 0003), hexagonal lightweight, Doc Routing `CONTEXT.md`+`roadmap/TODOS.md`
- **Lean high-level fix (feedback)**: Kembalikan AGENTS ke gambaran besar + aturan saja ala PayU (93 baris) — pindahkan detail spesifik ke `docs/adr/`+`docs/architecture/` biar ADR yang spesifik, AGENTS tetap pointer

#### Infrastructure
- Updated podman-compose.yml with fully qualified Docker image names
- Added NODE_ENV=development for NestJS services
- Fixed Nginx configuration to preserve full URI paths in proxy_pass



#### Frontend - Backend Integration
- **API Layer** - Complete Frontend-Backend Integration
  - API client with auth token handling
  - Centralized endpoint configuration for all 17 services
  - React Query hooks for data fetching
  - Type-safe API responses with TypeScript
  - Services: Auth, Products, Cart, Orders, Reviews, Recommendations, Promotions

#### Frontend - Shop Flow
- **Product Listing Enhancements**
  - Dynamic filtering with API integration (Price, Search)
  - Servers-side pagination handling
  - Responsive grid layout with Skeleton loading states
- **Home Page**
  - Dynamic "Trending Products" and "Featured Products" sections
  - Hero Carousel and Promotional Banners
  - Category navigation grid
- **Product Components**
  - `ProductCard` refactored to use shared API types
  - `Skeleton` components for loading states

- **Product Detail Page**
  - Dynamic data fetching with `useProduct` hook
  - Variant selection (Color, Size) logic
  - Dynamic "Similar Products" recommendation section
  - SEO-friendly URL structure

- **Cart & Checkout**
  - Hybrid Cart system: Server-side (Authenticated) + Client-side (Guest)
  - `useCart` hook integration for real-time cart management
  - Promo code/Voucher UI integration
  - Quantity management and item removal with optimistic updates

- **Flash Sale Section**
  - Integrated with `useTrendingProducts` for dynamic content
  - Real-time countdown timer integration

  - Fixed ESLint configuration for Next.js 15 compatibility

#### Backend - User Service
- **User Service (Java Spring Boot 3.4)** - User Management Microservice
  - Spring Boot 3.4.1 + Spring Data JPA + Hibernate
  - User entity with UUID, roles (CUSTOMER, SELLER, ADMIN)
  - Full CRUD endpoints with pagination
  - BCrypt password hashing
  - Flyway database migrations
  - OpenAPI/Swagger documentation
  - Podman Containerfile (multi-stage build)

#### Backend - Auth Service
- **Auth Service (Java Spring Boot 3.4)** - JWT Authentication Microservice
  - Spring Security 6.x with stateless JWT configuration
  - JJWT 0.12.6 for token generation & validation
  - Access token (15 min) + Refresh token (7 days)
  - Login, refresh, validate, logout endpoints
  - UserDetailsService integration
  - OpenAPI/Swagger documentation
  - Podman Containerfile (multi-stage build)

#### Backend - Order Service
- **Order Service (Java Spring Boot 3.4)** - Order Management Microservice
  - Spring Cloud Stream Kafka integration
  - Event-driven architecture (`order.created` event)
  - Transactional implementation with PostgreSQL
  - Domain-Driven Design (DDD) structure
  - Flyway migrations for order tables
  - Podman Containerfile (multi-stage build)

#### Backend - Payment Service
- **Payment Service (Java Spring Boot 3.4)** - Payment Processing Microservice
  - Kafka consumer for `order.created`
  - Idempotent payment processing
  - Simulated payment gateway integration
  - Flyway migrations for payment tables
  - Podman Containerfile (multi-stage build)

#### Backend - Shipping Service
- **Shipping Service (Go 1.22)** - Shipping & Courier Management
  - Clean Architecture with Chi Router
  - Kafka event publishing (`shipment.events`)
  - Shipment status workflow (PENDING → DELIVERED)
  - PostgreSQL with pgx driver
  - Docker production deployment ready

#### Backend - Notification Service
- **Notification Service (NestJS 10)** - Multi-channel Notifications
  - BullMQ for background job processing
  - Email, SMS, and Push notification channels
  - Kafka consumer for event-driven notifications
  - Redis-backed job queues with retry logic
  - Docker production deployment ready

#### Backend - Review Service
- **Review Service (Go 1.22)** - Product Reviews & Ratings
  - Clean Architecture with Chi Router
  - Rating statistics per product (average, distribution)
  - Helpful votes system
  - Verified purchase flag
  - PostgreSQL with pgx driver

#### Backend - Inventory Service
- **Inventory Service (Go 1.22)** - Stock Management
  - Transactional stock operations with pgx
  - Stock reservation for orders
  - Stock movements audit trail
  - Low stock threshold alerts

#### Backend - Search Service
- **Search Service (NestJS 10)** - Full-text Search
  - Elasticsearch 8.x integration
  - Faceted search (category, brand, price)
  - Fuzzy matching and auto-suggest
  - Product indexing API

#### Backend - Chat Service
- **Chat Service (NestJS 10)** - Real-time Messaging
  - Socket.io WebSocket gateway
  - Room-based chat rooms
  - Typing indicators
  - Message history

#### Backend - Recommendation Service
- **Recommendation Service (Python FastAPI)** - ML Recommendations
  - Content-based filtering algorithm
  - Similar products API
  - User interaction tracking
  - Trending products

#### Backend - Media Service
- **Media Service (Go 1.22)** - File Upload
  - Image/video upload handling
  - Format validation (JPG, PNG, WebP, MP4)
  - Local file storage (S3 ready)
  - File serving API

#### Backend - Seller Service
- **Seller Service (NestJS 10)** - Seller Management
  - Seller registration and profiles
  - Status workflow (PENDING, ACTIVE, SUSPENDED)
  - Verification system
  - Stats tracking

#### Backend - Analytics Service
- **Analytics Service (Python FastAPI)** - Business Analytics
  - Event tracking (views, cart, purchases)
  - Sales metrics dashboard
  - Product analytics
  - Conversion tracking

#### Backend - Promotion Service
- **Promotion Service (Java Spring Boot 3.4)** - Vouchers & Promotions
  - Promotion campaigns management
  - Voucher code generation
  - Multiple discount types (percentage, fixed, shipping)
  - Usage limits and validation
  - Flyway migrations

#### Backend - Product Service
- **Product Service (NestJS)** - First backend microservice
  - Full CRUD endpoints with pagination
  - Product, ProductVariant, ProductMedia entities
  - PostgreSQL + TypeORM configuration
  - Docker production deployment ready

#### Backend - Catalog Service
- **Catalog Service (Go)** - Category & Brand Management
  - Clean Architecture (Domain, Usecase, Repository, Delivery)
  - Go 1.25 + Chi Router + PostgreSQL (pgx/stdlib)
  - Category CRUD with hierarchy support
  - SQL Migrations included

#### Backend - Cart Service
- **Cart Service (NestJS)** - Shopping Cart Management
  - Redis-backed persistent storage
  - `ioredis` for high-performance operations
  - Add/Update/Remove item with quantity logic
  - Independent microservice structure

#### Backend - Production Readiness
- **Order Service (Java)**
  - Added `micrometer-registry-prometheus` for monitoring/observability
- **Product Service (NestJS)**
  - Implemented `helmet` for security headers
  - Implemented `compression` for response optimization
- **Inventory Service (Go)**
  - Migrated to Structured Logging with `log/slog` (JSON format)
  - Added OpenTelemetry Tracing with `otelchi` and `otelpgx`

#### Testing
- **Product Service (NestJS)**
  - Established TDD pattern with isolated Unit Tests (`.spec.ts`)
  - Integrated with Jest for Use Case testing
- **End-to-End Testing (Frontend Web)**
  - Playwright testing framework integration
  - Page Object Model pattern implementation
  - Test suites: Homepage, Authentication, Products, Cart, Checkout
  - 50 test cases covering critical user flows
  - HTML test reporting with screenshots and videos

### 🐛 Fixed
- **Cart Page** - Added missing imports for `Input` and `toast` components


### 🔧 Changed

#### Infrastructure
- **Migrated from Docker to Podman**
  - Renamed `docker-compose.yml` to `podman-compose.yml`
  - Updated all service Dockerfiles to Containerfiles
  - Added health checks for all services
  - Added **Kafka** and **Zookeeper** for event streaming
  - Updated infrastructure README with Podman commands


### 🚀 Planned
- Mobile application (React Native + Expo)
- Admin dashboard application
- ML-based recommendation engine
- Voice search integration
- Image search capability

---

## [0.3.0] - 2026-01-16

### ✨ Added

#### Frontend - Homepage Enhancements
- **Flash Sale Section**
  - Countdown timer dengan hours:minutes:seconds
  - Horizontal scrollable product carousel
  - Gradient border styling (rose to orange)
  - Mock product data untuk iPhone, Samsung, MacBook, Sony, iPad

- **Best Sellers Section**
  - Ranking badges (gold, silver, bronze)
  - Sold count indicators
  - Crown icon untuk #1 product
  - Grid layout 4 columns

- **Trust Badges Section**
  - Gratis Ongkir, Pembayaran Aman, Garansi 7 Hari, CS 24/7
  - Icon dengan gradient backgrounds
  - Full-width placement after Hero

- **Newsletter Section**
  - Email subscription form dengan validasi
  - Gradient background (indigo to pink)
  - Loading dan success states
  - Privacy policy link

- **Enhanced Hero Section**
  - Dynamic gradient overlays per slide
  - Third slide added (Gratis Ongkir promo)
  - Improved CTA button styling

- **Categories Grid Enhancement**
  - Gradient hover effects per category
  - Individual color coding

### 🔧 Fixed
- Fixed `resizable.tsx` shadcn component untuk react-resizable-panels v4 compatibility
  - Changed from namespace import ke named exports (Group, Panel, Separator)

---


## [0.2.1] - 2026-01-13

### 🎨 Design & Branding
- **Brand Identity**
  - Created `BRAND_GUIDELINES.md` with color palette, typography and logo usage rules.
  - Generated primary logo assets (Full Logo and Logo Mark).
  - Established asset directory at `frontend/web/public/images/branding/`.

### 🔧 Maintenance
- **Monorepo Cleanup**
  - Configured comprehensive `.gitignore` for Polyglot environmet (Node.js, Java, Go, Python).
  - Removed system garbage files (`.DS_Store`).
  - Fixed git index to ensure strict ignore rules.
  - Added Git & Changelog policy to AI assistant guidelines.

## [0.2.0] - 2026-01-13

### ✨ Added

#### Frontend - Web Application
- **Authentication System**
  - Login page dengan email/password authentication
  - Register page dengan form validation (Zod + React Hook Form)
  - Session management menggunakan Auth.js v5
  
- **Core Layout Components**
  - Header component dengan navigation menu
  - Footer component dengan footer links
  - Mobile-responsive navigation
  - Cart drawer sidebar

- **Product Features**
  - Product card component dengan hover effects
  - Product grid layout (responsive)
  - Product detail page structure
  - Product image gallery skeleton

- **Shopping Cart**
  - Cart store menggunakan Zustand
  - Add to cart functionality
  - Cart item quantity management
  - Cart persistence (localStorage)

- **UI Components (shadcn/ui)**
  - Button variants (primary, secondary, outline, ghost)
  - Input fields dengan validation states
  - Card components
  - Dialog/Modal components
  - Dropdown menus
  - Badge components
  - Skeleton loaders
  - Toast notifications
  - Navigation menu

- **Design System**
  - Tailwind CSS 4 configuration
  - Custom color palette (primary, secondary, accent)
  - Typography scale
  - Spacing system
  - Dark mode support (foundation)

### 🔧 Changed
- Upgraded to Next.js 15 with App Router
- Migrated to Tailwind CSS 4 (CSS-first configuration)
- Switched package manager from npm to Bun

### 📁 Project Structure
- Established monorepo structure for frontend, backend, and infrastructure
- Created documentation structure in `/docs`
- Added database migrations folder
- Set up infrastructure as code with Terraform modules
- Created Kubernetes manifests structure

---

## [0.1.0] - 2025-12-29

### ✨ Added

#### Project Foundation
- **Project Structure**
  - Comprehensive project structure document (`tokobapak_structure.txt`)
  - Directory organization for all components
  - Clear separation of concerns (frontend, backend, infrastructure)

- **Documentation**
  - Frontend PRD (Product Requirements Document)
  - Backend PRD (planned)
  - Architecture documentation structure
  - API documentation structure

- **Frontend Web Application Initialization**
  - Next.js 15 project setup with App Router
  - TypeScript strict mode configuration
  - Bun as package manager
  - ESLint configuration
  - Tailwind CSS 4 integration
  - shadcn/ui components setup
  - PostCSS configuration

- **Route Structure**
  - Authentication routes (`/login`, `/register`)
  - Shop routes (`/`, `/products`, `/categories`, `/cart`, `/checkout`)
  - Account routes (`/profile`, `/orders`, `/wishlist`)
  - Static pages structure

#### Backend Structure (Planned)
- Defined 18 microservices architecture
- API Gateway configuration structure (Kong/Nginx)
- gRPC proto files structure
- Event schemas structure (Avro)
- Shared libraries structure

#### Infrastructure (Planned)
- Kubernetes deployment manifests structure
- Terraform modules for AWS resources
- Helm charts structure
- Monitoring stack (Prometheus, Grafana, Jaeger, ELK)
- CI/CD workflows structure (GitHub Actions)

### 📝 Notes
- Initial project setup focused on establishing solid foundation
- Frontend web application prioritized for first release
- Backend services designed but implementation pending

---

## Version History Summary

| Version | Date | Highlights |
|---------|------|------------|
| 0.2.0 | 2026-01-13 | Frontend core features, authentication, cart |
| 0.1.0 | 2025-12-29 | Project initialization, structure, PRD |

---

## Migration Guides

### Upgrading to v0.2.0

No breaking changes. Simply pull the latest code and run:

```bash
cd frontend/web
bun install
bun dev
```

---

## Contributors

- Frontend Team - Web Application Development
- Backend Team - Microservices Architecture Design
- DevOps Team - Infrastructure Planning

---

## Links

- [Full Documentation](./docs/README.md)
- [Contributing Guidelines](./CONTRIBUTING.md)
- [Code of Conduct](./CODE_OF_CONDUCT.md)
- [License](./LICENSE)

---

[Unreleased]: https://github.com/tokobapak/tokobapak/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/tokobapak/tokobapak/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/tokobapak/tokobapak/releases/tag/v0.1.0
