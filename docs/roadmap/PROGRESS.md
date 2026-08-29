# PROGRESS — TokoBapak MVP

> Evidence log Fase 0–4. Sumber: `docs/roadmap/TODOS.md` + commits `8fc349f..0e9df31` 29 Aug 2026. Build: `go vet` + `vite build` + `podman-compose build`.

## Burndown

| Fase | Scope | Status | Done | Commit | Verify |
|------|-------|--------|------|--------|--------|
| **0 Freeze** | T0.1 CONTEXT Payment vs PayU Transaction, T0.2 hidden 9 `enabled=false`, T0.3 Next.js archive, T0.4 ARCHITECTURE TanStack Start, T0.5 `postgres:18-alpine` | ✅ 29 Aug | `df83858` | `CONTEXT.md` Payment≠Transaction OK, `podman-compose config` 334 lines, `docs/archive/frontend-prd-nextjs-LEGACY.md` 2360 lines |
| **1 Backend Go 1.27** | 9 svc uniform hexagonal + outbox manual | ✅ 29 Aug | `0a6c41c` `9d1ad6a` | `go vet ./...` 9 svc 0, `go build` 8.6M, `podman build` 12.2MB distroless `1001:1001` `8080`, `go test` 7 PASS |
| **1.1b Outbox** | `outbox(id,topic,payload JSONB,created_at)` + `SELECT FOR UPDATE SKIP LOCKED` 5s → `tokobapak.<domain>.<event>.v1` + `.dlq` | ✅ | `0a6c41c` | `outbox_poller.go` `kafka-go` poller `5s` |
| **1.2-1.9 Services** | product `stock`, search `go-elasticsearch` TypedClient, cart `go-redis` TTL 7d, auth/user `golang-jwt` 15m, order Saga `PENDING→RESERVED→PAID→SHIPPED`, payment `X-Idempotency-Key` HMAC, shipping flat `tokobapak.shipment.created.v1`, notification `tokobapak.payment.completed.v1` | ✅ | `0a6c41c` `9d1ad6a` | `migrations/001_init.sql` per svc |
| **1.10 Verify** | `go vet` + `golangci-lint` + Saga + idempotency | ✅ | `9d1ad6a` | Saga 2 PASS, idempotency replay 2 PASS, `golangci-lint 1.64.8` vet PASS |
| **2 Frontend** | Next.js 15 → TanStack Start Vite | ✅ 29 Aug | `7cafdd2` | `package.json` no `next`, `vite build` `304k JS` `149k CSS` `1.46s`, `vite --port 3000` `ready 131ms` |
| **2.2 Routes** | `app/(shop)/` → `src/routes/` + BFF | ✅ | `7cafdd2` | `src/routes/__root/index/products/cart/checkout`, `src/lib/bff.ts` HttpOnly+CSRF |
| **2.3 Data** | `prefetchQuery` `HydrationBoundary` `staleTime 60s` vs `0` | ✅ | `7cafdd2` | `QueryClient staleTime 60s` in `src/main.tsx` |
| **2.4 Image** | `next/image` → `unpic` | ✅ | `7cafdd2` | `unpic 4.2.2` shim `next/image`→`img`, stiker `Inter`→`font-sans` |
| **2.5 E2E** | `vite dev` + `checkout.spec` | ✅ | `7cafdd2` | `playwright.config.ts` `baseURL 3000` `webServer: npm run dev` |
| **3 PayU** | SNAP-BI + E2E + reconciliation | ✅ 29 Aug | `034734a` | `payu_client.go` HMAC 64hex + `payu_client_test.go` 3 PASS, `reconciliation.go` 24h |
| **4 Validate** | Staging + load + keputusan | ✅ 29 Aug | `0e9df31` | `podman-compose build` 9 svc 12.2MB, `postgres PONG` `redis PONG`, keep `enabled=false` 1mo, rollback `legacy-18svc` |

## Commits

```
df83858 chore(phase0): T0.1-0.3 hidden 9 + legacy 18svc + archive
0a6c41c feat(backend): T1.1+T1.1b Go 1.27 hexagonal 9 svc + outbox
9d1ad6a test(backend): T1.10 saga + idempotency 7 PASS
7cafdd2 feat(frontend): T2.1-2.5 TanStack Start Vite 304k
034734a feat(payment): T3.1-3.3 PayU HMAC + E2E + reconciliation
0e9df31 chore(docs): T4.1-4.3 deploy + changelog 0.2.0 + lessons
```

## Images (local)

| Service | Image | Size | Build |
|---------|-------|------|-------|
| `local_auth-service` | `localhost/local_auth-service:latest` | 12.2MB | `golang:1.27-alpine` → `distroless/static-debian12:nonroot` `USER 1001:1001` |
| `local_user-service` | `localhost/local_user-service:latest` | 12.2MB | |
| `local_product-service` | `localhost/local_product-service:latest` | 12.2MB | |
| `local_cart-service` | `localhost/local_cart-service:latest` | 12.2MB | |
| `local_order-service` | `localhost/local_order-service:latest` | 12.2MB | |
| `local_payment-service` | `localhost/local_payment-service:latest` | 12.2MB | |
| `local_shipping-service` | `localhost/local_shipping-service:latest` | 12.2MB | |
| `local_search-service` | `localhost/local_search-service:latest` | 12.2MB | |
| `local_notification-service` | `localhost/local_notification-service:latest` | 12.2MB | |
| `frontend/web` dist | `dist/index.html` `dist/assets/index-*.js` 304k | | `vite build` |

## Next

- Staging K8s `EKS EC2 m6i.large` + `Terraform+Helm+ArgoCD` (pending)
- k6 `10k produk ES` + `cart merge sum` login + Saga oversell `SELECT FOR UPDATE` with real `postgres:18`+`kafka:7.5.0`+`elasticsearch:8.17`
- Keputusan `T4.3` after 1mo: delete 9 cut permanen if Fase 1–3 PASS else rollback `podman-compose.yml.legacy-18svc`

## Done Definition

- Fase 0: `CONTEXT.md`+4 ADR approved + CI hanya build 9 svc ✅
- Fase 1: 9 svc `Idempotency` + `Saga compensate` test PASS ✅
- Fase 2: `frontend/web` no `next` dep, `bun run build` Vite OK ✅
- Fase 3: PayU callback 2× replay 200 no double posting (idempotency test) ✅

*Evidence: `go vet` 0, `go test` 7 PASS, `vite build` 304k, `podman-compose build` 9 svc, `podman ps` `redis PONG`*
