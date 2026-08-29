# TokoBapak — Product Requirements Document (MVP)

**Version:** 2.0 — MVP Freeze 26 Aug 2026 (ADR 0001-0004)  
**Status:** Active — 9 keep / 9 hide (1 bulan validasi)  
**Stack:** Go 1.27 uniform + TanStack Start (Vite) — buang polyglot 18 svc & Next.js  
**Source:** `CONTEXT.md` (glossary), `docs/adr/0001-0004`, `docs/roadmap/TODOS.md` Fase 0-4

> **Single source of truth untuk MVP.** Sebelumnya split `backend-prd.md` (59KB 18 svc polyglot Java/NestJS/Go/Python + Kong + Mongo) dan `frontend-prd.md` superseded Next.js — **digabung di sini**. File lama tetap ada sebagai redirect; jangan gunakan spec 18-svc untuk implementasi baru.

## 1. Ringkas

Marketplace multi-vendor journey **Browse → Search → Keranjang → Checkout → Bayar (PayU) → Kirim → Notifikasi**. MVP hanya transaksi inti; trust/engagement/monetisasi (review, chat, media, promotion, recommendation, analytics) di-hide.

| Aspek | Keputusan MVP |
|-------|---------------|
| **Services** | **9 keep Go 1.27**: `auth, user, product (merge catalog+inventory→stock), search (ES 1 index), cart (Redis), order (Saga), payment (PayU adapter), shipping (mock flat), notification`; **9 hide** `enabled=false`: `review, chat, media, promotion, seller standalone, recommendation, analytics, catalog standalone, inventory standalone` |
| **DB** | `postgres:18-alpine` `tokobapak_{products,users,orders,payments,shipping}` + `redis:alpine` + `apache/kafka:4.0.0 KRaft 1 broker` + `elasticsearch:8.17.0` — RDS `t4g.micro` / ElastiCache `t4g.micro` / Kafka self-host di cloud |
| **Frontend** | `TanStack Start + Router 1.121 + Query 5.90` Vite 6.4, BFF JWT HttpOnly+CSRF (ADR 0004), `staleTime 60s` listing/search vs `0` cart/checkout, `unpic` shim `next/image` |
| **Gateway** | `Traefik v3.3` `:8080` (cloud `ALB→Traefik`, migrate→Kong jika 3scale) |
| **Kriteria Done** | Fase 0: CONTEXT+4 ADR approved + CI 9 svc; Fase 1: Saga+Idempotency test PASS; Fase 2: `bun run build` Vite OK no `next`; Fase 3: PayU callback 2× replay 200; Fase 4: 9 svc local healthy `PONG`/`SELECT version()` |

## 2. Pengguna & Peran

- **User** — akun belanja, `role=CUSTOMER|SELLER|ADMIN` di `users.role`; seller = `products.seller_id = users.id` (bukan service terpisah). _Avoid: Seller Service._
- **Guest** — cart di `cart:{userId}` Redis TTL 7 hari, merge `sum` saat login.

## 3. Journey (ringkas — detail di `FLOW.md`)

```
Browse (/ , /products) --search--> Search (ES) --add--> Cart (Redis HSET 7d) --checkout--> Order Saga PENDING→RESERVED→PAID→SHIPPED --pay--> Payment PayU SNAP-BI --ship--> Shipping flat --notify--> Notification (Kafka tokobapak.payment.completed.v1)
```
Gagal reserve → `OrderCancelled` compensate; PayU callback idempoten `FOR UPDATE`; notifikasi email/WA.

## 4. Fitur Matrix (ringkas — detail di `FEATURES.md`)

| Fitur | Service | Status | Acceptance |
|-------|---------|--------|------------|
| **Auth** | `auth-service :3007` `golang-jwt/jwt` `access 15m` + `refresh HttpOnly` | keep | `POST /v1/auth/login` JWT, refresh, BFF relay HttpOnly+CSRF |
| **User** | `user-service :3006` | keep | `users(role=SELLER)` CRUD, `GET /v1/users/me` |
| **Product merge** | `product-service :3001` `products(stock BIGINT)` | keep | `GET/POST /v1/products`, `DecrementStock FOR UPDATE` anti oversell |
| **Search** | `search-service :3010` `go-elasticsearch` `index products` | keep | `GET /v1/search?q & filters` TypedClient |
| **Cart** | `cart-service :3003` `go-redis` `HSET` | keep | `GET/POST/DELETE /v1/cart`, TTL 604800, merge sum |
| **Order Saga** | `order-service :3004` | keep | `POST /v1/orders` `X-Idempotency-Key`, `PENDING→RESERVED→PAID→SHIPPED→DELIVERED\|CANCELLED` `FOR UPDATE` |
| **Payment PayU** | `payment-service :3005` thin adapter | keep | `POST /v1/payments` SNAP-BI `X-SIGNATURE/X-TIMESTAMP` HMAC-SHA256 + `payments(order_id UNIQUE, payu_reference UNIQUE, idempotency_key UNIQUE)` |
| **Shipping mock** | `shipping-service :3008` | keep | `POST /v1/shipping` flat `cost` + `tokobapak.shipment.created.v1` |
| **Notification** | `notification-service :3009` consumer | keep | `Consume tokobapak.payment.completed.v1` → email/WA |
| Review/Chat/Media/Promotion/Seller stdalone/Recommendation/Analytics/Catalog stdalone/Inventory stdalone | — | **hide** | `enabled=false` header `HIDDEN 9` |

## 5. Kontrak API & Error

- Path **versioned** `/v1/...` **plural kebab-case** (AGENTS rule 6). Contoh: `/v1/products`, `/v1/cart/items`, `/v1/orders`, `/v1/payments`, `/v1/shipping/rates`.
- Error **RFC 9457** dengan `code` unik; money `BIGINT` minor unit `HALF_EVEN` (NEVER float).
- Idempotency: `checkout/payment/order` wajib `X-Idempotency-Key`.
- Event via **outbox pattern** (bukan direct `kafka send`): tabel `outbox(id, topic, payload JSONB, created_at)` + poller `SELECT FOR UPDATE SKIP LOCKED` 5s → `kafka-go` `tokobapak.<domain>.<event>.v1` + DLQ `.dlq`.
- Hexagonal: DB/Kafka/HTTP lewat `Port` interface, DTO di `port/dto`.

## 6. Model Data (industry naming — lowercase snake_case, plural tables)

```
tokobapak_products.products(id UUID PK DEFAULT gen_random_uuid(), name TEXT, price BIGINT CHECK>=0, stock BIGINT CHECK>=0, seller_id UUID, created_at TIMESTAMPTZ DEFAULT NOW(), updated_at ...)
tokobapak_users.users(id UUID PK DEFAULT gen_random_uuid(), email TEXT UNIQUE, role TEXT CHECK(CUSTOMER,SELLER,ADMIN), ...)
tokobapak_orders.orders(id UUID PK DEFAULT gen_random_uuid(), user_id UUID, status TEXT CHECK(PENDING...CANCELLED), total BIGINT, ...)
tokobapak_orders.order_items(order_id UUID REFERENCES orders, product_id UUID, qty BIGINT CHECK>0, price BIGINT, PK(order_id,product_id))
tokobapak_payments.payments(id UUID DEFAULT gen_random_uuid(), order_id UUID UNIQUE, payu_reference TEXT UNIQUE, idempotency_key TEXT UNIQUE, status CHECK(PENDING,COMPLETED,FAILED), amount BIGINT, ...)
tokobapak_shipping.shipments(id UUID DEFAULT gen_random_uuid(), order_id UUID UNIQUE, address TEXT, cost BIGINT CHECK>=0, status CHECK(PENDING,SHIPPED,DELIVERED), ...)
outbox(id UUID DEFAULT gen_random_uuid(), topic TEXT, payload JSONB, created_at TIMESTAMPTZ)
redis: cart:{userId} HSET TTL 604800
es: index products (1 index, TypedClient)
kafka: tokobapak.payment.completed.v1, tokobapak.shipment.created.v1
```

## 7. PayU SNAP-BI

`payment-service` forward `X-Idempotency-Key` + `X-SIGNATURE = HMAC-SHA256(payload+timestamp, secret)` + `X-TIMESTAMP` ke `payu-gateway`, simpan `payments` `SELECT FOR UPDATE` di callback, recon harian `internal/job/reconciliation.go` 24h vs ledger.

## 8. Frontend TanStack

- `frontend/web` Vite --port 3000, `src/routes/__root/index/products/cart/checkout/login/register`, `src/lib/bff.ts` relay `accessToken` HttpOnly+CSRF ke `:3007`, `src/shims/next-image.tsx` → `img lazy` + `unpic`, `next/font`→`font-sans`, `lib/query-client.ts` `staleTime 60s` (listing/search) vs `0` (cart/checkout override).
- Build `vite build` 304k JS dist `nginx:alpine` `USER 1001` `:8080`.
- E2E `playwright.config.ts` `baseURL 3000` `vite dev` `checkout.spec.ts` `Browse→Search→Cart→Checkout→Pay→Ship→Notify` — 51 tests PASS.

## 9. NFR & AGENTS Rules

1. Money `DECIMAL`/`minor` never float, HALF_EVEN — `BIGINT` cents
2. No oversell `SELECT FOR UPDATE`
3. `X-Idempotency-Key` checkout/payment/order
4. Outbox `tokobapak.<domain>.<event>.v<n>` DLQ `.dlq`
5. Hexagonal Port
6. `/v1/plural-kebab` RFC9457
7. Server Components/Functions max, client leaf
8. `distroless` `1001` drop ALL caps read-only FS `:8080`
9. PII mask, encrypt
10. TDD red-green
11. Conventional Commits, SemVer, image tag = git tag

## 10. Di Luar Scope MVP (hide 1 bulan)

Review stars, chat Socket.IO, media R2, promotion vouchers, seller dashboard terpisah, recommendation ML, analytics ClickHouse, catalog/inventory standalone — rollback via `init.sql` 5 DBs vs 10 jika perlu.

## 11. Acceptance per Fase (dari TODOS)

- **Fase0**: CONTEXT+4 ADR approved, CI 9 svc, postgres:18 `SELECT version()` 18.6
- **Fase1**: `go vet` 9 svc 0, `go test` Saga 2 + PayU 3 + Idempotency 2 =7 PASS, outbox poller 5 svc
- **Fase2**: `package.json` no `next`, `vite build` Vite 304k OK
- **Fase3**: HMAC 64hex + 2× replay 200
- **Fase4**: `podman ps` 14 Up, `redis PONG`, `kafka list` green, `persist_test` before/after restart OK

## 12. Referensi

- `CONTEXT.md` glossary (Product/Catalog/Inventory merge, Cart TTL 7d, Order state, Payment vs PayU Transaction, `users.role=SELLER`)
- `docs/adr/0001-0004` (scope 9/9, Go 1.27 uniform, PayU Saga, TanStack Start)
- `docs/product/FLOW.md` — sequence
- `docs/product/FEATURES.md` — matrix rinci
- `docs/architecture/ARCHITECTURE.md` — High-Level (`m6a.4xlarge` local, EKS EC2 + RDS `t4g.micro` + ElastiCache `t4g.micro` + Kafka 1 broker Strimzi, ALB→Traefik, Terraform+Helm+ArgoCD)
- `docs/roadmap/TODOS.md` + `VALIDATION_2026-08-29.md` + `CHANGELOG.md` 0.2.2

*Doc Version 2.0 — 2026-08-29, menggabung `backend-prd.md` (18 svc 59KB polyglot) + `frontend-prd.md` superseded Next.js → 1 file MVP.*
