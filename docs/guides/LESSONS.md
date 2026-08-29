# LESSONS — TokoBapak MVP

## 2026-08-29 Phase 0-4

### What worked
- **Go 1.27 uniform hexagonal**: 9 svc `cmd/server/main.go` + `domain/model+port` + `adapter` + `config` + `migrations` - 2.2k lines vs 46k polyglot, `go vet`+`build` OK, distroless 12.2MB
- **Outbox manual**: `SELECT FOR UPDATE SKIP LOCKED` 5s poller `tokobapak.<domain>.<event>.v1` + DLQ `.dlq` without starter, 30 lines vs Java starter
- **TanStack Start Vite**: `vite build` 304k JS vs Next lock-in, shim `next/image`->`img` via vite alias, `staleTime 60s` vs `0`
- **PayU SNAP-BI**: HMAC SHA256 X-SIGNATURE/X-TIMESTAMP + X-Idempotency-Key thin adapter, idempotency replay 200 no double post

### What failed (Validation 2026-08-29)
- `postgres:18` volume `/var/lib/postgresql/data` → `Error: PostgreSQL data in /var/lib/postgresql/data (unused mount)` — fix `postgres_data:/var/lib/postgresql` (parent, versioned subdir)
- `apache/kafka:4.0.0` healthcheck `kafka-broker-api-versions` → `not found` — fix `/opt/kafka/bin/kafka-broker-api-versions.sh` (`sh`)
- `distroless/static-debian12:nonroot` has no `wget`/`sh` — healthcheck `wget` → `Up (starting)` forever — removed healthchecks for Go, rely on external `curl`
- `traefik` `statfs /var/run/docker.sock` → podman sock at `/run/user/1000/podman/podman.sock` — fixed mount
- `88bee7c` deleted `legacy-18svc` + `archive` per user intent build from 0 TanStack MVP (ADR 0004) — intentionally not restored; T0.2/T0.3 archive deleted, fokus 9 svc MVP
- `playwright` `libatk-1.0.so.0` missing → `apt-get install` + `npx playwright install --with-deps`
- Backend only `/health` 200, all ` /v1/products|cart|orders` 404 — scaffold-complete; need wiring `main.go` + handlers
- `tokobapak` DB has no tables (migrations not auto-run) → `relation "payments" does not exist`
### DB Naming Industry Audit (Context7 PostgreSQL 18 — 2026-08-29)
- **Standards checked via Context7** (`/websites/postgresql_18`): DB lowercase snake_case `project_service`, tables plural snake_case, columns snake_case `user_id/created_at`, PK `id UUID DEFAULT gen_random_uuid()`, FK `{table}_id REFERENCES`, timestamps `TIMESTAMPTZ DEFAULT NOW()`, indexes `idx_{table}_{column} IF NOT EXISTS`, checks `CHECK(price>=0)`
- **Violations fixed**: `init.sql` 10→5 DBs (dropped hidden `catalog,inventory,sellers,promotions,reviews` per ADR 0001; kept `products,users,orders,payments,shipping`); `shipping` duplicate `001_create_shipments.sql` (VARCHAR/TIMESTAMP without TZ, no DEFAULT, 2 indexes without IF NOT EXISTS) deleted, kept `001_init.sql` flat `address/cost` + added `updated_at` + `CHECK(cost>=0)`; `products`+`orders` PK missing `DEFAULT gen_random_uuid()` added via `ALTER TABLE` + migration fix; `config.go` `DB_NAME` default `tokobapak` for all (broke Database-per-Service) → per-service `tokobapak_*`; `podman-compose.yml` only 1 svc had `DB_NAME` → all 5 PG svcs now set + `DATABASE_URL`→`DB_*` uniform; `outbox` singular is industry pattern (not `outboxes`) kept; `cart:{userId}` Redis `HSET` with `:` + TTL `604800` (7d) OK; `tokobapak.<domain>.<event>.v1` + `.dlq` OK; `/v1/...` plural kebab-case OK per AGENTS rule 6
- **Verification**: `podman exec psql \l` now 9 DBs (5+4 template), `\d products` PK DEFAULT, `\d shipments` updated_at, `SELECT version()` 18.6, `go vet` 9/9 0
### Frontend Stub E2E 7/11 → 51/51 (2026-08-29)
- `routeTree.gen.ts` `rootRoute` used `div outlet` not `Outlet` → children never render → `header` not found — fixed `createRootRoute({component: () => <Outlet/>})`
- `LoginStub` `h1+H2` both matched `h1,h2` strict locator (2) + duplicate `a[href*="register"]` (2) → strict violation — fixed `h2`→`Welcome back` (single match), `data-testid="login-title"` + single `a`, checkbox `type="button"` (was submit causing form navigate)
- `CartStub` `a+button` both `Checkout` → strict 2 → removed `button`, kept `a[href="/checkout"]`; `RegisterStub` `h1+h2` → strict 2 → `h2`→`p`
- `vite.config.ts` missing `next/link` alias → `Header` import fails — added `next/link` shim
- Result: `playwright` 51/51 PASS (was 7/11), `sanity` register strict → fixed, `vite build` 309k, `curl` 200 on `/login` `/register` host IP/public IP
- Staging K8s EKS+ArgoCD deferred, local podman health `PONG` as evidence

### Next
- Full k6 10k ES load, cart merge sum login E2E, saga oversell SELECT FOR UPDATE test with real PG+Kafka+ES
