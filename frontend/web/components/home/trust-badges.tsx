'use client'

import { Truck, Shield, Headphones, RefreshCw } from 'lucide-react'

const badges = [
    {
        icon: Truck,
        title: 'Gratis Ongkir',
        description: 'Untuk pesanan di atas Rp500.000'
    },
    {
        icon: Shield,
        title: 'Pembayaran Aman',
        description: '100% transaksi aman'
    },
    {
        icon: Headphones,
        title: 'Dukungan 24/7',
        description: 'Siap membantu kapan saja'
    },
    {
        icon: RefreshCw,
        title: 'Pengembalian Mudah',
        description: '30 hari garansi uang kembali'
    }
]

export function TrustBadges() {
    return (
        <section className="py-12 bg-muted">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {badges.map((badge, index) => (
                        <div
                            key={index}
                            className="flex items-center gap-4 p-4 bg-card border border-border"
                        >
                            <div className="w-12 h-12 bg-primary flex items-center justify-center flex-shrink-0">
                                <badge.icon className="h-6 w-6 text-primary-foreground" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-foreground">{badge.title}</h3>
                                <p className="text-sm text-muted-foreground">{badge.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
