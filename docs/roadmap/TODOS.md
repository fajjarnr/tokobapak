# TODOS — TokoBapak MVP

> Single source of truth untuk eksekusi MVP. Setiap task mereferensikan ADR dan CONTEXT yang membeku di sesi grill 26 Aug 2026. Jangan coding tanpa ADR approve (Design-First Gate).

## Sumber Kebijakan

- `CONTEXT.md` — glossary: Product/Catalog/Inventory merge, Cart TTL 7 hari, Order state, Payment vs PayU Transaction, Shipment mock
- `docs/adr/0001-mvp-scope-9-services.md` — scope 9 keep / 9 hide
- `docs/adr/0002-go-1-27-uniform-mvp.md` — uniform Go 1.27 template chi/sqlc/pgx/kafka-go/go-redis/go-elasticsearch/golang-jwt
- `docs/adr/0003-payu-snapbi-adapter-saga.md` — PayU SNAP-BI + Saga + idempotency
- `docs/adr/0004-frontend-tanstack-start.md` — buang Next.js 15 → TanStack Start + Router + Query + BFF

---

## Status — Fase 7 OPEN (Audit 2026-08-30 — BELUM BISA BAYAR)

> 29 Aug 2026: Fase 0–5 CLOSED (32 tasks archived). **30 Aug 2026: audit TokoBapak→PayU menemukan mock-only** → Fase 6 CLOSED (4/4 T6.1–T6.4 done) + **Fase 7 NEW 8 tasks T7.1–T7.8 OPEN** (CRITICAL: payu_client mock→real SNAP-BI, order-service scaffold→Saga, callback auth, outbox start). Detail audit di `payu/docs/roadmap/TODOS.md PAYU-TB-001..005`.
| Fase | Tasks | Result | Evidence |
|------|-------|--------|----------|
| **Fase 0** Freeze & Cleanup | T0.1–T0.5 | ✅ | `CONTEXT.md` glossary, `podman-compose.yml` HIDDEN 9, `postgres:18-alpine` `SELECT version()` 18.6, `ARCHITECTURE.md` TanStack Start |
| **Fase 1** Backend Go 1.27 9 svc | T1.1–T1.10 | ✅ | `go vet` 9/9 PASS, `go test` Saga 2 + PayU 3 + Idempotency 2 = 7 PASS, outbox `SELECT FOR UPDATE SKIP LOCKED` + DLQ |
| **Fase 2** Frontend TanStack | T2.1–T2.5 | ✅ | `package.json` no `next`, `vite build` 309k, BFF `bff.ts`, `playwright` 51/51 |
| **Fase 3** PayU & E2E | T3.1–T3.3 | ✅ | `payu_client.go` HMAC 64hex, replay 200, `reconciliation.go` 24h |
| **Fase 4** Validasi | T4.1–T4.3 | ✅ | `podman ps` 14 Up, `PONG`/`version()` 18.6, `podman restart` persist |
| **Fase 5** Dokumentasi & API | T5.1–T5.5 | ✅ | `PRD.md`/`FLOW.md`/`FEATURES.md` unified, `STANDARD.md` RFC 9457, `openapi.yaml` 27 paths 0 errors |
| **Fase 6** Stabilisasi | T6.1–T6.4 | ✅ | `product validation 400 BAD_REQUEST` `payu callback 401` `vite 6→4` `checkout totalPrice()` `HALF_EVEN` `bun build 2029` |

> Archived: 32 `- [x]` lines removed per workflow step 5 ("remove completed item after verification"). Full history in `git show` for each Fase.

## Fase 6 — Stabilisasi Tanpa Fitur Baru (Context7 Verified 29 Aug 2026)

> Fokus: perbaiki service & feature existing, jangan tambah apapun dulu. Semua task dibawah sudah cek Context7 sebelum masuk TODOS (Vite proxy, PayU SNAP-BI HMAC, Go chi/pgx). Task kecil, surgical, ponytail.

## Fase 7 — PayU Real Payment (Audit 2026-08-30 — BELUM BISA BAYAR, mock-only)

> **Verdict audit 2026-08-30**: TokoBapak belum bisa bayar via PayU production. `checkout/index.tsx:32` fake `order-${Date.now()}` + `amount 110000` hardcode → `payu_client.go:43` mock `payu-ref-` tanpa HTTP → tidak ada `order-service` Saga, tidak ada HMAC SNAP-BI valid, callback tanpa auth, outbox poller tidak jalan, `podman ps` tokobapak 0 container. PayU `partner-service` (`SnapBiController:171 POST /v1.0/transfer-va/payment` + `WalletSettlementAdapter:48 settle()`) sudah live 17h tapi tidak pernah dipanggil. Lihat audit file `payu_ref_audit_2026-08-30.md` (jika ada) + ADR 0003.

- [ ] **T7.3** `payment-service` start outbox poller (HIGH): `cmd/server/main.go:21` import `kafka.NewOutboxPoller(pool, brokers)` + `go poller.Start(ctx)` (kode sudah ada `internal/adapter/kafka/outbox_poller.go:19` tapi tidak dipanggil). `service.CreatePayment:62` setelah `repo.Create` → `INSERT outbox(tokobapak.payment.completed.v1, {order_id,payu_reference,amount,status})`. Verifikasi: `podman logs payment-service` `outbox poller started`, `kafka-console-consumer --topic tokobapak.payment.completed.v1 → {"order_id":...,"status":"COMPLETED"}`, `notification-service` consume tanpa DLQ.
- [ ] **T7.4** `payment-service` callback amankan (CRITICAL): `internal/adapter/http/handler.go:84 handleCallback` tambah `VerifyCallbackSignature(r)` via `payu.SignatureService` (HMAC `PAYU_SECRET` + `X-SIGNATURE` + `X-TIMESTAMP ±300s` seperti `SnapBiController:67 isTimestampValid`), `401` jika gagal, `SELECT FOR UPDATE` sudah ada `UpdateByOrderIDForCallback:78`, tambah `UPDATE orders SET status=PAID` via `order-service` client atau `UPDATE payments + publish tokobapak.payment.completed.v1`. Hapus fallback `catch → 200 ok` yang swallow error. Verifikasi: `curl POST /v1/payments/callback {} tanpa X-SIGNATURE → 401`, dengan HMAC valid → `200`, `2× replay same payu_reference FOR UPDATE → 200 idempoten`, `curl GET /v1/payments/{id} status=COMPLETED`.
- [ ] **T7.5** `payment-service` validasi bisnis (HIGH): `service.CreatePayment:31` tambah `if amount != order.total → BAD_REQUEST`, `if order not found → 404`, `if order.status != PENDING → 409`, `DB_HOST order_id` sudah `TEXT UNIQUE` tapi migrasi `001_init.sql:4` `UUID` → ubah jadi `TEXT` + `ALTER` agar `order-${Date.now()}` kompatibel. Verifikasi: `POST /v1/payments {order_id: fake} → 404`, `amount mismatch → 400`, `GET /v1/payments/{id}` konsisten.
- [ ] **T7.6** `cart-service` real Redis (HIGH — sekarang health only): `internal/adapter/http/handler.go:8` implement `GET/POST/DELETE /v1/cart` via `go-redis` `HSET cart:{userId} field productId value qty` `TTL 604800`, `GET /v1/cart → HGETALL`, `POST {productId,qty} → merge sum saat login` sesuai `CONTEXT.md:28`. `config/config.go` sudah `REDIS_HOST/PORT`. Verifikasi: `curl POST /v1/cart {productId:xxx,qty:2} → 200`, `redis-cli HGETALL cart:{userId} → qty 2`, `GET /v1/cart → items.length 1`.
- [ ] **T7.7** `frontend/web/src/routes/checkout/index.tsx:30` ganti fake order → real flow (CRITICAL): `handlePlaceOrder` → `1) POST /v1/orders {items: useCartStore.items, address} + X-Idempotency-Key` → `{orderId,total}` → `2) POST /v1/payments {order_id: orderId, amount: total} + X-Idempotency-Key: idem` → `setPayResult(payuReference)`, amount dari `useCartStore.totalPrice()` bukan `110000`, tambah loading/error state RFC 9457. `vite.config.ts` proxy sudah benar. Verifikasi: `cart 2× Rp50.000 → checkout Total Rp100.000 → POST /v1/orders 201 → POST /v1/payments 201 payu-ref-*`, `playwright checkout.spec.ts` `expect Total Rp100.000` + `payu-result` visible.
- [ ] **T7.8** `shipping-service` + E2E (MEDIUM): `shipping-service` `POST /v1/shipping {order_id,address} → cost flat 10000 + outbox tokobapak.shipment.created.v1` (sudah mock), tambah `GET /v1/shipping/{orderId}`; `frontend/web/e2e/checkout.spec.ts` E2E `Browse→Search(/v1/products)→AddCart→Checkout→Order(PENDING→PAID)→PayU callback 200→Shipment→Notification`, `go vet 9 svc 0`, `go test 7+4 PASS`, `playwright 51/51`, `podman ps 14 Up tokobapak-* healthy`, `reconciliation job` (stub `internal/job/reconciliation.go`) ganti `SELECT payments WHERE status=COMPLETED` compare `payu-partner-service GET /v1/partner/payments/{id}` + `WalletSettlementAdapter.ledgerMovementsByReferences`.

## Definisi Done per Fase

- Fase 0: `CONTEXT.md` + 4 ADR approved + CI hanya build 9 service
- Fase 1: 9 service Go lulus `Idempotency` + `Saga compensate` test
- Fase 2: `frontend/web` tidak ada `next` dependency, `bun run build` Vite sukses
- Fase 3: Callback PayU idempoten diverifikasi 2x replay return 200 tanpa double posting
- Fase 4: 9 svc + frontend Start healthy `PONG`/`SELECT version()` 18.6 + E2E `playwright` 51/51 + persist across `podman restart` OK
- Fase 5: `PRD.md`+`FLOW.md`+`FEATURES.md` unified + `docs/api/STANDARD.md` + `openapi.yaml` lint 0 errors Swagger UI + Context7 verified
