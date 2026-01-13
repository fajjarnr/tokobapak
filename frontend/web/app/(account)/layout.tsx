
import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { User, Package, Settings, LogOut, MapPin, Heart } from 'lucide-react'

export default function AccountLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1 container mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Account Sidebar */}
                    <aside className="w-full md:w-64 shrink-0 space-y-2">
                        <div className="font-semibold text-lg mb-4 px-4">My Account</div>
                        <nav className="flex flex-col space-y-1">
                            <Button variant="ghost" asChild className="justify-start">
                                <Link href="/profile">
                                    <User className="mr-2 h-4 w-4" /> Profile
                                </Link>
                            </Button>
                            <Button variant="ghost" asChild className="justify-start">
                                <Link href="/orders">
                                    <Package className="mr-2 h-4 w-4" /> My Orders
                                </Link>
                            </Button>
                            <Button variant="ghost" asChild className="justify-start">
                                <Link href="/wishlist">
                                    <Heart className="mr-2 h-4 w-4" /> Wishlist
                                </Link>
                            </Button>
                            <Button variant="ghost" asChild className="justify-start">
                                <Link href="/addresses">
                                    <MapPin className="mr-2 h-4 w-4" /> Addresses
                                </Link>
                            </Button>
                            <Button variant="ghost" asChild className="justify-start">
                                <Link href="/settings">
                                    <Settings className="mr-2 h-4 w-4" /> Settings
                                </Link>
                            </Button>
                            <Button variant="ghost" className="justify-start text-red-600 hover:text-red-600 hover:bg-red-50">
                                <LogOut className="mr-2 h-4 w-4" /> Logout
                            </Button>
                        </nav>
                    </aside>

                    {/* Account Content */}
                    <div className="flex-1 bg-card rounded-lg border p-6 min-h-[500px]">
                        {children}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    )
}
