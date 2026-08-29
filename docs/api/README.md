# API Docs — TokoBapak MVP

| Dok | Isi | Status |
|-----|-----|--------|
| [`STANDARD.md`](./STANDARD.md) | Konvensi `/v1` plural kebab-case, RFC 9457, `X-Idempotency-Key`, JWT BFF, money `BIGINT`, pagination, saga, rate limit, caching | **Sumber kebenaran** |
| [`../openapi/openapi.yaml`](../openapi/openapi.yaml) | OpenAPI 3.1.0 lengkap 9 svc + gateway Traefik | **Spec** |
| [`../openapi/README.md`](../openapi/README.md) | Cara preview Swagger/Redocly, lint, serve | — |

## Quick Start

```bash
# lihat spec
cat docs/openapi/openapi.yaml | head -n 50

# lint (install jika belum)
npx @redocly/cli lint docs/openapi/openapi.yaml

# preview Swagger
npx @redocly/cli preview-docs docs/openapi/openapi.yaml --port 8088
# → http://localhost:8088
```

## Flow

- Desain: `docs/product/PRD.md` §5 + `docs/product/FLOW.md` mermaid
- Kontrak: `docs/api/STANDARD.md` §6 (endpoints per svc)
- Spec: `docs/openapi/openapi.yaml` (tags health/auth/user/product/search/cart/order/payment/shipping/notification)
- Validasi: `curl http://localhost:3001/health` + `playwright` 51 PASS + `go test` 7 PASS

*MVP 2.0 — 9 keep Go 1.27, hide 9 `enabled=false`.*
