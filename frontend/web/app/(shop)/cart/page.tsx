
'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Minus, Plus, Trash2, ArrowRight, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useCartStore } from '@/stores/cart-store'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

export default function CartPage() {
    const { items, removeItem, updateQuantity, totalPrice } = useCartStore()

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(price)
    }

    if (items.length === 0) {
        return (
            <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center text-center space-y-4">
                <div className="h-24 w-24 bg-muted rounded-full flex items-center justify-center">
                    <Trash2 className="h-10 w-10 text-muted-foreground" />
                </div>
                <h1 className="text-2xl font-bold">Your cart is empty</h1>
                <p className="text-muted-foreground">Looks like you haven&apos;t added anything to your cart yet.</p>
                <Button asChild size="lg" className="mt-4">
                    <Link href="/">Start Shopping</Link>
                </Button>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Cart Items */}
                <div className="flex-1 space-y-4">
                    {items.map((item) => (
                        <Card key={item.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4">
                            <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border">
                                <Image
                                    src={item.image}
                                    alt={item.name}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <div className="flex-1 space-y-1">
                                <h3 className="font-semibold text-lg line-clamp-1">
                                    <Link href={`/product/${item.productId}`} className="hover:underline">
                                        {item.name}
                                    </Link>
                                </h3>
                                <p className="text-sm text-muted-foreground">Variant: Default</p>
                                <p className="font-bold text-primary sm:hidden">{formatPrice(item.price)}</p>
                            </div>

                            <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                                <p className="font-bold hidden sm:block w-32 text-right">{formatPrice(item.price)}</p>

                                <div className="flex items-center border rounded-md">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                                    >
                                        <Minus className="h-3 w-3" />
                                    </Button>
                                    <span className="w-8 text-center text-sm">{item.quantity}</span>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                    >
                                        <Plus className="h-3 w-3" />
                                    </Button>
                                </div>

                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                    onClick={() => {
                                        removeItem(item.id)
                                        toast('Item removed from cart')
                                    }}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>

                {/* Order Summary */}
                <div className="lg:w-[350px] space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Order Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span className="font-medium">{formatPrice(totalPrice())}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Shipping Estimate</span>
                                <span className="text-green-600">Calculated at checkout</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Tax</span>
                                <span className="font-medium">Rp -</span>
                            </div>
                            <Separator />

                            {/* Coupon Code - Mock */}
                            <div className="flex gap-2">
                                <Input placeholder="Coupon code" />
                                <Button variant="outline">Apply</Button>
                            </div>

                            <Separator />
                            <div className="flex justify-between items-center">
                                <span className="font-bold text-lg">Total</span>
                                <span className="font-bold text-lg text-primary">{formatPrice(totalPrice())}</span>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full gap-2" size="lg" asChild>
                                <Link href="/checkout">
                                    Proceed to Checkout <ArrowRight className="h-4 w-4" />
                                </Link>
                            </Button>
                        </CardFooter>
                    </Card>

                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                        <ShieldCheck className="h-4 w-4" /> Secure Checkout
                    </div>
                </div>
            </div>
        </div>
    )
}

