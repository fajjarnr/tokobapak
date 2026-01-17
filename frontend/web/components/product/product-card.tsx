
'use client'

import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ShoppingCart, Heart } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useCartStore } from '@/stores/cart-store'
import { toast } from 'sonner'
import { Product } from '@/lib/api'

interface ProductCardProps {
    product: Product
}

export function ProductCard({ product }: ProductCardProps) {
    const addItem = useCartStore((state) => state.addItem)

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault()
        addItem({
            id: product.id,
            productId: product.id,
            name: product.name,
            price: product.price,
            quantity: 1,
            image: product.images[0] || '/placeholder.png', // Handle image array
            sellerId: product.sellerId,
        })
        toast.success('Product added to cart')
    }

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(price)
    }

    // New products check (e.g. created within last 7 days)
    const isNew = new Date(product.createdAt).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000;

    return (
        <Card className="group overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="p-0 relative aspect-square overflow-hidden bg-muted">
                <Link href={`/product/${product.id}`}>
                    <Image
                        src={product.images[0] || '/placeholder-product.png'}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                </Link>
                {isNew && (
                    <Badge className="absolute top-2 left-2" variant="secondary">New</Badge>
                )}
                {product.discount && product.discount > 0 && (
                    <Badge className="absolute top-2 right-2 bg-red-500 hover:bg-red-600">-{product.discount}%</Badge>
                )}
            </CardHeader>
            <CardContent className="p-4 grid gap-1">
                <Link href={`/product/${product.id}`} className="hover:underline">
                    <h3 className="font-semibold truncate">{product.name}</h3>
                </Link>
                <div className="flex items-center gap-2">
                    <span className="font-bold text-lg">{formatPrice(product.price)}</span>
                    {product.originalPrice && product.originalPrice > product.price && (
                        <span className="text-sm text-muted-foreground line-through">
                            {formatPrice(product.originalPrice)}
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-1 text-sm text-yellow-500">
                    {'★'.repeat(Math.round(product.rating))}
                    <span className="text-muted-foreground ml-1">({product.rating.toFixed(1)})</span>
                    <span className="text-muted-foreground text-xs ml-1">({product.reviewCount})</span>
                </div>
            </CardContent>
            <CardFooter className="p-4 pt-0 gap-2">
                <Button className="w-full gap-2" size="sm" onClick={handleAddToCart}>
                    <ShoppingCart className="h-4 w-4" /> Add
                </Button>
                <Button variant="outline" size="icon" className="shrink-0 aspect-square h-9 w-9">
                    <Heart className="h-4 w-4" />
                </Button>
            </CardFooter>
        </Card>
    )
}
