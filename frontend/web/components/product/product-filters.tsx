'use client'


import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion'
import { SlidersHorizontal } from 'lucide-react'

const CATEGORIES = ['Electronics', 'Fashion', 'Home & Living', 'Beauty', 'Sports', 'Toys']
const BRANDS = ['Samsung', 'Apple', 'Nike', 'Adidas', 'Sony', 'LG']

interface ProductFiltersProps {
    priceRange: number[]
    setPriceRange: (range: number[]) => void
    selectedCategories: string[]
    setSelectedCategories: (categories: string[]) => void
    selectedBrands: string[]
    setSelectedBrands: (brands: string[]) => void
    onReset: () => void
    className?: string
}

export function ProductFilters({
    priceRange,
    setPriceRange,
    selectedCategories,
    setSelectedCategories,
    selectedBrands,
    setSelectedBrands,
    onReset,
    className
}: ProductFiltersProps) {

    const toggleCategory = (cat: string) => {
        if (selectedCategories.includes(cat)) {
            setSelectedCategories(selectedCategories.filter(c => c !== cat))
        } else {
            setSelectedCategories([...selectedCategories, cat])
        }
    }

    const toggleBrand = (brand: string) => {
        if (selectedBrands.includes(brand)) {
            setSelectedBrands(selectedBrands.filter(b => b !== brand))
        } else {
            setSelectedBrands([...selectedBrands, brand])
        }
    }

    return (
        <aside className={`w-full md:w-64 shrink-0 space-y-6 ${className}`}>
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                    <SlidersHorizontal className="h-5 w-5" /> Filters
                </h2>
                <Button variant="ghost" size="sm" className="text-xs" onClick={onReset}>
                    Reset
                </Button>
            </div>

            <Accordion type="multiple" defaultValue={['category', 'price', 'brand']} className="w-full">
                <AccordionItem value="category">
                    <AccordionTrigger>Categories</AccordionTrigger>
                    <AccordionContent>
                        <div className="space-y-2 pt-2">
                            {CATEGORIES.map((cat) => (
                                <div key={cat} className="flex items-center space-x-2">
                                    <Checkbox 
                                        id={`cat-${cat}`} 
                                        checked={selectedCategories.includes(cat)}
                                        onCheckedChange={() => toggleCategory(cat)}
                                    />
                                    <label htmlFor={`cat-${cat}`} className="text-sm font-medium leading-none cursor-pointer select-none">
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
                                    <Checkbox 
                                        id={`brand-${brand}`} 
                                        checked={selectedBrands.includes(brand)}
                                        onCheckedChange={() => toggleBrand(brand)}
                                    />
                                    <label htmlFor={`brand-${brand}`} className="text-sm font-medium leading-none cursor-pointer select-none">
                                        {brand}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </aside>
    )
}
