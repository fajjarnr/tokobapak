'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { CreditCard, Truck, MapPin, Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'

import { useCartStore } from '@/stores/cart-store'
import { useAuthStore } from '@/stores/auth-store'
import { orderApi, CreateOrderRequest } from '@/lib/api/orders'
import { toast } from 'sonner'
import { CartItem } from '@/stores/cart-store'

const checkoutSchema = z.object({
    firstName: z.string().min(2, 'First name is required'),
    lastName: z.string().min(2, 'Last name is required'),
    address: z.string().min(5, 'Address is required'),
    city: z.string().min(2, 'City is required'),
    postalCode: z.string().min(4, 'Postal code is required'),
    phone: z.string().min(10, 'Phone number is required'),
    shippingMethod: z.enum(['standard', 'express']),
    paymentMethod: z.enum(['card', 'bank', 'cod']),
})

type CheckoutFormValues = z.infer<typeof checkoutSchema>

export default function CheckoutPage() {
    const router = useRouter()
    const { items, totalPrice, clearCart, totalItems } = useCartStore()
    const { user, isAuthenticated } = useAuthStore()
    const [loading, setLoading] = useState(false)

    // Redirect if not authenticated
    useEffect(() => {
        if (!isAuthenticated) {
            toast.error('Please login to checkout')
            router.push('/login?redirect=/checkout')
        }
    }, [isAuthenticated, router])

    const form = useForm<CheckoutFormValues>({
        resolver: zodResolver(checkoutSchema),
        defaultValues: {
            firstName: user?.name?.split(' ')[0] || '',
            lastName: user?.name?.split(' ').slice(1).join(' ') || '',
            address: '',
            city: '',
            postalCode: '',
            phone: '',
            shippingMethod: 'standard',
            paymentMethod: 'bank', // Default to Bank Transfer
        },
    })

    const shippingMethod = form.watch('shippingMethod')
    const shippingCost = shippingMethod === 'express' ? 35000 : 15000
    const subtotal = totalPrice()
    const total = subtotal + shippingCost

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(price)
    }

    async function onSubmit(data: CheckoutFormValues) {
        if (items.length === 0) {
            toast.error('Your cart is empty')
            return
        }

        setLoading(true)
        try {
            const orderData: CreateOrderRequest = {
                items: items.map((item: CartItem) => ({
                    productId: item.productId,
                    quantity: item.quantity,
                    price: item.price,
                    name: item.name,
                    image: item.image,
                })),
                shippingAddress: {
                    firstName: data.firstName,
                    lastName: data.lastName,
                    address: data.address,
                    city: data.city,
                    postalCode: data.postalCode,
                    phone: data.phone,
                },
                shippingMethod: data.shippingMethod,
                paymentMethod: data.paymentMethod,
                totalAmount: total,
            }

            const order = await orderApi.create(orderData)

            toast.success('Order placed successfully!')
            // Clear cart ONLY if successful
            await clearCart()

            router.push(`/order-success?orderId=${order.id || 'new'}`)
        } catch (error: any) {
            console.error('Checkout error:', error)
            toast.error(error.message || 'Failed to place order')
        } finally {
            setLoading(false)
        }
    }

    if (!isAuthenticated) {
        return null // Or loading spinner while redirecting
    }

    if (items.length === 0) {
        // Show empty state
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

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col lg:flex-row gap-8">
                    <div className="flex-1 space-y-8">
                        {/* Shipping Address */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <MapPin className="h-5 w-5 text-primary" /> Shipping Address
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="grid gap-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="firstName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>First Name</FormLabel>
                                                <FormControl><Input {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="lastName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Last Name</FormLabel>
                                                <FormControl><Input {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <FormField
                                    control={form.control}
                                    name="address"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Address</FormLabel>
                                            <FormControl><Input {...field} placeholder="Street address" /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="city"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>City</FormLabel>
                                                <FormControl><Input {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="postalCode"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Postal Code</FormLabel>
                                                <FormControl><Input {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <FormField
                                    control={form.control}
                                    name="phone"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Phone Number</FormLabel>
                                            <FormControl><Input {...field} placeholder="08..." /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>

                        {/* Shipping Method */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Truck className="h-5 w-5 text-primary" /> Shipping Method
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <FormField
                                    control={form.control}
                                    name="shippingMethod"
                                    render={({ field }) => (
                                        <FormItem>
                                            <RadioGroup
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                                className="flex flex-col space-y-1"
                                            >
                                                <FormItem className="flex items-center space-x-3 space-y-0 border p-4 rounded-md">
                                                    <FormControl>
                                                        <RadioGroupItem value="standard" />
                                                    </FormControl>
                                                    <div className="flex-1 flex justify-between items-center">
                                                        <Label className="font-normal cursor-pointer w-full">
                                                            <div className="font-bold">Standard Shipping</div>
                                                            <div className="text-sm text-muted-foreground">3-5 business days</div>
                                                        </Label>
                                                        <span className="font-bold">Rp 15.000</span>
                                                    </div>
                                                </FormItem>
                                                <FormItem className="flex items-center space-x-3 space-y-0 border p-4 rounded-md">
                                                    <FormControl>
                                                        <RadioGroupItem value="express" />
                                                    </FormControl>
                                                    <div className="flex-1 flex justify-between items-center">
                                                        <Label className="font-normal cursor-pointer w-full">
                                                            <div className="font-bold">Express Shipping</div>
                                                            <div className="text-sm text-muted-foreground">1-2 business days</div>
                                                        </Label>
                                                        <span className="font-bold">Rp 35.000</span>
                                                    </div>
                                                </FormItem>
                                            </RadioGroup>
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>

                        {/* Payment Method */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <CreditCard className="h-5 w-5 text-primary" /> Payment Method
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <FormField
                                    control={form.control}
                                    name="paymentMethod"
                                    render={({ field }) => (
                                        <FormItem>
                                            <RadioGroup
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                                className="flex flex-col space-y-1"
                                            >
                                                <FormItem className="flex items-center space-x-3 space-y-0 mb-4">
                                                    <FormControl>
                                                        <RadioGroupItem value="card" />
                                                    </FormControl>
                                                    <FormLabel className="font-normal cursor-pointer">Credit Card</FormLabel>
                                                </FormItem>
                                                <FormItem className="flex items-center space-x-3 space-y-0 mb-4">
                                                    <FormControl>
                                                        <RadioGroupItem value="bank" />
                                                    </FormControl>
                                                    <FormLabel className="font-normal cursor-pointer">Bank Transfer (Virtual Account)</FormLabel>
                                                </FormItem>
                                                <FormItem className="flex items-center space-x-3 space-y-0 border-t pt-2 mt-2">
                                                    <FormControl>
                                                        <RadioGroupItem value="cod" />
                                                    </FormControl>
                                                    <FormLabel className="font-normal cursor-pointer">Cash on Delivery</FormLabel>
                                                </FormItem>
                                            </RadioGroup>
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:w-[380px] space-y-4">
                        <div className="sticky top-24 grid gap-4 bg-muted/40 p-6 rounded-lg border">
                            <h3 className="font-bold text-lg">Order Summary</h3>
                            <div className="space-y-3 max-h-[300px] overflow-auto pr-2 custom-scrollbar">
                                {items.map((item: CartItem) => (
                                    <div key={item.id} className="flex gap-4">
                                        <div className="relative h-16 w-16 overflow-hidden rounded border bg-background shrink-0">
                                            <Image src={item.image} alt={item.name} fill className="object-cover" />
                                        </div>
                                        <div className="flex-1 text-sm">
                                            <div className="font-medium line-clamp-2">{item.name}</div>
                                            <div className="text-muted-foreground">Qty: {item.quantity} {item.variant && `(${item.variant})`}</div>
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
                                    <span className="text-muted-foreground">Subtotal ({totalItems()} items)</span>
                                    <span>{formatPrice(subtotal)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Shipping</span>
                                    <span>{formatPrice(shippingCost)}</span>
                                </div>
                                <Separator className="my-2" />
                                <div className="flex justify-between font-bold text-lg">
                                    <span>Total</span>
                                    <span className="text-primary">{formatPrice(total)}</span>
                                </div>
                            </div>
                            <Button className="w-full mt-4" size="lg" type="submit" disabled={loading}>
                                {loading ? (
                                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</>
                                ) : (
                                    'Place Order'
                                )}
                            </Button>
                        </div>
                    </div>
                </form>
            </Form>
        </div>
    )
}
