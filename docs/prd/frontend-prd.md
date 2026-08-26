# Frontend PRD — SUPERSEDED

> **Status: Superseded oleh `docs/adr/0004-frontend-tanstack-start.md` (26 Aug 2026)**
>
> Dokumen ini sebelumnya mendefinisikan stack **Next.js 15 App Router** untuk `frontend/web`, `frontend/mobile`, `frontend/admin-dashboard`. Sesuai ADR 0004, MVP memutuskan **buang Next.js total → TanStack Start + TanStack Router + TanStack Query (Vite) + BFF JWT**.
>
> File lengkap versi Next.js diarsipkan di `docs/archive/frontend-prd-nextjs-LEGACY.md` untuk referensi.
>
> **Referensi baru:**
> - `docs/adr/0004-frontend-tanstack-start.md` — keputusan, trade-off, dan effort rewrite 2–3 minggu
> - `docs/TODOS.md` Fase 2 (T2.1–T2.5) — task migrasi routes, BFF, HydrationBoundary, Vite build, Playwright
> - `CONTEXT.md` — glossary Cart/Search/Order/Payment yang tetap berlaku untuk frontend baru
>
> Jangan gunakan spesifikasi Next.js di file arsip untuk implementasi baru. Semua PRD frontend selanjutnya akan ditulis sebagai `docs/prd/frontend-tanstack-prd.md` (belum dibuat, tunggu Fase 2).
