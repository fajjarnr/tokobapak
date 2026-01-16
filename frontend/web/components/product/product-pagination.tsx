import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'

interface ProductPaginationProps {
    currentPage: number
    totalPages: number
    onPageChange: (page: number) => void
}

export function ProductPagination({
    currentPage,
    totalPages,
    onPageChange
}: ProductPaginationProps) {
    // Generate page numbers to display
    const getPageNumbers = () => {
        const pages = []
        const showMax = 5
        let start = Math.max(1, currentPage - 2)
        const end = Math.min(totalPages, start + showMax - 1)
        
        if (end - start + 1 < showMax) {
            start = Math.max(1, end - showMax + 1)
        }

        for (let i = start; i <= end; i++) {
            pages.push(i)
        }
        return pages
    }

    if (totalPages <= 1) return null

    return (
        <div className="mt-8 flex justify-center gap-2 items-center">
            <Button 
                variant="outline" 
                size="icon"
                disabled={currentPage === 1}
                onClick={() => onPageChange(1)}
                className="hidden sm:flex"
            >
                <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button 
                variant="outline" 
                size="icon"
                disabled={currentPage === 1}
                onClick={() => onPageChange(currentPage - 1)}
            >
                <ChevronLeft className="h-4 w-4" />
            </Button>

            {getPageNumbers().map((page) => (
                <Button
                    key={page}
                    variant={currentPage === page ? 'default' : 'outline'}
                    onClick={() => onPageChange(page)}
                    className="min-w-[40px]"
                >
                    {page}
                </Button>
            ))}

            <Button 
                variant="outline" 
                size="icon"
                disabled={currentPage === totalPages}
                onClick={() => onPageChange(currentPage + 1)}
            >
                <ChevronRight className="h-4 w-4" />
            </Button>
            <Button 
                variant="outline" 
                size="icon"
                disabled={currentPage === totalPages}
                onClick={() => onPageChange(totalPages)}
                className="hidden sm:flex"
            >
                <ChevronsRight className="h-4 w-4" />
            </Button>
        </div>
    )
}
