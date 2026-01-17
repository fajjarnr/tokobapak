import { Suspense } from 'react'
import ProductsContent from '@/components/product/products-content'
import { Skeleton } from '@/components/ui/skeleton'

export default function ProductsPage() {
    return (
        <div className="container mx-auto px-4 py-8">
            <Suspense fallback={<ProductPageSkeleton />}>
                <ProductsContent />
            </Suspense>
        </div>
    )
}

function ProductPageSkeleton() {
    return (
        <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar Skeleton */}
            <div className="hidden md:block w-64 space-y-6">
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-40 w-full" />
            </div>

            {/* Main Content Skeleton */}
            <div className="flex-1 space-y-6">
                <div className="flex justify-between items-center">
                    <Skeleton className="h-10 w-48" />
                    <Skeleton className="h-10 w-32" />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="space-y-4">
                            <Skeleton className="h-[300px] w-full rounded-xl" />
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
