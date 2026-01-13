
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import Image from 'next/image'

const ORDERS = [
    {
        id: 'ORD-1234',
        date: '2023-10-25',
        status: 'Delivered',
        total: 3515000,
        items: [
            { name: 'Wireless Headphones', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=100&auto=format&fit=crop' }
        ]
    },
    {
        id: 'ORD-5678',
        date: '2023-10-10',
        status: 'Processing',
        total: 150000,
        items: [
            { name: 'T-Shirt', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=100&auto=format&fit=crop' }
        ]
    }
]

export default function OrdersPage() {
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(price)
    }

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold">Order History</h2>

            <div className="space-y-4">
                {ORDERS.map((order) => (
                    <div key={order.id} className="border rounded-lg p-4 flex flex-col sm:flex-row gap-4 justify-between">
                        <div className="flex gap-4">
                            <div className="relative h-16 w-16 overflow-hidden rounded bg-muted border">
                                <Image src={order.items[0].image} alt="Product" fill className="object-cover" />
                            </div>
                            <div className="space-y-1">
                                <div className="font-semibold text-sm">Order #{order.id}</div>
                                <div className="text-xs text-muted-foreground">Placed on {order.date}</div>
                                <div className="text-sm font-medium">{order.items[0].name} {order.items.length > 1 && `+${order.items.length - 1} more`}</div>
                            </div>
                        </div>

                        <div className="flex flex-col items-end gap-2 text-right">
                            <Badge variant={order.status === 'Delivered' ? 'secondary' : 'default'}>
                                {order.status}
                            </Badge>
                            <div className="font-bold">{formatPrice(order.total)}</div>
                            <Button variant="outline" size="sm" asChild>
                                <Link href={`/orders/${order.id}`}>View Details</Link>
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
