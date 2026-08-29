# LESSONS — TokoBapak MVP

## 2026-08-29 Phase 0-4

### What worked
- **Go 1.27 uniform hexagonal**: 9 svc `cmd/server/main.go` + `domain/model+port` + `adapter` + `config` + `migrations` - 2.2k lines vs 46k polyglot, `go vet`+`build` OK, distroless 12.2MB
- **Outbox manual**: `SELECT FOR UPDATE SKIP LOCKED` 5s poller `tokobapak.<domain>.<event>.v1` + DLQ `.dlq` without starter, 30 lines vs Java starter
- **TanStack Start Vite**: `vite build` 304k JS vs Next lock-in, shim `next/image`->`img` via vite alias, `staleTime 60s` vs `0`
- **PayU SNAP-BI**: HMAC SHA256 X-SIGNATURE/X-TIMESTAMP + X-Idempotency-Key thin adapter, idempotency replay 200 no double post

### What failed
- `golangci-lint v1.64.8` typecheck false positive with Go 1.27 module, `go vet` is truth
- `confluentinc/cp-zookeeper:7.5.0` short-name pull fails without `docker.io/` prefix on podman 5.7
- `unpic@0.14.1` not found, latest is 4.2.2, use `*`

### Ponytail decisions
- Skipped shared starter, global lock `tick 5s` poller, naive `img` shim - add per-account locks / vite-imagetools if throughput matters
- Kept `next-themes` (not Next core) - remove if strict no-next check
- Staging K8s EKS+ArgoCD deferred, local podman health `PONG` as evidence

### Next
- Full k6 10k ES load, cart merge sum login E2E, saga oversell SELECT FOR UPDATE test with real PG+Kafka+ES
