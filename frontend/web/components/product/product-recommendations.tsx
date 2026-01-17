'use client'

import { ProductCard } from '@/components/product/product-card'
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from '@/components/ui/carousel'
import { useSimilarProducts } from '@/hooks/use-products'
import { Skeleton } from '@/components/ui/skeleton'

interface ProductRecommendationsProps {
    currentProductId: string
}

export function ProductRecommendations({ currentProductId }: ProductRecommendationsProps) {
    const { data, isLoading } = useSimilarProducts(currentProductId)
    const products = data?.similar_products

    if (isLoading) {
        return (
             <section className="mt-16 space-y-6">
                <h2 className="text-2xl font-bold">You might also like</h2>
                <div className="flex gap-4 overflow-hidden">
                    {Array.from({ length: 5 }).map((_, i) => (
                         <div key={i} className="basis-1/2 md:basis-1/3 lg:basis-1/5 shrink-0">
                             <div className="space-y-3">
                                <Skeleton className="h-[200px] w-full rounded-xl" />
                                <div className="space-y-1.5">
                                    <Skeleton className="h-4 w-[80%]" />
                                    <Skeleton className="h-4 w-[50%]" />
                                </div>
                            </div>
                         </div>
                    ))}
                </div>
            </section>
        )
    }

    if (!products || products.length === 0) {
        return null
    }

    return (
        <section className="mt-16 space-y-6">
            <h2 className="text-2xl font-bold">You might also like</h2>
            
            <Carousel
                opts={{
                    align: "start",
                }}
                className="w-full"
            >
                <CarouselContent className="-ml-4">
                    {products.map((product) => (
                        <CarouselItem key={product.id} className="pl-4 basis-1/2 md:basis-1/3 lg:basis-1/5">
                            <ProductCard product={product} />
                        </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious className="hidden md:flex -left-4" />
                <CarouselNext className="hidden md:flex -right-4" />
            </Carousel>
        </section>
    )
}
