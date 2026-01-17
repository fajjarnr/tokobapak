'use client'

import React, { Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Check, ShoppingBag, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

function OrderSuccessContent() {
    const searchParams = useSearchParams()
    const orderId = searchParams.get('orderId') || 'Pending'

    return (
        <Card className="max-w-md w-full border-dashed">
            <CardContent className="pt-10 pb-10 flex flex-col items-center text-center space-y-6">
                <div className="relative">
                    <div className="absolute inset-0 bg-green-500/20 blur-xl rounded-full" />
                    <div className="relative h-24 w-24 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center shadow-lg transform transition-transform hover:scale-105">
                        <Check className="h-12 w-12 text-white" strokeWidth={3} />
                    </div>
                </div>

                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">Order Successful!</h1>
                    <p className="text-muted-foreground">
                        Thank you for your purchase. Your order has been received.
                    </p>
                </div>

                <div className="bg-muted/50 rounded-lg p-4 w-full max-w-sm">
                    <p className="text-sm text-muted-foreground mb-1">Order Reference</p>
                    <p className="text-xl font-mono font-bold tracking-wider">{orderId}</p>
                </div>

                <div className="flex flex-col w-full gap-3 pt-4">
                    <Button asChild size="lg" className="w-full gap-2 font-medium">
                        <Link href="/orders">
                            Track Order <ArrowRight className="h-4 w-4" />
                        </Link>
                    </Button>
                    <Button variant="outline" asChild size="lg" className="w-full gap-2">
                        <Link href="/">
                            <ShoppingBag className="h-4 w-4" /> Continue Shopping
                        </Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}

export default function OrderSuccessPage() {
    return (
        <div className="container mx-auto px-4 py-16 md:py-24 flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in duration-500 slides-in-from-bottom-5">
            <Suspense fallback={<div>Loading...</div>}>
                <OrderSuccessContent />
            </Suspense>
        </div>
    )
}
