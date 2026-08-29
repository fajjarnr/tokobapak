import { createFileRoute } from '@tanstack/react-router'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { ProductCard } from '@/components/product/product-card'

const MOCK = [
  { id: 'p1', name: 'Kaos Polos Katun', price: 99000, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500', rating: 4.8 },
  { id: 'p2', name: 'Sepatu Sneakers', price: 450000, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500', rating: 4.9 },
  { id: 'p3', name: 'Tas Ransel', price: 250000, image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500', rating: 4.7 },
  { id: 'p4', name: 'Headset Gaming', price: 350000, image: 'https://images.unsplash.com/photo-1599669454699-248893623440?w=500', rating: 4.6 },
]

export const Route = createFileRoute('/products/')({
  component: Products,
})

function Products() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Products</h1>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {MOCK.map((p) => (
            <div key={p.id} data-testid="product-card">
              <ProductCard id={p.id} name={p.name} price={p.price} image={p.image} rating={p.rating} />
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  )
}
