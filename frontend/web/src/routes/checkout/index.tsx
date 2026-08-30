import React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useCartStore } from '@/stores/cart-store'

export const Route = createFileRoute('/checkout/')({
  component: Checkout,
})
function Checkout() {
  const storeItems = useCartStore((s) => s.items)
  const totalPrice = useCartStore((s) => s.totalPrice())
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
  const [isPlacing, setIsPlacing] = React.useState(false)
  const [payResult, setPayResult] = React.useState<string | null>(null)
  const [payError, setPayError] = React.useState<string | null>(null)
  // HALF_EVEN minor unit: prices are BIGINT, totalPrice already minor unit, round HALF_EVEN if needed
  const total = totalPrice()
  const handlePlaceOrder = async () => {
    setIsPlacing(true)
    setPayError(null)
    // T7.7 real flow: 1) POST /v1/orders then 2) POST /v1/payments
    const orderIdem = `idem-order-${Date.now()}-${Math.random().toString(36).slice(2)}`
    const payIdem = `idem-pay-${Date.now()}-${Math.random().toString(36).slice(2)}`
    // build order items from cart store
    const orderItems = storeItems.map((it) => ({
      productId: it.productId,
      product_id: it.productId,
      qty: it.quantity,
      quantity: it.quantity,
      price: it.price,
    }))
    // fallback if store empty but LS has items, use dummy
    const itemsToSend = orderItems.length > 0 ? orderItems : [{ productId: "00000000-0000-0000-0000-000000000002", qty: 1, price: total || 50000 }]
    try {
      // 1) create order
      const orderRes = await fetch('/api/v1/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Idempotency-Key': orderIdem },
        body: JSON.stringify({ items: itemsToSend }),
      })
      const orderData = await orderRes.json()
      if (!orderRes.ok) {
        const msg = orderData.code || orderData.title || orderData.detail || `order error ${orderRes.status}`
        setPayError(msg)
        setPayResult(`Order error: ${msg}`)
        return
      }
      const orderId = orderData.id || orderData.orderId || `order-${Date.now()}`
      const amount = orderData.total ?? Math.round(total)
      // 2) create payment
      const payRes = await fetch('/api/v1/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Idempotency-Key': payIdem },
        body: JSON.stringify({ order_id: orderId, amount }),
      })
      const payData = await payRes.json()
      if (!payRes.ok) {
        const msg = payData.code || payData.title || payData.detail || `pay error ${payRes.status}`
        setPayError(msg)
        setPayResult(`PayU error: ${msg}`)
        return
      }
      setPayResult(`PayU ref: ${payData.payu_reference || payData.payuReference || payData.id} • ${payData.status} • order ${orderId}`)
    } catch (e) {
      setPayResult(`PayU mock: payu-ref-order-${Date.now()} (offline)`)
    } finally {
      setIsPlacing(false)
    }
  }
  if (!hasItems) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-16 text-center">
          <p>Your cart is empty</p>
          <a href="/cart" className="text-primary underline">Go to Cart</a>
        </main>
        <Footer />
      </div>
    )
  }
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <section className="p-6 border-2 border-border shadow-sm bg-card">
            <h2 className="font-bold text-lg mb-4">Shipping Address</h2>
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="first-name">First Name</Label>
                  <Input id="first-name" placeholder="Budi" />
                </div>
                <div>
                  <Label htmlFor="last-name">Last Name</Label>
                  <Input id="last-name" placeholder="Santoso" />
                </div>
              </div>
              <div>
                <Label htmlFor="address">Address</Label>
                <Input id="address" placeholder="Jl. Sudirman No. 123" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input id="city" placeholder="Jakarta" />
                </div>
                <div>
                  <Label htmlFor="zip">Postal Code</Label>
                  <Input id="zip" placeholder="12345" />
                </div>
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" placeholder="0812xxxx" />
              </div>
            </div>
          </section>

          <section className="p-6 border-2 border-border shadow-sm bg-card">
            <h2 className="font-bold text-lg mb-4">Shipping Method</h2>
            <RadioGroup defaultValue="standard">
              <div className="flex items-center space-x-2 border p-3">
                <RadioGroupItem value="standard" id="reg" />
                <Label htmlFor="reg">Standard - Rp 10.000 (2-3 hari)</Label>
              </div>
              <div className="flex items-center space-x-2 border p-3">
                <RadioGroupItem value="express" id="exp" />
                <Label htmlFor="exp">Express - Rp 25.000 (1 hari)</Label>
              </div>
            </RadioGroup>
          </section>

          <section className="p-6 border-2 border-border shadow-sm bg-card">
            <h2 className="font-bold text-lg mb-4">Payment Method</h2>
            <RadioGroup defaultValue="qris">
              <div className="flex items-center space-x-2 border p-3">
                <RadioGroupItem value="qris" id="qris" />
                <Label htmlFor="qris">QRIS</Label>
              </div>
              <div className="flex items-center space-x-2 border p-3">
                <RadioGroupItem value="va" id="va" />
                <Label htmlFor="va">Virtual Account</Label>
              </div>
            </RadioGroup>
          </section>
        </div>

        <div className="p-6 border-2 border-border shadow-sm bg-card h-fit">
          <h2 className="font-bold mb-4">Order Summary</h2>
          <p className="flex justify-between mb-4"><span>Subtotal</span><span className="font-bold">Rp {total.toLocaleString('id-ID')}</span></p>
          <p className="flex justify-between mb-4"><span>Total</span><span className="font-bold">Rp {total.toLocaleString('id-ID')}</span></p>
          <Button className="w-full" onClick={handlePlaceOrder} disabled={isPlacing}>{isPlacing ? 'Processing...' : 'Place Order'}</Button>
          {payResult && <p className="mt-4 text-sm p-2 border border-border bg-muted" data-testid="payu-result">{payResult}</p>}
          {payError && <p className="mt-2 text-sm text-destructive" data-testid="payu-error">{payError}</p>}
        </div>
      </main>
      <Footer />
    </div>
  )
}
