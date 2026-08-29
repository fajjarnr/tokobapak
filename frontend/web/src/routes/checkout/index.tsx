import { createFileRoute } from '@tanstack/react-router'
export const Route = createFileRoute('/checkout')({ component: () => <div>Checkout Saga PENDING→RESERVED→PAID→SHIPPED</div> })
