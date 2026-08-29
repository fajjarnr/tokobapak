# TODOS — TokoBapak MVP

> Single source of truth untuk eksekusi MVP. Setiap task mereferensikan ADR dan CONTEXT yang membeku di sesi grill 26 Aug 2026. Jangan coding tanpa ADR approve (Design-First Gate).

## Sumber Kebijakan

- `CONTEXT.md` — glossary: Product/Catalog/Inventory merge, Cart TTL 7 hari, Order state, Payment vs PayU Transaction, Shipment mock
- `docs/adr/0001-mvp-scope-9-services.md` — scope 9 keep / 9 hide
- `docs/adr/0002-go-1-27-uniform-mvp.md` — uniform Go 1.27 template chi/sqlc/pgx/kafka-go/go-redis/go-elasticsearch/golang-jwt
- `docs/adr/0003-payu-snapbi-adapter-saga.md` — PayU SNAP-BI + Saga + idempotency
- `docs/adr/0004-frontend-tanstack-start.md` — buang Next.js 15 → TanStack Start + Router + Query + BFF

---

## Status — No Actionable Tasks ✅ 29 Aug 2026

All 32 tasks across Fase 0–5 verified and archived. See `git log --grep="T0\|T1\|T2\|T3\|T4\|T5"` and `CHANGELOG.md 0.2.2` + `docs/roadmap/VALIDATION_2026-08-29.md`.

| Fase | Tasks | Result | Evidence |
|------|-------|--------|----------|
| **Fase 0** Freeze & Cleanup | T0.1–T0.5 | ✅ | `CONTEXT.md` glossary, `podman-compose.yml` HIDDEN 9, `postgres:18-alpine` `SELECT version()` 18.6, `ARCHITECTURE.md` TanStack Start |
| **Fase 1** Backend Go 1.27 9 svc | T1.1–T1.10 | ✅ | `go vet` 9/9 PASS, `go test` Saga 2 + PayU 3 + Idempotency 2 = 7 PASS, outbox `SELECT FOR UPDATE SKIP LOCKED` + DLQ |
| **Fase 2** Frontend TanStack | T2.1–T2.5 | ✅ | `package.json` no `next`, `vite build` 309k, BFF `bff.ts`, `playwright` 51/51 |
| **Fase 3** PayU & E2E | T3.1–T3.3 | ✅ | `payu_client.go` HMAC 64hex, replay 200, `reconciliation.go` 24h |
| **Fase 4** Validasi | T4.1–T4.3 | ✅ | `podman ps` 14 Up, `PONG`/`version()` 18.6, `podman restart` persist |
| **Fase 5** Dokumentasi & API | T5.1–T5.5 | ✅ | `PRD.md`/`FLOW.md`/`FEATURES.md` unified, `STANDARD.md` RFC 9457, `openapi.yaml` 27 paths 0 errors |

> Archived: 32 `- [x]` lines removed per workflow step 5 ("remove completed item after verification"). Full history in `git show` for each Fase.

## Definisi Done per Fase

- Fase 0: `CONTEXT.md` + 4 ADR approved + CI hanya build 9 service
- Fase 1: 9 service Go lulus `Idempotency` + `Saga compensate` test
- Fase 2: `frontend/web` tidak ada `next` dependency, `bun run build` Vite sukses
- Fase 3: Callback PayU idempoten diverifikasi 2x replay return 200 tanpa double posting
- Fase 4: 9 svc + frontend Start healthy `PONG`/`SELECT version()` 18.6 + E2E `playwright` 51/51 + persist across `podman restart` OK
- Fase 5: `PRD.md`+`FLOW.md`+`FEATURES.md` unified + `docs/api/STANDARD.md` + `openapi.yaml` lint 0 errors Swagger UI + Context7 verified
