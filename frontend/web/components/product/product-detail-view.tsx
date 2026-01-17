'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
    ShoppingCart,
    Heart,
    Share2,
    Minus,
    Plus,
    Star,
    Truck,
    ShieldCheck,
    Undo2
} from 'lucide-react'
import { useCartStore } from '@/stores/cart-store'
import { useAuthStore } from '@/stores/auth-store'
import { useAddToCart } from '@/hooks/use-cart'
import { toast } from 'sonner'
import { ProductRecommendations } from '@/components/product/product-recommendations'
import { useProduct } from '@/hooks/use-products'
import { formatPrice } from '@/lib/utils'
import { Product } from '@/lib/api'
import { ProductReviews } from '@/components/product/product-reviews'

interface ProductDetailViewProps {
    id: string
    initialData?: Product
}

export function ProductDetailView({ id, initialData }: ProductDetailViewProps) {
    const router = useRouter()
    const { data: product, isLoading, error } = useProduct(id, initialData)

    // Auth & Cart Logic
    const { isAuthenticated } = useAuthStore()
    const { addItem: addLocalItem } = useCartStore()
    const addToCartMutation = useAddToCart()

    const [quantity, setQuantity] = useState(1)
    const [selectedImage, setSelectedImage] = useState(0)
    const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({})

    const handleAddToCart = () => {
        if (!product) return

        if (product.variants && product.variants.length > 0) {
            const missingVariants = product.variants.filter(v => !selectedVariants[v.name])
            if (missingVariants.length > 0) {
                toast.error(`Please select ${missingVariants[0].name}`)
                return;
            }
        }

        if (isAuthenticated) {
            addToCartMutation.mutate({
                productId: product.id,
                quantity: quantity
            }, {
                onSuccess: () => toast.success('Product added to cart'),
                onError: () => toast.error('Failed to add to cart')
            })
        } else {
            addLocalItem({
                id: product.id,
                productId: product.id,
                name: product.name,
                price: product.price,
                quantity: quantity,
                image: product.images[0],
                variant: Object.values(selectedVariants).join(', '),
                sellerId: product.sellerId,
                stock: product.stock
            })
            toast.success('Product added to cart')
        }
    }

    if (isLoading) {
        return <ProductDetailSkeleton />
    }

    if (error || !product) {
        return (
            <div className="container mx-auto px-4 py-32 text-center">
                <h2 className="text-2xl font-bold mb-4">Product not found</h2>
                <Button onClick={() => router.push('/')}>Return to Home</Button>
            </div>
        )
    }

    const discountAmount = product.originalPrice ? product.originalPrice - product.price : 0
    const discountPercentage = product.originalPrice ? Math.round((discountAmount / product.originalPrice) * 100) : 0

    return (
        <div className="container mx-auto px-4 py-8 pb-32 md:pb-8">
            {/* Breadcrumbs */}
            <Breadcrumb className="mb-6">
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <Link href="/">Home</Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <Link href="/products">Products</Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>{product.name}</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
                {/* Product Images */}
                <div className="w-full lg:w-1/2 space-y-4">
                    <div className="relative aspect-square overflow-hidden rounded-xl border bg-muted">
                        <Image
                            src={product.images[selectedImage] || '/placeholder-image.jpg'}
                            alt={product.name}
                            fill
                            className="object-cover"
                            priority
                        />
                    </div>
                    {product.images.length > 1 && (
                        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                            {product.images.map((img, index) => (
                                <button
                                    key={index}
                                    className={`relative aspect-square w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all ${selectedImage === index ? 'border-primary' : 'border-transparent hover:border-gray-300'
                                        }`}
                                    onClick={() => setSelectedImage(index)}
                                >
                                    <Image src={img} alt={`Product thumbnail ${index}`} fill className="object-cover" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Product Info */}
                <div className="w-full lg:w-1/2 space-y-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            {product.category && (
                                <Badge variant="secondary">{product.category.name}</Badge>
                            )}
                            {product.stock > 0 ? (
                                <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">In Stock</Badge>
                            ) : (
                                <Badge variant="destructive">Out of Stock</Badge>
                            )}
                        </div>
                        <h1 className="text-3xl font-bold">{product.name}</h1>
                        <div className="flex items-center gap-4 mt-2">
                            <div className="flex items-center text-yellow-500">
                                <Star className="h-5 w-5 fill-current" />
                                <span className="font-semibold ml-1 text-foreground">{product.rating.toFixed(1)}</span>
                            </div>
                            <span className="text-muted-foreground">•</span>
                            <span className="text-muted-foreground">{product.reviewCount} Reviews</span>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <div className="flex items-baseline gap-3">
                            <span className="text-3xl font-bold">{formatPrice(product.price)}</span>
                            {product.originalPrice && (
                                <span className="text-lg text-muted-foreground line-through">{formatPrice(product.originalPrice)}</span>
                            )}
                        </div>
                        {discountPercentage > 0 && (
                            <p className="text-sm text-green-600 font-medium">Save {discountPercentage}%</p>
                        )}
                    </div>

                    <Separator />

                    {/* Variants */}
                    {product.variants && product.variants.length > 0 && (
                        <div className="space-y-4">
                            {product.variants.map((variant) => (
                                <div key={variant.id}>
                                    <h3 className="text-sm font-medium mb-3">{variant.name}</h3>
                                    <div className="flex flex-wrap gap-3">
                                        {variant.options.map((option) => (
                                            <button
                                                key={option}
                                                className={`px-4 py-2 rounded-md border text-sm font-medium transition-colors ${selectedVariants[variant.name] === option
                                                    ? 'border-primary bg-primary text-primary-foreground'
                                                    : 'border-input hover:bg-accent hover:text-accent-foreground'
                                                    }`}
                                                onClick={() => setSelectedVariants(prev => ({ ...prev, [variant.name]: option }))}
                                            >
                                                {option}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Actions (Desktop) */}
                    <div className="hidden md:flex flex-col sm:flex-row gap-4">
                        <div className="flex items-center border rounded-md w-max">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-10 w-10"
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                disabled={product.stock === 0 || addToCartMutation.isPending}
                            >
                                <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-12 text-center font-medium">{quantity}</span>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-10 w-10"
                                onClick={() => setQuantity(quantity + 1)}
                                disabled={product.stock === 0 || addToCartMutation.isPending}
                            >
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="flex flex-1 gap-3">
                            <Button
                                className="flex-1"
                                size="lg"
                                onClick={handleAddToCart}
                                disabled={product.stock === 0 || addToCartMutation.isPending}
                            >
                                <ShoppingCart className="mr-2 h-5 w-5" />
                                {product.stock === 0 ? 'Out of Stock' : (addToCartMutation.isPending ? 'Adding...' : 'Add to Cart')}
                            </Button>
                            <Button variant="outline" size="icon" className="h-11 w-11">
                                <Heart className="h-5 w-5" />
                            </Button>
                            <Button variant="outline" size="icon" className="h-11 w-11">
                                <Share2 className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>

                    {/* Benefits */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-muted-foreground pt-4">
                        <div className="flex items-center gap-2">
                            <Truck className="h-5 w-5 text-primary" />
                            <span>Free Shipping</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="h-5 w-5 text-primary" />
                            <span>1 Year Warranty</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Undo2 className="h-5 w-5 text-primary" />
                            <span>30 Days Return</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sticky Mobile Add to Cart Bar */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t md:hidden z-50 flex items-center gap-4 shadow-xl pb-6">
                <div className="flex items-center border rounded-md">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        disabled={product.stock === 0 || addToCartMutation.isPending}
                    >
                        <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-8 text-center font-medium">{quantity}</span>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10"
                        onClick={() => setQuantity(quantity + 1)}
                        disabled={product.stock === 0 || addToCartMutation.isPending}
                    >
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>
                <Button
                    className="flex-1"
                    size="lg"
                    onClick={handleAddToCart}
                    disabled={product.stock === 0 || addToCartMutation.isPending}
                >
                    {addToCartMutation.isPending ? 'Adding...' : `Add - ${formatPrice(product.price * quantity)}`}
                </Button>
            </div>

            {/* Product Description & Reviews Tabs */}
            <div className="mt-12">
                <Tabs defaultValue="description" className="w-full">
                    <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
                        <TabsTrigger value="description" className="py-2.5 px-4 rounded-t-md data-[state=active]:bg-background data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none">
                            Description
                        </TabsTrigger>
                        <TabsTrigger value="reviews" className="py-2.5 px-4 rounded-t-lg data-[state=active]:bg-background data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none">
                            Reviews ({product.reviewCount})
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="description" className="pt-6">
                        <div className="prose max-w-none dark:prose-invert">
                            <p className="whitespace-pre-line leading-relaxed">{product.description}</p>
                        </div>
                    </TabsContent>
                    <TabsContent value="reviews" className="pt-6">
                        <ProductReviews productId={product.id} />
                    </TabsContent>
                </Tabs>
            </div>

            {/* Recommended Products */}
            <ProductRecommendations currentProductId={product.id} />
        </div>
    )
}

function ProductDetailSkeleton() {
    return (
        <div className="container mx-auto px-4 py-8 pb-32 md:pb-8">
            <Skeleton className="h-6 w-64 mb-6" />
            <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
                <div className="w-full lg:w-1/2 space-y-4">
                    <Skeleton className="aspect-square w-full rounded-xl" />
                    <div className="flex gap-4">
                        <Skeleton className="h-20 w-20 rounded-lg" />
                        <Skeleton className="h-20 w-20 rounded-lg" />
                        <Skeleton className="h-20 w-20 rounded-lg" />
                    </div>
                </div>
                <div className="w-full lg:w-1/2 space-y-6">
                    <Skeleton className="h-8 w-1/3" />
                    <Skeleton className="h-12 w-3/4" />
                    <Skeleton className="h-6 w-1/4" />
                    <div className="space-y-4 pt-4">
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-12 w-full" />
                    </div>
                </div>
            </div>
        </div>
    )
}
