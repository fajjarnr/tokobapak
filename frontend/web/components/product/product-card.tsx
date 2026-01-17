'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ShoppingCart, Heart, Star } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useCartStore } from '@/stores/cart-store'
import { toast } from 'sonner'
import { Product } from '@/lib/api'
import { useState } from 'react'

interface ProductCardProps {
    product?: Product
    // Alternative props for standalone usage
    id?: string
    name?: string
    slug?: string
    price?: number
    originalPrice?: number
    image?: string
    rating?: number
    reviewCount?: number
    isNew?: boolean
}

export function ProductCard({
    product,
    id,
    name,
    slug,
    price,
    originalPrice,
    image,
    rating,
    reviewCount,
    isNew
}: ProductCardProps) {
    const addItem = useCartStore((state) => state.addItem)
    const [isWishlisted, setIsWishlisted] = useState(false)

    // Use product props or standalone props
    const productId = product?.id ?? id ?? ''
    const productName = product?.name ?? name ?? ''
    const productSlug = product?.slug ?? slug ?? productId
    const productPrice = product?.price ?? price ?? 0
    const productOriginalPrice = product?.originalPrice ?? originalPrice
    const productImage = product?.images?.[0] ?? image ?? '/placeholder.svg'
    const productRating = product?.rating ?? rating ?? 0
    const productReviewCount = product?.reviewCount ?? reviewCount ?? 0
    const productIsNew = isNew ?? (product?.createdAt ? new Date(product.createdAt).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000 : false)

    const discount = productOriginalPrice
        ? Math.round(((productOriginalPrice - productPrice) / productOriginalPrice) * 100)
        : 0

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        addItem({
            id: productId,
            productId: productId,
            name: productName,
            price: productPrice,
            quantity: 1,
            image: productImage,
            sellerId: product?.sellerId,
        })
        toast.success(`${productName} ditambahkan ke keranjang`)
    }

    const handleWishlistToggle = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setIsWishlisted(!isWishlisted)
        toast.success(isWishlisted ? 'Dihapus dari wishlist' : 'Ditambahkan ke wishlist')
    }

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(price)
    }

    return (
        <Link
            href={`/product/${productSlug}`}
            className="group bg-card border border-border overflow-hidden hover:shadow-lg transition-all duration-300 block"
        >
            {/* Image container */}
            <div className="relative aspect-square overflow-hidden bg-muted/30">
                <Image
                    src={productImage}
                    alt={productName}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />

                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                    {discount > 0 && (
                        <Badge className="bg-destructive text-destructive-foreground">
                            -{discount}%
                        </Badge>
                    )}
                    {productIsNew && (
                        <Badge className="bg-primary text-primary-foreground">New</Badge>
                    )}
                </div>

                {/* Wishlist button */}
                <Button
                    size="icon"
                    variant="secondary"
                    className={`absolute top-3 right-3 transition-all ${isWishlisted
                            ? 'opacity-100 bg-destructive text-destructive-foreground hover:bg-destructive/90'
                            : 'opacity-0 group-hover:opacity-100'
                        }`}
                    onClick={handleWishlistToggle}
                >
                    <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-current' : ''}`} />
                </Button>

                {/* Quick add */}
                <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button className="w-full gap-2" onClick={handleAddToCart}>
                        <ShoppingCart className="h-4 w-4" />
                        Add to Cart
                    </Button>
                </div>
            </div>

            {/* Content */}
            <div className="p-4">
                <h3 className="font-medium text-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                    {productName}
                </h3>

                {/* Rating */}
                <div className="flex items-center gap-1 mb-2">
                    <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                            <Star
                                key={i}
                                className={`h-3.5 w-3.5 ${i < productRating
                                        ? 'fill-amber-400 text-amber-400'
                                        : 'fill-muted text-muted'
                                    }`}
                            />
                        ))}
                    </div>
                    <span className="text-xs text-muted-foreground">({productReviewCount})</span>
                </div>

                {/* Price */}
                <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-foreground">
                        {formatPrice(productPrice)}
                    </span>
                    {productOriginalPrice && productOriginalPrice > productPrice && (
                        <span className="text-sm text-muted-foreground line-through">
                            {formatPrice(productOriginalPrice)}
                        </span>
                    )}
                </div>
            </div>
        </Link>
    )
}
