
'use client'

import { useState } from 'react'
import { ProductCard } from '@/components/product/product-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Filter, SlidersHorizontal, Search } from 'lucide-react'

// Mock Data (Expanded)
const MOCK_PRODUCTS = Array.from({ length: 12 }).map((_, i) => ({
    id: `p-${i + 1}`,
    name: `Product ${i + 1} - High Quality Item`,
    price: Math.floor(Math.random() * 5000000) + 100000,
    originalPrice: Math.random() > 0.5 ? Math.floor(Math.random() * 6000000) + 200000 : undefined,
    rating: (Math.random() * 2) + 3, // 3.0 to 5.0
    image: `https://images.unsplash.com/photo-${[
        '1505740420928-5e560c06d30e',
        '1523275335684-37898b6baf30',
        '1587829741301-dc798b91add1',
        '1542291026-7eec264c27ff',
        '1607082348824-0a96f2a4b9da',
        '1483985988355-763728e1935b'
    ][i % 6]}?q=80&w=600&auto=format&fit=crop`,
    isNew: Math.random() < 0.2,
    discount: Math.random() < 0.3 ? Math.floor(Math.random() * 50) : undefined,
}))

const CATEGORIES = ['Electronics', 'Fashion', 'Home & Living', 'Beauty', 'Sports', 'Toys']
const BRANDS = ['Samsung', 'Apple', 'Nike', 'Adidas', 'Sony', 'LG']

export default function ProductsPage() {
    const [priceRange, setPriceRange] = useState([0, 10000000])

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row gap-8">
                {/* Mobile Filter Sheet */}
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="outline" className="md:hidden mb-4 gap-2">
                            <Filter className="h-4 w-4" /> Filters
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                        <div className="py-4">
                            <h2 className="text-lg font-semibold mb-4">Filters</h2>
                            {/* Mobile Filters Content (Duplicate of Sidebar) */}
                            <div className="space-y-6">
                                {/* Categories */}
                                <div className="space-y-2">
                                    <h3 className="font-medium">Category</h3>
                                    {CATEGORIES.map((cat) => (
                                        <div key={cat} className="flex items-center space-x-2">
                                            <Checkbox id={`m-cat-${cat}`} />
                                            <label htmlFor={`m-cat-${cat}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                                {cat}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                                {/* Price */}
                                <div className="space-y-4">
                                    <h3 className="font-medium">Price Range</h3>
                                    <Slider
                                        defaultValue={[0, 10000000]}
                                        max={10000000}
                                        step={100000}
                                        value={priceRange}
                                        onValueChange={setPriceRange}
                                    />
                                    <div className="flex justify-between text-sm text-muted-foreground">
                                        <span>Rp 0</span>
                                        <span>Rp 10jt+</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </SheetContent>
                </Sheet>

                {/* Sidebar Filters (Desktop) */}
                <aside className="hidden md:block w-64 shrink-0 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold flex items-center gap-2">
                            <SlidersHorizontal className="h-5 w-5" /> Filters
                        </h2>
                        <Button variant="ghost" size="sm" className="text-xs">Reset</Button>
                    </div>

                    <Accordion type="multiple" defaultValue={['category', 'price', 'brand']} className="w-full">
                        <AccordionItem value="category">
                            <AccordionTrigger>Categories</AccordionTrigger>
                            <AccordionContent>
                                <div className="space-y-2 pt-2">
                                    {CATEGORIES.map((cat) => (
                                        <div key={cat} className="flex items-center space-x-2">
                                            <Checkbox id={`cat-${cat}`} />
                                            <label htmlFor={`cat-${cat}`} className="text-sm font-medium leading-none cursor-pointer">
                                                {cat}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="price">
                            <AccordionTrigger>Price</AccordionTrigger>
                            <AccordionContent>
                                <div className="pt-4 px-2">
                                    <Slider
                                        defaultValue={[0, 10000000]}
                                        max={10000000}
                                        step={100000}
                                        value={priceRange}
                                        onValueChange={setPriceRange}
                                        className="mb-4"
                                    />
                                    <div className="flex items-center gap-2">
                                        <Input
                                            type="number"
                                            className="h-8 text-xs"
                                            value={priceRange[0]}
                                            onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                                        />
                                        <span>-</span>
                                        <Input
                                            type="number"
                                            className="h-8 text-xs"
                                            value={priceRange[1]}
                                            onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                                        />
                                    </div>
                                </div>
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="brand">
                            <AccordionTrigger>Brands</AccordionTrigger>
                            <AccordionContent>
                                <div className="space-y-2 pt-2">
                                    {BRANDS.map((brand) => (
                                        <div key={brand} className="flex items-center space-x-2">
                                            <Checkbox id={`brand-${brand}`} />
                                            <label htmlFor={`brand-${brand}`} className="text-sm font-medium leading-none cursor-pointer">
                                                {brand}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </aside>

                {/* Main Content */}
                <div className="flex-1">
                    {/* Top Bar */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                        <p className="text-sm text-muted-foreground block">
                            Showing <strong>12</strong> of <strong>128</strong> products
                        </p>
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <div className="relative w-full sm:w-[200px]">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="Search results..." className="pl-8" />
                            </div>
                            {/* Sort Dropdown (Mock) */}
                            <Button variant="outline" className="shrink-0">Sort by: Featured</Button>
                        </div>
                    </div>

                    {/* Product Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {MOCK_PRODUCTS.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>

                    {/* Pagination (Simple) */}
                    <div className="mt-8 flex justify-center gap-2">
                        <Button variant="outline" disabled>Previous</Button>
                        <Button variant="default">1</Button>
                        <Button variant="outline">2</Button>
                        <Button variant="outline">3</Button>
                        <Button variant="outline">Next</Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
