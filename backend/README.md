# TokoBapak Backend — MVP 9 Services (Go 1.27)

> MVP per `docs/adr/0001-mvp-scope-9-services.md` — 9 hidden deleted 29 Aug 2026. Keep 9 Go uniform hexagonal.

## Services (MVP Keep 9)

| Service | Port | DB / Infra | Description | Health |
|---------|------|------------|-------------|--------|
| **auth-service** | 3007 | postgres `users` | JWT 15m + refresh HttpOnly | `GET /health` |
| **user-service** | 3006 | postgres `users` | CRUD users, role SELLER | `GET /health` |
| **product-service** | 3001 | postgres `products(stock)` + outbox | merge catalog+inventory, `SELECT FOR UPDATE` stock | `GET /health` |
| **cart-service** | 3003 | redis `HSET cart:{userId}` TTL 7d | merge sum on login | `GET /health` |
| **order-service** | 3004 | postgres `orders` Saga PENDING→RESERVED→PAID→SHIPPED | reserve → PayU charge → shipment | `GET /health` |
| **payment-service** | 3005 | postgres `payments` + PayU SNAP-BI HMAC | `X-Idempotency-Key` UNIQUE, `tokobapak.payment.completed.v1` | `GET /health` |
| **shipping-service** | 3008 | postgres `shipments` | mock flat `tokobapak.shipment.created.v1` | `GET /health` |
| **search-service** | 3010 | elasticsearch:8.17.0 1 index `products` | `go-elasticsearch` TypedClient | `GET /health` |
| **notification-service** | 3009 | kafka consumer | consume `tokobapak.payment.completed.v1` | `GET /health` |

Hidden 9 deleted: `catalog, inventory, seller, review, chat, media, promotion, recommendation, analytics` — see `docs/roadmap/SERVICES.md`.

## Stack

- Go 1.27, `chi`, `pgx`, `kafka-go`, `go-redis`, `go-elasticsearch`, `golang-jwt/jwt`
- Hexagonal: `cmd/server/main.go` + `internal/domain/model+port` + `internal/application/service` + `internal/adapter/{postgres,http,kafka,client/payu}` + `config` + `migrations`
- Outbox manual: `outbox(id,topic,payload JSONB,created_at)` + poller `SELECT FOR UPDATE SKIP LOCKED` 5s → `tokobapak.<domain>.<event>.v1` + `.dlq`
- Build: `golang:1.27-alpine` → `gcr.io/distroless/static-debian12:nonroot` USER 1001:1001 EXPOSE 8080

## Quick Start

```bash
# infra (postgres 18, redis, kafka 4 KRaft, elasticsearch)
cd infrastructure/local
podman compose up -d
podman exec tokobapak-postgres psql -U postgres -c "SELECT version();"
podman exec tokobapak-redis redis-cli ping

# run one service
cd backend/services/product-service
go run cmd/server/main.go
# or build
go test ./...
go vet ./...
```

## Migrations

Per-service `migrations/001_init.sql` — products `price BIGINT stock BIGINT`, users `role`, orders `status`, payments `idempotency_key UNIQUE`, shipments, outbox.

## Docs

- ADR 0001 MVP scope, 0002 Go uniform, 0003 PayU SNAP-BI, 0004 TanStack Start
- `docs/roadmap/SERVICES.md` + `docs/architecture/ARCHITECTURE.md`
