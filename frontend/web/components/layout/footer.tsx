import Link from 'next/link'
import { Facebook, Instagram, Twitter, Youtube, CreditCard, Wallet } from 'lucide-react'

const footerLinks: Record<string, { label: string; href: string }[]> = {
    'Tentang Kami': [
      { label: 'Tentang TokoBapak', href: '/about' },
      { label: 'Karir', href: '/careers' },
      { label: 'Press', href: '/press' },
      { label: 'Program Afiliasi', href: '/affiliate' },
    ],
    'Layanan Pelanggan': [
      { label: 'Hubungi Kami', href: '/contact' },
      { label: 'FAQ', href: '/faq' },
      { label: 'Info Pengiriman', href: '/shipping-info' },
      { label: 'Pengembalian', href: '/returns' },
    ],
    'Link Cepat': [
      { label: 'New Arrivals', href: '/new-arrivals' },
      { label: 'Best Sellers', href: '/best-sellers' },
      { label: 'Sale Items', href: '/sale' },
      { label: 'Gift Cards', href: '/gift-cards' },
    ],
    'Akun Saya': [
      { label: 'Pesanan Saya', href: '/orders' },
      { label: 'Wishlist', href: '/wishlist' },
      { label: 'Pengaturan Akun', href: '/settings' },
      { label: 'Lacak Pesanan', href: '/track-order' },
    ],
}

export function Footer() {
    return (
        <footer className="bg-foreground text-card pt-12 pb-6">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-8">
                    {/* Brand column */}
                    <div className="col-span-2 md:col-span-4 lg:col-span-1">
                        <Link href="/" className="flex items-center gap-2 mb-4">
                            <div className="w-10 h-10 bg-primary flex items-center justify-center">
                                <span className="text-primary-foreground font-bold text-xl">T</span>
                            </div>
                            <span className="text-2xl font-bold text-card">TokoBapak</span>
                        </Link>
                        <p className="text-card/70 text-sm mb-4">
                            Toko online terpercaya untuk semua kebutuhan Anda. Produk berkualitas, harga terbaik, dan layanan prima.
                        </p>
                        <div className="flex gap-3">
                            <a
                                href="#"
                                className="w-9 h-9 bg-card/10 flex items-center justify-center hover:bg-primary transition-colors"
                            >
                                <Facebook className="h-4 w-4" />
                            </a>
                            <a
                                href="#"
                                className="w-9 h-9 bg-card/10 flex items-center justify-center hover:bg-primary transition-colors"
                            >
                                <Twitter className="h-4 w-4" />
                            </a>
                            <a
                                href="#"
                                className="w-9 h-9 bg-card/10 flex items-center justify-center hover:bg-primary transition-colors"
                            >
                                <Instagram className="h-4 w-4" />
                            </a>
                            <a
                                href="#"
                                className="w-9 h-9 bg-card/10 flex items-center justify-center hover:bg-primary transition-colors"
                            >
                                <Youtube className="h-4 w-4" />
                            </a>
                        </div>
                    </div>

                    {/* Link columns */}
                    {Object.entries(footerLinks).map(([title, links]) => (
                        <div key={title}>
                            <h4 className="font-semibold text-card mb-4">{title}</h4>
                            <ul className="space-y-2">
                                {links.map((link) => (
                                    <li key={link.href}>
                                        <a
                                            href={link.href}
                                            className="text-sm text-card/70 hover:text-primary transition-colors"
                                        >
                                            {link.label}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Payment methods & copyright */}
                <div className="border-t border-card/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-card/60">
                        © {new Date().getFullYear()} TokoBapak. All rights reserved.
                    </p>
                    <div className="flex items-center gap-3">
                        <span className="text-sm text-card/60">We Accept:</span>
                        <div className="flex gap-2">
                            <div className="w-10 h-6 bg-card/10 flex items-center justify-center">
                                <CreditCard className="h-4 w-4 text-card/70" />
                            </div>
                            <div className="w-10 h-6 bg-card/10 flex items-center justify-center">
                                <Wallet className="h-4 w-4 text-card/70" />
                            </div>
                            <div className="w-10 h-6 bg-card/10 flex items-center justify-center text-xs font-bold text-card/70">
                                Pay
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    )
}
