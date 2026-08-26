---
name: Frontend Development
description: Skills for developing Next.js 15 frontend applications with React, Tailwind CSS, and shadcn/ui
---

# Frontend Development Skills

> Panduan lengkap skill untuk Frontend Development di TokoBapak E-commerce Platform

---

## 📖 Table of Contents

1. [Overview](#overview)
2. [Technology Stack](#technology-stack)
3. [Component Generation](#component-generation)
4. [API Integration & Data Fetching](#api-integration--data-fetching)
5. [State Management](#state-management)
6. [Next.js 15 Patterns](#nextjs-15-patterns)
7. [Styling with Tailwind CSS 4](#styling-with-tailwind-css-4)
8. [Testing & Quality Assurance](#testing--quality-assurance)
9. [Best Practices](#best-practices)

---

## Overview

AI Assistant harus mampu membantu developer dalam:

- 🎨 Building React Server Components dan Client Components
- 🧩 Using shadcn/ui component library
- 🎯 Implementing Tailwind CSS 4 styling
- 📊 Data fetching dengan TanStack Query
- 🔄 State management dengan Zustand
- ✅ Testing dengan Vitest dan Playwright

---

## Technology Stack

| Technology        | Version               | Purpose                   |
| ----------------- | --------------------- | ------------------------- |
| **Runtime**       | Bun 1.2+              | Package manager & runtime |
| **Framework**     | Next.js 15            | App Router, SSR, ISR      |
| **Styling**       | Tailwind CSS 4        | CSS-first configuration   |
| **UI Components** | shadcn/ui             | Radix primitives          |
| **State**         | Zustand 5             | Global state management   |
| **Data Fetching** | TanStack Query 5      | Server state              |
| **Forms**         | React Hook Form + Zod | Form validation           |
| **Icons**         | Lucide React          | Icon library              |

### Commands

```bash
cd frontend/web
bun install           # Install dependencies
bun dev               # Start development server
bun build             # Production build
bun test              # Run tests
bun lint              # Lint code
```

---

## Component Generation

### Skill: Frontend Component Generation

**Trigger**: User meminta membuat komponen UI baru

**Capabilities**:

- Membuat React Server Components (default) atau Client Components
- Menggunakan shadcn/ui components
- Implement Tailwind CSS 4 styling
- TypeScript strict typing
- Accessible (ARIA) components

**Example - ProductCard Component**:

```typescript
// Generate: "Buat komponen ProductCard dengan gambar, title, price, dan rating"
'use client'

import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Star } from 'lucide-react'
import Image from 'next/image'

interface ProductCardProps {
  id: string
  name: string
  price: number
  rating: number
  imageUrl: string
}

export function ProductCard({ id, name, price, rating, imageUrl }: ProductCardProps) {
  return (
    <Card className="group hover:shadow-lg transition-shadow">
      <CardHeader className="p-0">
        <div className="relative aspect-square overflow-hidden rounded-t-lg">
          <Image
            src={imageUrl}
            alt={name}
            fill
            className="object-cover group-hover:scale-105 transition-transform"
          />
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <h3 className="font-semibold truncate">{name}</h3>
        <div className="flex items-center gap-1 mt-2">
          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          <span className="text-sm">{rating.toFixed(1)}</span>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <p className="text-lg font-bold text-primary">
          Rp {price.toLocaleString('id-ID')}
        </p>
      </CardFooter>
    </Card>
  )
}
```

### shadcn/ui Components

**Installation**:

```bash
bunx shadcn@latest add [component]
```

**Customization**: via `components.json`

**Key Concepts**:

- ✅ Radix primitives usage
- ✅ Compose complex components
- ✅ Accessible by default

---

## API Integration & Data Fetching

### Skill: TanStack Query Integration

**Trigger**: User meminta fetch data dari API

**Example - Custom Hooks**:

```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { productsApi } from "@/lib/api";

export function useProducts(filters?: ProductFilters) {
  return useQuery({
    queryKey: ["products", filters],
    queryFn: () => productsApi.getProducts(filters),
    staleTime: 60_000, // 1 minute
  });
}

export function useAddToCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (item: CartItem) => cartApi.addItem(item),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
}
```

### Skill: REST API Client Creation

**Capabilities**:

- Generate API client dengan proper error handling
- Add retry logic
- Handle authentication
- Type-safe requests/responses

---

## State Management

### Skill: Zustand Store Creation

**Trigger**: User meminta manage global state

**Example - Cart Store**:

```typescript
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  total: number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) =>
        set((state) => ({
          items: [...state.items, item],
        })),
      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        })),
      clearCart: () => set({ items: [] }),
      get total() {
        return get().items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0,
        );
      },
    }),
    { name: "cart-storage" },
  ),
);
```

---

## Next.js 15 Patterns

### Must Know

- ✅ Server Components vs Client Components
- ✅ Server Actions untuk mutations
- ✅ Streaming with Suspense
- ✅ Route handlers (`app/api/`)
- ✅ Metadata API untuk SEO
- ✅ Image optimization
- ✅ Incremental Static Regeneration (ISR)

### Example: Product Page with ISR

```typescript
// app/products/[slug]/page.tsx
import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { ProductDetail } from '@/components/product-detail'
import { ProductSkeleton } from '@/components/skeletons'

interface Props {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props) {
  const product = await fetch(`${API_URL}/products/${params.slug}`).then(r => r.json())

  return {
    title: product.name,
    description: product.description,
    openGraph: {
      images: [product.imageUrl],
    },
  }
}

export default async function ProductPage({ params }: Props) {
  const product = await fetch(`${API_URL}/products/${params.slug}`, {
    next: { revalidate: 60 } // ISR: revalidate every 60 seconds
  }).then(r => r.json())

  if (!product) notFound()

  return (
    <div>
      <Suspense fallback={<ProductSkeleton />}>
        <ProductDetail product={product} />
      </Suspense>
    </div>
  )
}
```

---

## Styling with Tailwind CSS 4

### Must Know

- ✅ CSS-first configuration
- ✅ Custom design tokens
- ✅ Dark mode support
- ✅ Responsive design patterns
- ✅ Animation utilities

---

## Testing & Quality Assurance

### Unit Tests (Vitest)

```typescript
// components/product-card.test.tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { ProductCard } from './product-card'

describe('ProductCard', () => {
  it('renders product information', () => {
    render(
      <ProductCard
        id="1"
        name="Test Product"
        price={100000}
        rating={4.5}
        imageUrl="/test.jpg"
      />
    )

    expect(screen.getByText('Test Product')).toBeInTheDocument()
    expect(screen.getByText('Rp 100.000')).toBeInTheDocument()
    expect(screen.getByText('4.5')).toBeInTheDocument()
  })
})
```

### E2E Tests (Playwright)

```typescript
// e2e/checkout.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Checkout Flow", () => {
  test("user can complete purchase", async ({ page }) => {
    // Login
    await page.goto("/login");
    await page.fill('[name="email"]', "test@example.com");
    await page.fill('[name="password"]', "password");
    await page.click('button[type="submit"]');

    // Add to cart
    await page.goto("/products/test-product");
    await page.click('button:has-text("Add to Cart")');

    // Checkout
    await page.click('a[href="/cart"]');
    await page.click('button:has-text("Checkout")');

    // Fill shipping info
    await page.fill('[name="address"]', "Test Address");
    await page.fill('[name="phone"]', "08123456789");

    // Select payment
    await page.click('label:has-text("Bank Transfer")');

    // Place order
    await page.click('button:has-text("Place Order")');

    // Verify success
    await expect(page).toHaveURL(/\/orders\/[a-z0-9-]+/);
    await expect(page.locator("text=Order Successful")).toBeVisible();
  });
});
```

---

## Best Practices

### Code Quality Checklist

- ✅ TypeScript: No `any` types
- ✅ ESLint: No warnings
- ✅ Prettier: Formatted code
- ✅ Tests: Coverage > 80%
- ✅ Accessibility: ARIA labels present
- ✅ Performance: No obvious bottlenecks

### Key Conventions

- **Use App Router** - Jangan gunakan Pages Router
- **Use Server Components by default** - Client components hanya jika perlu interactivity
- **TypeScript strict mode** - Semua file harus typed
- **Imports**: Absolute imports menggunakan `@/` alias
- **File naming**: kebab-case untuk files

### Common Scenario: Debug Cart Issue

```typescript
// Problem: Cart items tidak persist setelah page refresh
// Root cause: Zustand store tidak menggunakan persist middleware

// Fix:
import { persist } from "zustand/middleware";

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item) =>
        set((state) => ({
          items: [...state.items, item],
        })),
    }),
    {
      name: "cart-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
```

---

## Context7 Integration

Untuk dokumentasi terbaru, gunakan Context7 MCP:

| Library              | Context7 ID                 | Use Case             |
| -------------------- | --------------------------- | -------------------- |
| **Next.js**          | `/vercel/next.js`           | App Router, SSR, ISR |
| **Next.js Commerce** | `/vercel/commerce`          | E-commerce patterns  |
| **React**            | `/facebook/react`           | React patterns       |
| **Tailwind CSS**     | `/tailwindlabs/tailwindcss` | Styling utilities    |
| **TypeScript**       | `/microsoft/typescript`     | Type definitions     |

---

_Last Updated: January 2026_
