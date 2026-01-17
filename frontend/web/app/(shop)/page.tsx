
import { HeroCarousel } from '@/components/home/hero-carousel'
import { FeaturedProductsSection } from '@/components/home/featured-products-section'
import { TrendingProductsSection } from '@/components/home/trending-products-section'
import { CategoriesGrid } from '@/components/home/categories-grid'
import { PromoBanner } from '@/components/home/promo-banner'
import { FlashSaleSection } from '@/components/home/flash-sale-section' // Keep existing if it has logic
import { TrustBadgesSection } from '@/components/home/trust-badges-section'
import { NewsletterSection } from '@/components/home/newsletter-section'

export default function HomePage() {
  return (
    <div className="flex flex-col gap-0 pb-10">
      
      {/* Hero Section */}
      <HeroCarousel />

      {/* Trust Badges */}
      <TrustBadgesSection />

      <div className="container mx-auto px-4 space-y-12 mt-12">

        {/* Dynamic Categories */}
        <CategoriesGrid />

        {/* Flash Sale (Mock/Static for now, or update later) */}
        <FlashSaleSection />

        {/* Trending Products (Dynamic) */}
        <TrendingProductsSection />

        {/* Featured Products (Dynamic) */}
        <FeaturedProductsSection />

        {/* Promo Banner */}
        <PromoBanner />

        {/* Newsletter */}
        <NewsletterSection />

      </div>
    </div>
  )
}

