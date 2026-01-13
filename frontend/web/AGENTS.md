# Agent Guidelines for TokoBapak Frontend

## Build & Development Commands

- **Start dev server**: `npm run dev` or `bun run dev`
- **Build production**: `npm run build` or `bun run build`
- **Run linter**: `npm run lint` or `bun run lint`
- **No test command** configured - check with user before adding tests

Always run `npm run lint` after making changes to ensure code quality.

## Project Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript (strict mode enabled)
- **Styling**: Tailwind CSS v4
- **UI Components**: Shadcn UI (Radix UI primitives)
- **State Management**: Zustand with persist middleware
- **Forms**: React Hook Form + Zod validation
- **Data Fetching**: TanStack Query
- **Icons**: Lucide React
- **Notifications**: Sonner toast
- **Package Manager**: Bun (but npm commands work)

## Code Style & Conventions

### Import Order

```typescript
// 1. React and Next.js
'use client'
import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

// 2. Third-party libraries
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

// 3. Internal components (grouped by feature)
import { Button } from '@/components/ui/button'
import { ProductCard } from '@/components/product/product-card'

// 4. Internal utilities/stores/hooks
import { useAuthStore } from '@/stores/auth-store'
import { cn } from '@/lib/utils'
import { loginSchema } from '@/lib/validations/auth'
```

### Naming Conventions

- **Components**: PascalCase (`ProductCard`, `Button`, `LoginForm`)
- **Hooks**: camelCase with `use` prefix (`useAuthStore`, `useCartStore`, `useMobile`)
- **Functions**: camelCase (`formatPrice`, `addItem`, `handleSubmit`)
- **Constants**: UPPER_SNAKE_CASE (`HERO_SLIDES`, `FEATURED_PRODUCTS`, `CATEGORIES`)
- **Interfaces/Types**: PascalCase (`User`, `AuthStore`, `ProductCardProps`, `LoginInput`)
- **Stores**: camelCase with `Store` suffix (`auth-store.ts`, `cart-store.ts`)

### Component Structure

```typescript
'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'

interface ComponentProps {
    // Explicit type annotations for all props
    title: string
    count?: number
}

export function ComponentName({ title, count = 0 }: ComponentProps) {
    // State
    const [isLoading, setIsLoading] = useState(false)

    // Store hooks
    const addItem = useCartStore((state) => state.addItem)

    // Event handlers
    const handleClick = () => {
        setIsLoading(true)
        // logic
        setIsLoading(false)
    }

    return (
        <div className="...">
            {/* JSX */}
        </div>
    )
}
```

### File Organization

- `app/` - Next.js App Router pages and layouts (route groups with parentheses for non-URL segments)
- `components/` - React components organized by feature or type
  - `ui/` - Reusable Shadcn UI components
  - `layout/` - Layout components (Header, Footer)
  - `product/` - Feature-specific components
- `stores/` - Zustand state management
- `hooks/` - Custom React hooks
- `lib/` - Utilities and validation schemas
- `public/` - Static assets

### TypeScript Guidelines

- Use interface for component props and object shapes
- Use type for unions, primitives, and computed types
- Always type function parameters and return values explicitly
- Use `z.infer<typeof schema>` to derive types from Zod schemas
- Use `Readonly` for props that shouldn't be mutated: `Readonly<{ children: React.ReactNode }>`

### Styling Patterns

- Use `cn()` utility for conditional class merging: `cn("base-class", isActive && "active-class", className)`
- Use CVA (`class-variance-authority`) for component variants
- Use Tailwind classes with semantic spacing (e.g., `gap-4`, `p-4`, `text-lg`)
- Responsive design: `grid-cols-2 md:grid-cols-3 lg:grid-cols-4`
- Dark mode support with `dark:` prefix

### Form Handling

```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
})
```

### Error Handling

- Use Sonner for toast notifications: `toast.success('Success')`, `toast.error('Error')`
- Zod provides automatic validation error messages
- Use try-catch for async operations and toast on error

### Next.js Patterns

- Use `Link` for navigation between routes (client-side)
- Use `useRouter` from `next/navigation` for programmatic navigation
- Use `Image` from `next/image` for optimized images with `fill`, `priority`, `sizes`
- Server components by default, add `'use client'` directive when needed
- Route groups with parentheses for layout without affecting URL: `(auth)/`, `(shop)/`
- Dynamic routes with brackets: `[id]/page.tsx`

### State Management

```typescript
// Zustand store pattern
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface StoreType {
    state: any
    actions: () => void
}

export const useStore = create<StoreType>()(
    persist(
        (set) => ({
            state: null,
            actions: () => set({ state: newValue }),
        }),
        { name: 'storage-name' }
    )
)
```

### Accessibility & UX

- Include semantic HTML elements
- Add proper alt text for images
- Use button type="submit" in forms
- Provide loading states with `<Loader2>` icon during async operations
- Keyboard navigation support for interactive elements

## Linting

Project uses ESLint with Next.js configuration (`eslint-config-next`).
No test framework is currently configured - verify with user before adding tests.
