
import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function OrderSuccessPage() {
    return (
        <div className="container mx-auto px-4 py-24 flex flex-col items-center justify-center text-center space-y-6">
            <div className="h-24 w-24 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-3xl font-bold">Order Placed Successfully!</h1>
            <p className="text-muted-foreground max-w-md">
                Thank you for your purchase. We have received your order and will begin processing it shortly. You will receive an email confirmation.
            </p>
            <div className="flex gap-4">
                <Button variant="outline" asChild>
                    <Link href="/orders">View My Orders</Link>
                </Button>
                <Button asChild>
                    <Link href="/">Continue Shopping</Link>
                </Button>
            </div>
        </div>
    )
}
