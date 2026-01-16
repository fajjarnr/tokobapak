'use client'

import { useState, useEffect } from 'react'
import { ProductCard } from '@/components/product/product-card'
import { Button } from '@/components/ui/button'
import { Flame, ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'

// Mock Flash Sale Products
const FLASH_SALE_PRODUCTS = [
    {
        id: 'fs-1',
        name: 'iPhone 15 Pro Max 256GB',
        price: 18999000,
        originalPrice: 24999000,
        rating: 4.9,
        image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=500&auto=format&fit=crop',
        discount: 24,
    },
    {
        id: 'fs-2',
        name: 'Samsung Galaxy S24 Ultra',
        price: 16499000,
        originalPrice: 21999000,
        rating: 4.8,
        image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=500&auto=format&fit=crop',
        discount: 25,
    },
    {
        id: 'fs-3',
        name: 'MacBook Air M3 13"',
        price: 15999000,
        originalPrice: 19999000,
        rating: 4.9,
        image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=500&auto=format&fit=crop',
        discount: 20,
    },
    {
        id: 'fs-4',
        name: 'Sony WH-1000XM5',
        price: 3499000,
        originalPrice: 5499000,
        rating: 4.8,
        image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=500&auto=format&fit=crop',
        discount: 36,
    },
    {
        id: 'fs-5',
        name: 'iPad Pro 12.9" M2',
        price: 13999000,
        originalPrice: 18999000,
        rating: 4.9,
        image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=500&auto=format&fit=crop',
        discount: 26,
    },
]

// Calculate end time (8 hours from now)
const getEndTime = () => {
    const end = new Date()
    end.setHours(end.getHours() + 8)
    return end
}

interface TimeLeft {
    hours: number
    minutes: number
    seconds: number
}

export function FlashSaleSection() {
    const [endTime] = useState(getEndTime)
    const [timeLeft, setTimeLeft] = useState<TimeLeft>({ hours: 8, minutes: 0, seconds: 0 })
    const [scrollPosition, setScrollPosition] = useState(0)

    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date()
            const difference = endTime.getTime() - now.getTime()

            if (difference > 0) {
                setTimeLeft({
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60),
                })
            }
        }, 1000)

        return () => clearInterval(timer)
    }, [endTime])

    const scroll = (direction: 'left' | 'right') => {
        const container = document.getElementById('flash-sale-container')
        if (container) {
            const scrollAmount = 300
            const newPosition = direction === 'left'
                ? scrollPosition - scrollAmount
                : scrollPosition + scrollAmount
            container.scrollTo({ left: newPosition, behavior: 'smooth' })
            setScrollPosition(newPosition)
        }
    }

    const formatNumber = (num: number) => num.toString().padStart(2, '0')

    return (
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-rose-500 via-orange-500 to-amber-500 p-1">
            <div className="bg-background/95 backdrop-blur rounded-xl p-6 md:p-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-rose-500 to-orange-500 rounded-full">
                            <Flame className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold bg-gradient-to-r from-rose-500 to-orange-500 bg-clip-text text-transparent">
                                Flash Sale
                            </h2>
                            <p className="text-sm text-muted-foreground">Diskon besar, waktu terbatas!</p>
                        </div>
                    </div>

                    {/* Countdown Timer */}
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground mr-2">Berakhir dalam:</span>
                        <div className="flex items-center gap-1">
                            <div className="bg-gradient-to-br from-rose-500 to-orange-500 text-white font-bold px-3 py-2 rounded-lg text-lg min-w-[48px] text-center">
                                {formatNumber(timeLeft.hours)}
                            </div>
                            <span className="font-bold text-xl">:</span>
                            <div className="bg-gradient-to-br from-rose-500 to-orange-500 text-white font-bold px-3 py-2 rounded-lg text-lg min-w-[48px] text-center">
                                {formatNumber(timeLeft.minutes)}
                            </div>
                            <span className="font-bold text-xl">:</span>
                            <div className="bg-gradient-to-br from-rose-500 to-orange-500 text-white font-bold px-3 py-2 rounded-lg text-lg min-w-[48px] text-center animate-pulse">
                                {formatNumber(timeLeft.seconds)}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Products Carousel */}
                <div className="relative">
                    <Button
                        variant="outline"
                        size="icon"
                        className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 bg-background shadow-lg hidden md:flex"
                        onClick={() => scroll('left')}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>

                    <div
                        id="flash-sale-container"
                        className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide scroll-smooth"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                        {FLASH_SALE_PRODUCTS.map((product) => (
                            <div key={product.id} className="min-w-[220px] md:min-w-[260px]">
                                <ProductCard product={product} />
                            </div>
                        ))}
                    </div>

                    <Button
                        variant="outline"
                        size="icon"
                        className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 bg-background shadow-lg hidden md:flex"
                        onClick={() => scroll('right')}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>

                {/* View All Link */}
                <div className="mt-4 text-center">
                    <Button variant="outline" asChild className="border-rose-500 text-rose-500 hover:bg-rose-50 hover:text-rose-600">
                        <Link href="/flash-sale">Lihat Semua Flash Sale →</Link>
                    </Button>
                </div>
            </div>
        </section>
    )
}
