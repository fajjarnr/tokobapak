# Changelog

All notable changes to the TokoBapak project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

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
