'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Star } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import Link from 'next/link'
import Image from 'next/image'
import { useProducts } from '@/hooks/use-products'

const tabs = ['New Arrivals', 'Best Seller', 'Best Offers']

const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(price)
}

// Category-based placeholder images
const placeholderImages: Record<string, string> = {
    '550e8400-e29b-41d4-a716-446655440001': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
    '550e8400-e29b-41d4-a716-446655440002': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
    '550e8400-e29b-41d4-a716-446655440003': 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400',
}

export function TabbedProductSection() {
    const [activeTab, setActiveTab] = useState('Best Seller')
    const [countdown, setCountdown] = useState({ hours: 20, minutes: 45, seconds: 9 })

    // Fetch products from backend - sort based on tab
    const { data: productsData, isLoading } = useProducts({
        pageSize: 8,
        sort: activeTab === 'New Arrivals' ? '-createdAt' : activeTab === 'Best Seller' ? '-reviewCount' : '-discount',
    })

    const products = productsData?.data || []

    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown((prev) => {
                let { hours, minutes, seconds } = prev
                seconds--
                if (seconds < 0) {
                    seconds = 59
                    minutes--
                }
                if (minutes < 0) {
                    minutes = 59
                    hours--
                }
                if (hours < 0) {
                    hours = 23
                }
                return { hours, minutes, seconds }
            })
        }, 1000)
        return () => clearInterval(timer)
    }, [])

    const formatTime = (num: number) => num.toString().padStart(2, '0')

    const getProductImage = (product: typeof products[0]) => {
        if (product.images && product.images.length > 0) {
            return product.images[0]
        }
        return placeholderImages[product.categoryId] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400'
    }

    return (
        <section className="py-12 bg-background">
            <div className="container mx-auto px-4">
                {/* Tabs */}
                <div className="flex justify-center gap-8 mb-8">
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`text-lg font-semibold pb-2 transition-colors ${activeTab === tab
                                    ? 'text-primary border-b-2 border-primary'
                                    : 'text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    {/* Left Banner */}
                    <div className="lg:col-span-1 bg-foreground p-6 flex flex-col justify-between min-h-[500px] text-primary-foreground border border-border">
                        {/* Limited time badge & countdown */}
                        <div>
                            <p className="text-sm text-primary-foreground/80 mb-2">Limited time only!</p>
                            <div className="flex gap-2 text-center">
                                <div className="bg-primary-foreground/20 px-3 py-2">
                                    <span className="text-xl font-bold text-accent">{formatTime(countdown.hours)}</span>
                                </div>
                                <span className="text-xl font-bold">:</span>
                                <div className="bg-primary-foreground/20 px-3 py-2">
                                    <span className="text-xl font-bold text-accent">{formatTime(countdown.minutes)}</span>
                                </div>
                                <span className="text-xl font-bold">:</span>
                                <div className="bg-primary-foreground/20 px-3 py-2">
                                    <span className="text-xl font-bold text-accent">{formatTime(countdown.seconds)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Product images preview */}
                        <div className="flex-1 flex items-center justify-center py-6">
                            <div className="relative">
                                <Image
                                    src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200"
                                    alt="Featured product"
                                    width={128}
                                    height={128}
                                    className="object-contain"
                                />
                            </div>
                        </div>

                        {/* Promo text */}
                        <div>
                            <h3 className="text-2xl font-bold mb-1">Flash Sale 2024</h3>
                            <p className="text-sm text-primary-foreground/80 mb-3">Diskon s/d 40% untuk semua produk</p>
                            <Button
                                variant="link"
                                className="text-accent hover:text-accent/80 p-0 h-auto font-semibold"
                                asChild
                            >
                                <Link href="/products">Belanja Sekarang</Link>
                            </Button>
                        </div>
                    </div>

                    {/* Right Product Grid - 4x2 */}
                    <div className="lg:col-span-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                        {isLoading ? (
                            Array.from({ length: 8 }).map((_, i) => (
                                <div key={i} className="bg-card p-4 border border-border">
                                    <Skeleton className="aspect-square mb-3" />
                                    <Skeleton className="h-4 w-3/4 mb-2" />
                                    <Skeleton className="h-4 w-1/2" />
                                </div>
                            ))
                        ) : products.length > 0 ? (
                            products.map((product) => (
                                <Link
                                    key={product.id}
                                    href={`/product/${product.id}`}
                                    className="bg-card p-4 border border-border hover:shadow-lg transition-shadow group"
                                >
                                    {/* Image */}
                                    <div className="aspect-square bg-muted/10 mb-3 overflow-hidden relative">
                                        <Image
                                            src={getProductImage(product)}
                                            alt={product.name}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    </div>

                                    {/* Info */}
                                    <h4 className="text-sm font-medium text-foreground line-clamp-1">
                                        {product.name}
                                    </h4>
                                    <p className="text-xs text-muted-foreground mb-2">{product.description?.slice(0, 30)}...</p>

                                    {/* Price */}
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-sm font-bold text-foreground">
                                            {formatPrice(Number(product.price))}
                                        </span>
                                        {product.originalPrice && (
                                            <span className="text-xs text-muted-foreground line-through">
                                                {formatPrice(Number(product.originalPrice))}
                                            </span>
                                        )}
                                    </div>

                                    {/* Rating */}
                                    <div className="flex items-center gap-1">
                                        <div className="flex">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={`w-3 h-3 ${i < Number(product.rating)
                                                            ? 'fill-yellow-400 text-yellow-400'
                                                            : 'text-muted'
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                        <span className="text-xs text-muted-foreground">({product.reviewCount})</span>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <div className="col-span-full text-center py-8 text-muted-foreground">
                                Tidak ada produk ditemukan
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    )
}
