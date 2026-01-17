'use client';

import { useProducts } from '@/hooks/use-products';
import { ProductCard } from '@/components/product/product-card';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function FeaturedProductsSection() {
    const { data, isLoading } = useProducts({ page: 1, pageSize: 8 });

    if (isLoading) {
        return (
            <section>
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <Skeleton className="h-8 w-48 mb-2" />
                        <Skeleton className="h-4 w-32" />
                    </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="space-y-4">
                            <Skeleton className="h-[250px] w-full rounded-xl" />
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-[80%]" />
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        );
    }

    if (!data?.data?.length) return null;

    return (
        <section>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold">Produk Unggulan</h2>
                    <p className="text-sm text-muted-foreground">Pilihan terbaik untuk Anda</p>
                </div>
                <Button variant="link" asChild>
                    <Link href="/products">Lihat Semua</Link>
                </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {data.data.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </section>
    );
}
