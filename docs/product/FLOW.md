# FLOW — TokoBapak MVP Journey

**Scope:** MVP 9 svc (ADR 0001) — Browse → Search → Keranjang → Checkout → Bayar (PayU) → Kirim → Notifikasi. 9 hide tidak ada di flow MVP.

## 1. Happy Path E2E

```mermaid
sequenceDiagram
    actor Buyer as Pembeli
    participant Web as Web App (TanStack Start :3000)
    participant BFF as BFF Token Relay
    participant Auth as auth-service :3007
    participant Product as product-service :3001
    participant Search as search-service :3010
    participant Cart as cart-service :3003
    participant Order as order-service :3004
    participant Payment as payment-service :3005
    participant PayU as PayU gateway
    participant Shipping as shipping-service :3008
    participant Notify as notification-service :3009
    participant PG as postgres:18
    participant Redis as redis
    participant ES as elasticsearch
    participant Kafka as kafka:4.0

    Buyer->>Web: Browse / (staleTime 60s)
    Web->>Product: GET /v1/products
    Product->>PG: SELECT * FROM products
    Web->>Search: GET /v1/search?q=kaos&category=fashion
    Search->>ES: GET products/_search
    Buyer->>Web: Add to cart (qty 1)
    Web->>Cart: POST /v1/cart/items {productId, qty}
    Cart->>Redis: HSET cart:{userId} qty 1 EX 604800
    Cart-->>Web: 200 cart summary
    Note over Cart: TTL 7 hari, merge sum saat login
    Buyer->>Web: Checkout
    Web->>Order: POST /v1/orders X-Idempotency-Key
    Order->>PG: BEGIN; INSERT orders PENDING; INSERT outbox tokobapak.order.created.v1; COMMIT
    Order->>Kafka: poller SELECT FOR UPDATE SKIP LOCKED 5s Publish tokobapak.order.created.v1
    Order->>Product: Reserve stock FOR UPDATE
    Product->>PG: UPDATE products SET stock=stock-qty WHERE id=$1 AND stock>=qty
    alt stock cukup
        Order->>PG: UPDATE orders SET status=RESERVED
        Order->>Payment: POST /v1/payments {orderId, amount}
        Payment->>PG: INSERT payments(order_id, payu_reference, idempotency_key, status PENDING) UNIQUEs
        Payment->>PayU: SNAP-BI X-SIGNATURE=HMAC SHA256(payload+timestamp) X-TIMESTAMP X-Idempotency-Key
        PayU-->>Payment: 200 payu_reference
        Payment->>Kafka: tokobapak.payment.pending.v1
        Buyer->>PayU: Bayar QRIS / Transfer
        PayU->>Payment: callback POST /v1/payments/callback X-SIGNATURE FOR UPDATE
        Payment->>PG: UPDATE payments SET status=COMPLETED WHERE payu_reference FOR UPDATE (idempoten 2× 200)
        Payment->>Kafka: tokobapak.payment.completed.v1
        Order->>PG: UPDATE orders SET status=PAID
        Order->>Shipping: emit tokobapak.shipment.created.v1
        Shipping->>PG: INSERT shipments(order_id, address, cost flat, status PENDING)
        Shipping->>Kafka: tokobapak.shipment.created.v1
        Notify->>Kafka: Consume tokobapak.payment.completed.v1
        Notify->>Buyer: email/WA "Pembayaran berhasil, pesanan dikirim"
        Order->>PG: UPDATE orders SET status=SHIPPED
    else stock kurang
        Order->>PG: UPDATE orders SET status=CANCELLED + compensate OrderCancelled
    end
```

## 2. State Machines

**Order** `PENDING → RESERVED → PAID → SHIPPED → DELIVERED | CANCELLED`
- `PENDING→RESERVED` hanya jika `stock>=qty` `FOR UPDATE`
- `RESERVED→PAID` setelah PayU callback `COMPLETED`
- `CANCELLED` hanya dari `PENDING`/`RESERVED` (tidak dari `PAID` tanpa compensate)

**PayU Transaction** (source of truth dana) `PENDING → VALIDATING → COMPLETED/FAILED` — TokoBapak `payments` hanya adapter.

**Cart** `HSET cart:{userId}` `TTL 604800` (7d), `Merge sum` = qty lama + qty baru.

**Shipment** `PENDING → SHIPPED → DELIVERED`, `cost` flat mock (bukan RajaOngkir).

## 3. Error & Edge (AGENTS rules)

- **Money** `BIGINT` minor unit `HALF_EVEN` never float
- **No oversell** `SELECT ... FOR UPDATE` di reserve
- **Idempotency** `X-Idempotency-Key` di `POST /v1/orders` & `/v1/payments` → replay 200 tanpa double posting (UNIQUE + `GetByKey`)
- **Outbox** `SELECT FOR UPDATE SKIP LOCKED` poller 5s → `tokobapak.<domain>.<event>.v1` DLQ `.dlq`
- **BFF** `src/lib/bff.ts` relay `accessToken` HttpOnly+CSRF ke `auth-service :3007`, `refresh 15m`
- **Gateway** Traefik `:8080` → backend `:3001-3010`

## 4. Routing (Frontend Vite)

`/` `Browse` (staleTime 60s) — `header` + `hero-carousel` + `categories` + `product-card` + `footer`
`/products?q=...` `Search` (60s)
`/cart` `HSET` (0) — `cart-item` or `empty` + `Checkout` link
`/checkout` (0) — `first-name/last-name/address/city/zip/phone` + `Place Order` → `SHIPPED`
`/login` BFF `accessToken` → `auth-storage` → `/`
`/register` `name/email/password/confirmPassword` → `auth-storage` → `/`

## 5. Non-Happy (hide MVP)

- `review` stars, `chat` Socket.IO, `media` R2, `promotion` voucher, `recommendation` ML — `enabled=false` 1 bulan, tidak ada di sequence MVP.

*Ref: `CONTEXT.md` glossary, `docs/adr/0003-payu-snapbi-adapter-saga.md`, `docs/architecture/SEQUENCE_DIAGRAMS.md`, E2E `playwright` 51 PASS.*
