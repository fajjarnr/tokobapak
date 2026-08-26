# TokoBapak Documentation — MVP

> **MVP 26 Aug 2026**: docs `api/`, `backend/`, `database/`, `design/`, `images/` dihapus karena superseded oleh ADR 0001–0004 (Go 1.27 uniform 9 service + TanStack Start). Histori tetap di git. Sumber baru: `CONTEXT.md`, `docs/adr/`, `docs/TODOS.md`.

## Contents

| Directory | Description | Status |
|-----------|-------------|--------|
| [architecture/](./architecture/) | System architecture, diagrams, sequence flows | **T0.4: perlu update Next.js → TanStack Start** |
| [prd/](./prd/) | Product Requirement Documents | `frontend-prd.md` superseded → ADR 0004 |
| [adr/](./adr/) | Architecture Decision Records (0001–0004) | **Sumber kebenaran MVP** |
| [TODOS.md](./TODOS.md) | Task eksekusi MVP Fase 0–4 | **Single source of truth** |

## Quick Links — MVP

- **[CONTEXT.md](../CONTEXT.md)** - Glossary MVP (Product/Cart/Order/Payment vs PayU Transaction)
- **[TODOS.md](./TODOS.md)** - Task Fase 0–4 dengan ref ADR
- **[ADR 0001](./adr/0001-mvp-scope-9-services.md)** - Scope 9 keep / 9 hide
- **[ADR 0002](./adr/0002-go-1-27-uniform-mvp.md)** - Go 1.27 uniform
- **[ADR 0003](./adr/0003-payu-snapbi-adapter-saga.md)** - PayU SNAP-BI + Saga
- **[ADR 0004](./adr/0004-frontend-tanstack-start.md)** - TanStack Start migration
- **[Architecture](./architecture/ARCHITECTURE.md)** - System design (akan diupdate T0.4)
- **[Environment Variables](./ENVIRONMENT_VARIABLES.md)** - Service configs (akan disesuaikan Go)

## For Developers (MVP)

1. Baca `../CONTEXT.md` untuk bahasa domain
2. Baca `docs/adr/0001` → `0004` untuk keputusan
3. Ikuti `docs/TODOS.md` Fase 0–4
4. Jangan pakai docs `api/`, `backend/`, `database/` lama — sudah dihapus (git history tersedia)
