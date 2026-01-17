'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ProductCard } from '@/components/product/product-card'

const categories = ['All', 'Electronics', 'Fashion', 'Home & Kitchen']

const products = [
    {
        id: '1',
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',
        name: 'Premium Wireless Earbuds Pro X',
        price: 899000,
        originalPrice: 1499000,
        rating: 4,
        reviewCount: 1234,
        category: 'Electronics',
        badge: 'Hot'
    },
    {
        id: '2',
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop',
        name: 'Smart Fitness Watch Series 5',
        price: 1999000,
        originalPrice: 2999000,
        rating: 5,
        reviewCount: 856,
        category: 'Electronics',
        isNew: true
    },
    {
        id: '3',
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop',
        name: 'Ultra Sport Running Sneakers',
        price: 799000,
        originalPrice: 1299000,
        rating: 4,
        reviewCount: 567,
        category: 'Fashion'
    },
    {
        id: '4',
        image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=400&fit=crop',
        name: 'Modern Velvet Accent Chair',
        price: 2499000,
        originalPrice: 3999000,
        rating: 5,
        reviewCount: 234,
        category: 'Home & Kitchen'
    }
]

export function DealsSection() {
    const [activeCategory, setActiveCategory] = useState('All')

    const filteredProducts = activeCategory === 'All'
        ? products
        : products.filter(p => p.category === activeCategory)

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
                    {filteredProducts.map(product => (
                        <ProductCard
                            key={product.id}
                            id={product.id}
                            name={product.name}
                            slug={product.id}
                            price={product.price}
                            originalPrice={product.originalPrice}
                            image={product.image}
                            rating={product.rating}
                            reviewCount={product.reviewCount}
                        />
                    ))}
                </div>
            </div>
        </section>
    )
}
