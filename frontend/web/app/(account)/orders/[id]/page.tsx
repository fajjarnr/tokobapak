'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import {
    Package,
    Truck,
    CreditCard,
    Calendar,
    MapPin,
    ArrowLeft,
    XCircle,
    CheckCircle2,
    Clock,
    AlertCircle
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { orderApi, Order } from '@/lib/api/orders'
import { useAuthStore } from '@/stores/auth-store'
import { toast } from 'sonner'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

export default function OrderDetailPage() {
    const params = useParams()
    const router = useRouter()
    const { isAuthenticated } = useAuthStore()
    const [order, setOrder] = useState<Order | null>(null)
    const [loading, setLoading] = useState(true)
    const [cancelling, setCancelling] = useState(false)

    const orderId = params.id as string

    useEffect(() => {
        if (!isAuthenticated) return

        const fetchOrder = async () => {
            try {
                const data = await orderApi.getById(orderId)
                setOrder(data)
            } catch (error) {
                console.error('Failed to fetch order', error)
                toast.error('Failed to load order details')
                router.push('/orders')
            } finally {
                setLoading(false)
            }
        }

        fetchOrder()
    }, [orderId, isAuthenticated, router])

    const handleCancelOrder = async () => {
        if (!order) return
        setCancelling(true)
        try {
            await orderApi.cancel(order.id)
            toast.success('Order cancelled successfully')
            // Refresh order
            const updatedOrder = await orderApi.getById(orderId)
            setOrder(updatedOrder)
        } catch (error) {
            console.error('Failed to cancel order', error)
            toast.error('Failed to cancel order')
        } finally {
            setCancelling(false)
        }
    }

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(price)
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'pending': return 'bg-yellow-100 text-yellow-800'
            case 'paid': return 'bg-blue-100 text-blue-800'
            case 'processing': return 'bg-blue-100 text-blue-800'
            case 'shipped': return 'bg-purple-100 text-purple-800'
            case 'delivered': return 'bg-green-100 text-green-800'
            case 'cancelled': return 'bg-red-100 text-red-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    const steps = [
        { label: 'Order Placed', status: 'pending', icon: Clock },
        { label: 'Processing', status: 'processing', icon: Package },
        { label: 'Shipped', status: 'shipped', icon: Truck },
        { label: 'Delivered', status: 'delivered', icon: CheckCircle2 },
    ]

    const getCurrentStep = (status: string) => {
        const s = status?.toLowerCase()
        if (s === 'paid') return 1
        if (s === 'processing') return 1
        if (s === 'shipped') return 2
        if (s === 'delivered') return 3
        return 0
    }

    if (!isAuthenticated) return null // Handled by middleware or redirect

    if (loading) {
        return (
            <div className="space-y-8">
                <div className="h-8 w-64 bg-muted animate-pulse rounded" />
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="md:col-span-2 space-y-6">
                        <div className="h-40 bg-muted animate-pulse rounded-lg" />
                        <div className="h-64 bg-muted animate-pulse rounded-lg" />
                    </div>
                    <div className="h-64 bg-muted animate-pulse rounded-lg" />
                </div>
            </div>
        )
    }

    if (!order) return null

    const currentStepIndex = getCurrentStep(order.status)
    const isCancelled = order.status.toLowerCase() === 'cancelled'

    return (
        <div className="space-y-6">
            <div className="mb-6">
                <Button variant="ghost" asChild className="pl-0 hover:pl-2 transition-all">
                    <Link href="/orders">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to My Orders
                    </Link>
                </Button>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        Order #{order.id}
                        <Badge className={`${getStatusColor(order.status)} border-0 text-sm px-3 py-1`}>
                            {order.status}
                        </Badge>
                    </h1>
                    <p className="text-muted-foreground mt-2 flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Placed on {formatDate(order.createdAt)}
                    </p>
                </div>
                {!isCancelled && (order.status.toLowerCase() === 'pending' || order.status.toLowerCase() === 'paid') && (
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" disabled={cancelling}>
                                Cancel Order
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Cancel Order?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Are you sure you want to cancel this order? This action cannot be undone.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>No, Keep Order</AlertDialogCancel>
                                <AlertDialogAction onClick={handleCancelOrder} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                    Yes, Cancel Order
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                )}
            </div>

            {/* Timeline */}
            {!isCancelled && (
                <Card className="mb-8">
                    <CardContent className="pt-8 pb-8">
                        <div className="relative flex flex-col md:flex-row justify-between items-center w-full max-w-4xl mx-auto">
                            {/* Line */}
                            <div className="absolute top-4 md:top-1/2 left-4 md:left-0 h-full md:h-1 w-1 md:w-full bg-muted -z-10 md:-translate-y-1/2" />

                            {steps.map((step, index) => {
                                const isCompleted = index <= currentStepIndex
                                const isCurrent = index === currentStepIndex
                                const Icon = step.icon

                                return (
                                    <div key={step.status} className="flex md:flex-col items-center gap-4 md:gap-2 bg-card p-2 md:p-0 z-10 w-full md:w-auto">
                                        <div className={`
                                            flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors
                                            ${isCompleted ? 'bg-primary border-primary text-primary-foreground' : 'bg-background border-muted text-muted-foreground'}
                                        `}>
                                            <Icon className="h-5 w-5" />
                                        </div>
                                        <div className="md:text-center">
                                            <p className={`font-medium ${isCompleted ? 'text-foreground' : 'text-muted-foreground'}`}>
                                                {step.label}
                                            </p>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="grid md:grid-cols-3 gap-8">
                {/* Details */}
                <div className="md:col-span-2 space-y-6">
                    {/* Items */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Package className="h-5 w-5" /> Order Items
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                {order.items.map((item, index) => (
                                    <div key={index} className="flex gap-4">
                                        <div className="relative h-20 w-20 overflow-hidden rounded-md border bg-muted shrink-0">
                                            {item.image ? (
                                                <Image src={item.image} alt={item.name} fill className="object-cover" />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center">
                                                    <Package className="h-8 w-8 text-muted-foreground" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-medium line-clamp-2">{item.name}</h3>
                                            <div className="mt-1 text-sm text-muted-foreground">
                                                Qty: {item.quantity}
                                            </div>
                                            <div className="mt-1 font-medium">
                                                {formatPrice(item.price)}
                                            </div>
                                        </div>
                                        <div className="font-bold">
                                            {formatPrice(item.price * item.quantity)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Shipping Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Truck className="h-5 w-5" /> Shipping Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <h4 className="font-semibold mb-2">Delivery Address</h4>
                                    <div className="text-sm text-muted-foreground space-y-1">
                                        <p className="font-medium text-foreground">
                                            {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                                        </p>
                                        <p>{order.shippingAddress.address}</p>
                                        <p>{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
                                        <p>{order.shippingAddress.phone}</p>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-semibold mb-2">Shipping Method</h4>
                                    <div className="text-sm text-muted-foreground">
                                        <p>{order.shippingMethod === 'express' ? 'Express Shipping (1-2 Days)' : 'Standard Shipping (3-5 Days)'}</p>
                                        {/* Tracking number simulation */}
                                        {order.status === 'shipped' && (
                                            <div className="mt-2 p-2 bg-muted rounded border border-dashed">
                                                <span className="font-mono text-xs">Tracking: TK-123456789</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Summary */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CreditCard className="h-5 w-5" /> Payment
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h4 className="text-sm text-muted-foreground mb-1">Payment Method</h4>
                                <div className="font-medium capitalize">{order.paymentMethod.replace('_', ' ')}</div>
                            </div>

                            <Separator />

                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span>{formatPrice(order.totalAmount - (order.shippingMethod === 'express' ? 35000 : 15000))}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Shipping</span>
                                    <span>{formatPrice(order.shippingMethod === 'express' ? 35000 : 15000)}</span>
                                </div>
                                <Separator className="my-2" />
                                <div className="flex justify-between font-bold text-lg">
                                    <span>Total</span>
                                    <span className="text-primary">{formatPrice(order.totalAmount)}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-primary/5 border-primary/20">
                        <CardHeader>
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <AlertCircle className="h-4 w-4" /> Need Help?
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm">
                            <p className="text-muted-foreground mb-3">If you have any issues with your order, please contact our support.</p>
                            <Button variant="outline" size="sm" className="w-full">Contact Support</Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
