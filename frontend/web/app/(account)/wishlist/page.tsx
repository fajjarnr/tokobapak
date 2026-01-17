'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Heart, ShoppingCart, Trash2, Package } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { useWishlistStore } from '@/stores/wishlist-store'
import { useCartStore } from '@/stores/cart-store'
import { useAddToCart } from '@/hooks/use-cart'
import { useAuthStore } from '@/stores/auth-store'
import { toast } from 'sonner'

export default function WishlistPage() {
    const { items, removeItem, clearWishlist } = useWishlistStore()
    const { isAuthenticated } = useAuthStore()
    const localCart = useCartStore()
    const addToCartMutation = useAddToCart()
    const [mounted, setMounted] = useState(false)

    // Fix hydration issue with zustand persist
    useEffect(() => {
        setMounted(true)
    }, [])

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(price)
    }

    const handleAddToCart = (item: typeof items[0]) => {
        if (isAuthenticated) {
            addToCartMutation.mutate({ productId: item.productId, quantity: 1 }, {
                onSuccess: () => toast.success(`${item.name} added to cart`),
                onError: () => toast.error('Failed to add to cart')
            })
        } else {
            localCart.addItem({
                id: item.productId,
                productId: item.productId,
                name: item.name,
                price: item.price,
                quantity: 1,
                image: item.image
            })
            toast.success(`${item.name} added to cart`)
        }
    }

    const handleRemove = (productId: string, productName: string) => {
        removeItem(productId)
        toast.success(`${productName} removed from wishlist`)
    }

    if (!mounted) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold tracking-tight">My Wishlist</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-64 bg-muted animate-pulse rounded-lg" />
                    ))}
                </div>
            </div>
        )
    }

    if (items.length === 0) {
        return (
            <div className="py-16 text-center">
                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                    <Heart className="h-10 w-10 text-muted-foreground" />
                </div>
                <h1 className="text-2xl font-bold mb-2">Your wishlist is empty</h1>
                <p className="text-muted-foreground mb-8">
                    Save your favorite items here to shop later
                </p>
                <Button asChild>
                    <Link href="/products">Browse Products</Link>
                </Button>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">My Wishlist</h2>
                    <p className="text-muted-foreground">
                        {items.length} {items.length === 1 ? 'item' : 'items'} saved
                    </p>
                </div>
                {items.length > 0 && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            clearWishlist()
                            toast.success('Wishlist cleared')
                        }}
                    >
                        Clear All
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((item) => (
                    <Card key={item.id} className="overflow-hidden group">
                        <div className="relative aspect-square bg-muted">
                            <Link href={`/product/${item.slug}`}>
                                {item.image ? (
                                    <Image
                                        src={item.image}
                                        alt={item.name}
                                        fill
                                        className="object-cover transition-transform group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <Package className="h-12 w-12 text-muted-foreground" />
                                    </div>
                                )}
                            </Link>
                            <Button
                                variant="destructive"
                                size="icon"
                                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => handleRemove(item.productId, item.name)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                        <CardContent className="p-4">
                            <Link href={`/product/${item.slug}`}>
                                <h3 className="font-medium line-clamp-2 hover:text-primary transition-colors">
                                    {item.name}
                                </h3>
                            </Link>
                            <p className="text-lg font-bold text-primary mt-2">
                                {formatPrice(item.price)}
                            </p>
                        </CardContent>
                        <CardFooter className="p-4 pt-0">
                            <Button
                                className="w-full"
                                onClick={() => handleAddToCart(item)}
                                disabled={addToCartMutation.isPending}
                            >
                                <ShoppingCart className="mr-2 h-4 w-4" />
                                Add to Cart
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    )
}
