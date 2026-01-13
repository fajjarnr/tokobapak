# GEMINI.md - TokoBapak E-commerce Platform

> AI Assistant Guidelines & Project Context for Gemini/Claude

---

## 📋 Project Overview

**TokoBapak** adalah platform e-commerce multi-vendor modern yang dibangun dengan arsitektur microservices. Platform ini menyediakan pengalaman berbelanja online yang komprehensif untuk pasar Indonesia.

### Quick Facts

| Attribute | Value |
|-----------|-------|
| **Project Name** | TokoBapak |
| **Type** | Multi-vendor E-commerce Marketplace |
| **Architecture** | Microservices + Event-Driven |
| **Primary Languages** | TypeScript, Java, Go, Python |
| **Last Updated** | January 2026 |

---

## 🏗️ Architecture Overview

### Frontend Applications

| Application | Technology | Path | Status |
|-------------|------------|------|--------|
| **Web (Customer)** | Next.js 15, Tailwind CSS 4, shadcn/ui | `/frontend/web` | Active |
| **Mobile** | React Native + Expo | `/frontend/mobile` | Planned |
| **Admin Dashboard** | Next.js 15, Tailwind CSS 4 | `/frontend/admin` | Planned |

### Backend Services

| Service | Technology | Purpose |
|---------|------------|---------|
| **user-service** | Java (Spring Boot) | User management & authentication |
| **auth-service** | Java (Spring Boot) | JWT & OAuth authentication |
| **product-service** | NestJS | Product catalog management |
| **catalog-service** | Go | Categories, brands, attributes |
| **inventory-service** | Go | Stock management |
| **cart-service** | NestJS + Redis | Shopping cart operations |
| **order-service** | Java (Spring Boot) | Order processing |
| **payment-service** | Java (Spring Boot) | Payment gateway integration |
| **shipping-service** | Go | Shipping & courier integration |
| **notification-service** | NestJS + Bull Queue | Email, SMS, Push notifications |
| **search-service** | NestJS + Elasticsearch | Full-text search |
| **review-service** | Go | Product reviews & ratings |
| **chat-service** | NestJS + Socket.io | Real-time messaging |
| **recommendation-service** | Python (FastAPI) | ML-based recommendations |
| **analytics-service** | Python (FastAPI) | Business analytics |
| **promotion-service** | Java (Spring Boot) | Vouchers & promotions |
| **seller-service** | NestJS | Seller management |
| **media-service** | Go | Image/video processing |

### Infrastructure

| Component | Technology |
|-----------|------------|
| **Orchestration** | Kubernetes (EKS/EKS Anywhere) |
| **API Gateway** | Kong / Nginx |
| **Message Queue** | Apache Kafka, RabbitMQ |
| **Cache** | Redis Cluster |
| **Search Engine** | Elasticsearch |
| **Database** | PostgreSQL, MongoDB |
| **Object Storage** | SeaweedFS, Cloudflare R2, S3 |
| **Monitoring** | Prometheus, Grafana, Jaeger, ELK |
| **IaC** | Terraform, Helm |

---

## 📁 Project Structure

```
tokobapak/
├── frontend/                    # Frontend Applications
│   ├── web/                     # Next.js 15 Customer Web App
│   ├── mobile/                  # React Native Mobile App
│   └── admin/                   # Admin Dashboard
│
├── backend/                     # Backend Microservices
│   ├── api-gateway/            # Kong/Nginx Gateway
│   ├── services/               # All Microservices
│   │   ├── user-service/       # Java - Spring Boot
│   │   ├── auth-service/       # Java - Spring Boot
│   │   ├── product-service/    # NestJS
│   │   ├── catalog-service/    # Go
│   │   ├── inventory-service/  # Go
│   │   ├── cart-service/       # NestJS + Redis
│   │   ├── order-service/      # Java
│   │   ├── payment-service/    # Java
│   │   ├── shipping-service/   # Go
│   │   ├── notification-service/ # NestJS
│   │   ├── search-service/     # NestJS + Elasticsearch
│   │   ├── review-service/     # Go
│   │   ├── chat-service/       # NestJS + Socket.io
│   │   ├── recommendation-service/ # Python FastAPI
│   │   ├── analytics-service/  # Python FastAPI
│   │   ├── promotion-service/  # Java
│   │   ├── seller-service/     # NestJS
│   │   └── media-service/      # Go
│   └── shared/                 # Shared Libraries & Schemas
│
├── infrastructure/             # Infrastructure as Code
│   ├── kubernetes/            # K8s manifests
│   ├── terraform/             # Terraform modules
│   ├── helm/                  # Helm charts
│   └── monitoring/            # Observability configs
│
├── database/                  # Database Migrations & Seeds
├── message-queue/             # Kafka & RabbitMQ configs
├── cache/                     # Redis configurations
├── search/                    # Elasticsearch configs
├── storage/                   # Object storage configs
├── tests/                     # Integration & E2E tests
├── scripts/                   # Automation scripts
├── tools/                     # Development tools
├── docs/                      # Documentation
└── .github/                   # CI/CD Workflows
```

---

## 🛠️ Development Guidelines

### Frontend (Web Application)

**Technology Stack:**
- **Runtime:** Bun 1.2+
- **Framework:** Next.js 15 (App Router)
- **Styling:** Tailwind CSS 4
- **UI Components:** shadcn/ui (Radix primitives)
- **State Management:** Zustand 5
- **Data Fetching:** TanStack Query 5
- **Forms:** React Hook Form + Zod
- **Icons:** Lucide React

**Commands:**
```bash
cd frontend/web
bun install           # Install dependencies
bun dev               # Start development server
bun build             # Production build
bun test              # Run tests
bun lint              # Lint code
```

**Key Conventions:**
- Gunakan App Router (bukan Pages Router)
- Semua komponen di `components/` menggunakan shadcn/ui
- State management menggunakan Zustand stores
- Forms menggunakan React Hook Form dengan Zod validation
- API calls menggunakan TanStack Query

### Backend Services

**Java Services (Spring Boot):**
```bash
cd backend/services/user-service
./mvnw spring-boot:run    # Development
./mvnw clean package      # Build
```

**Node.js Services (NestJS):**
```bash
cd backend/services/product-service
npm install
npm run start:dev         # Development
npm run build             # Build
```

**Go Services:**
```bash
cd backend/services/catalog-service
go mod download
go run cmd/server/main.go  # Development
go build -o bin/server cmd/server/main.go  # Build
```

**Python Services (FastAPI):**
```bash
cd backend/services/recommendation-service
pip install -r requirements.txt
uvicorn app.main:app --reload  # Development
```

---

## 📚 Context7 Integration

Untuk mendapatkan dokumentasi terbaru, gunakan Context7 MCP untuk library berikut:

### Recommended Libraries for Context7

| Library | Context7 ID | Use Case |
|---------|-------------|----------|
| **Next.js** | `/vercel/next.js` | App Router, SSR, ISR |
| **Next.js Commerce** | `/vercel/commerce` | E-commerce patterns |
| **React** | `/facebook/react` | React patterns |
| **Tailwind CSS** | `/tailwindlabs/tailwindcss` | Styling utilities |
| **TypeScript** | `/microsoft/typescript` | Type definitions |
| **NestJS** | `/nestjs/nest` | Backend services |
| **Spring Boot** | `/spring-projects/spring-boot` | Java services |

### How to Query

```
# Untuk Next.js e-commerce patterns
Context7 Library: /vercel/next.js
Query: "App Router e-commerce product page with ISR"

# Untuk shadcn/ui components
Context7 Library: /shadcn-ui/ui
Query: "Dialog component with form validation"
```

---

## 🎯 AI Assistant Instructions

### When Working on Frontend

1. **Selalu gunakan App Router** - Jangan gunakan Pages Router
2. **Komponen menggunakan shadcn/ui** - Install via `bunx shadcn@latest add [component]`
3. **Styling dengan Tailwind CSS 4** - Gunakan CSS-first configuration
4. **TypeScript strict mode** - Semua file harus typed
5. **Use Server Components by default** - Client components hanya jika perlu interactivity

### When Working on Backend

1. **Follow Clean Architecture** - Hexagonal/Ports & Adapters pattern
2. **Event-Driven Communication** - Gunakan Kafka untuk inter-service events
3. **API Versioning** - Semua API harus versioned (`/v1/`, `/v2/`)
4. **Database Migrations** - Gunakan Flyway (Java) atau native migrations

### Code Style

- **Naming:** camelCase untuk variables/functions, PascalCase untuk components/classes
- **File naming:** kebab-case untuk files
- **Imports:** Absolute imports menggunakan `@/` alias
- **Error Handling:** Always handle errors properly dengan proper logging

### Documentation Standards

- Semua public API harus didokumentasikan dengan OpenAPI/Swagger
- Setiap service harus memiliki README.md
- Gunakan JSDoc/TSDoc untuk public functions
- Maintain ADR (Architecture Decision Records) di `docs/architecture/ADR/`

---

## 🔗 Related Resources

| Resource | Path |
|----------|------|
| Project Structure | `tokobapak_structure.txt` |
| Frontend PRD | `frontend/prd.md` |
| Backend PRD | `backend/prd.md` |
| Architecture | `docs/architecture/ARCHITECTURE.md` |
| API Docs | `docs/api/API_DOCUMENTATION.md` |
| Changelog | `CHANGELOG.md` |
| Contributing | `CONTRIBUTING.md` |

---

## 📞 Support

- **Frontend Issues:** frontend-team@tokobapak.id
- **Backend Issues:** backend-team@tokobapak.id
- **Infrastructure:** devops-team@tokobapak.id

---

*Last Updated: January 2026*
