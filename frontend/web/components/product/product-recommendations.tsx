'use client'

import { ProductCard } from '@/components/product/product-card'
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from '@/components/ui/carousel'

// Mock Recommendations Data
const RECOMMENDED_PRODUCTS = [
    {
        id: 'r-1',
        name: 'Wireless Charging Pad',
        price: 499000,
        rating: 4.5,
        image: 'https://images.unsplash.com/photo-1615526675159-e248c3021d3f?q=80&w=500&auto=format&fit=crop',
    },
    {
        id: 'r-2',
        name: 'USB-C Fast Charger 65W',
        price: 399000,
        rating: 4.8,
        image: 'https://images.unsplash.com/photo-1591543620767-582b2eec0f97?q=80&w=500&auto=format&fit=crop',
        discount: 10,
    },
    {
        id: 'r-3',
        name: 'Premium Leather Case',
        price: 299000,
        originalPrice: 399000,
        rating: 4.6,
        image: 'https://images.unsplash.com/photo-1603351154351-5cfb3d04ef30?q=80&w=500&auto=format&fit=crop',
        discount: 25,
    },
    {
        id: 'r-4',
        name: 'Screen Protector Glass',
        price: 99000,
        rating: 4.3,
        image: 'https://images.unsplash.com/photo-1592679261230-e883a96041a9?q=80&w=500&auto=format&fit=crop',
    },
    {
        id: 'r-5',
        name: 'Bluetooth Speaker',
        price: 799000,
        rating: 4.7,
        image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?q=80&w=500&auto=format&fit=crop',
    },
]

export function ProductRecommendations() {
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
                    {RECOMMENDED_PRODUCTS.map((product) => (
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
