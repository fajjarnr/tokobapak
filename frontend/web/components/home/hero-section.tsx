'use client'

import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export function HeroSection() {
    return (
        <section className="py-6">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Main banner */}
                    <div className="lg:col-span-2 relative overflow-hidden h-[300px] md:h-[400px] border border-border">
                        <Image
                            src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1200&h=600&fit=crop"
                            alt="Best Furniture Collection"
                            fill
                            className="object-cover"
                            priority
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-foreground/70 to-transparent" />
                        <div className="relative h-full flex flex-col justify-center p-6 md:p-10 text-card max-w-md">
                            <span className="text-sm font-medium bg-primary text-primary-foreground px-3 py-1 w-fit mb-4">
                                Diskon s/d 50%
                            </span>
                            <h1 className="text-3xl md:text-4xl font-bold mb-3">
                                Koleksi Furniture Terbaik
                            </h1>
                            <p className="text-card/80 mb-6">
                                Tingkatkan ruang hidup Anda dengan koleksi premium furniture modern kami.
                            </p>
                            <Button className="w-fit group" asChild>
                                <Link href="/categories?category=furniture">
                                    Belanja Sekarang
                                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </Button>
                        </div>
                    </div>

                    {/* Side banners */}
                    <div className="flex flex-col gap-4">
                        <div className="relative overflow-hidden h-[190px] flex-1 border border-border">
                            <Image
                                src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&h=400&fit=crop"
                                alt="Stylish Fashion"
                                fill
                                className="object-cover object-top"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
                            <div className="relative h-full flex flex-col justify-end p-4 text-card">
                                <span className="text-xs font-medium text-accent-foreground bg-accent px-2 py-1 w-fit mb-2">
                                    Super Sale 70%
                                </span>
                                <h3 className="text-xl font-bold">Fashion Pria Stylish</h3>
                            </div>
                        </div>

                        <div className="relative overflow-hidden h-[190px] flex-1 bg-accent border border-border">
                            <div className="relative h-full flex flex-col justify-center p-6">
                                <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 w-fit mb-2">
                                    Musim Baru
                                </span>
                                <h3 className="text-xl font-bold text-foreground mb-2">
                                    Tampilan Stylish Untuk Setiap Musim
                                </h3>
                                <Button variant="outline" size="sm" className="w-fit" asChild>
                                    <Link href="/products">
                                        Belanja Sekarang
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
