'use client'

import Link from 'next/link'
import { ShoppingCart, Search, Menu, User, LogOut, Settings, Package, Heart, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useCartStore } from '@/stores/cart-store'
import { useAuthStore } from '@/stores/auth-store'
import { useState } from 'react'

const categories = [
    { name: 'Electronics', path: '/categories?category=electronics' },
    { name: 'Fashion', path: '/categories?category=fashion' },
    { name: 'Furniture', path: '/categories?category=furniture' },
    { name: 'All Products', path: '/products' },
]

export function Header() {
    const cartItemsCount = useCartStore((state) => state.totalItems())
    const { user, logout, isAuthenticated } = useAuthStore()
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    return (
        <header className="sticky top-0 z-50 bg-card shadow-sm">
            {/* Top bar - Promo Banner */}
            <div className="bg-primary text-primary-foreground py-2">
                <div className="container mx-auto px-4 flex items-center justify-between text-sm">
                    <p>Gratis Ongkir untuk Pesanan di Atas Rp500.000 | Same Day Delivery</p>
                    <div className="hidden md:flex items-center gap-4">
                        <a href="#" className="hover:underline">Lacak Pesanan</a>
                        <a href="#" className="hover:underline">Pusat Bantuan</a>
                    </div>
                </div>
            </div>

            {/* Main header */}
            <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between gap-4">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-primary flex items-center justify-center">
                            <span className="text-primary-foreground font-bold text-xl">T</span>
                        </div>
                        <span className="text-2xl font-bold text-foreground hidden sm:block">TokoBapak</span>
                    </Link>

                    {/* Search bar */}
                    <div className="flex-1 max-w-2xl hidden md:flex">
                        <div className="relative w-full flex">
                            <Input
                                type="text"
                                placeholder="Cari produk, merek, dan lainnya..."
                                className="rounded-r-none border-r-0 bg-background"
                            />
                            <Button className="rounded-l-none px-6">
                                <Search className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 md:gap-4">
                        <Button variant="ghost" size="icon" className="md:hidden">
                            <Search className="h-5 w-5" />
                        </Button>

                        {/* Wishlist */}
                        <Button variant="ghost" size="icon" className="relative" asChild>
                            <Link href="/wishlist">
                                <Heart className="h-5 w-5" />
                            </Link>
                        </Button>

                        {/* Cart */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="relative"
                            asChild
                        >
                            <Link href="/cart">
                                <ShoppingCart className="h-5 w-5" />
                                {cartItemsCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                        {cartItemsCount}
                                    </span>
                                )}
                            </Link>
                        </Button>

                        {isAuthenticated ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="hidden md:flex items-center gap-2">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={user?.image} alt={user?.name} />
                                            <AvatarFallback>{user?.name?.charAt(0) || 'U'}</AvatarFallback>
                                        </Avatar>
                                        <span>Account</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem asChild>
                                        <Link href="/profile">
                                            <User className="mr-2 h-4 w-4" /> Profile
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link href="/orders">
                                            <Package className="mr-2 h-4 w-4" /> Orders
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link href="/settings">
                                            <Settings className="mr-2 h-4 w-4" /> Settings
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive">
                                        <LogOut className="mr-2 h-4 w-4" /> Logout
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <Button variant="ghost" className="hidden md:flex items-center gap-2" asChild>
                                <Link href="/login">
                                    <User className="h-5 w-5" />
                                    <span>Account</span>
                                </Link>
                            </Button>
                        )}

                        <Button
                            variant="ghost"
                            size="icon"
                            className="md:hidden"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                            <Menu className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="border-t border-border bg-card">
                <div className="container mx-auto px-4">
                    <div className="hidden md:flex items-center gap-1">
                        <Button
                            variant="ghost"
                            className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground rounded-none py-6"
                            asChild
                        >
                            <Link href="/categories">
                                <Menu className="h-5 w-5" />
                                <span>Browse Categories</span>
                                <ChevronDown className="h-4 w-4" />
                            </Link>
                        </Button>
                        {categories.map((category) => (
                            <Button key={category.name} variant="ghost" className="rounded-none py-6" asChild>
                                <Link href={category.path}>{category.name}</Link>
                            </Button>
                        ))}
                    </div>
                </div>
            </nav>

            {/* Mobile menu */}
            {isMenuOpen && (
                <div className="md:hidden bg-card border-t border-border">
                    <div className="container mx-auto px-4 py-4">
                        <div className="mb-4">
                            <Input
                                type="text"
                                placeholder="Cari produk..."
                                className="w-full"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            {categories.map((category) => (
                                <Button
                                    key={category.name}
                                    variant="ghost"
                                    className="justify-start"
                                    asChild
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    <Link href={category.path}>{category.name}</Link>
                                </Button>
                            ))}
                            <Button
                                variant="ghost"
                                className="justify-start"
                                asChild
                                onClick={() => setIsMenuOpen(false)}
                            >
                                <Link href="/wishlist">
                                    <Heart className="h-4 w-4 mr-2" />
                                    Wishlist
                                </Link>
                            </Button>
                            {!isAuthenticated && (
                                <Button
                                    variant="ghost"
                                    className="justify-start"
                                    asChild
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    <Link href="/login">
                                        <User className="h-4 w-4 mr-2" />
                                        Login / Register
                                    </Link>
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </header>
    )
}
