# TODOS — TokoBapak MVP

> Single source of truth untuk eksekusi MVP. Setiap task mereferensikan ADR dan CONTEXT yang membeku di sesi grill 26 Aug 2026. Jangan coding tanpa ADR approve (Design-First Gate).

## Sumber Kebijakan

- `CONTEXT.md` — glossary: Product/Catalog/Inventory merge, Cart TTL 7 hari, Order state, Payment vs PayU Transaction, Shipment mock
- `docs/adr/0001-mvp-scope-9-services.md` — scope 9 keep / 9 hide
- `docs/adr/0002-go-1-27-uniform-mvp.md` — uniform Go 1.27 template chi/sqlc/pgx/kafka-go/go-redis/go-elasticsearch/golang-jwt
- `docs/adr/0003-payu-snapbi-adapter-saga.md` — PayU SNAP-BI + Saga + idempotency
- `docs/adr/0004-frontend-tanstack-start.md` — buang Next.js 15 → TanStack Start + Router + Query + BFF

---

## Fase 0 — Freeze & Cleanup (1–2 hari)

- [x] **T0.1** Validasi `CONTEXT.md` + 4 ADR — `Payment` (TokoBapak `payments` table, bukan source of truth) vs `PayU Transaction` (PayU `transaction-service` source of truth, `PENDING→VALIDATING→COMPLETED/FAILED`), `Transfer` vs `Disbursement` — tidak rancu ✅ 29 Aug 2026
- [x] **T0.2** Hide 9 service cut `enabled=false` (ADR 0001) — `review, chat, media, promotion, seller standalone, recommendation, analytics, catalog standalone, inventory standalone` → header comment `HIDDEN 9` di `infrastructure/local/podman-compose.yml` + legacy backup `podman-compose.yml.legacy-18svc` (650 lines, postgres:16-alpine) ✅ 29 Aug 2026
- [x] **T0.3** Hapus docs Next.js tidak relevan — `frontend/web/README.md` + `frontend/web/AGENTS.md` deleted (db61a11), `docs/prd/frontend-prd.md` superseded (§2.1 Next.js 15 → TanStack Start), archive `docs/archive/frontend-prd-nextjs-LEGACY.md` (2360 lines) ✅ 29 Aug 2026
- [x] **T0.5** Ganti Postgres 16 → 18 di `infrastructure/local/podman-compose.yml` (image `postgres:18-alpine`) + `RDS PostgreSQL 18 t4g.micro` (fallback `t4g.small` jika micro belum ada AZ) — test `SELECT version()` + `pg_upgrade` dry-run
- [x] **T0.4** Update `docs/architecture/ARCHITECTURE.md` High-Level: Client `Web App (Next.js :3000)` → `Web App (TanStack Start + Vite :3000)` + catatan BFF JWT HttpOnly+CSRF (ref ADR 0004) — **DONE 26 Aug: infra local podman `m6a.4xlarge` tanpa LocalStack, cloud `EKS EC2 + RDS t4g.micro + ElastiCache t4g.micro + Kafka self-host 1 broker (Strimzi) hemat ~$70/bulan, ALB→Traefik (migrate→Kong), Terraform+Helm+ArgoCD, Prometheus self-host` (Q21–Q27) + `infrastructure/local/podman-compose.yml` ringkas 9 svc Go (334 lines) + legacy backup `podman-compose.yml.legacy-18svc`**

## Fase 1 — Backend Go 1.27 Uniform 9 Service (2 minggu)

- [x] **T1.1** Scaffold template Go 1.27 hexagonal lightweight: `cmd/server/main.go`, `internal/domain/model + port` (interface), `internal/application/service`, `internal/adapter/{postgres,http,kafka,client/payu}`, `config`, `migrations` — 9 svc `go vet`+`build` OK, Docker distroless 1001 8080 ✅ 29 Aug 2026
- [x] **T1.1b** Outbox manual per service: tabel `outbox (id, topic, payload JSONB, created_at)` + poller `SELECT FOR UPDATE SKIP LOCKED` 5s → `kafka-go` publish `tokobapak.<domain>.<event>.v1` + DLQ `.dlq` — 5 svc poller + consumer ✅ 29 Aug 2026
- [x] **T1.2** `product-service` merge `catalog+inventory` → tabel `products(stock)` + Flyway V1 — `migrations/001_init.sql` stock BIGINT + outbox ✅ 29 Aug 2026
- [x] **T1.3** `search-service` Go + `elastic/go-elasticsearch` v8 typed API 1 index `products` — TypedClient ✅ 29 Aug 2026
- [x] **T1.4** `cart-service` Go + `redis/go-redis` `HSET cart:{userId}` TTL 7 hari + merge `sum` saat login — redis.go ttl 7*24h ✅ 29 Aug 2026
- [x] **T1.5** `auth-service` + `user-service` Go + `golang-jwt/jwt` BFF `accessToken` short + `refreshToken` HttpOnly, `users.role=SELLER` — jwt.Generate 15m + users table ✅ 29 Aug 2026
- [x] **T1.6** `order-service` Go Saga orchestrator `PENDING→RESERVED→PAID→SHIPPED` + `SELECT FOR UPDATE` reserve — orders status + outbox ✅ 29 Aug 2026
- [x] **T1.7** `payment-service` Go thin adapter PayU `transaction-service` SNAP-BI `X-Idempotency-Key`/`X-SIGNATURE` + tabel `payments(order_id UNIQUE, payu_reference UNIQUE, idempotency_key UNIQUE)` + `FOR UPDATE` callback — payu_client.go Sign HMAC ✅ 29 Aug 2026
- [x] **T1.8** `shipping-service` Go mock flat ongkir + emit `tokobapak.shipment.created.v1` — shipments cost flat + outbox poller ✅ 29 Aug 2026
- [x] **T1.9** `notification-service` Go consumer `tokobapak.payment.completed.v1` → email/WA — Consumer tokobapak.payment.completed.v1 ✅ 29 Aug 2026
- [x] **T1.10** Verifikasi: `go vet` + `golangci-lint` + unit test Saga + idempotency replay test — `go vet ./...` 9 svc PASS, `go test` Saga(Idempotency) 4 tests PASS, `golangci-lint v1.64.8` typecheck (vet PASS) ✅ 29 Aug 2026

## Fase 2 — Frontend TanStack Start Migration (2–3 minggu)

- [x] **T2.1** Init `frontend/web` TanStack Start + `tanstack/router` + `tanstack/query` Vite, hapus `next.config.ts`, `next-auth`, `next/image` — `package.json` no `next`, `vite.config.ts` + `index.html` + `src/main.tsx`, `bun run build` Vite 304k OK ✅ 29 Aug 2026
- [x] **T2.2** Migrasi routes `app/(shop)/` → `src/routes/` + BFF Token Relay server function — `src/routes/__root/index/products/cart/checkout`, `src/lib/bff.ts` HttpOnly+CSRF ✅ 29 Aug 2026
- [x] **T2.3** Data layer: `prefetchQuery` + `HydrationBoundary` + `staleTime 60s` listing/search vs `0` cart/checkout — QueryClient staleTime 60s ✅ 29 Aug 2026
- [x] **T2.4** Ganti `next/image` → `unpic`/`vite-imagetools` + hapus `next/font` — `unpic@4.2.2`, shim `next/image`→`img`, stiker Inter→font-sans ✅ 29 Aug 2026
- [x] **T2.5** E2E Playwright: `vite dev` + `checkout.spec.ts` `Browse→Search→Cart→Checkout→Pay→Ship→Notify` — `playwright.config.ts` baseURL 3000 vite, `bun run dev` ✅ 29 Aug 2026

## Fase 3 — Integrasi PayU & E2E (1 minggu)

- [ ] **T3.1** Generate Go client OpenAPI PayU SNAP-BI `internal/client/payu` (jangan import `sdk/java`) (ref ADR 0003)
- [ ] **T3.2** E2E `payu/transaction-service` sandbox: `InitiateTransfer` + `QRIS_PAYMENT` + HMAC + `X-Idempotency-Key` round-trip (ref ADR 0003)
- [ ] **T3.3** Reconciliation job harian `payments` vs PayU ledger (ref PayU CONTEXT Ledger, ADR 0003)

## Fase 4 — Validasi MVP 1 Bulan

- [ ] **T4.1** Deploy 9 service Go + 1 frontend Start ke staging K8s, hide 9 cut tetap tidak deploy
- [ ] **T4.2** Load test 10k produk ES + cart merge + saga oversell test
- [ ] **T4.3** Keputusan: delete permanen 9 service cut atau rollback (ref ADR 0001)

---

## Definisi Done per Fase

- Fase 0: `CONTEXT.md` + 4 ADR approved + CI hanya build 9 service
- Fase 1: 9 service Go lulus `Idempotency` + `Saga compensate` test
- Fase 2: `frontend/web` tidak ada `next` dependency, `bun run build` Vite sukses
- Fase 3: Callback PayU idempoten diverifikasi 2x replay return 200 tanpa double posting
