# SERVICES — TokoBapak MVP

> Catalog 9 keep + 9 hide per `docs/adr/0001-mvp-scope-9-services.md`. Infra `podman m6a.4xlarge` → `EKS EC2 + RDS t4g.micro + ElastiCache t4g.micro + Kafka 1 broker`.

## MVP Keep 9 — Go 1.27 uniform hexagonal

Template `cmd/server/main.go` + `internal/domain/model+port` + `internal/application/service` + `internal/adapter/{postgres,http,kafka,client/payu}` + `config` + `migrations`. Build `golang:1.27-alpine` → `gcr.io/distroless/static-debian12:nonroot` `USER 1001:1001` `EXPOSE 8080` `HEALTHCHECK wget /health`.

| Service | Port | Tech | DB / Infra | Health | Event | Migrations |
|---------|------|------|------------|--------|-------|------------|
| **auth-service** | `3007` | Go 1.27 `chi` `golang-jwt/jwt` | `postgres:18` `users` | `GET /health` `GET /v1/health` | `tokobapak.auth.*.v1` | `users(id,email UNIQUE,password_hash,role CUSTOMER/SELLER/ADMIN)` + `outbox` |
| **user-service** | `3006` | Go 1.27 `chi` `pgx` `jwt` | `postgres:18` `users` | `GET /health` | — | `users` + `outbox` |
| **product-service** | `3001` | Go 1.27 `chi` `pgx` `kafka-go` | `postgres:18` `products` | `GET /health` | `tokobapak.product.*.v1` → ES | `products(id,name,price BIGINT,stock BIGINT seller_id)` + `outbox` |
| **cart-service** | `3003` | Go 1.27 `chi` `go-redis` `kafka-go` | `redis:alpine` `HSET cart:{userId}` TTL `7d` (604800) | `GET /health` | `tokobapak.cart.*.v1` | `outbox` (no pg table, Redis primary) |
| **order-service** | `3004` | Go 1.27 `chi` `pgx` `kafka-go` Saga | `postgres:18` `orders`+`order_items` | `GET /health` | `OrderCreated → inventory reserve → PayU charge → shipment` `OrderCancelled` compensate | `orders(status PENDING/RESERVED/PAID/SHIPPED/DELIVERED/CANCELLED)` `order_items` |
| **payment-service** | `3005` | Go 1.27 `chi` `pgx` `kafka-go` `client/payu` | `postgres:18` `payments` | `GET /health` | `tokobapak.payment.completed.v1` → notification | `payments(order_id UNIQUE,payu_reference UNIQUE,idempotency_key UNIQUE,status PENDING/COMPLETED/FAILED)` |
| **shipping-service** | `3008` | Go 1.27 `chi` `pgx` `kafka-go` | `postgres:18` `shipments` | `GET /health` | `tokobapak.shipment.created.v1` mock flat | `shipments(order_id UNIQUE,cost,status PENDING/SHIPPED/DELIVERED)` |
| **search-service** | `3010` | Go 1.27 `chi` `go-elasticsearch` v8 Typed API | `elasticsearch:8.17.0` 1 index `products` | `GET /health` | `products` index `POST /v1/search` | `outbox` stub |
| **notification-service** | `3009` | Go 1.27 `chi` `kafka-go` | Kafka consumer (no DB) | `GET /health` | consume `tokobapak.payment.completed.v1` → email/WA | `outbox` stub |
| **frontend/web** | `3000` `8080` | TanStack Start + TanStack Router + TanStack Query + Vite | — | `GET /` | BFF `src/lib/bff.ts` HttpOnly+CSRF | `vite build` `dist/` `nginx:alpine` |

## Hide 9 — `enabled=false` (ADR 0001) `podman-compose.yml.legacy-18svc`

| Service | Orig Tech | Hide Reason | Legacy |
|---------|-----------|-------------|--------|
| `catalog-service` | Go 1.22 `chi` | merge → `product-service` | `localhost/local_catalog-service` (old) |
| `inventory-service` | Go 1.22 `pgx` | merge → `products.stock` `SELECT FOR UPDATE` | `localhost/local_inventory-service` |
| `seller-service` | NestJS | merge → `users.role=SELLER` `products.seller_id` | |
| `review-service` | Go 1.22 | trust feature cut | |
| `chat-service` | NestJS `socket.io` | engagement cut | `3013` |
| `media-service` | Go 1.22 | langsung R2 | `3015` |
| `promotion-service` | Java Spring | monetisasi cut | `3018` |
| `recommendation-service` | Python FastAPI | ML cut | `3014` |
| `analytics-service` | Python FastAPI | analytics cut | `3017` |

> Activate: `podman-compose -f podman-compose.yml.legacy-18svc up -d` or add `profiles: ["hidden"]` + `--profile hidden`.

## Infra Local `podman-compose.yml` (5)

| Infra | Image | Port | Health | Cloud |
|-------|-------|------|--------|-------|
| `postgres` | `docker.io/library/postgres:18-alpine` | `5432` | `pg_isready -U postgres` | `RDS t4g.micro` single-AZ |
| `redis` | `docker.io/library/redis:alpine` | `6379` | `redis-cli ping` → `PONG` | `ElastiCache t4g.micro` |
| `zookeeper` | `confluentinc/cp-zookeeper:7.5.0` | `2181` | | |
| `kafka` | `confluentinc/cp-kafka:7.5.0` 1 broker `KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR=1` | `9092` `29092` | `kafka-broker-api-versions` | `self-host 1 broker Strimzi` → `MSK Serverless` |
| `elasticsearch` | `docker.elastic.co/elasticsearch/elasticsearch:8.17.0` `single-node` `ES_JAVA_OPTS=-Xms512m` | `9200` | `curl /_cluster/health` `green|yellow` | |

## Event Topics (outbox manual)

| Topic | Publisher | Consumer | DLQ |
|-------|-----------|----------|-----|
| `tokobapak.order.created.v1` | `order-service` | `payment-service` `shipping-service` | `tokobapak.order.created.v1.dlq` |
| `tokobapak.payment.completed.v1` | `payment-service` | `notification-service` | `.dlq` |
| `tokobapak.shipment.created.v1` | `shipping-service` | `notification-service` | `.dlq` |
| `tokobapak.product.updated.v1` | `product-service` | `search-service` | `.dlq` |

## Ports Quick

```sh
podman-compose -f infrastructure/local/podman-compose.yml ps
podman exec tokobapak_postgres psql -U postgres -c "SELECT version();"
podman exec tokobapak_redis redis-cli ping
curl http://localhost:3001/health # product
curl http://localhost:3003/health # cart
curl http://localhost:3004/health # order
curl http://localhost:3005/health # payment
```

*Build: `localhost/local_*` 12.2MB `USER 1001:1001`, `go vet` 0, `go test` 7 PASS, `vite build` 304k*
