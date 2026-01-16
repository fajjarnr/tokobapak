'use client'

import { ProductCard } from '@/components/product/product-card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, Crown } from 'lucide-react'
import Link from 'next/link'

// Mock Best Sellers Data
const BEST_SELLERS = [
    {
        id: 'bs-1',
        name: 'AirPods Pro 2nd Gen',
        price: 3499000,
        rating: 4.9,
        image: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?q=80&w=500&auto=format&fit=crop',
        isNew: false,
        soldCount: 12500,
    },
    {
        id: 'bs-2',
        name: 'Nike Air Jordan 1 Retro',
        price: 2899000,
        originalPrice: 3299000,
        rating: 4.8,
        image: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?q=80&w=500&auto=format&fit=crop',
        discount: 12,
        soldCount: 9800,
    },
    {
        id: 'bs-3',
        name: 'Dyson V15 Detect',
        price: 12999000,
        rating: 4.9,
        image: 'https://images.unsplash.com/photo-1558317374-067fb5f30001?q=80&w=500&auto=format&fit=crop',
        soldCount: 7500,
    },
    {
        id: 'bs-4',
        name: 'Lego Star Wars Millennium Falcon',
        price: 2499000,
        originalPrice: 2999000,
        rating: 4.7,
        image: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?q=80&w=500&auto=format&fit=crop',
        discount: 17,
        soldCount: 6200,
    },
]

const rankColors = [
    'bg-gradient-to-br from-yellow-400 to-amber-500', // 1st - Gold
    'bg-gradient-to-br from-gray-300 to-gray-400',    // 2nd - Silver
    'bg-gradient-to-br from-amber-600 to-amber-700',  // 3rd - Bronze
    'bg-gradient-to-br from-indigo-500 to-purple-600', // 4th+
]

export function BestSellersSection() {
    return (
        <section>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full">
                        <TrendingUp className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold">Produk Terlaris</h2>
                        <p className="text-sm text-muted-foreground">Paling banyak dibeli minggu ini</p>
                    </div>
                </div>

                <Button variant="link" asChild>
                    <Link href="/best-sellers">Lihat Semua</Link>
                </Button>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {BEST_SELLERS.map((product, index) => (
                    <div key={product.id} className="relative">
                        {/* Rank Badge */}
                        <div className={`absolute -top-2 -left-2 z-10 w-8 h-8 ${rankColors[index]} rounded-full flex items-center justify-center shadow-lg`}>
                            {index === 0 ? (
                                <Crown className="h-4 w-4 text-white" />
                            ) : (
                                <span className="text-white font-bold text-sm">{index + 1}</span>
                            )}
                        </div>

                        <ProductCard product={product} />

                        {/* Sold Count Badge */}
                        <Badge
                            variant="secondary"
                            className="absolute bottom-20 left-2 bg-background/90 backdrop-blur text-xs"
                        >
                            {product.soldCount.toLocaleString('id-ID')} terjual
                        </Badge>
                    </div>
                ))}
            </div>
        </section>
    )
}
