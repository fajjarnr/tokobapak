import { createFileRoute } from '@tanstack/react-router'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { ProductCard } from '@/components/product/product-card'
import React from 'react'

interface BackendProduct {
  id: string
  name: string
  price: number
  stock: number
  description: string
}

export const Route = createFileRoute('/products/')({
  component: Products,
})

function Products() {
  const [products, setProducts] = React.useState<BackendProduct[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    fetch('/api/v1/products?limit=24')
      .then((r) => r.json())
      .then((j) => {
        if (j.data && Array.isArray(j.data)) setProducts(j.data)
        else if (Array.isArray(j)) setProducts(j)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6">Products</h1>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-64 border-2 border-border bg-card animate-pulse" />
            ))}
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Products <span className="text-lg font-normal text-muted-foreground">({products.length} produk dari database)</span></h1>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((p) => (
            <div key={p.id} data-testid="product-card">
              <ProductCard id={p.id} name={p.name} price={p.price} image={`https://picsum.photos/seed/${p.id}/500/500`} rating={4.8} />
            </div>
          ))}
        </div>
        {products.length === 0 && <p className="text-center py-12 text-muted-foreground">Tidak ada produk</p>}
      </main>
      <Footer />
    </div>
  )
}
