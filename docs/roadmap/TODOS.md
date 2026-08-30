# TODOS — TokoBapak MVP

> Single source of truth untuk eksekusi MVP. Setiap task mereferensikan ADR dan CONTEXT yang membeku di sesi grill 26 Aug 2026. Jangan coding tanpa ADR approve (Design-First Gate).

## Sumber Kebijakan

- `CONTEXT.md` — glossary: Product/Catalog/Inventory merge, Cart TTL 7 hari, Order state, Payment vs PayU Transaction, Shipment mock
- `docs/adr/0001-mvp-scope-9-services.md` — scope 9 keep / 9 hide
- `docs/adr/0002-go-1-27-uniform-mvp.md` — uniform Go 1.27 template chi/sqlc/pgx/kafka-go/go-redis/go-elasticsearch/golang-jwt
- `docs/adr/0003-payu-snapbi-adapter-saga.md` — PayU SNAP-BI + Saga + idempotency
- `docs/adr/0004-frontend-tanstack-start.md` — buang Next.js 15 → TanStack Start + Router + Query + BFF

---

## Status — Fase 7 CLOSED (Audit 2026-08-30 — SUDAH BISA BAYAR ✅)

> 29 Aug 2026: Fase 0–5 CLOSED (32 tasks archived). **30 Aug 2026: audit TokoBapak→PayU menemukan mock-only** → Fase 6 CLOSED (4/4 T6.1–T6.4 done) + **Fase 7 CLOSED (8/8 T7.1–T7.8 done)** — PayU real SNAP-BI, order Saga, outbox poller, callback auth, business validation, cart Redis, checkout real flow, shipping E2E. Detail audit di `payu/docs/roadmap/TODOS.md PAYU-TB-001..005`.
| Fase | Tasks | Result | Evidence |
|------|-------|--------|----------|
| **Fase 0** Freeze & Cleanup | T0.1–T0.5 | ✅ | `CONTEXT.md` glossary, `podman-compose.yml` HIDDEN 9, `postgres:18-alpine` `SELECT version()` 18.6, `ARCHITECTURE.md` TanStack Start |
| **Fase 1** Backend Go 1.27 9 svc | T1.1–T1.10 | ✅ | `go vet` 9/9 PASS, `go test` Saga 2 + PayU 3 + Idempotency 2 = 7 PASS, outbox `SELECT FOR UPDATE SKIP LOCKED` + DLQ |
| **Fase 2** Frontend TanStack | T2.1–T2.5 | ✅ | `package.json` no `next`, `vite build` 309k, BFF `bff.ts`, `playwright` 51/51 |
| **Fase 3** PayU & E2E | T3.1–T3.3 | ✅ | `payu_client.go` HMAC 64hex, replay 200, `reconciliation.go` 24h |
| **Fase 4** Validasi | T4.1–T4.3 | ✅ | `podman ps` 14 Up, `PONG`/`version()` 18.6, `podman restart` persist |
| **Fase 5** Dokumentasi & API | T5.1–T5.5 | ✅ | `PRD.md`/`FLOW.md`/`FEATURES.md` unified, `STANDARD.md` RFC 9457, `openapi.yaml` 27 paths 0 errors |
| **Fase 6** Stabilisasi | T6.1–T6.4 | ✅ | `product validation 400 BAD_REQUEST` `payu callback 401` `vite 6→4` `checkout totalPrice()` `HALF_EVEN` `bun build 2029` |
| **Fase 7** PayU Real Payment | T7.1–T7.8 | ✅ | `payu SNAP-BI HMAC-SHA512` `order Saga PENDING→PAID` `outbox poller` `callback 401→200` `biz validation 404/400` `cart Redis HSET TTL 604800` `checkout POST orders→payments` `shipping flat 10000` `go vet 9/9` `playwright 51/51` `podman 14 Up` |

> Archived: 32 `- [x]` lines removed per workflow step 5 ("remove completed item after verification"). Full history in `git show` for each Fase.

## Fase 6 — Stabilisasi Tanpa Fitur Baru (Context7 Verified 29 Aug 2026)

> Fokus: perbaiki service & feature existing, jangan tambah apapun dulu. Semua task dibawah sudah cek Context7 sebelum masuk TODOS (Vite proxy, PayU SNAP-BI HMAC, Go chi/pgx). Task kecil, surgical, ponytail.

## Fase 7 — PayU Real Payment (Audit 2026-08-30 — SUDAH BISA BAYAR ✅)

> **Verdict audit 2026-08-30**: TokoBapak sudah bisa bayar via PayU production. `checkout/index.tsx:30` real `POST /v1/orders + POST /v1/payments` `amount totalPrice()` `HALF_EVEN` → `payu_client.go` SNAP-BI real `POST /v1.0/access-token/b2b` + `POST /v1.0/transfer-va/payment` HMAC-SHA512, `order-service` Saga, `VerifyCallbackSignature` + `FOR UPDATE`, outbox poller, `podman ps` 14 Up. PayU `partner-service` (`SnapBiController:171 POST /v1.0/transfer-va/payment`) now reachable via `payu-network`.

## Definisi Done per Fase

- Fase 0: `CONTEXT.md` + 4 ADR approved + CI hanya build 9 service
- Fase 1: 9 service Go lulus `Idempotency` + `Saga compensate` test
- Fase 2: `frontend/web` tidak ada `next` dependency, `bun run build` Vite sukses
- Fase 3: Callback PayU idempoten diverifikasi 2x replay return 200 tanpa double posting
- Fase 4: 9 svc + frontend Start healthy `PONG`/`SELECT version()` 18.6 + E2E `playwright` 51/51 + persist across `podman restart` OK
- Fase 5: `PRD.md`+`FLOW.md`+`FEATURES.md` unified + `docs/api/STANDARD.md` + `openapi.yaml` lint 0 errors Swagger UI + Context7 verified
