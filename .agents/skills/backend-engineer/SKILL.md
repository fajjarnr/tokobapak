---
name: backend-engineer
description: TokoBapak backend engineering for Go hexagonal services — chi routing, pgx transactions, outbox/Kafka, Redis cart, Elasticsearch search, JWT auth, PayU SNAP-BI adapter, financial integrity (BIGINT HALF_EVEN), idempotency, and testing. Use when implementing, debugging, or reviewing any TokoBapak Go service; verify all library APIs with Context7 first.
---

# TokoBapak Backend Engineer

Use the smallest change that preserves financial integrity, hexagonal boundaries, and the existing service template. Read the target service's `go.mod`, `config/`, `migrations/*.sql`, and tests before changing code. Reuse the established `internal/domain/port` boundary — do not add a second HTTP client, Kafka producer, or auth middleware for one endpoint.

## Context7 documentation gate — REQUIRED

Before writing or changing code that uses a library, framework, SDK, or API:

1. Read the service `go.mod` to determine the installed version.
2. Resolve the library in Context7 — prefer the official high-trust ID.
3. Query **one concrete topic at a time** (routing, pool/tx, writer/reader, commands, JWT signing). Use returned docs as source of truth — never recall flags, option names, or method signatures from memory.
4. If the indexed version differs from `go.mod`, treat `go.mod` as truth and note the mismatch.
5. Re-resolve after bumping a dependency. Do not mix examples across major versions.

**TokoBapak stack (general — verify installed version via `go.mod` + `podman-compose.yml`):**

| Surface | Stack | Context7 ID |
|---|---|---|
| Language | Go (uniform across services) | `go.dev/doc` |
| HTTP | `go-chi/chi` | `/go-chi/docs` |
| Postgres | `jackc/pgx` + `pgxpool` | `/jackc/pgx` |
| Kafka | `segmentio/kafka-go` | `/segmentio/kafka-go` |
| Redis | `redis/go-redis` — cart-service | `/redis/go-redis` |
| Search | `elastic/go-elasticsearch` — search-service | `/elastic/go-elasticsearch` |
| Auth | `golang-jwt/jwt` — auth/user | `/golang-jwt/jwt` |
| Infra | Postgres, Redis, Kafka KRaft, Elasticsearch, Traefik via `podman-compose.yml` | — |

Stack names are stable; versions are intentionally omitted — `go.mod` and compose files are the source of truth.

## Build and dependencies

- `go.mod` is per-service (not monorepo). Run from service dir: `go test ./... -count=1 -race && go vet ./...` — must pass all services after change.
- Let `go.mod` manage versions; bump only with Context7 compatibility check + `go mod tidy`.
- No shared starter — copy the established template `cmd/server/main.go → config.Load → chi → :PORT` and `internal/domain/{model,port} → application/service → adapter/{http,postgres,redis,kafka,client/payu} → config`.

## Hexagonal architecture

Keep domain independent of chi, pgx, kafka-go, redis, elasticsearch, and config. External I/O only via Port.

```
cmd/server (wire) -> adapter/http (chi handler + DTO) -> application/service -> domain/model+port
                                          ^                                    |
adapter/{postgres,redis,kafka,client/payu}  ----------------------------------+
```

- DTOs in `internal/domain/port` (or `port/dto.go`); never expose domain model or pgx/redis types at HTTP boundary.
- Inbound use-cases + outbound ports beside `domain/model`; adapters implement ports.
- Persistence entities / `pgx.Row` scanning / framework tags stay in `adapter/postgres`. Domain enums are top-level files in `domain/model`.
- Match service's established package names; don't move whole service to satisfy guide.

## Financial integrity

- Money = `BIGINT` minor unit (cents), **never `float`/`double`**. `CHECK(price>=0)`, `CHECK(stock>=0)`.
- Rounding `HALF_EVEN` when converting major→minor. One helper, not per-handler ad-hoc math.
- Compare with `==` on int64; never float epsilon.
- No oversell: `DecrementStock WHERE stock >= qty FOR UPDATE` or `SELECT ... FOR UPDATE` inside tx. DB constraint is part of invariant.
- Mask PII (`NIK/PIN/token`) in logs. Secrets via `Vault/env` (`ENVIRONMENT_VARIABLES.md`), never hardcoded.

## Transactions and outbox

Business mutation + outbox row **must be one pgx transaction**:

```go
tx, _ := pool.Begin(ctx)
defer tx.Rollback(ctx)
// 1. business write (order, payment, stock)
_, err = tx.Exec(ctx, `INSERT INTO orders (...) VALUES (...)`)
if err != nil { return err }
// 2. outbox write — same tx
_, err = tx.Exec(ctx, `INSERT INTO outbox(id, topic, payload) VALUES ($1,$2,$3)`,
    id, "tokobapak.order.created.v1", payload)
if err != nil { return err }
return tx.Commit(ctx)
```

- Poller: `SELECT ... FOR UPDATE SKIP LOCKED` every 5s → `kafka-go.Writer.WriteMessages` → delete/ack. Topics `tokobapak.<domain>.<event>.v1` + `.dlq` only for DLQ. CloudEvents envelope.
- Never `kafka.Writer.WriteMessages` from `application/service` or `domain` directly.
- Consumer must be idempotent (at-least-once). Keep `type/source/subject/correlationId/version` stable.
- Verify poller with: rollback leaves no business row **and** no outbox row; commit creates exactly one durable outbox row.

## Persistence — pgx

- Repos are outbound ports; `pgxpool.Pool`, `pgx.Tx`, mappers stay in `adapter/postgres`.
- Read paths `pool.Query` / write paths `pool.Begin` + `tx.Commit`. Avoid holding tx across network calls (PayU/Kafka).
- Use `pgx.TxOptions` only when needed; default is fine for MVP.
- Prevent N+1: single `JOIN` or batched `WHERE id = ANY($1)`; verify with `EXPLAIN`.
- Never expose `DELETE` on financial tables; use status `CANCELLED` + compensating outbox event. Saga compensates via `RESERVED→CANCELLED` + stock restore.

## API and idempotency

- Paths `/v1/plural-kebab` (e.g. `/v1/orders`, `/v1/payments`). RFC 9457 errors with unique `code` (`PAY_001` etc.), Spectral lint must pass 0 errors.
- Every `checkout/order/payment` mutation requires `X-Idempotency-Key: UUIDv4`. DB `UNIQUE(idempotency_key)` + `UNIQUE(payu_reference)` + `UNIQUE(order_id)` (`payment-service/migrations/001_init.sql`).
- Atomically reserve key: `INSERT ... ON CONFLICT DO NOTHING` then `SELECT FOR UPDATE`. Same key + same fingerprint → replay stored outcome; same key + different payload → `409 Conflict`. Never execute two payments for one key.
- Validate at boundary (handler) — keep DTO validation separate from domain invariants.
- PayU adapter: `POST /v1.0/access-token/b2b` + `POST /v1.0/transfer-va/payment` HMAC-SHA512 over canonical `method:path:timestamp:body` (`payu_client.go:26 Sign`), replay window ±300s, `X-TIMESTAMP`/`X-SIGNATURE`. Preserve `X-Idempotency-Key` across retries; retry only transient `5xx`/`429` with bounded backoff.

## Caching — Redis (cart)

```go
// HSET cart:{userId} field -> JSON, TTL 604800 (7 days)
pipe.HSet(ctx, "cart:"+userID, itemID, data)
pipe.Expire(ctx, "cart:"+userID, 604800*time.Second)
```

- Source of truth for cart is Redis (`HSET` + `TTL 604800`), not Postgres. Merge `sum` on login.
- Never treat Redis as truth for `orders/payments/stock/balance` — Postgres is truth.
- Explicit key, TTL, serialization, invalidation. Add multi-layer cache only after measured bottleneck.

## Resilience and external calls (PayU/ES)

- Resolve `kafka-go`/`pgx`/`go-redis`/`go-elasticsearch` via Context7 before configuring timeouts/retries.
- Timeouts explicit per client (HTTP `Client{Timeout}`, pgx `PoolConfig`, redis `DialTimeout`). No unbounded calls.
- Retry **only** transient `5xx`/`429`/network timeout and only when idempotency key preserved. Never retry `4xx` validation/auth.
- Failure contract: `timeout | circuit-open | invalid upstream | ambiguous PENDING` must be distinguishable — return `PENDING` + status `GET /v1/payments/{id}` / reconciliation, never fake success.

## Testing and verification

TDD red-first: failing test that reproduces bug before fix.

- `go test ./... -count=1 -race && go vet ./...` — all services must PASS.
- Cover domain invariants exhaustively; adapters 80%+. Test real behavior not mock interactions — use Testcontainers for pgx/kafka where boundary matters.
- Every financial mutation needs concurrency + idempotency test (parallel `go test -race` with same `X-Idempotency-Key`).
- Outbox: verify `tx.Rollback` → no outbox row, `tx.Commit` → exactly one row.
- Run smallest service test first, then `podman compose` health `PONG`/`SELECT version()` + `playwright` for E2E.

## Observability and security

- Structured log fields: `request_id`, `trace_id`, `user_id`, `order_id`, `outcome`, `code`, `duration_ms`. Never log bodies with PII/credentials/tokens/PINs.
- Health `/health` liveness, metrics if present. Keep request ID propagation through outbox/Kafka headers.
- Hash/encrypt PII at rest per `AGENTS.md: Security` (Vault Transit / env).

## Platform workflow

Before change, read `CONTEXT.md` (Product/Inventory/Search/Cart/Order/Payment/Shipment glossary) + `docs/adr/0001-0004` + service `migrations/*.sql` + `podman-compose.yml` env (`PAYU_BASE_URL`, `DB_HOST`, `KAFKA_BROKERS`). Compliance matrix changes over time — don't copy from stale audit.

Read detailed references only when needed:

- [Hexagonal Go template](local://backend/services/order-service/internal/domain/port/port.go) — actual port boundary
- [PayU core banking patterns](../../payu/.agents/skills/core-banking-engineer/references/hexagonal_architecture_guide.md) — DDD adaptation
- Product domain enforcement via `CHECK` + `FOR UPDATE` (see `product-service/migrations/001_init.sql`)

## Official documentation to resolve through Context7

- Chi: https://go-chi.io/ — ID `/go-chi/docs`
- pgx: https://github.com/jackc/pgx — ID `/jackc/pgx`
- kafka-go: https://github.com/segmentio/kafka-go — ID `/segmentio/kafka-go`
- go-redis: https://redis.uptrace.dev/ — ID `/redis/go-redis`
- go-elasticsearch: https://www.elastic.co/guide/en/elasticsearch/client/go-api/current/index.html — ID `/elastic/go-elasticsearch`
- golang-jwt: https://golang-jwt.github.io/jwt/ — ID `/golang-jwt/jwt`
- Go: https://go.dev/doc/ — stdlib `context`, `net/http`, `encoding/json`
