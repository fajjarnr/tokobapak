# AGENTS.md — TokoBapak E-commerce Platform (MVP 26 Aug 2026)

> Panduan singkat untuk AI Agent. Detail lengkap ada di `docs/` — file ini hanya berisi aturan yang **wajib dipatuhi** + pointer. Sumber kebenaran MVP: `CONTEXT.md` + `docs/adr/0001-0004` + `docs/roadmap/TODOS.md` — jangan coding tanpa ADR approve (Design-First Gate, ref `docs/README.md` superseded).

## What is TokoBapak

Marketplace multi-vendor (microservices + event-driven Saga choreography) untuk pasar Indonesia. **MVP 26 Aug 2026**: 9 services **Go 1.27.0 uniform** (hide 9 via `enabled=false` bukan `git rm`) + **TanStack Start + TanStack Router + Vite** (migrasi dari Next.js 15, ADR 0004) + **PayU SNAP-BI adapter** sebagai sumber kebenaran dana. Local: `m6a.4xlarge` podman (`postgres:18-alpine`, `redis:alpine`, `cp-kafka:7.5.0` 1 broker, `elasticsearch:8.17.0`, `Traefik:8080`); Cloud: EKS EC2 + RDS t4g.micro + ElastiCache t4g.micro + Kafka self-host 1 broker.

## Commands

| Action | Command |
| :----- | :------ |
| Run web (repo saat ini masih Next.js) | `cd frontend/web && bun install && bun dev` — target MVP: `npm run dev` Vite TanStack Start (ADR 0004 T2.1) |
| Local infra | `cd infrastructure/local && podman compose up -d` — postgres 5432, redis 6379, kafka 9092, es 9200, traefik 8080 |
| Build Go uniform (9 MVP) | `go run backend/services/<service>/cmd/server/main.go` atau `go build -o bin/server ./cmd/server` |
| All tests | `go vet ./... && golangci-lint run && go test ./...` + `npx playwright test` (E2E `vite dev`) |
| Check services | `podman ps` / `kubectl get pods -n tokobapak` |

> `backend/README.md` masih tulis NestJS/Spring Boot — **superseded** per `docs/README.md`, jangan pakai. `frontend/web` masih `app/` Next.js — akan jadi `src/routes/` TanStack (T2.1).

## Layout

- `frontend/web` — **legacy** Next.js 15 App Router `app/(shop)` + `next-auth` + ISR → **target** TanStack Start `src/routes/` + BFF JWT HttpOnly+CSRF + `HydrationBoundary` (ADR 0004, `docs/adr/0004`)
- `backend/services/` — **9 MVP Go 1.27 keep**: `auth:3007`, `user:3006` (`role=SELLER`), `product:3001` (merge `catalog+inventory` → `products.stock`), `cart:3003` (go-redis TTL 7 hari), `order:3004` (Saga), `payment:3005` (thin adapter PayU SNAP-BI), `shipping:3008` (mock flat), `search:3010` (go-elasticsearch 1 index), `notification:3009` (Kafka consumer) **+ 9 hide** `catalog, inventory, seller, promotion, review, chat, media, recommendation, analytics` → `enabled=false` (ADR 0001, `CONTEXT.md`)
- `backend/services/<svc>/` — template Go hexagonal lightweight: `cmd/server/main.go`, `internal/domain/{model,port}`, `internal/application/service`, `internal/adapter/{postgres(sqlc+pgx),http(chi/gin),kafka,client/payu}`, `config`, `migrations/` + `outbox` (ADR 0002)
- `infrastructure/local/podman-compose.yml` — 9213 bytes, 9 svc Go + infra (bukan `infrastructure/docker`), legacy 18 svc di `podman-compose.yml.legacy-18svc`; cloud Terraform+Helm+ArgoCD EKS
- `docs/` — `adr/0001-0004` (sumber kebenaran), `architecture/ARCHITECTURE.md` (T0.4 sudah update Web→TanStack, Kong→Traefik), `roadmap/TODOS.md` (Fase 0–4 single source), `CONTEXT.md` (glossary Payment vs PayU Transaction), `prd/` superseded

## 🚨 Non-Negotiable Rules

1. **Money**: `products.price` pakai `DECIMAL(12,2)`/minor IDR; **PayU adapter WAJIB `BigDecimal(19,4) HALF_EVEN`** + `payu_reference UNIQUE` (ADR 0003, PayU ledger immutable) — NEVER `float`/`double`.
2. **No Oversell**: Stock = `products.stock` kolom + `SELECT FOR UPDATE` di `order-service` reserve; **bukan** `inventory-service` standalone (ADR 0001, CONTEXT Inventory). Jangan update tanpa reserve event.
3. **Idempotency**: Semua `checkout/payment/order` wajib `X-Idempotency-Key` + HMAC SNAP-BI `X-SIGNATURE`/`X-TIMESTAMP`; tabel `payments(order_id UNIQUE, payu_reference UNIQUE, idempotency_key UNIQUE)` + `FOR UPDATE` callback (ADR 0003).
4. **Event Publishing**: **Outbox manual** (bukan `outbox-starter` Java) — tabel `outbox(id, topic, payload JSONB)` + poller `SELECT FOR UPDATE SKIP LOCKED` 5s → `kafka-go` publish `tokobapak.<domain>.<event>.v1` + DLQ `.dlq`, CloudEvents 1.0 (ADR 0002/0003).
5. **Hexagonal Lightweight**: External comms lewat `port` interface; DTO di `port`; `handler → service → port → adapter` — tanpa `shared/outbox-starter`/`saga-starter` (ADR 0002).
6. **API & Error**: Path versioned `/v1/...` plural kebab-case; error RFC 9457 code unik (`ORD_001`, `PAY_002`); saga choreography `OrderCreated → reserve → PayU charge → shipment` kompensasi `OrderCancelled` (ADR 0003).
7. **Frontend**: TanStack Start + Router + Query Vite; BFF Token Relay server function, `staleTime 60s` listing/search vs `0` cart/checkout via `HydrationBoundary` prefetch; `unpic` ganti `next/image` (ADR 0004). Maksimalkan Server Functions, client hanya leaf.
8. **Container**: distroless/UBI9, non-root 1001, drop ALL caps, read-only FS, port sesuai katalog (3001–3010, 8080 Traefik).
9. **Security**: Mask PII di log, encrypt di DB; no secrets di code (Vault/env); validasi Zod di trust boundary; JWT `golang-jwt` HttpOnly+CSRF (ADR 0002/0004).
10. **TDD**: NO PROD CODE tanpa failing test; test idempotency replay 2x + Saga reserve + outbox poller; `go vet` + `golangci-lint` + frontend Playwright `Browse→Search→Cart→Checkout→Pay→Ship→Notify` (TODOS T1.10, T2.5).
11. **Git & SemVer**: Conventional Commits `type(scope): msg`; no force-push protected; SemVer `MAJOR.MINOR.PATCH` (MAJOR=breaking API/DB/event); image tag = git tag `vX.Y.Z`; CHANGELOG Keep a Changelog ISO8601.

## 🧠 AI Working Protocol & Debugging

- **Design-First Gate**: Dilarang tulis code/scaffold tanpa design plan disetujui. Rujuk `CONTEXT.md` + ADR + `TODOS.md` Fase 0–4 dulu.
- **Root Cause Reproduction**: Buat failing test reproduksi bug (misal `SELECT FOR UPDATE` race, HMAC invalid) sebelum fix.
- **Dev Loop**: Error Analysis → Minimal Fix → Local Test (`go test`/`playwright`) → Build → E2E Verify.
- **Stop on Blockers**: Ambiguitas atau fix gagal >2x → STOP tanya user. Dilarang `TODO`/`TBD`.
- **Evidence Before Claims**: Klaim "tests pass" wajib output `go test`/`podman ps`.
- **Subagent Strategy**: Paralel hanya jika file/service beda; share file → sekuensial. Review diff via subagent sebelum merge.
- **Skills Usage**: Jika ada skill di `.agent/skills/` relevan → wajib baca & ikuti.
- **No Performative Agreement**: Langsung eksekusi teknikal, tanpa basa-basi.
- **Simplicity First**: Kode minimum yang works. 200 baris bisa 50 → rewrite.
- **Surgical Changes**: Hanya sentuh kode relevan. Match style Go (`gofmt`, `chi/gin`, `sqlc`) + TS (`@/` alias, TS strict, kebab-case files). Bersihkan unused import yang kamu buat.
- **Explicit Assumptions**: Nyatakan asumsi; multi-interpretation → sajikan opsi.
- **Success Criteria Loop**: Task → goal terverifikasi (`Add reserve` → `Test concurrent reserve → only 1 succeeds`).

## 🤝 Collaboration Modes

- **Driver**: AI nulis kode. **Navigator**: AI rencana+review, user nulis. **TDD**: red-green-refactor. **Review**: audit saja. **Mentor**: jelaskan tanpa solusi langsung.

## MCP Tools — Gunakan Selalu

Setiap tulis/edit/debug library → resolve via Context7 dulu, jangan asumsikan dari memory.

| Library | Context7 ID | Use Case MVP |
| :------ | :---------- | :----------- |
| TanStack Start/Router/Query | `/tanstack/start` , `/tanstack/router` | Frontend Vite (ADR 0004) — bukan `/vercel/next.js` |
| Go | `/golang/go` | Go 1.27 uniform, `chi/gin`, `sqlc+pgx`, `kafka-go`, `go-redis`, `go-elasticsearch` |
| Tailwind | `/tailwindlabs/tailwindcss` | Styling |
| TypeScript | `/microsoft/typescript` | Types |

> `docs/README.md` tandai `/vercel/commerce` & `/vercel/next.js` **superseded** — jangan pakai pola Next.js Commerce untuk MVP baru. `/spring-projects/spring-boot` hide (ADR 0001).

## 🔄 Doc Routing (Jangan Campur Konten)

| Konten | File |
| :----- | :--- |
| Glossary domain (Product/Cart/Order/Payment vs PayU Transaction) | `CONTEXT.md` |
| ADR sumber kebenaran (0001 scope, 0002 Go uniform, 0003 PayU, 0004 TanStack) | `docs/adr/` |
| Task eksekusi Fase 0–4 (single source) | `docs/roadmap/TODOS.md` |
| Deployment & milestone | `docs/roadmap/PROGRESS.md` + `docs/roadmap/SERVICES.md` |
| Architecture & sequence | `docs/architecture/ARCHITECTURE.md` + `docs/architecture/SEQUENCE_DIAGRAMS.md` |
| Infra MOP | `infrastructure/README.md` + `infrastructure/local/podman-compose.yml` |
| Changelog | `CHANGELOG.md` |
| Env (akan disesuaikan Go) | `docs/ENVIRONMENT_VARIABLES.md` |

## 🛰️ Deep Reference (Baca Saat Relevan)

- MVP overview & superseded docs → `docs/README.md`
- Glossary → `CONTEXT.md`
- ADR 0001 scope 9/9 hide → `docs/adr/0001-mvp-scope-9-services.md`
- ADR 0002 Go 1.27 + outbox manual → `docs/adr/0002-go-1-27-uniform-mvp.md`
- ADR 0003 PayU SNAP-BI + Saga → `docs/adr/0003-payu-snapbi-adapter-saga.md`
- ADR 0004 TanStack Start → `docs/adr/0004-frontend-tanstack-start.md`
- System design (T0.4 updated) → `docs/architecture/ARCHITECTURE.md`
- Prd superseded → `docs/prd/backend-prd.md` (58KB, ref ADR) + `frontend-prd.md` (1KB)
- DB & outbox → `backend/services/<svc>/migrations/` + `001_create_outbox.sql`
- Skills & workflows → `.agent/skills/`

*Last Updated: August 2026 (MVP freeze 26 Aug, ADR 0001–0004)*
