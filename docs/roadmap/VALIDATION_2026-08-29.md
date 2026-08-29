# Validation Report — TokoBapak MVP Fase 0–4
**Date:** 2026-08-29 11:30 UTC  
**Validator:** AI (load-bearing harness) — sequential, one TODO at a time, full E2E  
**Env:** `m6a.4xlarge` Ubuntu 26.04, podman 5.7.0, podman-compose 1.5.0, Go 1.27, Node 20, Bun, Vite 6.4.3, Playwright 1.57, postgres:18-alpine, redis:alpine, apache/kafka:4.0.0, elasticsearch:8.17.0

## Summary
All 28 TODOs in `docs/roadmap/TODOS.md` marked ✅ were inspected against code, compose, DB, and runtime. **Infrastructure now healthy** after 3 fixes (postgres 18 mount, kafka healthcheck, traefik sock). **Code-level: scaffolds exist but business logic is stub** — only `/health` and `/v1/health` are implemented; CRUD, BFF, Saga, Search, Cart merge, etc. are interfaces/shims without wiring. Frontend routes are minimal stubs. E2E Playwright 7/11 passed (stub). Persistence and recovery verified.

## Environment & Service Health ✅ (fixed)
| Check | Before | After | Evidence |
|-------|--------|-------|----------|
| postgres:18 | `Error: PostgreSQL data in /var/lib/postgresql/data (unused mount)` — volume mounted at `/var/lib/postgresql/data` while image expects `/var/lib/postgresql` (parent) | Fixed `volumes: - postgres_data:/var/lib/postgresql` | `SELECT version()` → `PostgreSQL 18.6` (healthy 52s) |
| kafka 4.0.0 | healthcheck `kafka-broker-api-versions` not found (binary is `/opt/kafka/bin/kafka-broker-api-versions.sh`) → unhealthy | Fixed healthcheck to `/opt/kafka/bin/kafka-broker-api-versions.sh` | `kafka Up 8m (healthy)`; `kafka-topics.sh --list` → `tokobapak.test.v1` |
| traefik | mount `/var/run/docker.sock` missing (podman sock at `/run/user/1000/podman/podman.sock`) → Error statfs | Fixed to `/run/user/1000/podman/podman.sock:/var/run/docker.sock:ro` | `tokobapak-traefik Up 8m`; `curl :8081/api/http/routers` → `api@internal` |
| Go services healthcheck | `wget` not in `distroless/static-debian12:nonroot` → all Up (starting) forever | Removed healthchecks (distroless has no shell); rely on external curl | `curl :3001/health` → `{"status":"ok","service":"product-service"}` 9/9 200; `podman ps` 14 containers Up |
| legacy + archive | `podman-compose.yml.legacy-18svc` + `docs/archive/frontend-prd-nextjs-LEGACY.md` deleted in `88bee7c` per user intent build from 0 (ADR 0004) | Intentionally **not restored** — fokus TanStack MVP, no rollback | `ls` confirms deleted, `compose` header `MVP 9 svc only; legacy removed` |
| Public IP | `18.143.199.84`, host IP `172.31.13.132` | Verified `curl http://<ip>:3001/health` 200 on localhost, host IP, public IP | see below |

**Service Health (podman ps, 2026-08-29 11:28):**
```
tokobapak-postgres      Up 1m (healthy)   0.0.0.0:5432->5432
tokobapak-redis         Up 1m (healthy)   0.0.0.0:6379->6379
tokobapak-kafka         Up 9m (healthy)   0.0.0.0:9092->9092
tokobapak-elasticsearch Up 9m (healthy)   0.0.0.0:9200->9200
tokobapak-auth-service        Up 9m  :3007  {"status":"ok"}
tokobapak-user-service        Up 9m  :3006
tokobapak-product-service     Up 9m  :3001
tokobapak-cart-service        Up 9m  :3003  PONG (redis)
tokobapak-order-service       Up 8m  :3004
tokobapak-payment-service     Up 8m  :3005  HMAC 64hex
tokobapak-shipping-service    Up 8m  :3008
tokobapak-search-service      Up 8m  :3010  TypedClient
tokobapak-notification-service Up 8m :3009  tokobapak.payment.completed.v1
tokobapak-traefik             Up 8m  :8080 :8081
```

**Port & Connectivity:**
- `postgres:5432` → `SELECT 1` ok; `SELECT version()` 18.6
- `redis:6379` → `PING` PONG; `HSET` ttl 7*24h in code
- `kafka:9092` → `kafka-topics.sh --create tokobapak.test.v1` Created; `--list` ok
- `elasticsearch:9200` → `/_cluster/health` green 100%
- `host IP 172.31.13.132:3001/health` 200; `public IP 18.143.199.84:3001/health` 200

## T0 Freeze & Cleanup
| ID | Claim | Validation | Evidence | Fix |
|----|-------|------------|----------|-----|
| T0.1 | CONTEXT Payment vs PayU Transaction, Transfer vs Disbursement tidak rancu | ✅ Pass | `CONTEXT.md` glossary distinct: Payment (tokobapak payments table) vs PayU Transaction (PENDING→VALIDATING→COMPLETED), Transfer 1-hop vs Disbursement BI-FAST | — |
| T0.2 | Hide 9 cut enabled=false, header HIDDEN 9 | ✅ Pass (clean) | `podman-compose.yml` header `HIDDEN 9` + `MVP 9 svc only; legacy removed 29 Aug 2026` — 277 lines, no `legacy-18svc` (deleted per user intent build from 0) | — |
| T0.3 | Hapus docs Next.js, fokus TanStack | ✅ Pass (clean) | `frontend/web/README.md` deleted, `AGENTS.md` deleted, `docs/prd/frontend-prd.md` superseded build from 0 — `docs/archive` deleted intentionally per user intent (ADR 0004) | — |
| T0.4 | ARCHITECTURE High-Level Web App Next.js → TanStack Start Vite + BFF JWT HttpOnly+CSRF, infra m6a.4xlarge, EKS EC2 RDS t4g.micro | ✅ Pass | `ARCHITECTURE.md` lines 31-32 Frontend TanStack Start Vite, 38 booster, 48 TanStack, 148-149 auth RDS 18, 423 Q21–Q27 table m6a.4xlarge, postgres:18-alpine, redis:alpine, Traefik | — |
| T0.5 | Postgres 16→18, RDS t4g.micro | ⚠️ Fixed | `compose` image `postgres:18-alpine`, `SELECT version()` 18.6, but initial mount at `/data` caused error (see above) | Fixed mount to `/var/lib/postgresql` |

## T1 Backend Go 1.27 Uniform 9 Service
| ID | Claim | Validation | Evidence | Gap |
|----|-------|------------|----------|-----|
| T1.1 | Scaffold hexagonal lightweight `cmd/server/main.go` + `domain/model+port` + `application/service` + `adapter/{postgres,http,kafka,client/payu}` + `config` + `migrations` — 9 svc go vet+build OK, distroless 1001 8080 | ✅ Pass (scaffold) | `go.mod` go 1.27 9/9, `ls` structure ok, `Dockerfile` distroless 1001 8080 12.2MB, `go vet ./...` 9/9 exit 0, `podman build` 12.2MB | `main.go` only starts http Router, does not wire `postgres/redis/kafka/payu` adapters — stub |
| T1.1b | Outbox `id,topic,payload JSONB,created_at` + poller `SELECT FOR UPDATE SKIP LOCKED` 5s → `tokobapak.<domain>.<event>.v1` + DLQ `.dlq` — 5 svc poller+consumer | ✅ Code exists, ⚠️ Not wired | `outbox_poller.go` 9 svc has `SELECT FOR UPDATE SKIP LOCKED` and `topic+".dlq"`, `migrations` has outbox table; `notification-service` has `TopicPaymentCompleted = tokobapak.payment.completed.v1` | Poller `Start()` never called in `main.go`; no `kafka.Writer` produce verified beyond `tokobapak.test.v1` manual |
| T1.2 | product-service merge catalog+inventory → `products(stock)` + Flyway V1 | ✅ Pass (schema) | `migrations/001_init.sql` `products(stock BIGINT CHECK >=0)` + outbox; DB `tokobapak_products` exists | Handler only `/health`; no `POST /v1/products`, no `DecrementStock` impl (only interface) |
| T1.3 | search-service Go + `elastic/go-elasticsearch` v8 TypedAPI 1 index `products` | ✅ Pass (client) | `go.mod` v8.19.0, `es.go` `elasticsearch.NewTypedClient` | No `Index`/`Search` HTTP handlers; `/_cluster/health` green but index `products` not created (404 on `GET /products`) |
| T1.4 | cart-service Go + `redis/go-redis` `HSET cart:{userId}` TTL 7 hari + merge sum | ✅ Pass (redis) | `redis.go` `ttl: 7*24h`, `go-redis/v9` | No cart endpoints; only ping; `HSET`/`Merge` not implemented in handler |
| T1.5 | auth-service + user-service Go + `golang-jwt/jwt` BFF access short + refresh HttpOnly, `users.role=SELLER` | ✅ Pass (jwt) | `jwt.go` `Generate` 15m `exp`, `users` table `role CHECK CUSTOMER/SELLER/ADMIN` | No `/v1/auth/login` or BFF cookie logic beyond stub `relayToken` in frontend; `user-service` Postgres adapter only Ping |
| T1.6 | order-service Go Saga `PENDING→RESERVED→PAID→SHIPPED` + `SELECT FOR UPDATE` reserve | ✅ Pass (model) | `model` status enum, `saga_test.go` 2 PASS (`isAllowed` + compensate), `orders` table with outbox | `service.go` is `Health() string` stub; `postgres.go` only Ping; no `Reserve` with `FOR UPDATE` |
| T1.7 | payment-service Go thin adapter PayU `transaction-service` SNAP-BI `X-Idempotency-Key`/`X-SIGNATURE` + `payments(order_id UNIQUE, payu_reference UNIQUE, idempotency_key UNIQUE)` + `FOR UPDATE` callback | ✅ Pass (HMAC) | `payu_client.go` `Sign HMAC SHA256 64hex` + headers, `payments` table UNIQUEs, `payu_client_test.go` 3 PASS | `CreateTransaction` returns `payu-ref-` mock, no HTTP to PayU; callback `FOR UPDATE` only in test `TestPaymentForUpdateCallback` (in-memory) |
| T1.8 | shipping-service Go mock flat ongkir + emit `tokobapak.shipment.created.v1` | ✅ Pass (mock) | `shipments(cost BIGINT)` + outbox poller; log `tokobapak.shipment.created.v1` in comment | Handler stub; cost flat not exposed via API |
| T1.9 | notification-service Go consumer `tokobapak.payment.completed.v1` → email/WA | ✅ Pass (consumer) | `outbox_poller.go` `TopicPaymentCompleted`, `kafka.Consumer` with `FetchMessage` + `Commit` | `service.go` Health stub; no email/WA send; OutboxPoller is no-op |
| T1.10 | `go vet` + `golangci-lint` + unit test Saga + idempotency replay | ✅ Pass | `go vet ./...` 9 svc 0, `golangci-lint v1.64.8` vet PASS, `go test` Saga 2 PASS + PayU 3 PASS + idempotency 2 PASS = 7 PASS | Only 2 services have tests (order, payment); 7 services have `[no test files]` |

**Verdict T1:** Scaffold + migrations + contracts pass; **runtime wiring missing** — all 9 services expose only `/health` and `/v1/health` (404 on all business paths). Validate via `for port in 3001 3003 3004...; curl localhost:$port/v1/products` → 404.

## T2 Frontend TanStack Start Migration
| ID | Claim | Validation | Evidence | Gap |
|----|-------|------------|----------|-----|
| T2.1 | Init `frontend/web` TanStack Start + `tanstack/router` + `tanstack/query` Vite, hapus `next.config.ts`, `next-auth`, `next/image` — `package.json` no `next`, `vite.config.ts` + `index.html` + `src/main.tsx`, `bun run build` Vite 304k OK | ✅ Pass | `package.json` no `next` (only `next-themes`), `vite.config.ts` alias `next/image→shims`, `vite build` 304k JS 149k CSS 1.47s, `bun dev` ready 131ms | `app/(shop)` legacy Next folder still present under `frontend/web/app` (not used, Vite uses `src/routes`) |
| T2.2 | Migrasi routes `app/(shop)/` → `src/routes/` + BFF Token Relay server function — `src/routes/__root/index/products/cart/checkout`, `src/lib/bff.ts` HttpOnly+CSRF | ✅ Pass | `src/routes/__root.tsx`, `index.tsx`, `products/index.tsx`, `cart/index.tsx`, `checkout/index.tsx` + `bff.ts` `relayToken` + `refreshToken` | `bff.ts` is stub (ponytail comment) — no real HttpOnly cookie forwarding to `:3007` |
| T2.3 | Data layer: `prefetchQuery` + `HydrationBoundary` + `staleTime 60s` listing/search vs `0` cart/checkout — QueryClient staleTime 60s | ✅ Pass | `src/main.tsx` `QueryClient staleTime 60*1000` comment `60s listing/search per ADR 0004, 0 for cart/checkout overridden` | No `prefetchQuery`/`HydrationBoundary` usage in routes (routes are static divs) |
| T2.4 | Ganti `next/image` → `unpic`/`vite-imagetools` + hapus `next/font` — `unpic@4.2.2`, shim `next/image`→`img`, stiker Inter→font-sans | ✅ Pass | `package.json` `unpic *`, `vite.config.ts` alias, `shims/next-image.tsx` shim `img loading=lazy`, `shims/next-font.ts` `Inter→font-sans` | `unpic` not actually used beyond shim; `vite-imagetools` not installed (ponytail: naive `img` shim) |
| T2.5 | E2E Playwright: `vite dev` + `checkout.spec.ts` Browse→Search→Cart→Checkout→Pay→Ship→Notify — `playwright.config.ts` baseURL 3000 vite, `bun run dev` | ✅ Pass (config) | `playwright.config.ts` `baseURL 3000`, `webServer: npm run dev`, `e2e/checkout.spec.ts` etc 6 specs, `page-objects` | Playwright browsers missing libatk initially, then 7/11 passed after `npx playwright install --with-deps`; failures due to stub UI (header, hero, register) — see E2E below |

## T3 Integrasi PayU & E2E
| ID | Claim | Validation | Evidence |
|----|-------|------------|----------|
| T3.1 | Generate Go client OpenAPI PayU SNAP-BI `internal/client/payu` — `payu_client.go` HMAC SHA256 X-SIGNATURE/X-TIMESTAMP + X-Idempotency-Key, no sdk/java | ✅ Pass | `payu_client.go` `Sign` 64hex, headers `X-Idempotency-Key/Signature/Timestamp`, `New()` |
| T3.2 | E2E `payu/transaction-service` sandbox: `InitiateTransfer` + `QRIS_PAYMENT` + HMAC + `X-Idempotency-Key` round-trip — `payu_client_test.go` 3 tests PASS, idempotency replay 200 | ✅ Pass | `go test -run TestHMAC/TestIdempotency/TestQRIS` 3 PASS; replay deterministic `payu-ref-` |
| T3.3 | Reconciliation job harian `payments` vs PayU ledger — `internal/job/reconciliation.go` 24h ticker vs PayU ledger | ✅ Pass (stub) | `ReconciliationJob interval 24h`, `Reconcile()` logs `no mismatch (stub)` |

## T4 Validasi MVP 1 Bulan
| ID | Claim | Validation | Evidence |
|----|-------|------------|----------|
| T4.1 | Deploy 9 service Go + 1 frontend Start ke staging K8s, hide 9 cut tetap tidak deploy — `podman-compose build` 9 svc 12.2MB distroless 1001 OK, local `postgres:18-alpine` + `redis:alpine` healthy `PONG` + `SELECT version()` | ✅ Pass (local) | `podman images` 9 svc 12.2MB, `podman ps` 14 containers, `redis-cli ping` PONG, `psql version` 18.6, `curl :3001/health` 200, staging K8s EKS+ArgoCD pending (not deployed) |
| T4.2 | Load test 10k produk ES + cart merge + saga oversell test — `go test` 10k insert + cart merge sum + saga FOR UPDATE reserve (stub, full k6 pending) | ⚠️ Stub | `saga_test.go` `isAllowed`, `reserveStock` mock; no k6, no 10k ES insert, no real `SELECT FOR UPDATE` |
| T4.3 | Keputusan: delete permanen 9 service cut (build from 0) | ✅ Pass (clean) | `compose` header `HIDDEN 9` + `MVP 9 svc only; legacy removed` — no rollback file, `PROGRESS.md` keep `enabled=false` 1mo then delete permanen | — |

## CRUD Validation (Web App → Gateway → Backend → DB)
**Expected:** Each CRUD feature must support Create→Read→Update→Delete through full path: Web App (TanStack Start :3000) → Gateway (Traefik :8080) → Backend (Go :3001-3010) → DB/Redis/Kafka/ES → back.

**Actual (2026-08-29 11:30):**
- **Backend CRUD endpoints:** None beyond `/health`. `curl :3001/v1/products` 404, `:3003/v1/cart` 404, `:3004/v1/orders` 404, `:3005/v1/payments` 404, `:3006/v1/users` 404, `:3007/v1/auth/login` 404, `:3010/v1/search` 404, `:3008/v1/shipments` 404. Only `/health` and `/v1/health` 200.
- **Frontend CRUD:** Routes are static divs (`<div>Products listing staleTime 60s</div>` etc). No fetch to backend, no BFF wiring. `src/lib/bff.ts` stub.
- **DB persistence:** Direct `psql` and `redis-cli` work (see Recovery), but no backend writes via Web App → not reflected.
- **Gateway:** Traefik `api@internal` only; no routers for product/cart/order/payment ( `curl :8080/` 404, `:8081/api/http/routers` only internal). So Web App → Gateway → Backend routing not configured.

**Verdict:** CRUD lifecycle **FAIL** — infrastructure healthy, but application-layer CRUD not implemented (stub). Data created via `psql`/`redis-cli` persists, but not via Web App.

## Full E2E & Route Validation
### Backend HTTP Smoke (curl)
```
:3001/health 200  :3001/v1/health 200  :3001/v1/products 404
:3003/health 200  :3006/health 200  :3007/health 200  :3008/health 200
:3009/health 200  :3010/health 200  :3004/health 200  :3005/health 200
```
All 9 MVP services 200 on health, 404 on business paths.

### Frontend HTTP Smoke (vite dev :3000 & vite build preview :3000)
```
GET /          200  TokoBapak - Belanja Aman & Hemat
GET /products  200  (SPA fallback, same index.html)
GET /cart      200
GET /checkout  200
GET /nonexistent 200 (SPA 200, not 404 — expected for TanStack Start SPA)
```
`curl http://localhost:3000/` 200, `http://172.31.13.132:3000/` (host IP) — vite dev binds 0.0.0.0, reachable; `http://18.143.199.84:3000/` public IP also 200 via vite preview (after `vite preview --host`). `public IP` detected via `curl -4 ifconfig.me` → `18.143.199.84`.

### Playwright CLI/headless E2E (Web App as entry)
- **Before:** `Executable doesn't exist` + `libatk-1.0.so.0` missing → fixed via `npx playwright install` + `apt-get install libatk1.0-0 ...` (with-deps)
- **After:** `npx playwright test e2e/sanity.spec.ts e2e/homepage.spec.ts` → **7 passed, 4 failed (1.4m)**
  - Passed: `homepage should load`, `should have search functionality`, `cart` etc.
  - Failed: `should display header with logo`, `hero carousel`, `footer`, `Sanity Register and Login` — stub UI lacks `header`, `heroCarousel`, `h1 register-title`.
- Full suite `npx playwright test` → 51 failed initially (no browsers), after deps 4 failures due to stub UI (expected).

**Critical user journey:** `Browse→Search→Cart→Checkout→Pay→Ship→Notify` not end-to-end via Gateway→Backend→Persistence→Web App; only static route smoke.

### Regression
- `go vet` 9 svc still PASS after fixes
- `vite build` still 304k after fixes

## Verification, Recovery & Evidence
### Targeted Tests & Project Suite
- `go test ./...` per svc: order-service 2 PASS, payment-service 5 PASS (3 PayU + 2 idempotency), other 7 svc `[no test files]`
- `make test` equivalent: `go test ./... && npx playwright test` → go 7 PASS, playwright 7/11 PASS (stub)
- `vite build` 304k OK
- `podman-compose build` 12.2MB distroless 1001 OK

### Compose-level Validation
| Check | Result | Evidence |
|-------|--------|----------|
| Service health | 14 Up, 4 infra healthy, 9 Go Up | `podman ps` |
| Inter-service connectivity | postgres `psql SELECT 1` ok, redis `PING` PONG, kafka `kafka-topics.sh --list` ok, es `/_cluster/health` green | `podman exec` |
| Gateway routing | Traefik up but no routers for business services (exposedbydefault=false, no labels) | `curl :8080/` 404, `/api/http/routers` only internal |
| API contracts | Only health contracts exist; business contracts 404 | curl 404 above |
| Logs | No FATAL except `relation "payments" does not exist` when querying before migration | `podman logs --tail` |
| Persistence across restart | ✅ postgres `persist_test` before_restart → after `podman restart postgres` still `before_restart`; redis `PERSIST before_restart` → after restart still `before_restart` | `psql SELECT val`, `redis-cli GET` |
| Restart/recovery | postgres 18.6, redis PONG, kafka healthy after restart; Go services Up without healthcheck (No restart loop) | `podman ps` after restart |
| Resource/restart sanity | postgres 25MB, redis 6MB, kafka 330MB, es 1.08GB, Go 1.7-2MB each, traefik 34MB; no CrashLoop | `podman stats --no-stream` |
| Security/config smoke | distroless `USER 1001:1001`, `EXPOSE 8080`, but `CapDrop []`, `ReadonlyRootfs false` (compose not setting `drop ALL`, `readOnlyRootFilesystem` per AGENTS rule 8) | `podman inspect` |
| Warnings/errors | `WARNING: Redis does not require authentication`, `pg_isready` ok | logs |

### Fixes Applied During Validation (auto-investigated)
1. **postgres 18 mount** `postgres_data:/var/lib/postgresql` (was `/data` → error) — rebuild healthy
2. **kafka healthcheck** `.../kafka-broker-api-versions.sh` (was without `.sh`/path → unhealthy)
3. **traefik docker.sock** `/run/user/1000/podman/podman.sock` (was `/var/run/docker.sock` → statfs error)
4. **Go healthchecks** removed (distroless no `wget`) — `Up (starting)` → `Up`
5. **Legacy + archive** deleted per user intent build from 0 (ADR 0004) — intentionally not restored
6. **Playwright deps** installed (`libatk`, `chromium`)

Re-ran affected tests after each fix: `go test` still PASS, `podman ps` healthy, `vite build` OK.

## Documentation & Completion
- **TODOS.md** not modified (all 28 remain ✅ per rule “Do not modify TODO status”).
- **PROGRESS.md** needs update with this validation evidence (see below).
- **ADR:** No new ADR, but note that T4.1 staging K8s not deployed (local only).
- **LESSONS.md** needs ponytail decisions for infra fixes.
- **CHANGELOG.md** needs 0.2.1 validation fixes.

**A TODO is validated only when** implementation, CRUD, E2E, route smoke, deployment, health, connectivity, persistence, recovery pass. **None of the 28 meet full criteria** — they pass at scaffold/migration/contract level but fail at runtime CRUD/E2E/routing.

## Actionable Tasks Remaining (not in TODOS, but needed for MVP Done)
1. **Wire `main.go`** for 9 services: connect `pgxpool`, `redis`, `kafka`, `elasticsearch`, start `OutboxPoller`, register `ProductRepository`, `CartRepository`, `OrderSaga`, `PayUClient` etc.
2. **Implement handlers:** `POST /v1/products`, `GET /v1/products/:id` with `DecrementStock` `FOR UPDATE`, `POST /v1/cart` `HSET` TTL 7d, `POST /v1/orders` `X-Idempotency-Key` + Saga, `POST /v1/payments` + callback `FOR UPDATE`, `GET /v1/search`, etc. (currently 404).
3. **BFF:** Implement `src/lib/bff.ts` HttpOnly+CSRF relay to `auth-service:3007` and `HydrationBoundary` prefetch.
4. **Gateway:** Add Traefik labels or Kong routes for `Host(`tokobapak.localhost`)` → backend.
5. **Migrations:** Auto-run on startup (e.g., `golang-migrate` or `sqlc`); currently DBs exist but tables not created except via manual `psql`; `tokobapak` has no tables.
6. **Security:** Add `cap_drop: ALL`, `read_only: true`, `security_opt` per AGENTS rule 8.
7. **Playwright:** Update page-objects/expectations to match stub UI or implement hero/header/register.
8. **k6 load:** Implement 10k ES, cart merge, oversell test.
9. **Staging K8s:** Deploy to EKS + ArgoCD.

## Evidence Commands (repro)
```bash
podman ps --format "{{.Names}} {{.Status}}"
curl -s http://localhost:3001/health; curl -s http://localhost:3007/health
curl -s http://localhost:9200/_cluster/health | jq .status
podman exec tokobapak-postgres psql -U postgres -c "SELECT version();"
podman exec tokobapak-redis redis-cli ping
podman exec tokobapak-kafka /opt/kafka/bin/kafka-topics.sh --bootstrap-server localhost:9092 --list
curl -4 ifconfig.me; hostname -I; curl -s http://172.31.13.132:3001/health
curl -s http://localhost:3000/ | grep TokoBapak
cd frontend/web && npx playwright test --reporter=list
cd backend/services/order-service && go test -v ./...
cd backend/services/payment-service && go test -v ./...
podman exec tokobapak-postgres psql -U postgres -c "INSERT INTO persist_test ..."
podman restart tokobapak-postgres; podman exec ... SELECT val
podman logs tokobapak-kafka | tail
podman stats --no-stream
```

## Conclusion
**TODOS marked ✅ are scaffold-complete, not feature-complete.** Validation shows infra fixed and healthy, but application CRUD/E2E not yet implemented. Next step: implement 1–9 above, then re-run this validation until all 5 gate checks per TODO pass.

*Generated: 2026-08-29 11:32 UTC, podman-compose.yml fixed, legacy/archive deleted per user intent build from 0 (ADR 0004).*
