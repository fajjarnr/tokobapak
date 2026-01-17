import Link from 'next/link'
import { Facebook, Instagram, Twitter, Youtube, CreditCard, Wallet } from 'lucide-react'

const footerLinks = {
    'Tentang Kami': ['Tentang TokoBapak', 'Karir', 'Press', 'Program Afiliasi'],
    'Layanan Pelanggan': ['Hubungi Kami', 'FAQ', 'Info Pengiriman', 'Pengembalian'],
    'Link Cepat': ['New Arrivals', 'Best Sellers', 'Sale Items', 'Gift Cards'],
    'Akun Saya': ['Pesanan Saya', 'Wishlist', 'Pengaturan Akun', 'Lacak Pesanan'],
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
                                    <li key={link}>
                                        <a
                                            href="#"
                                            className="text-sm text-card/70 hover:text-primary transition-colors"
                                        >
                                            {link}
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
