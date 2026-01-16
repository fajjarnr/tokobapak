'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
import { toast } from 'sonner'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ProductRecommendations } from '@/components/product/product-recommendations'

export default function ProductDetailPage() {
    const params = useParams()
    const { addItem } = useCartStore()
    const [quantity, setQuantity] = useState(1)
    const [selectedImage, setSelectedImage] = useState(0)

    // Mock Product Data
    const product = {
        id: params?.id as string || '1',
        name: 'Wireless Noise Cancelling Headphones Premium Edition',
        price: 3500000,
        originalPrice: 4500000,
        rating: 4.8,
        reviews: 124,
        description: `Experience industry-leading noise cancellation with our latest premium headphones. 
    Designed for comfort and extended listening sessions, these headphones feature:
    
    - Dual Noise Sensor Technology
    - Up to 30-hour battery life
    - Touch Sensor controls
    - Wearing detection
    - Speak-to-chat technology`,
        images: [
            'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1000&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1583394838336-acd977736f90?q=80&w=1000&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1524678606372-987b7809707d?q=80&w=1000&auto=format&fit=crop',
        ],
        variants: [
            { name: 'Black', color: '#000000' },
            { name: 'Silver', color: '#C0C0C0' },
            { name: 'Blue', color: '#0000FF' }
        ]
    }

    const handleAddToCart = () => {
        addItem({
            id: product.id,
            productId: product.id,
            name: product.name,
            price: product.price,
            quantity: quantity,
            image: product.images[0],
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
                            <Link href="/products">Electronics</Link>
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
                            src={product.images[selectedImage]}
                            alt={product.name}
                            fill
                            className="object-cover"
                            priority
                        />
                    </div>
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
                </div>

                {/* Product Info */}
                <div className="w-full lg:w-1/2 space-y-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Badge variant="secondary">Electronics</Badge>
                            <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">In Stock</Badge>
                        </div>
                        <h1 className="text-3xl font-bold">{product.name}</h1>
                        <div className="flex items-center gap-4 mt-2">
                            <div className="flex items-center text-yellow-500">
                                <Star className="h-5 w-5 fill-current" />
                                <span className="font-semibold ml-1 text-foreground">{product.rating}</span>
                            </div>
                            <span className="text-muted-foreground">•</span>
                            <span className="text-muted-foreground">{product.reviews} Reviews</span>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <div className="flex items-baseline gap-3">
                            <span className="text-3xl font-bold">{formatPrice(product.price)}</span>
                            <span className="text-lg text-muted-foreground line-through">{formatPrice(product.originalPrice)}</span>
                        </div>
                        <p className="text-sm text-green-600 font-medium">Save Rp {new Intl.NumberFormat('id-ID').format(product.originalPrice - product.price)}</p>
                    </div>

                    <Separator />

                    {/* Variants */}
                    <div>
                        <h3 className="text-sm font-medium mb-3">Color</h3>
                        <div className="flex gap-3">
                            {product.variants.map((variant) => (
                                <button
                                    key={variant.name}
                                    className="h-8 w-8 rounded-full border-2 ring-offset-2 focus:ring-2 ring-primary border-gray-200"
                                    style={{ backgroundColor: variant.color }}
                                    title={variant.name}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Actions (Desktop) */}
                    <div className="hidden md:flex flex-col sm:flex-row gap-4">
                        <div className="flex items-center border rounded-md w-max">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-10 w-10"
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            >
                                <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-12 text-center font-medium">{quantity}</span>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-10 w-10"
                                onClick={() => setQuantity(quantity + 1)}
                            >
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="flex flex-1 gap-3">
                            <Button className="flex-1" size="lg" onClick={handleAddToCart}>
                                <ShoppingCart className="mr-2 h-5 w-5" /> Add to Cart
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
                    >
                        <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-8 text-center font-medium">{quantity}</span>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10"
                        onClick={() => setQuantity(quantity + 1)}
                    >
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>
                <Button className="flex-1" size="lg" onClick={handleAddToCart}>
                    Add to Cart - {formatPrice(product.price * quantity)}
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
                            Reviews ({product.reviews})
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="description" className="pt-6">
                        <div className="prose max-w-none dark:prose-invert">
                            <p className="whitespace-pre-line leading-relaxed">{product.description}</p>
                        </div>
                    </TabsContent>
                    <TabsContent value="reviews" className="pt-6">
                        <div className="grid gap-6">
                            {/* Mock Review */}
                            <div className="flex gap-4">
                                <Avatar>
                                    <AvatarImage src="https://github.com/shadcn.png" />
                                    <AvatarFallback>CN</AvatarFallback>
                                </Avatar>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-semibold">Budi Santoso</h4>
                                        <span className="text-xs text-muted-foreground">2 days ago</span>
                                    </div>
                                    <div className="flex text-yellow-500">
                                        <Star className="h-4 w-4 fill-current" />
                                        <Star className="h-4 w-4 fill-current" />
                                        <Star className="h-4 w-4 fill-current" />
                                        <Star className="h-4 w-4 fill-current" />
                                        <Star className="h-4 w-4 fill-current" />
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-2">
                                        Barang sangat bagus, original, pengiriman cepat. Recommended seller!
                                    </p>
                                </div>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>

            {/* Recommended Products */}
            <ProductRecommendations />
        </div>
    )
}
