
import { Button } from '@/components/ui/button'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import { ProductCard } from '@/components/product/product-card'
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
    href: '/deals'
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070&auto=format&fit=crop',
    title: 'New Collections',
    description: 'Fresh arrivals for the summer season.',
    cta: 'Discover',
    href: '/categories'
  }
]

const CATEGORIES = [
  { name: 'Electronics', icon: '💻', href: '/category/electronics' },
  { name: 'Fashion', icon: '👕', href: '/category/fashion' },
  { name: 'Home & Living', icon: '🏠', href: '/category/home' },
  { name: 'Beauty', icon: '💄', href: '/category/beauty' },
  { name: 'Sports', icon: '⚽', href: '/category/sports' },
  { name: 'Toys', icon: '🧸', href: '/category/toys' },
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
    <div className="flex flex-col gap-8 pb-10">

      {/* Hero Section */}
      <Carousel className="w-full">
        <CarouselContent>
          {HERO_SLIDES.map((slide) => (
            <CarouselItem key={slide.id}>
              <div className="relative h-[400px] md:h-[500px] w-full bg-muted">
                <Image
                  src={slide.image}
                  alt={slide.title}
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white text-center p-4">
                  <h1 className="text-4xl md:text-6xl font-bold mb-4">{slide.title}</h1>
                  <p className="text-lg md:text-xl mb-6 max-w-2xl">{slide.description}</p>
                  <Button asChild size="lg" className="rounded-full px-8 text-lg">
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

      <div className="container mx-auto px-4 space-y-12">

        {/* Categories Grid */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Shop by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {CATEGORIES.map((cat) => (
              <Link key={cat.name} href={cat.href} className="group">
                <div className="bg-card border rounded-xl p-6 flex flex-col items-center justify-center gap-4 hover:shadow-md transition-shadow h-full aspect-square md:aspect-auto md:h-40">
                  <span className="text-4xl group-hover:scale-110 transition-transform">{cat.icon}</span>
                  <span className="font-semibold text-center">{cat.name}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Featured Products */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Featured Products</h2>
            <Button variant="link" asChild>
              <Link href="/products">View All</Link>
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {FEATURED_PRODUCTS.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* Promo Banner */}
        <section className="bg-primary text-primary-foreground rounded-2xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-4 text-center md:text-left">
            <h2 className="text-3xl font-bold">Download TokoBapak App</h2>
            <p className="max-w-md text-primary-foreground/90">Get the best shopping experience with our mobile app. Available on iOS and Android.</p>
            <div className="flex gap-4 justify-center md:justify-start">
              <Button variant="secondary" size="lg">App Store</Button>
              <Button variant="secondary" size="lg">Play Store</Button>
            </div>
          </div>
          <div className="relative h-64 w-full md:w-1/2 max-w-sm">
            {/* Placeholder for App Screen */}
            <div className="absolute inset-0 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20 flex items-center justify-center">
              <span className="text-2xl font-bold">App Preview</span>
            </div>
          </div>
        </section>

      </div>
    </div>
  )
}
