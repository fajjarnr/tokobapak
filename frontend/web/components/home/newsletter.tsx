'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

export function Newsletter() {
    const [email, setEmail] = useState('')

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (email) {
            toast.success('Terima kasih sudah berlangganan!')
            setEmail('')
        }
    }

    return (
        <section className="py-12 bg-primary text-primary-foreground">
            <div className="container mx-auto px-4">
                <div className="max-w-2xl mx-auto text-center">
                    <h2 className="text-2xl md:text-3xl font-bold mb-4">
                        Berlangganan Newsletter Kami
                    </h2>
                    <p className="text-primary-foreground/80 mb-6">
                        Dapatkan update terbaru tentang produk baru dan penawaran eksklusif langsung ke inbox Anda.
                    </p>
                    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                        <Input
                            type="email"
                            placeholder="Masukkan email Anda"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="flex-1 bg-primary-foreground text-foreground border-none"
                            required
                        />
                        <Button type="submit" variant="secondary" className="px-8">
                            Berlangganan
                        </Button>
                    </form>
                </div>
            </div>
        </section>
    )
}
