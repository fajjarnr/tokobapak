import { createFileRoute } from '@tanstack/react-router'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { HeroCarousel } from '@/components/home/hero-carousel'
import { CategoriesGrid } from '@/components/home/categories-grid'
import { TrustBadgesSection } from '@/components/home/trust-badges-section'
import { BestSellersSection } from '@/components/home/best-sellers-section'
import { TrendingProductsSection } from '@/components/home/trending-products-section'
import { NewsletterSection } from '@/components/home/newsletter-section'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroCarousel />
        <CategoriesGrid />
        <TrendingProductsSection />
        <BestSellersSection />
        <TrustBadgesSection />
        <NewsletterSection />
      </main>
      <Footer />
    </div>
  )
}
