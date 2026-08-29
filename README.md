# 🛒 TokoBapak

<div align="center">

![TokoBapak Logo](./docs/assets/logo.png)

**Platform E-commerce Multi-Vendor Modern untuk Indonesia**

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.x-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Bun](https://img.shields.io/badge/Bun-1.2+-fbf0df?style=for-the-badge&logo=bun)](https://bun.sh/)

[Demo](https://demo.tokobapak.id) • [Dokumentasi](./docs) • [Kontribusi](./CONTRIBUTING.md) • [Changelog](./CHANGELOG.md)

</div>

---

## ✨ Tentang TokoBapak

**TokoBapak** adalah platform marketplace e-commerce modern yang dibangun dengan arsitektur microservices dan teknologi terkini. Platform ini dirancang untuk memberikan pengalaman berbelanja online yang seamless, cepat, dan aman untuk pasar Indonesia.

### 🎯 Key Features

- 🛍️ **Multi-Vendor Marketplace** - Seller dapat membuka toko dan menjual produk
- 🔍 **Advanced Search** - Pencarian cepat dengan Elasticsearch
- 💬 **Real-time Chat** - Komunikasi langsung dengan seller
- 💳 **Multiple Payment Options** - Integrasi dengan berbagai payment gateway Indonesia
- 🚚 **Shipping Integration** - JNE, J&T, SiCepat, GoSend, dan lainnya
- 📱 **Mobile First** - Responsive design untuk semua device
- 🤖 **Smart Recommendations** - ML-powered product recommendations
- 🔐 **Secure** - Enterprise-grade security standards

---

## 🏗️ Arsitektur

![System Architecture](docs/images/system_architecture.png)

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENTS                                   │
│     Web App (Next.js)  │  Mobile (React Native)  │  Admin       │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                    ┌──────────▼──────────┐
                    │    API Gateway      │
                    │    (Kong/Nginx)     │
                    └──────────┬──────────┘
                               │
    ┌──────────────────────────┼──────────────────────────┐
    │ MICROSERVICES            │                          │
    │  ┌─────────┐ ┌─────────┐ │ ┌─────────┐ ┌─────────┐  │
    │  │  User   │ │ Product │ │ │  Order  │ │ Payment │  │
    │  │ Service │ │ Service │ │ │ Service │ │ Service │  │
    │  └────┬────┘ └────┬────┘ │ └────┬────┘ └────┬────┘  │
    │       │           │      │      │           │       │
    │  ┌────┴───────────┴──────┴──────┴───────────┴────┐  │
    │  │              MESSAGE BROKER                    │  │
    │  │                (Kafka)                         │  │
    │  └────────────────────────────────────────────────┘  │
    └─────────────────────────────────────────────────────-┘
                               │
    ┌──────────────────────────┼──────────────────────────┐
    │ DATA LAYER               │                          │
    │  ┌─────────┐ ┌─────────┐ │ ┌─────────┐ ┌─────────┐  │
    │  │PostgreSQL│ │  Redis  │ │ │Elastic- │ │ Object  │  │
    │  │  (RDS)  │ │ Cluster │ │ │ search  │ │ Storage │  │
    │  └─────────┘ └─────────┘ │ └─────────┘ └─────────┘  │
    └─────────────────────────────────────────────────────-┘
```

---

## 🚀 Quick Start

### Prerequisites

- **Bun** >= 1.2.0 ([Install](https://bun.sh/))
- **Node.js** >= 20.0.0 (untuk compatibility)
- **Docker** & **Docker Compose** (untuk local development)

### Installation

```bash
# Clone repository
git clone https://github.com/tokobapak/tokobapak.git
cd tokobapak

# Install dependencies untuk web application
cd frontend/web
bun install

# Copy environment file
cp .env.local.example .env.local

# Jalankan development server
bun dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

### Menjalankan dengan Docker

```bash
# Jalankan semua services (development)
docker-compose -f docker-compose.dev.yml up -d

# Atau hanya backend services
docker-compose up -d postgres redis kafka elasticsearch
```

---

## 📁 Project Structure

```
tokobapak/
├── frontend/                    # Frontend Applications
│   ├── web/                     # 🌐 Next.js Customer Web App
│   ├── mobile/                  # 📱 React Native Mobile App
│   └── admin/                   # 📊 Admin Dashboard
│
├── backend/                     # Backend Microservices (MVP 9 Go 1.27)
│   └── services/               # 9 MVP services per ADR 0001
│       ├── auth-service/       # Go 1.27 chi jwt (3007)
│       ├── user-service/       # Go 1.27 chi pgx (3006)
│       ├── product-service/    # Go 1.27 chi pgx stock (3001)
│       ├── cart-service/       # Go 1.27 chi go-redis (3003)
│       ├── order-service/      # Go 1.27 Saga (3004)
│       ├── payment-service/    # Go 1.27 PayU SNAP-BI (3005)
│       ├── shipping-service/   # Go 1.27 mock (3008)
│       ├── search-service/     # Go 1.27 go-elasticsearch (3010)
│       └── notification-service/ # Go 1.27 kafka (3009)
│
├── infrastructure/             # Infrastructure as Code
│   ├── kubernetes/            # K8s manifests
│   ├── terraform/             # Terraform modules
│   ├── helm/                  # Helm charts
│   └── monitoring/            # Observability
│
├── database/                  # Migrations & Seeds
├── docs/                      # Documentation
├── tests/                     # Integration & E2E Tests
└── scripts/                   # Automation Scripts
```

---

## 💻 Technology Stack

### Frontend — TanStack Start + Vite (ADR 0004)

| Technology | Purpose |
|------------|---------|
| **TanStack Start + Vite 6** `TanStack Router` `TanStack Query` | SSR + file-based routing `src/routes` |
| **TypeScript 5** | Type-safe |
| **Tailwind CSS 4** `shadcn/ui` | UI |
| **Bun 1.2** | Runtime + package manager |
| **BFF** `src/lib/bff.ts` | HttpOnly + CSRF relay |

### Backend — MVP 9 Go 1.27 uniform (ADR 0001/0002)

| Technology | Purpose |
|------------|---------|
| **Go 1.27** `chi` `pgx` `kafka-go` | 9 services uniform hexagonal |
| **PostgreSQL 18** `pgx` | `users, products(stock), orders, payments, shipments` + outbox |
| **Redis** `go-redis` | `cart` HSET TTL 7d |
| **Elasticsearch 8.17** `go-elasticsearch` TypedClient | `search` 1 index `products` |
| **Kafka 4 KRaft** `apache/kafka:4.0.0` | outbox `tokobapak.<domain>.<event>.v1` + `.dlq` |

### Infrastructure — podman m6a.4xlarge local → EKS EC2 + RDS + ElastiCache + Kafka

| Technology | Purpose |
|------------|---------|
| **Podman Compose** `postgres:18` `redis:alpine` `apache/kafka:4.0.0` `elasticsearch:8.17` | local 4 infra + 9 services |
| **Traefik v3.3** | local gateway `:8080` (sim ALB→Traefik) |
| **Kubernetes + Helm + Terraform** | EKS EC2 + RDS t4g.micro + ElastiCache t4g.micro + Kafka self-host |
| **Prometheus + Grafana** | Metrics |
| **ELK Stack** | Centralized logging |

---

## 📖 Documentation

| Document | Description |
|----------|-------------|
| [GEMINI.md](./GEMINI.md) | AI Assistant Guidelines & Context |
| [CHANGELOG.md](./CHANGELOG.md) | Version history |
| [CONTRIBUTING.md](./CONTRIBUTING.md) | Contribution guidelines |
| [docs/ARCHITECTURE.md](./docs/architecture/ARCHITECTURE.md) | System architecture |
| [docs/API_DOCUMENTATION.md](./docs/api/API_DOCUMENTATION.md) | API specifications |
| [frontend/prd.md](./frontend/prd.md) | Frontend PRD |
| [backend/prd.md](./backend/prd.md) | Backend PRD |

---

## 🧪 Testing

```bash
# Frontend - Unit tests
cd frontend/web
bun test

# Frontend - E2E tests
bun test:e2e

# Backend - Java services
cd backend/services/user-service
./mvnw test

# Backend - Node.js services
cd backend/services/product-service
npm run test

# Backend - Go services
cd backend/services/catalog-service
go test ./...
```

---

## 🔧 Development

### Available Scripts

```bash
# Frontend Web
bun dev          # Start development server
bun build        # Production build
bun start        # Start production server
bun lint         # Run ESLint
bun test         # Run tests
bun format       # Format code with Prettier

# Docker
docker-compose up -d                    # Start all services
docker-compose -f docker-compose.dev.yml up -d  # Development mode
docker-compose logs -f [service]        # View logs
docker-compose down                     # Stop all services
```

### Environment Variables

Lihat `.env.example` untuk variabel yang diperlukan:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8080

# Authentication
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/tokobapak

# Redis
REDIS_URL=redis://localhost:6379

# External Services
MIDTRANS_SERVER_KEY=your-midtrans-key
XENDIT_API_KEY=your-xendit-key
```

---

## 🤝 Contributing

Kami menyambut kontribusi dari siapa saja! Silakan baca [CONTRIBUTING.md](./CONTRIBUTING.md) untuk panduan.

1. Fork repository
2. Buat branch fitur (`git checkout -b feature/amazing-feature`)
3. Commit perubahan (`git commit -m 'Add amazing feature'`)
4. Push ke branch (`git push origin feature/amazing-feature`)
5. Buat Pull Request

---

## 📄 License

Distributed under the MIT License. See [LICENSE](./LICENSE) for more information.

---

## 📞 Contact

- **Website:** [tokobapak.id](https://tokobapak.id)
- **Email:** dev@tokobapak.id
- **Twitter:** [@tokobapak](https://twitter.com/tokobapak)

---

<div align="center">

Made with ❤️ by TokoBapak Team

</div>
