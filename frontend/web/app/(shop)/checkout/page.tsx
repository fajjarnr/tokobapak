
'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { CreditCard, Truck, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useCartStore } from '@/stores/cart-store'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export default function CheckoutPage() {
    const router = useRouter()
    const { items, totalPrice, clearCart } = useCartStore()
    const [loading, setLoading] = useState(false)

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(price)
    }

    const handlePlaceOrder = async () => {
        setLoading(true)
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 2000))

        toast.success('Order placed successfully!')
        clearCart()
        router.push('/order-success') // We should create this page too, or just redirect to home
        setLoading(false)
    }

    if (items.length === 0) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <h1 className="text-2xl font-bold mb-4">Cart is empty</h1>
                <Button asChild><Link href="/">Go Shopping</Link></Button>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Checkout</h1>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Checkout Forms */}
                <div className="flex-1 space-y-8">

                    {/* Step 1: Shipping Address */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MapPin className="h-5 w-5 text-primary" /> Shipping Address
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="first-name">First name</Label>
                                    <Input id="first-name" placeholder="John" />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="last-name">Last name</Label>
                                    <Input id="last-name" placeholder="Doe" />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="address">Address</Label>
                                <Input id="address" placeholder="Jalan Sudirman No. 123" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="city">City</Label>
                                    <Input id="city" placeholder="Jakarta" />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="zip">Postal Code</Label>
                                    <Input id="zip" placeholder="12345" />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="phone">Phone Number</Label>
                                <Input id="phone" placeholder="08123456789" />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Step 2: Shipping Method */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Truck className="h-5 w-5 text-primary" /> Shipping Method
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <RadioGroup defaultValue="standard">
                                <div className="flex items-center justify-between space-x-2 border p-4 rounded-md mb-2">
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="standard" id="r1" />
                                        <Label htmlFor="r1" className="cursor-pointer">
                                            <div className="font-semibold">Standard Shipping</div>
                                            <div className="text-sm text-muted-foreground">3-5 business days</div>
                                        </Label>
                                    </div>
                                    <span className="font-semibold">Rp 15.000</span>
                                </div>
                                <div className="flex items-center justify-between space-x-2 border p-4 rounded-md">
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="express" id="r2" />
                                        <Label htmlFor="r2" className="cursor-pointer">
                                            <div className="font-semibold">Express Shipping</div>
                                            <div className="text-sm text-muted-foreground">1-2 business days</div>
                                        </Label>
                                    </div>
                                    <span className="font-semibold">Rp 35.000</span>
                                </div>
                            </RadioGroup>
                        </CardContent>
                    </Card>

                    {/* Step 3: Payment Method */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CreditCard className="h-5 w-5 text-primary" /> Payment Method
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <RadioGroup defaultValue="card">
                                <div className="flex items-center space-x-2 mb-4">
                                    <RadioGroupItem value="card" id="pm1" />
                                    <Label htmlFor="pm1">Credit Card</Label>
                                </div>
                                <div className="flex items-center space-x-2 mb-4">
                                    <RadioGroupItem value="bank" id="pm2" />
                                    <Label htmlFor="pm2">Bank Transfer (Virtual Account)</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="cod" id="pm3" />
                                    <Label htmlFor="pm3">Cash on Delivery</Label>
                                </div>
                            </RadioGroup>
                        </CardContent>
                    </Card>

                </div>

                {/* Order Summary Sidebar */}
                <div className="lg:w-[350px] space-y-4">
                    <div className="grid gap-4 bg-muted/40 p-4 rounded-lg border">
                        <h3 className="font-bold text-lg">Your Order</h3>
                        <div className="space-y-3 max-h-[300px] overflow-auto pr-2">
                            {items.map((item) => (
                                <div key={item.id} className="flex gap-4">
                                    <div className="relative h-16 w-16 overflow-hidden rounded border bg-background">
                                        <Image src={item.image} alt={item.name} fill className="object-cover" />
                                    </div>
                                    <div className="flex-1 text-sm">
                                        <div className="font-medium line-clamp-2">{item.name}</div>
                                        <div className="text-muted-foreground">Qty: {item.quantity}</div>
                                    </div>
                                    <div className="font-medium text-sm">
                                        {formatPrice(item.price * item.quantity)}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <Separator />
                        <div className="space-y-1.5 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span>{formatPrice(totalPrice())}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Shipping</span>
                                <span>Rp 15.000</span>
                            </div>
                            <div className="flex justify-between font-bold text-lg pt-2 border-t mt-2">
                                <span>Total</span>
                                <span className="text-primary">{formatPrice(totalPrice() + 15000)}</span>
                            </div>
                        </div>
                        <Button className="w-full" size="lg" onClick={handlePlaceOrder} disabled={loading}>
                            {loading ? 'Processing...' : 'Place Order'}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
