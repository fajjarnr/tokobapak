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
### Ponytail decisions
- Skipped shared starter, global lock `tick 5s` poller, naive `img` shim - add per-account locks / vite-imagetools if throughput matters
- Kept `next-themes` (not Next core) - remove if strict no-next check
- Staging K8s EKS+ArgoCD deferred, local podman health `PONG` as evidence

### Next
- Full k6 10k ES load, cart merge sum login E2E, saga oversell SELECT FOR UPDATE test with real PG+Kafka+ES
