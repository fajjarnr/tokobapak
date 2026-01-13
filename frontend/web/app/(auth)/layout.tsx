
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ChevronLeft } from 'lucide-react'

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-muted/40 flex flex-col items-center justify-center p-4">
            <div className="absolute top-4 left-4 md:top-8 md:left-8">
                <Button variant="ghost" asChild className="gap-2">
                    <Link href="/">
                        <ChevronLeft className="h-4 w-4" />
                        Back to Store
                    </Link>
                </Button>
            </div>
            <div className="w-full max-w-md space-y-8">
                <div className="flex flex-col items-center text-center">
                    <div className="h-12 w-12 bg-primary rounded-xl flex items-center justify-center mb-4">
                        <span className="text-primary-foreground font-bold text-2xl">T</span>
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight">TokoBapak</h1>
                    <p className="text-sm text-muted-foreground mt-2">
                        Belanja kebutuhan keluarga jadi lebih mudah
                    </p>
                </div>
                {children}
            </div>
        </div>
    )
}
