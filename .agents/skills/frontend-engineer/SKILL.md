---
name: frontend-engineer
description: TokoBapak frontend engineering for TanStack Start + Vite + React + Tailwind, TanStack Router file-based routes, TanStack Query server state, Zustand client state, BFF token relay, money-safe UI, a11y, and Playwright. Use when implementing, debugging, or reviewing any TokoBapak web UI; verify all library APIs with Context7 first.
---

# TokoBapak Frontend Engineer

Use the smallest change that preserves money safety, BFF security, and the existing Vite + TanStack architecture. Read `package.json`, `vite.config.ts`, `src/routes/*`, `src/lib/bff.ts`, and existing shims before changing code. Reuse Radix/Tailwind/Zustand primitives — do not add a second router, query client, or state layer for one screen.

## Context7 documentation gate — REQUIRED

Before writing or changing code that uses a library/framework/SDK:

1. Read `frontend/web/package.json` for the installed version.
2. Resolve the official library in Context7.
3. Query **one topic at a time** (routing, loader, query/mutation, vite proxy, tailwind, persist). Use returned docs as source of truth.
4. If the indexed version differs from the manifest, treat the manifest as truth and note the mismatch.
5. Re-resolve after bumping a dep. Do not mix examples across majors.

**TokoBapak web stack (general — manifest is source of truth):**

| Surface | Stack | Context7 ID |
|---|---|---|
| Framework | TanStack Start + TanStack Router file-based `src/routes/*` + `routeTree.gen.ts` | `/tanstack/router` + `/websites/tanstack_start` |
| Bundler | Vite + `@vitejs/plugin-react` + `vite-tsconfig-paths` | `/vitejs/vite` |
| Styling | Tailwind CSS + `@tailwindcss/vite` + `tw-animate-css` | `/tailwindlabs/tailwindcss.com` + `/websites/tailwindcss` |
| State | TanStack Query (server) + Zustand (ephemeral client) + Zod + React Hook Form | `/tanstack/query` + `/pmndrs/zustand` |
| UI | React + Radix UI + lucide + sonner + recharts | `react.dev` + Radix docs |
| Test | Playwright (E2E gate) | `playwright.dev` |
| Runtime | Bun + Node, `vite --port 3000` dev, `nginx:alpine :8080` prod `vite build → dist` | — |

Stack names are stable; versions are intentionally omitted — `package.json` and `vite.config.ts` are the source of truth.

## Operating contract

1. Max Server Functions / loaders for data; `use client` only at smallest interactive leaf that needs `useState`/`useEffect`/browser APIs.
2. Inspect `vite.config.ts` proxy + `tsconfig.json` paths + shims (`next/image→unpic`, `next/link`, `next/font`) before adding an import or route.
3. Smallest diff that satisfies request — no speculative tokens, abstractions, or design layers.
4. For new feature, present route → loader/mutation → component → a11y/test plan before coding. For bug, write failing `playwright` repro first.

## Repository baseline — Vite + TanStack

```ts
// vite.config.ts (actual shape)
import { tanstackRouter } from '@tanstack/router-plugin/vite'
export default defineConfig({
  plugins: [tanstackRouter({ target: 'react', autoCodeSplitting: true }), tailwindcss(), react(), tsconfigPaths()],
  server: {
    port: 3000,
    proxy: {
      '/api/v1/products': { target: 'http://localhost:3101', changeOrigin: true, rewrite: (p)=>p.replace(/^\/api/,'') },
      '/api/v1/payments': { target: 'http://localhost:3005', changeOrigin: true },
      '/api/v1/orders':   { target: 'http://localhost:3004', changeOrigin: true },
      '/api/v1/cart':      { target: 'http://localhost:3003', changeOrigin: true },
      // + /v1/* aliases
    },
  },
  resolve: { alias: { '@': path.resolve(__dirname,'.'), 'next/image': shim, 'next/link': shim } },
})
```

- File-based routing: `src/routes/__root.tsx` (`createRootRoute`), `src/routes/index.tsx`, `products/`, `cart/`, `checkout/`, `login/` etc. → `src/routeTree.gen.ts` generated. Never hand-edit `routeTree.gen.ts`.
- `src/lib/bff.ts: relayToken/refreshToken` is stub — real impl forwards `HttpOnly accessToken` to `auth-service` (`golang-jwt/jwt`). Browser must never construct Bearer header.
- `alias next/* → shims` exists because ADR 0004 deleted `next` — do not re-add `next` deps; use `unpic` for images.

## TanStack Router + Start (file-based)

- Use `createFileRoute('/path')` + `loader` for data, `component` for UI. Use `createServerFn({method:'GET'|'POST'}).validator(zod).handler` for server functions (see Context7 `/tanstack/router` docs).
- Loaders are server-first; keep auth/price/stock reads dynamic (no static cache for personalized data).
- Use `Route.useLoaderData()` + `useRouter().invalidate()` after mutations — do not duplicate URL state in Zustand.
- Keep route handlers standard `Request/Response` (`server.handlers.GET`). Apply middleware via `server.middleware` / `createHandlers` per Context7.

## State and data fetching

- **TanStack Query** for server state: `useQuery({queryKey:['products'], queryFn:getProducts})`, `useMutation({mutationFn:postOrder, onSuccess:()=>queryClient.invalidateQueries({queryKey:['orders']})})` (`/tanstack/query`).
- **Zustand** for ephemeral client state only (persist requires explicit `setState` after create in v5, see migration docs). Example in-memory `authStore` pattern — never persist tokens/PII/balance.
- Do not put JWT, balance, cart total, or PII in `localStorage/sessionStorage` or query persister. `persist` only for explicit non-sensitive UI prefs with `partialize`.
- Mutation cache update: prefer `invalidateQueries` + refetch canonical resource over hand-rolled arithmetic on cached money.

## BFF and auth

```
Browser → /api/v1/* or /api/auth/* → Vite proxy / TanStack server fn → auth-service → downstream
          cookie HttpOnly               server-side fetch                golang-jwt 15m + refresh
```

- Login/refresh/logout via `POST /v1/auth/*` → `Set-Cookie: accessToken HttpOnly Secure SameSite`. Response body must not contain token.
- Browser JS must not read `accessToken` from `document.cookie` beyond relay stub; do not store in Zustand/Query/localStorage.
- Preserve Vite proxy `changeOrigin`, `rewrite`, timeout, and path allowlist. Do not proxy arbitrary `target` from query param (SSRF).

## Money-safe UI — CRITICAL

- Never `number`/`float` for `amount/price/fee/stock` — keep as **decimal string** at UI boundary. Validate `^(0|[1-9]\d{0,15})(\.\d{1,4})?$`, send unchanged; backend `BIGINT` `HALF_EVEN` is truth.
- Do not `valueAsNumber`, `toFixed()` business logic, or optimistic `balance - amount`. Show `pending` + refetch `/v1/payments/{id}` after write.
- Display formatting may round for presentation only.

```ts
type MoneyInput = { amount: string } // canonical decimal text
const isDecimal = (v:unknown): v is string => typeof v==='string' && /^(?:0|[1-9]\d{0,15})(?:\.\d{1,4})?$/.test(v)
```

## Components, Tailwind, and a11y

- Reuse `src/components/ui/*` (Radix + `class-variance-authority` + `clsx` + `tailwind-merge`) before adding a dep.
- Keep props typed; `unknown` at JSON boundary then `zod` narrow — never `any`.
- Use semantic HTML + native controls; ARIA only for missing semantics. Every input needs label + error association, dialogs trap focus, errors announced.
- `tsc --noEmit && vite build` must pass. Check `prefers-reduced-motion`, contrast, focus order, zoom 200%.

## Forms

- `react-hook-form + @hookform/resolvers + zod`. Validate amount string with zod, `inputMode="decimal"` not `type="number"` coercion.
- Financial writes require one `X-Idempotency-Key` UUID per user intent — generate once, preserve across retry. Show `pending/unknown` + reconciliation link on timeout; never blind retry.

## Testing

- Playwright is gate: `bun run test:e2e` must PASS (see TODOS Fase 7). Reuse isolated test data + `data-testid`, web-first assertions (`getByRole`), no `networkidle` blankets.
- BFF/auth: test `HttpOnly`, no token in JSON, `401` redirect, CSRF/origin.
- Financial flow: idempotent replay (2x same key → 200 same result), double-tap disabled, `insufficient stock`/`balance`, `pending` state, precision string.
- Add `vitest + Testing Library` only when unit coverage needed — currently Playwright is truth.

## Performance and resilience

- Measure `LCP/INP/CLS` before optimizing. Use TanStack Router `autoCodeSplitting` + TanStack Query caching (`staleTime`) + `React.lazy` per route — not per component.
- Handle `429/5xx`, slow network, duplicate tap, back nav, stale query explicitly. Timeout ≠ failure — offer `Check status`.

## Container

- `Dockerfile` `bun build → nginx:alpine USER 1001:1001 EXPOSE 8080` read-only FS. No `node` in prod. Keep `dist/` output, not `next` output.

## Verification checklist

- [ ] Installed versions checked via `package.json` + Context7 query recorded
- [ ] Server/loader boundary minimal; no secret crosses to client
- [ ] Money stays `string` — no `number` coercion or optimistic balance
- [ ] Financial mutation has one idempotency key + pending/retry/unknown states
- [ ] BFF uses HttpOnly cookies; no token in Zustand/Query/storage
- [ ] `vite build` + `tsc --noEmit` + `playwright` evidence attached

## Official docs to resolve via Context7

- TanStack Router: https://tanstack.com/router — ID `/tanstack/router`
- TanStack Start: https://tanstack.com/start — ID `/websites/tanstack_start`
- TanStack Query: https://tanstack.com/query — ID `/tanstack/query`
- Vite: https://vite.dev/config/ — ID `/vitejs/vite`
- Tailwind CSS: https://tailwindcss.com — ID `/tailwindlabs/tailwindcss.com`
- Zustand: https://zustand.docs.pmnd.rs — ID `/pmndrs/zustand`
- Playwright: https://playwright.dev/docs — locators/assertions/fixtures
- React: https://react.dev/reference/react
