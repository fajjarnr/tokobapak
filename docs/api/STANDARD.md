# API Standard — TokoBapak MVP

**Version:** 2.0 — 26 Aug 2026 (ADR 0001-0004)  
**Gateway:** `Traefik :8080` (local) → `ALB→Traefik` (cloud), single entry `/v1/...`  
**Spec:** `docs/openapi/openapi.yaml` (OpenAPI 3.1.0) — Swagger UI via `npx @redocly/cli preview-docs` atau `swagger-ui`

> Prinsip AGENTS rule 6,3,1: **plural kebab-case**, **RFC 9457**, **X-Idempotency-Key** di `checkout/payment/order`, money `BIGINT` minor `HALF_EVEN` never float.

## 1. Konvensi Dasar

| Aturan | Nilai | Contoh |
|--------|-------|--------|
| **Versioning** | Path prefix `/v1` (MAJOR breaking) | `GET /v1/products` |
| **Naming** | **Plural, kebab-case** (bukan singular/camel) | `/v1/products`, `/v1/cart/items`, `/v1/shipping/rates` |
| **Method** | REST semantik (GET list/detail, POST create, PUT full, PATCH partial, DELETE) | `POST /v1/orders` `PATCH /v1/orders/{id}/status` |
| **Content-Type** | `application/json` only, `charset=utf-8` | — |
| **Auth** | `Authorization: Bearer <JWT>` (HS256, `golang-jwt/jwt` 15m) + BFF `HttpOnly+CSRF` (ADR 0004) | `Cookie: accessToken=...; csrf=...` + `X-CSRF-Token` |
| **Idempotency** | `X-Idempotency-Key: <uuid>` **wajib** untuk `POST /v1/orders`, `/v1/payments`, `/v1/shipping/orders` | Replay 2× → 200 same `id` no double (UNIQUE) |
| **Correlation** | `X-Request-ID: <uuid>` auto (Traefik) | — |
| **PayU** | `X-SIGNATURE: HMAC-SHA256(payload+timestamp,secret)` + `X-TIMESTAMP` | SNAP-BI |
| **Money** | `BIGINT` cents (minor unit) `19,4` `HALF_EVEN` — never `float/double` | `99000` = Rp990.00? actually Rp99.000 (integer rupiah) |
| **Time** | `RFC 3339` UTC `TIMESTAMPTZ` | `2026-08-29T10:00:00Z` |

## 2. Error — RFC 9457 (Problem Details)

Semua error pakai `application/problem+json` dengan `code` unik tokobapak:

```json
{
  "type": "https://tokobapak.id/errors/insufficient-stock",
  "title": "Insufficient Stock",
  "status": 409,
  "code": "INSUFFICIENT_STOCK",
  "detail": "Product b856... stock 2 < qty 5",
  "instance": "/v1/orders",
  "requestId": "6b8d...-..."
}
```

| HTTP | Code | Kapan |
|------|------|-------|
| 400 | `BAD_REQUEST` `VALIDATION_ERROR` | body/zod invalid |
| 401 | `UNAUTHORIZED` `TOKEN_EXPIRED` | JWT missing/exp |
| 403 | `FORBIDDEN` | role bukan SELLER |
| 404 | `NOT_FOUND` `PRODUCT_NOT_FOUND` `ORDER_NOT_FOUND` | `ErrNotFound` |
| 409 | `CONFLICT` `INSUFFICIENT_STOCK` `IDEMPOTENCY_CONFLICT` | UNIQUE/FOR UPDATE |
| 422 | `UNPROCESSABLE` | Saga PENDING→PAID tanpa RESERVED |
| 429 | `RATE_LIMITED` | 30/min auth, 500/min read |
| 500 | `INTERNAL` | `ErrInternal` |
| 502 | `PAYU_UNAVAILABLE` | PayU gateway timeout |

## 3. Pagination, Filter, Sort

```http
GET /v1/products?page=1&limit=20&sort=price:asc&category=fashion&minPrice=10000&maxPrice=500000&q=kaos
```

Response:

```json
{
  "data": [{ "id": "uuid", "name": "Kaos", "price": 99000, "stock": 100 }],
  "meta": { "page": 1, "limit": 20, "total": 125, "totalPages": 7 },
  "links": { "self": "/v1/products?page=1", "next": "/v1/products?page=2" }
}
```

Defaults: `page=1, limit=20 (max 100)`, `sort=created_at:desc`.  
Search: `q` via ES `index products` (1 index, TypedClient) — bukan `LIKE`.

## 4. Idempotency & Saga

```
POST /v1/orders
X-Idempotency-Key: 6b8d40e0-...

→ 201 { "id": "uuid", "status": "PENDING" }
→ replay same key → 200 { "id": "same-uuid" } (no double order, UNIQUE(idempotency_key))
```

Saga `order-service` orchestrator:
`PENDING → RESERVED (FOR UPDATE stock) → PAID (PayU callback FOR UPDATE) → SHIPPED → DELIVERED | CANCELLED` — compensate `OrderCancelled` jika reserve gagal.

## 5. Auth & BFF

- **JWT** `sub: userId, role, exp 15m` HS256 `JWT_SECRET` env, `refreshToken` HttpOnly 7d via `POST /v1/auth/refresh`.
- **BFF** `frontend/web/src/lib/bff.ts` `relayToken(req)` baca `cookie accessToken` → forward `Authorization: Bearer` ke `auth-service :3007` server-side, `csrf` double-submit.
- Public: `GET /v1/products`, `GET /v1/search` `auth: false`. Private: `cart/order/payment` `auth: true`.

## 6. Services & Endpoints (MVP 9)

| Tag | Base | Endpoints |
|-----|------|-----------|
| **Auth** `:3007` | `/v1/auth` | `POST /login` `POST /register` `POST /refresh` `POST /logout` |
| **User** `:3006` | `/v1/users` | `GET /me` `PUT /me` `GET /{id}` `GET /me/addresses` |
| **Product** `:3001` | `/v1/products` | `GET /` `GET /{id}` `POST /` `PUT /{id}` `DELETE /{id}` |
| **Search** `:3010` | `/v1/search` | `GET /?q&category&minPrice&maxPrice&sort&page&limit` `GET /suggestions?q` |
| **Cart** `:3003` | `/v1/cart` | `GET /` `POST /items` `PUT /items/{itemId}` `DELETE /items/{itemId}` `DELETE /` |
| **Order** `:3004` | `/v1/orders` | `POST /` `GET /` `GET /{id}` `POST /{id}/cancel` `GET /{id}/timeline` |
| **Payment** `:3005` | `/v1/payments` | `POST /` `GET /{id}` `POST /callback` (PayU `X-SIGNATURE`) `POST /{id}/refund` |
| **Shipping** `:3008` | `/v1/shipping` | `POST /rates` `POST /orders` `GET /orders/{id}` `GET /orders/{id}/track` |
| **Notification** `:3009` | `/v1/notifications` | `GET /` `PUT /{id}/read` (Kafka `tokobapak.payment.completed.v1` internal) |

Health tiap svc: `GET /health` `{"status":"ok","service":"product-service"}` + `GET /v1/health` (Traefik `exposedbydefault=false`).

## 7. Header Wajib

```
Authorization: Bearer <JWT>            # private
X-Idempotency-Key: <uuid>              # POST /orders /payments
X-Request-ID: <uuid>                   # auto Traefik
X-CSRF-Token: <token>                  # BFF
X-SIGNATURE: <hmac>                    # PayU callback
X-TIMESTAMP: 2026-08-29T10:00:00Z       # PayU
Content-Type: application/json
```

## 8. Rate Limit (Traefik/Kong)

| Category | Limit |
|----------|-------|
| Auth `30/min` | brute force |
| Public read `500/min` | listing |
| Write `60/min` | create/update |
| Checkout `10/min` | cart manipulation |
| Payment `5/min` | highest |

## 9. Caching (BFF)

- `staleTime 60s` `GET /v1/products`, `/v1/search` (Via `QueryClient` + `HydrationBoundary` `prefetchQuery`)
- `staleTime 0` `GET /v1/cart`, `/v1/orders` (fresh checkout)

## 10. Contoh Lengkap

### Create Order (idempoten + saga)

```http
POST /v1/orders HTTP/1.1
Host: localhost:8080
Authorization: Bearer eyJ...
X-Idempotency-Key: 6b8d40e0-f705-4fd6-baaf-b5a8e1401a6f
Content-Type: application/json

{
  "items": [{ "productId": "b856...", "qty": 2, "price": 99000 }],
  "shippingAddress": { "address": "Jl. Merdeka 123", "city": "Jakarta", "postalCode": "10110", "phone": "0812..." },
  "shippingMethod": "standard",
  "paymentMethod": "qris"
}
-- 201
{
  "id": "66b0...",
  "status": "PENDING",
  "total": 198000,
  "createdAt": "2026-08-29T10:00:00Z"
}
```

### PayU Callback (idempoten FOR UPDATE)

```http
POST /v1/payments/callback HTTP/1.1
X-SIGNATURE: a1b2...64hex
X-TIMESTAMP: 2026-08-29T10:00:00Z
X-Idempotency-Key: same-as-order

{ "payuReference": "payu-ref-66b0...", "status": "COMPLETED" }
-- 200 same 2× replay no double
```

## 11. Validasi & Spec

- **OpenAPI:** `docs/openapi/openapi.yaml` (3.1.0) — sumber kebenaran, di-serve via Swagger UI `http://localhost:8080/docs` (nginx) atau `npx @redocly/cli preview-docs docs/openapi/openapi.yaml`
- **Lint:** `npx @redocly/cli lint docs/openapi/openapi.yaml` harus 0
- **Test:** `curl -s http://localhost:3001/health | jq .status` → `ok` untuk tiap svc, `playwright` 51 PASS

## 12. Referensi

- `docs/product/PRD.md` §5 Kontrak API & Error
- `docs/product/FLOW.md` sequence
- `CONTEXT.md` glossary (Payment vs PayU Transaction)
- `docs/adr/0003-payu-snapbi-adapter-saga.md` HMAC
- `docs/architecture/ARCHITECTURE.md` Traefik `:8080`

*Standard ini menggantikan Kong `kong.yml` 18-svc polyglot (Java/NestJS/Go) → Traefik 9 svc Go uniform per ADR 0002.*
