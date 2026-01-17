import { HeroSection } from '@/components/home/hero-section'
import { DealsSection } from '@/components/home/deals-section'
import { TabbedProductSection } from '@/components/home/tabbed-product-section'
import { CategoriesGrid } from '@/components/home/categories-grid'
import { TrustBadges } from '@/components/home/trust-badges'
import { Newsletter } from '@/components/home/newsletter'

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        {/* Hero Section - Grid Layout */}
        <HeroSection />

        {/* Weekly Best Deals - Dark Background */}
        <DealsSection />

        {/* Tabbed Products with Countdown */}
        <TabbedProductSection />

        {/* Categories Section */}
        <section className="py-12 bg-background">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
              Jelajahi Kategori
            </h2>
            <CategoriesGrid />
          </div>
        </section>

        {/* Trust Badges */}
        <TrustBadges />

        {/* Newsletter */}
        <Newsletter />
      </main>
    </div>
  )
}
