import { createFileRoute } from '@tanstack/react-router'
export const Route = createFileRoute('/products')({ component: () => <div>Products listing staleTime 60s</div> })
