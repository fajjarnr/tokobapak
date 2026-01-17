'use client'

import { useState } from 'react'
import { ProductCard } from '@/components/product/product-card'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Filter } from 'lucide-react'
import { ProductFilters } from '@/components/product/product-filters'
import { ProductSort } from '@/components/product/product-sort'
import { ProductPagination } from '@/components/product/product-pagination'
import { useProducts } from '@/hooks/use-products'
import { Skeleton } from '@/components/ui/skeleton'

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

    // API Query
    const { data, isLoading } = useProducts({
        page: currentPage,
        pageSize: itemsPerPage,
        minPrice: priceRange[0],
        maxPrice: priceRange[1],
        category: selectedCategories.length > 0 ? selectedCategories[0] : undefined, // Currently API only calls for single category, need update for multi
        query: searchQuery,
        sort: sortBy
    })

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
                        totalProducts={data?.total || 0}
                        shownProducts={data?.data?.length || 0}
                        viewMode={viewMode}
                        setViewMode={setViewMode}
                        sortBy={sortBy}
                        setSortBy={setSortBy}
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                    />

                    {/* Product Grid */}
                    {isLoading ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <div key={i} className="space-y-4">
                                    <Skeleton className="h-[300px] w-full rounded-xl" />
                                    <Skeleton className="h-4 w-3/4" />
                                    <Skeleton className="h-4 w-1/2" />
                                </div>
                            ))}
                        </div>
                    ) : data?.data && data.data.length > 0 ? (
                        <div className={`grid gap-6 ${
                            viewMode === 'grid' 
                                ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4' 
                                : 'grid-cols-1'
                        }`}>
                            {data.data.map((product) => (
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
                    {data && (
                        <ProductPagination 
                            currentPage={currentPage}
                            totalPages={Math.ceil(data.total / itemsPerPage)}
                            onPageChange={setCurrentPage}
                        />
                    )}
                </div>
            </div>
        </div>
    )
}

