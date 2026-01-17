'use client';

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

const HERO_SLIDES = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=2070&auto=format&fit=crop',
    title: 'Super Sale Is Live!',
    description: 'Get up to 70% off on electronics.',
    cta: 'Shop Now',
    href: '/products',
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

export function HeroCarousel() {
  return (
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
        <CarouselPrevious className="left-4 hidden md:flex" />
        <CarouselNext className="right-4 hidden md:flex" />
      </Carousel>
  )
}
