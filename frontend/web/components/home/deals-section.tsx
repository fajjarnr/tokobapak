'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ProductCard } from '@/components/product/product-card'
import { Skeleton } from '@/components/ui/skeleton'
import { useProducts } from '@/hooks/use-products'

const categories = ['All', 'Elektronik', 'Fashion', 'Rumah Tangga']

// Map display name to category ID
const categoryIdMap: Record<string, string> = {
    'Elektronik': '550e8400-e29b-41d4-a716-446655440001',
    'Fashion': '550e8400-e29b-41d4-a716-446655440002',
    'Rumah Tangga': '550e8400-e29b-41d4-a716-446655440003',
}

export function DealsSection() {
    const [activeCategory, setActiveCategory] = useState('All')

    // Fetch products from backend
    const { data: productsData, isLoading } = useProducts({
        category: activeCategory !== 'All' ? categoryIdMap[activeCategory] : undefined,
        pageSize: 8,
    })

    const products = productsData?.data || []

    // Fallback image when product has no media
    const getProductImage = (product: typeof products[0]) => {
        if (product.images && product.images.length > 0) {
            return product.images[0]
        }
        // Use placeholder based on category
        const placeholders: Record<string, string> = {
            '550e8400-e29b-41d4-a716-446655440001': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',
            '550e8400-e29b-41d4-a716-446655440002': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop',
            '550e8400-e29b-41d4-a716-446655440003': 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=400&fit=crop',
        }
        return placeholders[product.categoryId] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop'
    }

    return (
        <section className="py-12 bg-secondary-foreground">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h2 className="text-2xl md:text-3xl font-bold text-primary-foreground mb-2">
                            Penawaran Terbaik Minggu Ini
                        </h2>
                        <p className="text-primary-foreground/80">
                            Penawaran terbatas untuk produk terbaik
                        </p>
                    </div>

                    {/* Category tabs */}
                    <div className="flex flex-wrap gap-2">
                        {categories.map(category => (
                            <Button
                                key={category}
                                variant={activeCategory === category ? 'secondary' : 'outline'}
                                size="sm"
                                onClick={() => setActiveCategory(category)}
                                className={activeCategory === category
                                    ? 'bg-card text-foreground border-transparent'
                                    : 'bg-transparent text-primary-foreground border-primary-foreground/50 hover:bg-primary-foreground/10'
                                }
                            >
                                {category}
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Products grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {isLoading ? (
                        // Loading skeleton
                        Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="bg-card p-4 border border-border">
                                <Skeleton className="aspect-square mb-4" />
                                <Skeleton className="h-4 w-3/4 mb-2" />
                                <Skeleton className="h-4 w-1/2 mb-2" />
                                <Skeleton className="h-4 w-1/3" />
                            </div>
                        ))
                    ) : products.length > 0 ? (
                        products.map(product => (
                            <ProductCard
                                key={product.id}
                                id={product.id}
                                name={product.name}
                                slug={product.slug}
                                price={Number(product.price)}
                                originalPrice={product.originalPrice ? Number(product.originalPrice) : undefined}
                                image={getProductImage(product)}
                                rating={Number(product.rating) || 0}
                                reviewCount={product.reviewCount || 0}
                            />
                        ))
                    ) : (
                        <div className="col-span-full text-center text-primary-foreground py-8">
                            Tidak ada produk ditemukan
                        </div>
                    )}
                </div>
            </div>
        </section>
    )
}
