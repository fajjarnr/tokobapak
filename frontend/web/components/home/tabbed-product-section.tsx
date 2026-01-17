'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Star } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

const tabs = ['New Arrivals', 'Best Seller', 'Best Offers']

const newArrivalsProducts = [
    { id: '101', image: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400', title: 'Canon EOS R5 Mirrorless', subtitle: 'Digital Camera', price: 38990000, originalPrice: 42990000, rating: 5, reviews: 128 },
    { id: '102', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400', title: 'Apple Watch Ultra 2', subtitle: 'Smart Watch', price: 7990000, originalPrice: 8990000, rating: 5, reviews: 342 },
    { id: '103', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400', title: 'Sony WF-1000XM5', subtitle: 'Wireless Earbuds', price: 2790000, originalPrice: 3290000, rating: 4, reviews: 89 },
    { id: '104', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400', title: 'Nike Air Max 2024', subtitle: 'Running Shoes', price: 1890000, originalPrice: 2290000, rating: 4, reviews: 567 },
    { id: '105', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400', title: 'Herman Miller Aeron', subtitle: 'Ergonomic Chair', price: 13950000, originalPrice: 16950000, rating: 5, reviews: 234 },
    { id: '106', image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400', title: 'Bose QuietComfort Ultra', subtitle: 'Wireless Headphones', price: 3790000, originalPrice: 4290000, rating: 5, reviews: 456 },
    { id: '107', image: 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=400', title: 'Samsung Galaxy Watch 6', subtitle: 'Smart Watch', price: 3290000, originalPrice: 3990000, rating: 4, reviews: 198 },
    { id: '108', image: 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=400', title: 'DJI Mini 4 Pro Drone', subtitle: 'Aerial Camera', price: 7590000, originalPrice: 8990000, rating: 5, reviews: 87 },
]

const bestSellerProducts = [
    { id: '201', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400', title: 'Wilson Ultra Power XL 112', subtitle: 'Gaming Chair', price: 18990000, originalPrice: 19940500, rating: 4, reviews: 2345 },
    { id: '202', image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400', title: 'AirPods Max Space Gray', subtitle: 'Premium Headphones', price: 4990000, originalPrice: 5490000, rating: 5, reviews: 4521 },
    { id: '203', image: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400', title: 'GoPro Hero 12 Black', subtitle: 'Action Camera', price: 3990000, originalPrice: 4490000, rating: 4, reviews: 1876 },
    { id: '204', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400', title: 'Adidas Ultraboost 23', subtitle: 'Running Shoes', price: 1790000, originalPrice: 1990000, rating: 5, reviews: 3456 },
    { id: '205', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400', title: 'AirPods Pro 2nd Gen', subtitle: 'Wireless Earbuds', price: 2290000, originalPrice: 2490000, rating: 5, reviews: 5678 },
    { id: '206', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400', title: 'Garmin Fenix 7X', subtitle: 'Sport Watch', price: 6990000, originalPrice: 7990000, rating: 5, reviews: 1234 },
    { id: '207', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400', title: 'IKEA Markus Office', subtitle: 'Ergonomic Chair', price: 2490000, originalPrice: 2990000, rating: 4, reviews: 2789 },
    { id: '208', image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400', title: 'Sony WH-1000XM5', subtitle: 'Noise Canceling', price: 3490000, originalPrice: 3990000, rating: 5, reviews: 4123 },
]

const bestOffersProducts = [
    { id: '301', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400', title: 'New Balance 990v6', subtitle: 'Premium Sneakers', price: 1490000, originalPrice: 2490000, rating: 4, reviews: 567 },
    { id: '302', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400', title: 'Jabra Elite 85t', subtitle: 'Wireless Earbuds', price: 1490000, originalPrice: 2290000, rating: 4, reviews: 892 },
    { id: '303', image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400', title: 'Beats Studio Pro', subtitle: 'Premium Headphones', price: 2490000, originalPrice: 3490000, rating: 4, reviews: 1234 },
    { id: '304', image: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400', title: 'Fujifilm X-T5', subtitle: 'Mirrorless Camera', price: 14990000, originalPrice: 18990000, rating: 5, reviews: 456 },
    { id: '305', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400', title: 'Steelcase Leap V2', subtitle: 'Office Chair', price: 7990000, originalPrice: 11990000, rating: 5, reviews: 789 },
    { id: '306', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400', title: 'Fitbit Sense 2', subtitle: 'Health Watch', price: 1990000, originalPrice: 2990000, rating: 4, reviews: 1567 },
    { id: '307', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400', title: 'Puma RS-X Reinvention', subtitle: 'Retro Sneakers', price: 890000, originalPrice: 1490000, rating: 4, reviews: 345 },
    { id: '308', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400', title: 'Samsung Galaxy Buds2', subtitle: 'Wireless Earbuds', price: 990000, originalPrice: 1490000, rating: 4, reviews: 2345 },
]

const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(price)
}

export function TabbedProductSection() {
    const [activeTab, setActiveTab] = useState('Best Seller')
    const [countdown, setCountdown] = useState({ hours: 20, minutes: 45, seconds: 9 })

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

    const getProducts = () => {
        switch (activeTab) {
            case 'New Arrivals':
                return newArrivalsProducts
            case 'Best Seller':
                return bestSellerProducts
            case 'Best Offers':
                return bestOffersProducts
            default:
                return bestSellerProducts
        }
    }

    const products = getProducts()

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
                            <h3 className="text-2xl font-bold mb-1">Sneaker Fest 2024</h3>
                            <p className="text-sm text-primary-foreground/80 mb-3">Diskon s/d 40% untuk Sneaker Wanita</p>
                            <Button
                                variant="link"
                                className="text-accent hover:text-accent/80 p-0 h-auto font-semibold"
                            >
                                Belanja Sekarang
                            </Button>
                        </div>
                    </div>

                    {/* Right Product Grid - 4x2 */}
                    <div className="lg:col-span-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                        {products.map((product) => (
                            <Link
                                key={product.id}
                                href={`/product/${product.id}`}
                                className="bg-card p-4 border border-border hover:shadow-lg transition-shadow group"
                            >
                                {/* Image */}
                                <div className="aspect-square bg-muted/10 mb-3 overflow-hidden relative">
                                    <Image
                                        src={product.image}
                                        alt={product.title}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                </div>

                                {/* Info */}
                                <h4 className="text-sm font-medium text-foreground line-clamp-1">
                                    {product.title}
                                </h4>
                                <p className="text-xs text-muted-foreground mb-2">{product.subtitle}</p>

                                {/* Price */}
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-sm font-bold text-foreground">
                                        {formatPrice(product.price)}
                                    </span>
                                    <span className="text-xs text-muted-foreground line-through">
                                        {formatPrice(product.originalPrice)}
                                    </span>
                                </div>

                                {/* Rating */}
                                <div className="flex items-center gap-1">
                                    <div className="flex">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                className={`w-3 h-3 ${i < product.rating
                                                        ? 'fill-yellow-400 text-yellow-400'
                                                        : 'text-muted'
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                    <span className="text-xs text-muted-foreground">({product.reviews})</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}
