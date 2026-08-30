# 🛒 TokoBapak

<div align="center">

**Marketplace MVP untuk Indonesia — Browse → Search → Keranjang → Checkout → Bayar (via PayU) → Kirim → Notifikasi**

[![TanStack Start](https://img.shields.io/badge/TanStack_Start-1.121-black?style=for-the-badge)](https://tanstack.com/start)
[![Go](https://img.shields.io/badge/Go-1.27-00ADD8?style=for-the-badge&logo=go)](https://go.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.x-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Bun](https://img.shields.io/badge/Bun-1.2+-fbf0df?style=for-the-badge&logo=bun)](https://bun.sh/)

[Dokumentasi](./docs) • [PRD](./docs/product/PRD.md) • [Arsitektur](./docs/architecture/ARCHITECTURE.md) • [Changelog](./CHANGELOG.md)

</div>

---

## ✨ Tentang

**TokoBapak** adalah marketplace yang di-freeze MVP 26 Aug 2026 (ADR 0001–0004): **9 service Go 1.27 keep**, **9 service hide 1 bulan validasi**. Frontend **TanStack Start + Vite** (bukan Next.js). Pembayaran satu-satunya via **PayU SNAP-BI** — TokoBapak `payment-service` hanya thin adapter, sumber kebenaran dana ada di PayU `transaction-service`.

> `CONTEXT.md` adalah glossary tunggal. `seller` = `users.role=SELLER`, `inventory` = kolom `products.stock`, `shipment` = mock flat (bukan RajaOngkir), `payment` ≠ PayU `Transaction`.

### 🎯 MVP Scope (9 keep / 9 hide)

**Keep 9** — `auth :3007`, `user :3006`, `product :3001` (merge catalog+inventory), `cart :3003`, `order :3004` (Saga), `payment :3005` (PayU), `shipping :3008` (mock), `search :3010` (ES 1 index `products`), `notification :3009`.

**Hide 9 (deleted 29 Aug 2026)** — `review, chat, media, promotion, seller standalone, recommendation, analytics, catalog standalone, inventory standalone` — lihat `docs/roadmap/SERVICES.md`.

Journey: `Browse (/) → Search (ES) → Cart (Redis HSET TTL 7d) → Order Saga PENDING→RESERVED→PAID→SHIPPED → Payment PayU SNAP-BI → Shipping flat → Notification (Kafka tokobapak.payment.completed.v1)`

---

## 🏗️ Arsitektur MVP

```
┌─────────────────────────────────────────────────────────────────────────┐
│  CLIENT  TanStack Start + Vite :3000  (BFF src/lib/bff.ts HttpOnly+CSRF)│
└──────────────────────────────┬──────────────────────────────────────────┘
                               │  HTTPS
                    ┌──────────▼──────────┐
                    │  Traefik v3.3 :8080 │  local: podman  cloud: ALB→Traefik
                    └──────────┬──────────┘
                               │
         ┌─────────────────────┼─────────────────────┐
         │                     │                     │
┌────────▼────────┐   ┌────────▼────────┐   ┌────────▼────────┐
│  Auth Cluster   │   │  Core Services  │   │ Support Services│
│  auth :3007     │   │ product :3001   │   │ search :3010    │
│  user :3006     │   │ cart :3003      │   │ notification:3009│
│  JWT 15m +      │   │ order :3004     │   │ shipping :3008  │
│  refresh HttpOnly│  │ payment :3005 ──┼──►│  PayU SNAP-BI   │
└────────┬────────┘   └────────┬────────┘   └────────┬────────┘
         │                     │                     │
         └─────────────────────┼─────────────────────┘
                               │
         ┌─────────────────────┼─────────────────────┐
         │                     │                     │
┌────────▼────────┐   ┌────────▼───────┐   ┌────────▼────────┐
│ RDS PostgreSQL  │   │ ElastiCache    │   │ Kafka KRaft     │
│ t4g.micro 5432  │   │ t4g.micro 6379 │   │ apache/kafka:4  │
│ tokobapak_*     │   │ cart HSET      │   │ 1 broker 9092   │
└─────────────────┘   └────────────────┘   └─────────────────┘
         └─────────────────────┼─────────────────────┘
                               ▼
                    ┌─────────────────┐
                    │ Elasticsearch   │
                    │ 8.17.0 :9200    │  1 index `products`
                    └─────────────────┘
Local: postgres:18-alpine / redis:alpine / apache/kafka:4.0.0 / elasticsearch:8.17.0 (podman m6a.4xlarge)
Cloud: EKS EC2 + RDS t4g.micro + ElastiCache t4g.micro + Kafka self-host 1 broker → MSK Serverless
```

Detail: `docs/architecture/ARCHITECTURE.md` + `docs/architecture/SEQUENCE_DIAGRAMS.md`

---

## 🚀 Quick Start

### Prerequisites

- **Bun** >= 1.2.0 + **Node** >= 22
- **Go** 1.27.0
- **Podman** 4+ & **podman-compose** 1.0+

### 1. Infra (4 services)

```bash
cd infrastructure/local
podman compose up -d          # postgres:18, redis, kafka:4 KRaft, elasticsearch:8.17
podman exec tokobapak-postgres psql -U postgres -c "SELECT version();"
podman exec tokobapak-redis redis-cli ping   # PONG
curl http://localhost:9200/_cluster/health | grep -q 'green\|yellow'
```

### 2. Frontend (TanStack Start)

```bash
cd frontend/web
bun install
bun run dev                   # http://localhost:3000  (Vite + TanStack Router)
bun run build                 # vite build → dist/ → nginx:alpine :8080
```

### 3. Backend (satu service)

```bash
cd backend/services/product-service
go run cmd/server/main.go     # :3001
# atau via compose
cd infrastructure/local && podman compose up -d product-service --build
```

Cek health:

```bash
curl http://localhost:3001/health  # product
curl http://localhost:3003/health  # cart
curl http://localhost:3004/health  # order
curl http://localhost:3005/health  # payment
```

---

## 📁 Project Structure

```
tokobapak/
├── frontend/web/                   # TanStack Start + Vite 6 (ADR 0004)
│   ├── src/routes/                 # file-based routing (__root, products, cart, checkout, login)
│   ├── src/lib/bff.ts              # BFF JWT relay HttpOnly + CSRF
│   ├── src/shims/                  # next/image → unpic, next/font → font-sans, next-auth → shim
│   ├── vite.config.ts              # tanstackRouter + tailwindcss + alias next/*
│   ├── Dockerfile                  # bun build → nginx:alpine USER 1001 :8080
│   └── e2e/                        # Playwright checkout.spec.ts
├── backend/services/               # 9 MVP Go 1.27 uniform hexagonal (ADR 0002)
│   ├── auth-service/       :3007   # chi + golang-jwt/jwt (access 15m + refresh HttpOnly)
│   ├── user-service/       :3006   # chi + pgx (users.role SELLER)
│   ├── product-service/    :3001   # chi + pgx + kafka-go (products.stock FOR UPDATE)
│   ├── cart-service/       :3003   # chi + go-redis (HSET cart:{userId} TTL 604800)
│   ├── order-service/      :3004   # chi + pgx Saga PENDING→RESERVED→PAID→SHIPPED
│   ├── payment-service/    :3005   # chi + pgx + PayU SNAP-BI HMAC (X-SIGNATURE/X-TIMESTAMP)
│   ├── shipping-service/   :3008   # chi + pgx mock flat cost
│   ├── search-service/     :3010   # chi + go-elasticsearch TypedClient (index products)
│   └── notification-service/:3009  # chi + kafka-go consumer tokobapak.payment.completed.v1
├── infrastructure/local/
│   ├── podman-compose.yml          # 4 infra + 9 services + traefik:v3.3 :8080
│   └── init.sql
├── docs/
│   ├── adr/                        # 0001 MVP 9-svc, 0002 Go uniform, 0003 PayU SNAP-BI, 0004 TanStack
│   ├── architecture/               # ARCHITECTURE.md + SEQUENCE_DIAGRAMS.md
│   ├── product/                    # PRD.md + FLOW.md + FEATURES.md (single source MVP)
│   ├── roadmap/                    # TODOS.md + SERVICES.md + PROGRESS.md
│   ├── api/STANDARD.md             # RFC 9457 + /v1/plural-kebab
│   └── ENVIRONMENT_VARIABLES.md    # env reference (sebelumnya salah — lihat catatan)
├── CONTEXT.md                      # glossary (Product/Cart/Order/Payment vs PayU Transaction)
└── AGENTS.md                       # non-negotiable rules (money, idempotency, outbox, hexagonal)
```

Hide 9 dihapus permanen `5f58259` — tidak ada `catalog, inventory, seller, review, chat, media, promotion, recommendation, analytics`.

---

## 💻 Technology Stack

### Frontend — TanStack Start + Vite (ADR 0004)

| Technology | Purpose |
|------------|---------|
| **TanStack Start + Router 1.121 + Query 5.90** + **Vite 6.3** | SSR + file-based `src/routes`, `HydrationBoundary` prefetch |
| **React 19.2** + **TypeScript 5** + **Tailwind CSS 4** + **shadcn/ui** | UI (`unpic` shim `next/image`, `font-sans` shim `next/font`) |
| **Bun 1.2** | Runtime + package manager |
| **BFF** `src/lib/bff.ts` | HttpOnly cookie + CSRF, Token Relay server-side (sesuai PayU CONTEXT Browser Session) |

### Backend — 9 Go 1.27 uniform (ADR 0001/0002)

| Technology | Purpose |
|------------|---------|
| **Go 1.27** `chi` `pgx` `kafka-go` `go-redis` `go-elasticsearch` `golang-jwt/jwt` | 9 services hexagonal lightweight |
| **PostgreSQL 18** `pgx` | `tokobapak_{users,products,orders,payments,shipping}` + `outbox` per service |
| **Redis** `go-redis` | `cart:{userId}` HSET TTL 7d (604800), merge `sum` saat login |
| **Elasticsearch 8.17** `go-elasticsearch` TypedClient | 1 index `products` |
| **Kafka 4 KRaft** `apache/kafka:4.0.0` `CLUSTER_ID 4L6g3nShT-eMCtK--X86sw` | outbox `tokobapak.<domain>.<event>.v1` + DLQ `.dlq` (poller `SELECT FOR UPDATE SKIP LOCKED` 5s) |

### Infrastructure — podman m6a.4xlarge local → EKS EC2 + RDS + ElastiCache + Kafka

| Technology | Purpose |
|------------|---------|
| **Podman Compose** `postgres:18-alpine` `redis:alpine` `apache/kafka:4.0.0` `elasticsearch:8.17.0` | local 4 infra + 9 services |
| **Traefik v3.3** `:8080` | local gateway (sim ALB→Traefik), cloud `ALB→Traefik` — migrate→Kong jika butuh 3scale |
| **Kubernetes + Helm + Terraform** | EKS EC2 + RDS t4g.micro + ElastiCache t4g.micro + Kafka self-host 1 broker |
| **Distroless** `gcr.io/distroless/static-debian12:nonroot` `USER 1001:1001` `:8080` | container Go (readOnly FS, drop ALL caps) |
| **Nginx alpine** `USER 1001:1001` `:8080` | frontend `dist/` |

---

## 🔌 Kontrak API & PayU

- **Path versioned** `/v1/...` plural kebab-case, error **RFC 9457** dengan `code` unik — `docs/api/STANDARD.md`
- **Money** `BIGINT` minor unit, `HALF_EVEN`, NEVER `float` — `CHECK (price >= 0)` di `migrations/001_init.sql`
- **Idempotency** `X-Idempotency-Key` wajib di `POST /v1/orders`, `/v1/payments` — `UNIQUE(idempotency_key)` + `SELECT FOR UPDATE`
- **No oversell** `DecrementStock` `SELECT ... FOR UPDATE` di `product-service`
- **Outbox** `outbox(id, topic, payload JSONB, created_at)` + poller `kafka-go` → `tokobapak.<domain>.<event>.v1` + `.dlq` (bukan direct `kafka send`)
- **PayU SNAP-BI** `payment-service` forward `X-Idempotency-Key` + `X-SIGNATURE=HMAC-SHA256(payload+timestamp, secret)` + `X-TIMESTAMP` ke `PAYU_BASE_URL` (default `http://payu-gateway:8080`), simpan `payments(order_id UNIQUE, payu_reference UNIQUE, idempotency_key UNIQUE)` — ADR 0003. Callback idempoten `FOR UPDATE`, replay 2× tetap `200`.

Event:

| Topic | Publisher | Consumer |
|-------|-----------|----------|
| `tokobapak.order.created.v1` | order-service | payment, shipping |
| `tokobapak.payment.completed.v1` | payment-service | notification-service |
| `tokobapak.shipment.created.v1` | shipping-service | notification-service |
| `tokobapak.product.updated.v1` | product-service | search-service |

---

## 📖 Documentation

| Document | Description |
|----------|-------------|
| [CONTEXT.md](./CONTEXT.md) | Glossary MVP (Product/Cart/Order/Payment vs PayU Transaction — baca dulu) |
| [docs/product/PRD.md](./docs/product/PRD.md) | Single source PRD MVP 2.0 (menggabung backend+frontend PRD lama) |
| [docs/product/FLOW.md](./docs/product/FLOW.md) | Journey Browse→Search→Cart→Checkout→Pay→Ship→Notify |
| [docs/architecture/ARCHITECTURE.md](./docs/architecture/ARCHITECTURE.md) | System + microservices + data + event architecture |
| [docs/architecture/SEQUENCE_DIAGRAMS.md](./docs/architecture/SEQUENCE_DIAGRAMS.md) | Sequence Saga & PayU callback |
| [docs/adr/](./docs/adr/) | ADR 0001 MVP 9-svc, 0002 Go uniform, 0003 PayU SNAP-BI, 0004 TanStack Start |
| [docs/roadmap/SERVICES.md](./docs/roadmap/SERVICES.md) | Status 9 keep / 9 hide + ports + health |
| [docs/api/STANDARD.md](./docs/api/STANDARD.md) | API & error standard (RFC 9457) |
| [docs/ENVIRONMENT_VARIABLES.md](./docs/ENVIRONMENT_VARIABLES.md) | Env reference (⚠️ sebagian masih template lama — truth di `podman-compose.yml`) |
| [AGENTS.md](./AGENTS.md) | Non-negotiable rules + commands |

---

## 🧪 Testing

```bash
# Backend — Go 1.27 (semua service)
go test ./... -count=1 -race
go vet ./...

# Frontend — Playwright E2E (51 tests)
cd frontend/web
bun run test:e2e          # chromium, baseURL http://localhost:3000 locale id-ID
bun run test:e2e:ui       # UI mode
bun run test:e2e:report   # html report

# Single service
go test ./internal/application/service -run TestOrderSaga
./scripts/test-single-service.sh payment-service  # jika ada
```

Tidak ada `mvnw test` / `npm run test` Java/NestJS — MVP Go uniform (ADR 0002). `cart-service` pakai `go-redis` mock, `search-service` pakai ES TypedClient.

---

## 🔧 Development

### Available Scripts

```bash
# Frontend (frontend/web)
bun run dev          # vite --port 3000 (proxy /v1 → :3001/:3005)
bun run build        # vite build → dist/
bun run preview      # vite preview --port 3000
bun run lint         # eslint
bun run test:e2e     # playwright test

# Backend (per service)
go run cmd/server/main.go
go test ./... && go vet ./...

# Infra
podman compose -f infrastructure/local/podman-compose.yml up -d
podman compose -f infrastructure/local/podman-compose.yml logs -f [service]
podman compose -f infrastructure/local/podman-compose.yml down
podman compose -f infrastructure/local/podman-compose.yml down -v  # hapus volumes
```

### Environment Variables

Lihat `docs/ENVIRONMENT_VARIABLES.md` — **catatan:** file tersebut masih berisi template lama (Java/NestJS `MIDTRANS_`, `RAJAONGKIR_`, `ZOOKEEPER_`, port salah). **Truth untuk MVP**:

```env
# Auth :3007 / User :3006 / Product :3001 / Order :3004 / Payment :3005 / Shipping :3008
PORT=3001
DB_HOST=postgres
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=tokobapak_products   # tokobapak_users / tokobapak_orders / tokobapak_payments / tokobapak_shipping
JWT_SECRET=tokobapak-dev-secret-min-32-chars
KAFKA_BROKERS=kafka:29092     # internal 29092, external 9092
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_TTL_SECONDS=604800
ELASTICSEARCH_NODE=http://elasticsearch:9200
PAYU_BASE_URL=http://payu-gateway:8080
PAYU_HMAC_SECRET=dev-secret

# Frontend
VITE_API_URL=http://localhost:8080
```

Jangan pakai `NEXT_PUBLIC_API_URL`, `NEXTAUTH_SECRET`, `MIDTRANS_*`, `XENDIT_*` — sudah tidak ada di MVP.

---

## 🤝 Contributing

1. Baca `AGENTS.md` + `CONTEXT.md` + 4 ADR sebelum coding
2. Fork → branch `feat(scope): msg` (Conventional Commits)
3. TDD: failing test dulu, `go test` + `go vet` + `playwright test` harus PASS
4. Push → PR (no force-push ke protected)

---

## 📄 License

MIT — lihat [LICENSE](./LICENSE)

---

## 📞 Contact

- **Docs:** `docs/product/PRD.md` + `docs/architecture/ARCHITECTURE.md`
- **Infra:** `infrastructure/README.md` + `infrastructure/local/podman-compose.yml`

<div align="center">

Made with ❤️ by TokoBapak Team — MVP 2026-08-26 · Go 1.27 · TanStack Start · PayU SNAP-BI

</div>
