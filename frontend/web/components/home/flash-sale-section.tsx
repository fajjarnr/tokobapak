'use client'

import { useState, useEffect } from 'react'
import { ProductCard } from '@/components/product/product-card'
import { Button } from '@/components/ui/button'
import { Flame, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useTrendingProducts } from '@/hooks/use-products'
import { Skeleton } from '@/components/ui/skeleton'

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

    const { data, isLoading } = useTrendingProducts()
    const products = data?.trending || []

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

    if (isLoading) {
        return <FlashSaleSkeleton />
    }

    if (products.length === 0) return null;

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
                        {products.map((product) => (
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
                        <Link href="/products">Lihat Semua Flash Sale →</Link>
                    </Button>
                </div>
            </div>
        </section>
    )
}

function FlashSaleSkeleton() {
    return (
        <section className="relative overflow-hidden rounded-2xl bg-muted p-1 h-[400px] animate-pulse">
            <div className="h-full w-full bg-muted-foreground/10" />
        </section>
    )
}
