---
name: quality-engineer
description: TokoBapak quality engineering for Go hexagonal services and TanStack Start web — Go testing + race, Testcontainers, OpenAPI contract, and Playwright E2E. Use when designing, writing, reviewing, or debugging tests for any TokoBapak backend or frontend; verify test APIs with Context7 first.
---

# TokoBapak Quality Engineer

Test observable behavior at the cheapest layer that detects the risk. Start with a **failing test** for a bug or feature, then implement the smallest fix that makes it pass. A green test that accepts wrong behavior is a defect.

## Context7 documentation gate — REQUIRED

Before writing or changing a test, fixture, runner, or CI command that uses a library:

1. Inspect the target `go.mod` / `package.json`, existing `*_test.go` / `e2e/*.spec.ts`, `playwright.config.*`, and current command.
2. Resolve the official library in Context7 — prefer high-trust ID, query **one topic at a time** (API, fixture, assertion, lifecycle, config, CLI).
3. Treat returned docs as source of truth; do not copy flags or annotations from memory.
4. If indexed version differs from manifest, note the mismatch and verify against local source/CLI.
5. Re-resolve after bumps. Do not mix major-version APIs.

**TokoBapak test stack (general — manifest is truth):**

| Surface | Stack | Context7 ID |
|---|---|---|
| Go unit/adapter | `testing` stdlib + `net/http/httptest` | `go.dev/doc` |
| Integration | `testcontainers-go` `modules/postgres`, `modules/kafka`, `modules/redis` | `/testcontainers/testcontainers-go` |
| Contract | Spectral OpenAPI lint + `openapi.yaml` | `spectral` docs |
| Web E2E | Playwright `testDir: ./e2e`, `baseURL /`, `chromium` only, `trace on-first-retry` | `/microsoft/playwright` |
| Lint/type | `go vet`, `tsc --noEmit`, `eslint`, `vite build` | — |

Stack names stable; versions omitted — `go.mod` / `package.json` win.

## Repository map

Locate the real surface before choosing a layer:

```
backend/services/*/internal/domain/*          domain unit
backend/services/*/internal/adapter/http/*    adapter / handler
backend/services/*/internal/adapter/postgres/* persistence + outbox
backend/services/*/migrations/001_init.sql    constraints + indexes
frontend/web/e2e/*.spec.ts                    Playwright journeys
frontend/web/playwright.config.*              baseURL localhost:3000, locale id-ID
docs/openapi/openapi.yaml                     contract source
```

Reuse the nearest existing test, factory, fixture, and auth helper. Do not create a second harness for the same boundary.

## Test strategy — risk pyramid

| Layer | Use for | TokoBapak example |
|---|---|---|
| Domain unit | Invariants, deterministic logic | money `BIGINT HALF_EVEN`, status `PENDING→RESERVED→PAID→SHIPPED`, `CHECK(price>=0)` |
| Adapter / slice | Mapping, validation, HTTP, persistence wiring | `chi` handler → `400/401/409/422`, RFC 9457 `code`, `X-Idempotency-Key` |
| Integration | Real Postgres/Kafka/Redis + outbox + migrations | `Testcontainers` postgres/kafka, `outbox` commit/rollback, `SELECT FOR UPDATE` |
| Contract | Provider/consumer compatibility | Spectral `openapi.yaml` 0 errors, request/response/headers/errors |
| E2E | Critical journeys | `Browse→Search→Cart→Checkout→Pay→Ship` via Playwright |

Prioritize money, `stock FOR UPDATE`, idempotency, outbox, saga compensate, and failure paths over trivial getters. Current gate: `go test -race + go vet` all services PASS + `playwright` PASS + `spectral` 0 errors. Coverage is a gap signal, not proof.

## Go backend testing

### Unit and domain

- Use `testing` stdlib only (repo has no `testify`/`mockery` — keep it). Keep test instances isolated, no mutable globals.
- Test domain without `pgx`, `kafka-go`, `chi`, or `redis`. Use table-driven `[]struct{from,to,shouldPass}` for amount boundaries, status transitions, and authorization matrices.
- Mock **only** an outbound port when a real adapter would push test to integration layer. Assert the returned result and state transition; a `verify()`-only assertion is insufficient.
- Money: compare `int64` minor units directly; never float.

### Adapter / HTTP

- Use `net/http/httptest` + `chi` router under test. Assert `status`, `Content-Type`, `code`, `headers` (`X-Idempotency-Key`, `X-Request-ID`), and JSON body via `encoding/json` → `map` + `zod`-like checks in Go.
- Test validation, auth `401`, ownership `403`, idempotency `409`, business `422`, and RFC 9457 shape at this layer.
- Keep tests for `saga_test.go` (transitions + compensate) and `handler_test.go` / `payu_client_test.go` as reference.

### Integration — Testcontainers

Use `testcontainers-go` for behavior that depends on real Postgres/Kafka/Redis:

```bash
go get github.com/testcontainers/testcontainers-go/modules/postgres
go get github.com/testcontainers/testcontainers-go/modules/kafka
```

```go
pg, _ := postgres.Run(ctx, "postgres:18-alpine",
    postgres.WithDatabase("test"), postgres.WithUsername("postgres"), postgres.WithPassword("postgres"))
defer pg.Terminate(ctx)
connStr, _ := pg.ConnectionString(ctx, "sslmode=disable")

kafkaC, _ := kafka.Run(ctx, "confluentinc/confluent-local:7.5.0")
defer kafkaC.Terminate(ctx)
brokers, _ := kafkaC.Brokers(ctx)
```

- Apply `migrations/001_init.sql` against the container PG, not `sqlite` or a shared DB. Verify `UNIQUE(idempotency_key)`, `CHECK>=0`, indexes, and `FOR UPDATE` contention.
- For outbox: prove business row + `outbox` row commit together, both disappear on `tx.Rollback`, and poller `SELECT ... FOR UPDATE SKIP LOCKED` publishes exactly one event that a consumer can handle idempotently.
- Keep containers disposable per test (or per `TestMain`), never shared mutable state.

### Financial integrity — every mutation must cover

- `BIGINT` minor unit only — no `float`/`double` in code or tests;
- `HALF_EVEN` for major→minor conversion, with halfway and large-value cases;
- `CHECK>=0`, `DecrementStock WHERE stock>=qty` and concurrent reserve (parallel `-race` should not oversell);
- `X-Idempotency-Key`: N concurrent identical requests → one mutation, same result, one DB row; same key + different payload → `409`;
- outbox `CloudEvent` fields, topic `tokobapak.<domain>.<event>.v1`, ordering key, retry/`.dlq`;
- masked PII, no secrets in fixtures/logs, auth at every boundary.

Use deterministic IDs/amounts. Never real customer data, PINs, or production tokens.

## Contract testing

- Source: `docs/openapi/openapi.yaml` + Spectral. Lint must be `0 errors` before merge.
- Treat request + response as versioned public API. Cover success, validation `400`, auth `401`, conflict `409`, `422`, idempotency headers, pagination, and additive-field tolerance.
- Verify with `httptest` provider states and isolated data — no external calls.
- Publish `openapi.yaml` and run provider verification before promotion; a file existing is not proof the deployed provider is safe.

## Web E2E — Playwright

Use the repo's `playwright.config.*` (`testDir ./e2e`, `fullyParallel`, `baseURL http://localhost:3000`, `locale id-ID`, `timezone Asia/Jakarta`, `trace on-first-retry`, `chromium` only):

```ts
import { test, expect } from '@playwright/test'
test('checkout', async ({ page }) => {
  await page.goto('/checkout')
  await expect(page.getByRole('heading', { name: /checkout/i })).toBeVisible()
  // web-first assertions auto-retry — no sleep
})
```

- Use `page.getByRole` / `getByLabel` / `getByText`; prefer `web-first` `expect(locator).toBeVisible()` over `waitForTimeout`.
- Each test runs in an isolated `BrowserContext` — save auth via `storageState` fixture, not repeated login.
- Capture `trace/screenshot/video` on failure via config; `screenshot: only-on-failure`.
- Isolate with `data-testid` where a11y query is insufficient, not as primary selector.
- Gate: `bun run test:e2e` (or `npx playwright test --project=chromium`) — current `51/51` PASS must stay green. Do not blanket `networkidle`; use explicit readiness.

### Accessibility

Run `axe` via `@axe-core/playwright` where installed, then manual keyboard: tab order, focus trap in dialogs, labels + error association, `prefers-reduced-motion`, contrast, zoom 200%.

## CI and failure handling

Run narrowest check first, then broaden:

```
failing test → go test -run TestName -count=1 → go test ./... -race + go vet → playwright --project=chromium → spectral lint → podman compose health PONG
```

- `go test ./... -count=1 -race && go vet ./...` — per-service or all services from `backend/services/<svc>`.
- `bun run test:e2e` from `frontend/web`.
- Parallelize only suites that do not share ports/DBs/files.
- Do not: delete/weaken a failing test to make CI green; accept broad `2xx/5xx` ranges; add sleeps/retries to mask races; mock the system under test; commit secrets; claim coverage/perf without command output.
- Quarantine a flaky test only with owner + evidence + expiry + separate failure signal.

## Quality checklist

- [ ] A failing test existed first for the bug/behavior
- [ ] Layer matches the risk and uses the real boundary where required
- [ ] Domain invariants + all failure paths covered (`400/401/403/409/422`, `pending/unknown`, stock exhausted, idempotency replay)
- [ ] Financial precision, `FOR UPDATE`, outbox atomicity, saga `PENDING→RESERVED→PAID→SHIPPED→DELIVERED|CANCELLED` and compensate verified
- [ ] Contracts (`openapi.yaml` + Spectral) cover requests, responses, errors, headers, events
- [ ] E2E uses stable user-visible selectors + isolated fixtures + `trace` on failure
- [ ] `go vet` + `tsc --noEmit` + `vite build` clean
- [ ] Output, env, commit/image, and known limits recorded

## References

Read only the matching reference:

- Existing: `saga_test.go`, `idempotency_test.go`, `handler_test.go`, `payu_client_test.go`, `e2e/*.spec.ts`, `playwright.config.*`
- [Testcontainers Go postgres](https://golang.testcontainers.org/modules/postgres/) / kafka — via `/testcontainers/testcontainers-go`
- [Playwright locators, assertions, fixtures, isolation](https://playwright.dev/docs) — via `/microsoft/playwright`

## Official docs to resolve via Context7

- Go testing: https://go.dev/doc/ — stdlib `testing`, `net/http/httptest`, `-race`
- Testcontainers Go: https://golang.testcontainers.org/ — ID `/testcontainers/testcontainers-go`
- Playwright: https://playwright.dev/docs — ID `/microsoft/playwright`
- Spectral / OpenAPI: https://github.com/stoplightio/spectral
