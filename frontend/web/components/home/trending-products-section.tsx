'use client';

import { useTrendingProducts } from '@/hooks/use-products';
import { ProductCard } from '@/components/product/product-card';
import { Skeleton } from '@/components/ui/skeleton';

export function TrendingProductsSection() {
    const { data: trendingData, isLoading } = useTrendingProducts(4);

    if (isLoading) {
        return <Skeleton className="h-64 w-full rounded-xl" />;
    }

    const products = trendingData?.trending;

    if (!products?.length) return null;

    return (
        <section>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold">Sedang Tren</h2>
                    <p className="text-sm text-muted-foreground">Produk paling banyak dicari saat ini</p>
                </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </section>
    );
}
