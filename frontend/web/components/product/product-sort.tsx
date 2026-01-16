'use client'

import { Button } from '@/components/ui/button'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Search, LayoutGrid, List } from 'lucide-react'

interface ProductSortProps {
    totalProducts: number
    shownProducts: number
    viewMode: 'grid' | 'list'
    setViewMode: (mode: 'grid' | 'list') => void
    sortBy: string
    setSortBy: (sort: string) => void
    searchQuery: string
    setSearchQuery: (query: string) => void
}

export function ProductSort({
    totalProducts,
    shownProducts,
    viewMode,
    setViewMode,
    sortBy,
    setSortBy,
    searchQuery,
    setSearchQuery
}: ProductSortProps) {
    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <p className="text-sm text-muted-foreground block">
                Showing <strong>{shownProducts}</strong> of <strong>{totalProducts}</strong> products
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
                <div className="relative w-full sm:w-[200px]">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder="Search results..." 
                        className="pl-8" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                
                <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                    <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="featured">Featured</SelectItem>
                            <SelectItem value="newest">Newest Arrivals</SelectItem>
                            <SelectItem value="price-low">Price: Low to High</SelectItem>
                            <SelectItem value="price-high">Price: High to Low</SelectItem>
                            <SelectItem value="rating">Best Rating</SelectItem>
                        </SelectContent>
                    </Select>

                    <div className="flex gap-1 border rounded-lg p-1">
                        <Button 
                            variant={viewMode === 'grid' ? 'secondary' : 'ghost'} 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => setViewMode('grid')}
                        >
                            <LayoutGrid className="h-4 w-4" />
                        </Button>
                        <Button 
                            variant={viewMode === 'list' ? 'secondary' : 'ghost'} 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => setViewMode('list')}
                        >
                            <List className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
