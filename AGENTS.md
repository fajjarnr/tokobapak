# AGENTS.md — TokoBapak E-commerce Platform

> Panduan singkat untuk AI Agent. Detail lengkap ada di `docs/` — file ini hanya berisi aturan yang **wajib dipatuhi** + pointer.

## What is TokoBapak

Marketplace multi-vendor (microservices, event-driven, hexagonal) untuk pasar Indonesia. Stack: Go, TypeScript (TanStack Start), PostgreSQL, Redis, Kafka, Elasticsearch. Scope & keputusan MVP ada di `CONTEXT.md` + `docs/adr/` — baca dulu sebelum coding.

## Commands

| Action | Command |
| :----- | :------ |
| Run web | `cd frontend/web && bun install && bun dev` |
| Local infra | `cd infrastructure/local && podman compose up -d` |
| Build service | `go run backend/services/<service>/cmd/server/main.go` |
| All tests | `go test ./... && npx playwright test` |
| Check services | `podman ps` / `kubectl get pods` |

## Layout

- `frontend/web` — Web app (TanStack Start, lihat ADR 0004)
- `backend/services/` — Microservices Go + `shared/` (lihat ADR 0001/0002 untuk scope)
- `infrastructure/` — Podman Compose local, K8s/Helm/Terraform cloud
- `docs/` — `adr/`, `architecture/`, `roadmap/`, `CONTEXT.md`, `ENVIRONMENT_VARIABLES.md`
- `.agent/skills/` — skills & workflows

## 🚨 Non-Negotiable Rules

1. **Money**: Harga pakai `DECIMAL`/`minor unit`, NEVER `float`/`double`, rounding `HALF_EVEN`.
2. **No Oversell**: Stock decrement harus transactional/reservation — jangan update tanpa cek.
3. **Idempotency**: Endpoint `checkout/payment/order` wajib `X-Idempotency-Key`.
4. **Event Publishing**: Publish via outbox pattern (bukan direct `kafka send`). Topic `tokobapak.<domain>.<event>.v<n>`, DLQ `.dlq`.
5. **Hexagonal**: External comms (DB, Kafka, HTTP) wajib lewat Port. DTO di `port`/`dto`.
6. **API & Error**: Path versioned `/v1/...` plural kebab-case. Error RFC 9457 dengan code unik.
7. **Frontend**: Maksimalkan Server Components/Functions; client hanya leaf interaktif.
8. **Container**: distroless/UBI9, non-root (1001), drop ALL caps, read-only FS, port 8080.
9. **Security**: Mask PII di log, encrypt di DB. No secrets di code (pakai Vault/env).
10. **TDD**: NO PROD CODE tanpa failing test dulu. Test real behavior, bukan mock.
11. **Git & SemVer**: Conventional Commits `type(scope): msg`. No force-push protected. SemVer `MAJOR.MINOR.PATCH` (MAJOR=breaking API/DB/event). Image tag = git tag.

## 🧠 AI Working Protocol & Debugging

- **Design-First Gate**: Dilarang tulis code/scaffold fitur baru sebelum design plan disetujui user.
- **Root Cause Reproduction**: Buat failing test yang reproduksi bug dulu sebelum fix.
- **Dev Loop**: Error Analysis → Minimal Fix → Local Test → Build → E2E Verify.
- **Stop on Blockers**: Ambiguitas atau fix gagal >2x → STOP tanya user. Dilarang `TODO`/`TBD`.
- **Evidence Before Claims**: Klaim "tests pass" wajib bukti output command.
- **Subagent Strategy**: Paralel hanya jika file/service beda; share file → sekuensial. Review diff via subagent sebelum merge.
- **Skills Usage**: Jika ada skill di `.agent/skills/` relevan → wajib baca & ikuti.
- **No Performative Agreement**: Langsung eksekusi teknikal, tanpa basa-basi.
- **Simplicity First**: Kode minimum yang works. 200 baris bisa 50 → rewrite.
- **Surgical Changes**: Hanya sentuh kode relevan. Match existing style. Bersihkan unused import yang kamu buat.
- **Explicit Assumptions**: Nyatakan asumsi; multi-interpretation → sajikan opsi.
- **Success Criteria Loop**: Task → goal terverifikasi dengan verify-check per step.

## 🤝 Collaboration Modes

- **Driver**: AI nulis kode. **Navigator**: AI rencana+review, user nulis. **TDD**: red-green-refactor. **Review**: audit saja. **Mentor**: jelaskan tanpa solusi langsung.

## MCP Tools — Gunakan Selalu

Setiap tulis/edit/debug library → resolve via Context7 dulu, jangan asumsikan dari memory.

## 🔄 Doc Routing (Jangan Campur Konten)

| Konten | File |
| :----- | :--- |
| Glossary domain | `CONTEXT.md` |
| Keputusan arsitektur | `docs/adr/` |
| Task eksekusi | `docs/roadmap/TODOS.md` |
| Architecture & sequence | `docs/architecture/` |
| Infra MOP | `infrastructure/` |
| Changelog | `CHANGELOG.md` |

## 🛰️ Deep Reference (Baca Saat Relevan)

- Overview & superseded docs → `docs/README.md`
- Glossary → `CONTEXT.md`
- ADR (scope, Go uniform, PayU, TanStack) → `docs/adr/`
- System design → `docs/architecture/ARCHITECTURE.md`
- Sequence flows → `docs/architecture/SEQUENCE_DIAGRAMS.md`
- Env & service configs → `docs/ENVIRONMENT_VARIABLES.md`
- DB & migrations → `backend/services/<svc>/migrations/`
- Skills & workflows → `.agent/skills/`