# OpenAPI — TokoBapak MVP

**Spec:** `openapi.yaml` (OpenAPI 3.1.0) — 9 svc Go 1.27 + TanStack Start, gateway Traefik `:8080`.

## Lihat Swagger

```bash
# Redocly (recommended)
npx @redocly/cli preview-docs docs/openapi/openapi.yaml --port 8088
# → http://localhost:8088

# Swagger UI (via docker)
docker run -p 8088:8080 -e SWAGGER_JSON=/openapi.yaml -v $(pwd)/docs/openapi/openapi.yaml:/openapi.yaml swaggerapi/swagger-ui

# VS Code: extension “OpenAPI (Swagger) Editor” → preview
```

## Lint

```bash
npx @redocly/cli lint docs/openapi/openapi.yaml
# harus 0 error
npx @vacuum/cli report docs/openapi/openapi.yaml
```

## Serve via Gateway (opsional)

Tambah di `infrastructure/local/podman-compose.yml` (Traefik sudah serve `:8080`, nginx `frontend/web` serve `:3000`):

```nginx
# frontend/web/nginx.conf — sudah ada
location /docs {
  alias /usr/share/nginx/html/openapi.yaml;
}
```

Atau `docs/openapi` di-serve via `Traefik` label `PathPrefix(/docs)`.

## Desain

- **Versioned** `/v1/...` plural kebab-case, `X-Idempotency-Key` wajib `POST /orders` `/payments`, `X-Request-ID` auto.
- **Error** `application/problem+json` RFC 9457 + `code` (contoh `INSUFFICIENT_STOCK`).
- **Money** `BIGINT` cents, time `RFC 3339`.
- **Security** `bearerAuth` JWT 15m + BFF HttpOnly.
- **Tags** `health,auth,user,product,search,cart,order,payment,shipping,notification`.

## Sinkronisasi

- Sumber kebenaran: `docs/api/STANDARD.md` + `docs/product/PRD.md` + `CONTEXT.md`
- Setiap perubahan handler Go (`internal/adapter/http/handler.go`) → update `openapi.yaml` + `docs/api/STANDARD.md` + `docs/product/FLOW.md` jika flow berubah.
- CI: `npx @redocly/cli lint` di pre-commit (Husky) — belum di-enable, manual untuk MVP.

*Generated 2026-08-29 — MVP 2.0, 9 svc, 51 playwright PASS.*
