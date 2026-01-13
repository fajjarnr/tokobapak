
import Link from 'next/link'
import { Facebook, Instagram, Twitter } from 'lucide-react'

export function Footer() {
    return (
        <footer className="w-full border-t bg-background py-12 md:py-16 lg:py-20">
            <div className="container px-4 md:px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                                <span className="text-primary-foreground font-bold text-xl">T</span>
                            </div>
                            <span className="text-xl font-bold">TokoBapak</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Platform e-commerce terpercaya untuk kebutuhan keluarga Anda. Belanja aman, hemat, dan cepat.
                        </p>
                        <div className="flex gap-4">
                            <Link href="#" className="text-muted-foreground hover:text-foreground">
                                <Facebook className="h-5 w-5" />
                                <span className="sr-only">Facebook</span>
                            </Link>
                            <Link href="#" className="text-muted-foreground hover:text-foreground">
                                <Instagram className="h-5 w-5" />
                                <span className="sr-only">Instagram</span>
                            </Link>
                            <Link href="#" className="text-muted-foreground hover:text-foreground">
                                <Twitter className="h-5 w-5" />
                                <span className="sr-only">Twitter</span>
                            </Link>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg">Belanja</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href="#" className="hover:text-foreground">Semua Produk</Link></li>
                            <li><Link href="#" className="hover:text-foreground">Flash Sale</Link></li>
                            <li><Link href="#" className="hover:text-foreground">Produk Terlaris</Link></li>
                            <li><Link href="#" className="hover:text-foreground">Kategori</Link></li>
                        </ul>
                    </div>

                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg">Bantuan</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href="#" className="hover:text-foreground">Cara Belanja</Link></li>
                            <li><Link href="#" className="hover:text-foreground">Status Pesanan</Link></li>
                            <li><Link href="#" className="hover:text-foreground">Hubungi Kami</Link></li>
                            <li><Link href="#" className="hover:text-foreground">Pengembalian</Link></li>
                        </ul>
                    </div>

                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg">Tentang Kami</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href="#" className="hover:text-foreground">Tentang TokoBapak</Link></li>
                            <li><Link href="#" className="hover:text-foreground">Karir</Link></li>
                            <li><Link href="#" className="hover:text-foreground">Kebijakan Privasi</Link></li>
                            <li><Link href="#" className="hover:text-foreground">Syarat & Ketentuan</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
                    <p>&copy; {new Date().getFullYear()} TokoBapak. All rights reserved.</p>
                </div>
            </div>
        </footer>
    )
}
