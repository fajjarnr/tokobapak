'use client'

import { useState, useMemo } from 'react'
import { ProductCard } from '@/components/product/product-card'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Filter } from 'lucide-react'
import { ProductFilters } from '@/components/product/product-filters'
import { ProductSort } from '@/components/product/product-sort'
import { ProductPagination } from '@/components/product/product-pagination'

// Mock Data Generator
const generateMockProducts = (count: number) => {
    const categories = ['Electronics', 'Fashion', 'Home & Living', 'Beauty', 'Sports', 'Toys']
    const brands = ['Samsung', 'Apple', 'Nike', 'Adidas', 'Sony', 'LG']
    
    return Array.from({ length: count }).map((_, i) => {
        const category = categories[i % categories.length]
        const brand = brands[i % brands.length]
        const price = Math.floor(Math.random() * 5000000) + 100000
        
        return {
            id: `p-${i + 1}`,
            name: `${brand} Product ${i + 1} - ${category}`,
            price: price,
            originalPrice: Math.random() > 0.5 ? Math.floor(price * 1.2) : undefined,
            rating: (Math.random() * 2) + 3, // 3.0 to 5.0
            image: `https://images.unsplash.com/photo-${[
                '1505740420928-5e560c06d30e',
                '1523275335684-37898b6baf30',
                '1587829741301-dc798b91add1',
                '1542291026-7eec264c27ff',
                '1607082348824-0a96f2a4b9da',
                '1483985988355-763728e1935b'
            ][i % 6]}?q=80&w=600&auto=format&fit=crop`,
            category,
            brand,
            isNew: Math.random() < 0.2,
            discount: Math.random() < 0.3 ? Math.floor(Math.random() * 50) : undefined,
            date: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toISOString()
        }
    })
}

// Fixed mock data for client-side consistency
const MOCK_PRODUCTS = generateMockProducts(100)

export default function ProductsPage() {
    // Filter State
    const [priceRange, setPriceRange] = useState([0, 10000000])
    const [selectedCategories, setSelectedCategories] = useState<string[]>([])
    const [selectedBrands, setSelectedBrands] = useState<string[]>([])
    
    // Sort & View State
    const [sortBy, setSortBy] = useState('featured')
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
    const [searchQuery, setSearchQuery] = useState('')
    
    // Pagination State
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 12

    // Filter Logic
    const filteredProducts = useMemo(() => {
        return MOCK_PRODUCTS.filter(product => {
            // Price Filter
            if (product.price < priceRange[0] || product.price > priceRange[1]) return false
            
            // Category Filter
            if (selectedCategories.length > 0 && !selectedCategories.includes(product.category)) return false
            
            // Brand Filter
            if (selectedBrands.length > 0 && !selectedBrands.includes(product.brand)) return false
            
            // Search Filter
            if (searchQuery && !product.name.toLowerCase().includes(searchQuery.toLowerCase())) return false
            
            return true
        }).sort((a, b) => {
            // Sort Logic
            switch (sortBy) {
                case 'price-low': return a.price - b.price
                case 'price-high': return b.price - a.price
                case 'rating': return b.rating - a.rating
                case 'newest': return new Date(b.date).getTime() - new Date(a.date).getTime()
                default: return 0 // Featured (id order)
            }
        })
    }, [priceRange, selectedCategories, selectedBrands, searchQuery, sortBy])

    // Pagination Logic
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)
    const displayedProducts = filteredProducts.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    )

    const handleResetFilters = () => {
        setPriceRange([0, 10000000])
        setSelectedCategories([])
        setSelectedBrands([])
        setSearchQuery('')
        setCurrentPage(1)
    }

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
                    <SheetContent side="left" className="w-[300px] overflow-y-auto">
                        <div className="py-4">
                            <ProductFilters 
                                priceRange={priceRange}
                                setPriceRange={setPriceRange}
                                selectedCategories={selectedCategories}
                                setSelectedCategories={setSelectedCategories}
                                selectedBrands={selectedBrands}
                                setSelectedBrands={setSelectedBrands}
                                onReset={handleResetFilters}
                            />
                        </div>
                    </SheetContent>
                </Sheet>

                {/* Sidebar Filters (Desktop) */}
                <div className="hidden md:block">
                    <ProductFilters 
                        priceRange={priceRange}
                        setPriceRange={setPriceRange}
                        selectedCategories={selectedCategories}
                        setSelectedCategories={setSelectedCategories}
                        selectedBrands={selectedBrands}
                        setSelectedBrands={setSelectedBrands}
                        onReset={handleResetFilters}
                    />
                </div>

                {/* Main Content */}
                <div className="flex-1">
                    <ProductSort 
                        totalProducts={filteredProducts.length}
                        shownProducts={displayedProducts.length}
                        viewMode={viewMode}
                        setViewMode={setViewMode}
                        sortBy={sortBy}
                        setSortBy={setSortBy}
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                    />

                    {/* Product Grid */}
                    {displayedProducts.length > 0 ? (
                        <div className={`grid gap-6 ${
                            viewMode === 'grid' 
                                ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4' 
                                : 'grid-cols-1'
                        }`}>
                            {displayedProducts.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 text-muted-foreground">
                            <p className="text-lg">No products found.</p>
                            <Button variant="link" onClick={handleResetFilters}>Clear Filters</Button>
                        </div>
                    )}

                    {/* Pagination */}
                    <ProductPagination 
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                </div>
            </div>
        </div>
    )
}
