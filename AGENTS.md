# AGENTS.md — TokoBapak E-commerce Platform

> Panduan singkat untuk AI Agent. Detail lengkap ada di `docs/` — file ini hanya berisi aturan yang **wajib dipatuhi** + pointer.

## What is TokoBapak

Marketplace multi-vendor (microservices, event-driven, hexagonal) untuk pasar Indonesia — customer, seller, admin. Stack: TypeScript (Next.js 15), Java (Spring Boot), Go, Python (FastAPI), PostgreSQL/Mongo, Redis, Kafka, Elasticsearch, K8s (EKS).

## Commands

| Action | Command |
| :----- | :------ |
| Run web | `cd frontend/web && bun install && bun dev` |
| Local infra | `cd infrastructure/local && podman compose up -d` |
| Build Java | `mvn -f backend/services/<service>/pom.xml clean package -DskipTests -T 1C` |
| Build NestJS | `npm --prefix backend/services/<service> run build` |
| Build Go | `go run backend/services/<service>/cmd/server/main.go` |
| All tests | `make test` atau `bun test && npx playwright test` |
| Single service | `./scripts/test-single-service.sh <service>` (jika ada) |
| Check services | `podman ps` / `kubectl get pods` |

## Layout

- `frontend/web` — Next.js 15 App Router (Bun 1.2+, Tailwind 4, shadcn/ui)
- `backend/services/` — 18 microservices + `shared/` (Java/TS/Go/Python)
- `infrastructure/` — K8s/Helm/Terraform, `local/podman-compose.yml` + `nginx/`
- `docs/` — architecture, prd, adr, guides (BACA sebelum tugas arsitektural)
- `.agent/skills/` — skills & workflows

## 🚨 Non-Negotiable Rules

1. **Money**: Harga pakai integer minor unit IDR atau `DECIMAL(12,2)`, NEVER `float`/`double`. Format via shared util, rounding `HALF_EVEN`.
2. **No Oversell**: Stock decrement harus transactional / reservation event via `inventory-service`. Jangan update stock tanpa cek.
3. **Idempotency**: Semua endpoint `checkout/payment/order/cart` wajib `X-Idempotency-Key`.
4. **Event Publishing**: Publish via outbox pattern (bukan direct `kafkaTemplate.send()`). Topic `tokobapak.<domain>.<event>.v<n>`, DLQ suffix `.dlq`, format CloudEvents 1.0.
5. **Hexagonal**: External comms (DB, Kafka, HTTP) wajib lewat Port. DTO di `interfaces/dto` sebelum logic.
6. **API & Error**: Path versioned `/v1/...` plural kebab-case. Error RFC 9457 dengan code unik (`ORD_001`, `PAY_002`, `CRT_003`).
7. **Frontend**: Maksimalkan Server Components; `"use client"` hanya leaf interaktif. shadcn/ui via `bunx shadcn@latest add [comp]`, Tailwind CSS-first, Zustand + TanStack Query, Forms RHF + Zod, Icons Lucide.
8. **Container**: distroless/UBI9, non-root (UID 1001), drop ALL capabilities, read-only FS, port 8080.
9. **Security**: Mask PII (NIK/telp) di log, encrypt di DB. No secrets di code/properties (pakai Vault/env). Validasi Zod di trust boundary.
10. **TDD**: NO PROD CODE tanpa failing test dulu. Core domain (order/payment/cart) 80%+, lain 70%+. Test real behavior bukan mock. Frontend: React Testing Library (user behavior, bukan CSS/state).
11. **Git & SemVer**: Conventional Commits `type(scope): msg`. No force-push ke protected. SemVer `MAJOR.MINOR.PATCH` (MAJOR=breaking API/DB/event). Image tag = git tag `vX.Y.Z`. CHANGELOG Keep a Changelog ISO 8601 `YYYY-MM-DD`, no duplicate version.

## 🧠 AI Working Protocol & Debugging

- **Design-First Gate**: Dilarang tulis code/scaffold fitur baru sebelum design plan disetujui user.
- **Root Cause Reproduction**: Jangan langsung fix bug. Buat failing test yang reproduksi error konsisten dulu.
- **Dev Loop**: Error Analysis → Minimal Fix → Local Test → Build → E2E Verify.
- **Stop on Blockers**: Ambiguitas atau fix gagal >2x → STOP tanya user. Dilarang placeholder `TODO`/`TBD`.
- **Evidence Before Claims**: Klaim "tests pass" wajib bukti output command. Dilarang "should work".
- **Subagent Strategy**: Pakai subagent untuk riset/eksekusi paralel. Paralel HANYA jika file/service beda; share file → sekuensial. Review diff via subagent sebelum merge.
- **Skills Usage**: Jika ada skill di `.agent/skills/` yang relevan → wajib baca & ikuti.
- **No Performative Agreement**: Jangan basa-basi "You're absolutely right!". Langsung eksekusi teknikal.
- **Simplicity First**: Kode minimum yang works. 200 baris bisa 50 → rewrite. Tanya: "senior bakal bilang overcomplicated?"
- **Surgical Changes**: Hanya sentuh kode relevan. Match existing style (camelCase vars, PascalCase components, kebab-case files, `@/` alias, TS strict). Bersihkan unused import yang kamu buat, jangan hapus dead code pre-existing tanpa diminta. Tiap baris traceable ke request.
- **Explicit Assumptions**: Nyatakan asumsi eksplisit. Multi-interpretation → sajikan semua opsi, jangan pilih diam-diam.
- **Success Criteria Loop**: Ubah task jadi goal terverifikasi (`Add validation` → `Test invalid input → pass`). Tiap step punya verify-check.

## 🤝 Collaboration Modes

- **Driver**: AI nulis kode. **Navigator**: AI rencana+review, user nulis. **TDD**: red-green-refactor. **Review**: audit saja tanpa nulis kode. **Mentor**: jelaskan konsep tanpa solusi langsung.

## MCP Tools — Gunakan Selalu

Punya akses Context7. Setiap tulis/edit/debug library pihak ketiga → resolve library ID via Context7 dulu, fetch docs relevan. Jangan asumsikan API dari memory training.

| Library | Context7 ID | Use Case |
| :------ | :---------- | :------- |
| Next.js | `/vercel/next.js` | App Router, ISR |
| React | `/facebook/react` | Patterns |
| Tailwind | `/tailwindlabs/tailwindcss` | Styling |
| TypeScript | `/microsoft/typescript` | Types |
| NestJS | `/nestjs/nest` | Backend |
| Spring Boot | `/spring-projects/spring-boot` | Java services |

## 🔄 Doc Routing (Jangan Campur Konten)

| Konten | File |
| :----- | :--- |
| Bug/open items/todos | `docs/roadmap/TODOS.md` |
| Deployment/milestones | `docs/roadmap/PROGRESS.md` |
| Architecture decisions | `docs/adr/` + `docs/architecture/ARCHITECTURE.md` |
| Infra deployment MOP | `infrastructure/README.md` |
| Changelog | `CHANGELOG.md` |
| Lessons & patterns | `docs/guides/LESSONS.md` |

## 🛰️ Deep Reference (Baca Saat Relevan)

- Stack & architecture → `docs/architecture/ARCHITECTURE.md`
- PRD & service status → `docs/prd/` + `backend/README.md`
- Env & secrets → `docs/ENVIRONMENT_VARIABLES.md`
- DB & schema → `docs/architecture/` + `backend/services/*/migrations/`
- Frontend/Mobile/Python-ML & design system → `docs/guides/`
- Skills & workflows → `.agent/skills/`

*Last Updated: August 2026*
