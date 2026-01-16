import { Truck, ShieldCheck, RefreshCw, Headphones } from 'lucide-react'

const TRUST_BADGES = [
    {
        icon: Truck,
        title: 'Gratis Ongkir',
        description: 'Untuk pembelian di atas Rp100.000',
        color: 'from-emerald-500 to-teal-500',
    },
    {
        icon: ShieldCheck,
        title: 'Pembayaran Aman',
        description: 'Transaksi terenkripsi & aman',
        color: 'from-blue-500 to-indigo-500',
    },
    {
        icon: RefreshCw,
        title: 'Garansi 7 Hari',
        description: 'Tukar/kembalikan gratis',
        color: 'from-purple-500 to-pink-500',
    },
    {
        icon: Headphones,
        title: 'CS 24/7',
        description: 'Siap membantu kapanpun',
        color: 'from-orange-500 to-rose-500',
    },
]

export function TrustBadgesSection() {
    return (
        <section className="py-8 border-y bg-muted/30">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {TRUST_BADGES.map((badge) => (
                        <div
                            key={badge.title}
                            className="flex items-center gap-4 p-4 rounded-xl bg-background border hover:shadow-md transition-shadow"
                        >
                            <div className={`flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${badge.color} shadow-lg`}>
                                <badge.icon className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h3 className="font-semibold">{badge.title}</h3>
                                <p className="text-xs text-muted-foreground">{badge.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
