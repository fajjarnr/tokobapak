'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Mail, Send, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'

export function NewsletterSection() {
    const [email, setEmail] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSubscribed, setIsSubscribed] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!email || !email.includes('@')) {
            toast.error('Masukkan email yang valid')
            return
        }

        setIsSubmitting(true)

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))

        setIsSubscribed(true)
        setIsSubmitting(false)
        toast.success('Terima kasih! Anda berhasil berlangganan newsletter.')
    }

    return (
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 right-0 w-60 h-60 bg-white rounded-full translate-x-1/3 translate-y-1/3" />
                <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
            </div>

            <div className="relative px-6 py-12 md:px-12 md:py-16 text-center text-white">
                {/* Icon */}
                <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur rounded-full mb-6">
                    <Mail className="h-8 w-8" />
                </div>

                {/* Title */}
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                    Jangan Lewatkan Promo Menarik!
                </h2>
                <p className="text-white/80 mb-8 max-w-xl mx-auto">
                    Daftar newsletter kami dan dapatkan penawaran eksklusif, diskon khusus, serta info produk terbaru langsung ke inbox Anda.
                </p>

                {/* Form */}
                {isSubscribed ? (
                    <div className="flex items-center justify-center gap-3 bg-white/20 backdrop-blur rounded-full px-6 py-4 max-w-md mx-auto">
                        <CheckCircle className="h-6 w-6 text-emerald-300" />
                        <span className="font-medium">Anda sudah berlangganan!</span>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                        <div className="relative flex-1">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <Input
                                type="email"
                                placeholder="Masukkan email Anda"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="pl-10 h-12 bg-white text-gray-900 border-0 focus-visible:ring-2 focus-visible:ring-white"
                                disabled={isSubmitting}
                            />
                        </div>
                        <Button
                            type="submit"
                            size="lg"
                            className="h-12 px-8 bg-white text-purple-600 hover:bg-white/90 font-semibold gap-2"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <div className="h-5 w-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Send className="h-4 w-4" />
                                    Subscribe
                                </>
                            )}
                        </Button>
                    </form>
                )}

                {/* Privacy Note */}
                <p className="text-white/60 text-xs mt-4">
                    Kami menghargai privasi Anda. Baca <a href="/privacy" className="underline hover:text-white">Kebijakan Privasi</a> kami.
                </p>
            </div>
        </section>
    )
}
