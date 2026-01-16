
import { Button } from '@/components/ui/button'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import { ProductCard } from '@/components/product/product-card'
import { FlashSaleSection } from '@/components/home/flash-sale-section'
import { BestSellersSection } from '@/components/home/best-sellers-section'
import { TrustBadgesSection } from '@/components/home/trust-badges-section'
import { NewsletterSection } from '@/components/home/newsletter-section'
import Link from 'next/link'
import Image from 'next/image'

// Mock Data
const HERO_SLIDES = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=2070&auto=format&fit=crop',
    title: 'Super Sale Is Live!',
    description: 'Get up to 70% off on electronics.',
    cta: 'Shop Now',
    href: '/deals',
    gradient: 'from-rose-500/80 to-orange-500/80',
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070&auto=format&fit=crop',
    title: 'New Collections',
    description: 'Fresh arrivals for the summer season.',
    cta: 'Discover',
    href: '/categories',
    gradient: 'from-indigo-500/80 to-purple-500/80',
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=2070&auto=format&fit=crop',
    title: 'Gratis Ongkir Se-Indonesia',
    description: 'Belanja minimal Rp100.000, ongkir gratis!',
    cta: 'Mulai Belanja',
    href: '/products',
    gradient: 'from-emerald-500/80 to-teal-500/80',
  },
]

const CATEGORIES = [
  { name: 'Electronics', icon: '💻', href: '/category/electronics', color: 'from-blue-500 to-indigo-600' },
  { name: 'Fashion', icon: '👕', href: '/category/fashion', color: 'from-pink-500 to-rose-600' },
  { name: 'Home & Living', icon: '🏠', href: '/category/home', color: 'from-amber-500 to-orange-600' },
  { name: 'Beauty', icon: '💄', href: '/category/beauty', color: 'from-purple-500 to-pink-600' },
  { name: 'Sports', icon: '⚽', href: '/category/sports', color: 'from-emerald-500 to-teal-600' },
  { name: 'Toys', icon: '🧸', href: '/category/toys', color: 'from-yellow-500 to-amber-600' },
]

const FEATURED_PRODUCTS = [
  {
    id: '1',
    name: 'Wireless Noise Cancelling Headphones',
    price: 3500000,
    originalPrice: 4500000,
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1000&auto=format&fit=crop',
    discount: 22,
    isNew: true
  },
  {
    id: '2',
    name: 'Smart Watch Series 7',
    price: 5999000,
    rating: 4.5,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000&auto=format&fit=crop',
  },
  {
    id: '3',
    name: 'Mechanical Gaming Keyboard',
    price: 1250000,
    originalPrice: 1500000,
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b91add1?q=80&w=1000&auto=format&fit=crop',
    discount: 16
  },
  {
    id: '4',
    name: 'Running Shoes Pro',
    price: 1800000,
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1000&auto=format&fit=crop',
    isNew: true
  },
]

export default function HomePage() {
  return (
    <div className="flex flex-col gap-0 pb-10">

      {/* Hero Section with Autoplay */}
      <Carousel className="w-full" opts={{ loop: true }}>
        <CarouselContent>
          {HERO_SLIDES.map((slide) => (
            <CarouselItem key={slide.id}>
              <div className="relative h-[450px] md:h-[550px] w-full bg-muted overflow-hidden">
                <Image
                  src={slide.image}
                  alt={slide.title}
                  fill
                  className="object-cover"
                  priority
                />
                <div className={`absolute inset-0 bg-gradient-to-r ${slide.gradient} flex flex-col items-center justify-center text-white text-center p-4`}>
                  <h1 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg">{slide.title}</h1>
                  <p className="text-lg md:text-xl mb-6 max-w-2xl drop-shadow-md">{slide.description}</p>
                  <Button asChild size="lg" className="rounded-full px-8 text-lg bg-white text-gray-900 hover:bg-white/90 shadow-xl">
                    <Link href={slide.href}>{slide.cta}</Link>
                  </Button>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        {/* Navigation arrows (hidden on mobile, usually) */}
        <CarouselPrevious className="left-4 hidden md:flex" />
        <CarouselNext className="right-4 hidden md:flex" />
      </Carousel>

      {/* Trust Badges Section - Full Width */}
      <TrustBadgesSection />

      <div className="container mx-auto px-4 space-y-12 mt-12">

        {/* Flash Sale Section */}
        <FlashSaleSection />

        {/* Categories Grid */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Belanja per Kategori</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {CATEGORIES.map((cat) => (
              <Link key={cat.name} href={cat.href} className="group">
                <div className="relative bg-card border rounded-xl p-6 flex flex-col items-center justify-center gap-4 hover:shadow-lg transition-all h-full aspect-square md:aspect-auto md:h-40 overflow-hidden">
                  {/* Gradient Background on Hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${cat.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
                  <span className="text-4xl group-hover:scale-125 transition-transform duration-300">{cat.icon}</span>
                  <span className="font-semibold text-center relative z-10">{cat.name}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Best Sellers Section */}
        <BestSellersSection />

        {/* Featured Products */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">Produk Unggulan</h2>
              <p className="text-sm text-muted-foreground">Pilihan terbaik untuk Anda</p>
            </div>
            <Button variant="link" asChild>
              <Link href="/products">Lihat Semua</Link>
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {FEATURED_PRODUCTS.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* Newsletter Section */}
        <NewsletterSection />

        {/* Promo Banner */}
        <section className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

          <div className="space-y-4 text-center md:text-left relative z-10">
            <h2 className="text-3xl font-bold">Download TokoBapak App</h2>
            <p className="max-w-md text-white/90">Get the best shopping experience with our mobile app. Available on iOS and Android.</p>
            <div className="flex gap-4 justify-center md:justify-start">
              <Button variant="secondary" size="lg" className="bg-white text-purple-600 hover:bg-white/90">App Store</Button>
              <Button variant="secondary" size="lg" className="bg-white text-purple-600 hover:bg-white/90">Play Store</Button>
            </div>
          </div>
          <div className="relative h-64 w-full md:w-1/2 max-w-sm z-10">
            {/* Placeholder for App Screen */}
            <div className="absolute inset-0 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20 flex items-center justify-center">
              <span className="text-2xl font-bold">📱 App Preview</span>
            </div>
          </div>
        </section>

      </div>
    </div>
  )
}
