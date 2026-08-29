import { createFileRoute } from '@tanstack/react-router'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { HeroCarousel } from '@/components/home/hero-carousel'
import { CategoriesGrid } from '@/components/home/categories-grid'
import { TrustBadgesSection } from '@/components/home/trust-badges-section'
import { BestSellersSection } from '@/components/home/best-sellers-section'
import { TrendingProductsSection } from '@/components/home/trending-products-section'
import { NewsletterSection } from '@/components/home/newsletter-section'
import { ProductCard } from '@/components/product/product-card'
import React from 'react'
export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  const [products, setProducts] = React.useState<Array<{ id: string; name: string; price: number; image: string }>>([])
  React.useEffect(() => {
    fetch('/api/v1/products?limit=12')
      .then((r) => r.json())
      .then((j) => {
        const data = j.data || j
        if (Array.isArray(data)) {
          setProducts(data.slice(0, 12).map((p: { id: string; name: string; price: number }) => ({ id: p.id, name: p.name, price: p.price, image: `https://picsum.photos/seed/${p.id}/500/500` })))
        }
      })
      .catch(() => {})
  }, [])
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroCarousel />
        <CategoriesGrid />
        <TrendingProductsSection />
        <BestSellersSection />
        {products.length > 0 && (
          <section className="container mx-auto px-4 py-8">
            <h2 className="text-2xl font-bold mb-2">Produk Pilihan Dari Database</h2>
            <p className="text-sm text-muted-foreground mb-6">{products.length} produk • langsung dari PostgreSQL tokobapak_products</p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((p) => (
                <div key={p.id} data-testid="product-card">
                  <ProductCard id={p.id} name={p.name} price={p.price} image={p.image} rating={4.8} />
                </div>
              ))}
            </div>
          </section>
        )}
        <TrustBadgesSection />
        <NewsletterSection />
      </main>
      <Footer />
    </div>
  )
}
