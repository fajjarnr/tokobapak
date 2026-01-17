'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Package, Truck, Calendar, ArrowRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { orderApi, Order } from '@/lib/api/orders'
import { useAuthStore } from '@/stores/auth-store'
import { toast } from 'sonner'

export default function OrdersPage() {
    const { isAuthenticated, user } = useAuthStore()
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (isAuthenticated) {
            fetchOrders()
        }
    }, [isAuthenticated])

    const fetchOrders = async () => {
        try {
            const data = await orderApi.getAll()
            setOrders(data)
        } catch (error) {
            console.error('Failed to fetch orders:', error)
            toast.error('Failed to load order history')
        } finally {
            setLoading(false)
        }
    }

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending': return 'bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20'
            case 'paid': return 'bg-blue-500/10 text-blue-600 hover:bg-blue-500/20'
            case 'processing': return 'bg-blue-500/10 text-blue-600 hover:bg-blue-500/20'
            case 'shipped': return 'bg-purple-500/10 text-purple-600 hover:bg-purple-500/20'
            case 'delivered': return 'bg-green-500/10 text-green-600 hover:bg-green-500/20'
            case 'cancelled': return 'bg-red-500/10 text-red-600 hover:bg-red-500/20'
            default: return 'bg-gray-500/10 text-gray-600'
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

    if (!isAuthenticated) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <h1 className="text-2xl font-bold mb-4">Please Login</h1>
                <p className="text-muted-foreground mb-8">You need to be logged in to view your orders.</p>
                <Button asChild><Link href="/login">Login</Link></Button>
            </div>
        )
    }

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8 space-y-4">
                <div className="h-8 w-48 bg-muted animate-pulse rounded" />
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-40 bg-muted animate-pulse rounded-lg" />
                    ))}
                </div>
            </div>
        )
    }

    if (orders.length === 0) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                    <Package className="h-10 w-10 text-muted-foreground" />
                </div>
                <h1 className="text-2xl font-bold mb-2">No orders yet</h1>
                <p className="text-muted-foreground mb-8">Start shopping to see your orders here.</p>
                <Button asChild><Link href="/">Start Shopping</Link></Button>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">My Orders</h1>

            <div className="space-y-6">
                {orders.map((order) => (
                    <Card key={order.id} className="overflow-hidden">
                        <CardHeader className="bg-muted/30 flex flex-row items-center justify-between pb-4">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <span className="font-bold">Order {order.id}</span>
                                    <Badge className={`${getStatusColor(order.status)} border-0`}>
                                        {order.status}
                                    </Badge>
                                </div>
                                <div className="flex items-center text-sm text-muted-foreground gap-4">
                                    <span className="flex items-center gap-1">
                                        <Calendar className="h-4 w-4" />
                                        {formatDate(order.createdAt)}
                                    </span>
                                </div>
                            </div>
                            <Button variant="outline" size="sm" asChild>
                                <Link href={`/orders/${order.id}`}>
                                    View Details <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="space-y-4">
                                {order.items.map((item, index) => (
                                    <div key={index} className="flex gap-4">
                                        <div className="relative h-16 w-16 overflow-hidden rounded border bg-background shrink-0">
                                            {item.image ? (
                                                <Image src={item.image} alt={item.name} fill className="object-cover" />
                                            ) : (
                                                <div className="w-full h-full bg-muted flex items-center justify-center">
                                                    <Package className="h-6 w-6 text-muted-foreground" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-medium line-clamp-1">{item.name}</div>
                                            <div className="text-sm text-muted-foreground">
                                                {item.quantity} x {formatPrice(item.price)}
                                            </div>
                                        </div>
                                        <div className="font-medium">
                                            {formatPrice(item.price * item.quantity)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <Separator className="my-4" />
                            <div className="flex justify-between items-center">
                                <div className="text-sm text-muted-foreground">
                                    Payment Method: <span className="font-medium text-foreground uppercase">{order.paymentMethod}</span>
                                </div>
                                <div className="text-lg font-bold">
                                    Total: <span className="text-primary">{formatPrice(order.totalAmount)}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
