# FEATURES — TokoBapak MVP Matrix

**MVP 9 keep / 9 hide** (ADR 0001). Sebelumnya 18 svc polyglot — dipangkas ke transaksi inti 1 bulan validasi. Rinci di `PRD.md`.

## 1. Legend

- **keep** — implement Go 1.27 uniform + migrasi + test
- **hide** — `enabled=false` header `HIDDEN 9` di `podman-compose.yml`, tidak deploy, tidak di FLOW MVP

## 2. Keep 9 — Fitur & Acceptance

| # | Fitur | Service | Tech | DB/Infra | Endpoint (plural kebab-case `/v1/...`) | Acceptance |
|---|-------|---------|------|----------|----------------------------------------|------------|
| **F1** | **Auth JWT BFF** | `auth-service :3007` | Go `golang-jwt/jwt` HS256 | `tokobapak_users.users(role)` | `POST /v1/auth/login` `{"email","password"}` → `{accessToken 15m, refreshToken HttpOnly}` + `refresh` + CSRF; `src/lib/bff.ts` relay `accessToken` ke `auth:3007` | Login → `auth-storage` token → `/` 200, 2× replay idempoten |
| **F2** | **User + Seller role** | `user-service :3006` | Go `chi+p gx` | `tokobapak_users` | `GET /v1/users/me` `PUT /v1/users` | `users.role=SELLER` = `products.seller_id = users.id`, hide `seller standalone` |
| **F3** | **Product merge Catalog+Inventory** | `product-service :3001` | Go `chi+p gx+sqlc` | `tokobapak_products.products(stock BIGINT)` | `GET /v1/products` `GET /v1/products/{id}` `POST /v1/products` `PATCH stock` | `stock` kolom anti oversell `DecrementStock FOR UPDATE` |
| **F4** | **Search** | `search-service :3010` | Go `go-elasticsearch v8` TypedClient | `elasticsearch:9200` `index products` 1 index | `GET /v1/search?q&category&price&sort` | ES green, `PUT /products/_doc` 201, `/_search?q` |
| **F5** | **Cart** | `cart-service :3003` | Go `go-redis/v9` | `redis:6379` `cart:{userId}` | `GET /v1/cart` `POST /v1/cart/items` `PATCH /v1/cart/items/{id}` `DELETE /v1/cart` | `HSET` TTL `604800` (7d), merge `sum` saat login, `go test` merge |
| **F6** | **Order Saga** | `order-service :3004` orchestrator | Go `chi+kafka-go` outbox | `tokobapak_orders.orders`+`order_items` + `outbox` | `POST /v1/orders` `X-Idempotency-Key` `GET /v1/orders/{id}` | `PENDING→RESERVED→PAID→SHIPPED` `SELECT FOR UPDATE` reserve, compensate `CANCELLED` 2 tests PASS |
| **F7** | **Payment PayU adapter** | `payment-service :3005` thin | Go `hmac/sha256` SNAP-BI | `tokobapak_payments.payments(order_id UNIQUE, payu_reference UNIQUE, idempotency_key UNIQUE)` + `outbox` | `POST /v1/payments` `POST /v1/payments/callback` `GET /v1/payments/{id}` | `X-SIGNATURE/X-TIMESTAMP` HMAC 64hex, `FOR UPDATE` callback 2× 200 no double, 3 PayU tests + 2 idempotency PASS |
| **F8** | **Shipping mock** | `shipping-service :3008` | Go outbox | `tokobapak_shipping.shipments(address,cost,updated_at)` | `POST /v1/shipping/rates` flat `cost` `GET /v1/shipping/{id}` | flat `15000` + `tokobapak.shipment.created.v1` DLQ |
| **F9** | **Notification** | `notification-service :3009` consumer | Go `kafka-go` | Kafka | — | `Consume tokobapak.payment.completed.v1` → email/WA (stub) |

## 3. Hide 9 — Tidak di MVP

| Fitur | Alasan Hide | Rollback |
|-------|-------------|----------|
| `review` (Go) rating & stars | Trust — tunda 1 bulan | `review-service` disabled |
| `chat` (NestJS Socket.IO) | Engagement | disabled |
| `media` (Go R2) upload | Langsung R2 — tunda | disabled |
| `promotion` (Java) voucher | Monetisasi | disabled |
| `seller standalone` (NestJS) | Merge ke `users.role` | `users.role=SELLER` |
| `recommendation` (Python) ML | Personalisasi | disabled |
| `analytics` (Python ClickHouse) | Dashboard | disabled |
| `catalog standalone` (Go) | Merge ke `product` | `products.category_id` |
| `inventory standalone` (Go) | Merge ke `product.stock` | `products.stock` |

HIDEnya `enabled=false` bukan `git rm` — 1 bulan validasi jika Fase 1-3 lulus → delete permanen, jika gagal rollback via git history (no `legacy-18svc` file, build from 0 per user intent).

## 4. Frontend

| Fitur | Stack | Acceptance |
|-------|-------|------------|
| **Web App** | `TanStack Start + Router 1.121 + Query 5.90` Vite 6.4 `src/routes/__root/index/products/cart/checkout/login/register` | `bun run build` 309k JS, `vite dev --host 0.0.0.0` 200 localhost/host IP/public IP `18.143.199.84` |
| **BFF** | `src/lib/bff.ts` HttpOnly+CSRF | relay `accessToken` ke `:3007` `refresh 15m` |
| **Data layer** | `lib/query-client.ts` `staleTime 60s` vs `0` | `prefetchQuery` + `HydrationBoundary` listing/search 60s, cart/checkout 0 |
| **Image** | `unpic` + `vite-imagetools` shim `next/image→img lazy` `next/font→font-sans` | `next/image` shim 1 line |
| **E2E** | `playwright.config.ts` `baseURL 3000` `checkout.spec.ts` `Browse→Search→Cart→Checkout→Pay→Ship→Notify` | 51 tests PASS (homepage 10 + auth 13 + cart 9 + checkout 9 + products 9 + sanity 1) |

## 5. Cross-Cutting (AGENTS 11 rules)

- Money `BIGINT` `HALF_EVEN` never float — `price BIGINT`
- No oversell `FOR UPDATE`
- `X-Idempotency-Key` checkout/payment/order
- Outbox `tokobapak.<domain>.<event>.v1` DLQ `.dlq`
- Hexagonal `Port` DTO
- `/v1/plural-kebab` RFC9457
- Server Components max
- `distroless` `1001` drop ALL `read-only` `:8080`
- PII mask
- TDD red-green (Saga 2 + PayU 3 + Idempotency 2)
- Conventional Commits SemVer image tag = git tag

## 6. Trace ke TODOS

- F1 → T1.5
- F2 → T1.5
- F3 → T1.2
- F4 → T1.3
- F5 → T1.4
- F6 → T1.6
- F7 → T1.7 + T3.1-3.3
- F8 → T1.8
- F9 → T1.9
- Frontend → T2.1-2.5
- Hide → T0.2 + T4.3

*Detail flow di `FLOW.md`, kontrak API di `PRD.md` §5, validasi `VALIDATION_2026-08-29.md` 51/51.*
