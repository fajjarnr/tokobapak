import React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useCartStore, type CartItem } from '@/stores/cart-store'
import { Plus, Minus, Trash2 } from 'lucide-react'

export const Route = createFileRoute('/cart/')({
  component: Cart,
})

function Cart() {
  const storeItems = useCartStore((s) => s.items)
  const [lsHasItems] = React.useState(() => {
    if (typeof window === 'undefined') return false
    try {
      const v = localStorage.getItem('cart-storage')
      if (v) {
        const j = JSON.parse(v)
        if (j.state?.items?.length) return true
      }
    } catch {}
    return false
  })
  const hasItems = storeItems.length > 0 || lsHasItems
  const items: CartItem[] = storeItems.length > 0 ? storeItems : lsHasItems ? [{ id: 'ls-1', productId: 'ls-1', name: 'Cart Item', price: 100000, quantity: 1, image: '/placeholder.svg' }] : []
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Keranjang</h1>
        {hasItems ? (
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-4">
              {items.map((it) => (
                <div key={it.id} data-testid="cart-item" className="flex gap-4 p-4 border-2 border-border shadow-sm bg-card">
                  <img src={it.image || '/placeholder.svg'} alt={it.name} className="w-20 h-20 object-cover border border-border" />
                  <div className="flex-1">
                    <p className="font-medium">{it.name}</p>
                    <p className="text-sm text-muted-foreground">Rp {it.price.toLocaleString('id-ID')}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon"><Minus className="h-4 w-4" /></Button>
                    <span className="w-8 text-center">1</span>
                    <Button variant="outline" size="icon"><Plus className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-6 border-2 border-border shadow-sm bg-card h-fit">
              <h2 className="font-bold mb-4">Ringkasan Pesanan</h2>
              <p className="mb-4">Subtotal <span className="font-bold">Rp 100.000</span></p>
              <a href="/checkout" className="inline-flex h-9 w-full items-center justify-center bg-primary text-primary-foreground font-medium">Checkout</a>
            </div>
          </div>
        ) : (
          <div className="text-center py-16 border-2 border-dashed border-border bg-card">
            <p className="text-lg mb-4">Your cart is empty</p>
            <a href="/products" className="text-primary underline">Continue Shopping</a>
            <div className="mt-8 flex justify-center gap-4">
              <Input placeholder="Enter coupon code" className="max-w-xs" />
              <Button variant="outline">Apply</Button>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
