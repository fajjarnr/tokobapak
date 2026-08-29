# TokoBapak Documentation — MVP

> **MVP 26 Aug 2026**: docs `api/`, `backend/`, `database/`, `design/`, `images/` dihapus karena superseded oleh ADR 0001–0004 (Go 1.27 uniform 9 service + TanStack Start). Histori tetap di git. Sumber baru: `CONTEXT.md`, `docs/adr/`, `docs/TODOS.md`.

## Contents

| Directory | Description | Status |
|-----------|-------------|--------|
| [architecture/](./architecture/) | System architecture, diagrams, sequence flows | **T0.4 done: TanStack Start Vite** |
| [product/](./product/) | Product Requirement Documents | **PRD.md unified MVP 2.0 (backend+frontend) — backend-prd/frontend-prd superseded → PRD.md; FLOW.md + FEATURES.md keep 9/hide 9** |
| [api/](./api/) | API Standard & Conventions | **STANDARD.md — plural kebab-case, RFC 9457, X-Idempotency-Key, JWT BFF** |
| [openapi/](./openapi/) | OpenAPI 3.1.0 Spec + Swagger | **openapi.yaml 27 paths 10 tags — lint 0 errors, Swagger UI** |
| [adr/](./adr/) | Architecture Decision Records (0001–0004) | **Sumber kebenaran MVP** |
## Quick Links — MVP

- **[CONTEXT.md](../CONTEXT.md)** - Glossary MVP (Product/Cart/Order/Payment vs PayU Transaction)
- **[PRD.md](./product/PRD.md)** - Unified PRD backend+frontend MVP 2.0 (single source)
- **[FLOW.md](./product/FLOW.md)** - Journey Browse→Search→Cart→Checkout→Pay→Ship→Notify
- **[FEATURES.md](./product/FEATURES.md)** - Matrix keep 9 / hide 9
- **[API Standard](./api/STANDARD.md)** - Conventions `/v1` plural kebab-case, RFC 9457, idempotency (Context7 OpenAPI/Swagger verified)
- **[OpenAPI Spec](./openapi/openapi.yaml)** - 3.1.0 27 paths Swagger (`npx @redocly/cli preview-docs`)
- **[TODOS.md](./roadmap/TODOS.md)** - Task Fase 0–4 dengan ref ADR
- **[ADR 0001](./adr/0001-mvp-scope-9-services.md)** - Scope 9 keep / 9 hide
- **[ADR 0002](./adr/0002-go-1-27-uniform-mvp.md)** - Go 1.27 uniform
- **[ADR 0003](./adr/0003-payu-snapbi-adapter-saga.md)** - PayU SNAP-BI + Saga
- **[ADR 0004](./adr/0004-frontend-tanstack-start.md)** - TanStack Start migration
- **[Architecture](./architecture/ARCHITECTURE.md)** - System design (High-Level TanStack Start Vite, m6a.4xlarge, Traefik)
- **[Environment Variables](./ENVIRONMENT_VARIABLES.md)** - Service configs (Go 1.27 + postgres:18)
## For Developers (MVP)

1. Baca `../CONTEXT.md` untuk bahasa domain
2. Baca `docs/adr/0001` → `0004` untuk keputusan
3. Ikuti `docs/TODOS.md` Fase 0–4
4. Jangan pakai docs `api/`, `backend/`, `database/` lama — sudah dihapus (git history tersedia)
