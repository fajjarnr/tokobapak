import { createFileRoute } from '@tanstack/react-router'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'

export const Route = createFileRoute('/help/')({ component: Page })

function Page() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold mb-4">Pusat Bantuan</h1>
          <p className="text-lg text-muted-foreground mb-8">Pusat bantuan lengkap untuk pembeli dan penjual. Cari topik atau hubungi CS.</p>
          <div className="p-8 border-2 border-border shadow-sm bg-card">
            <p className="text-sm text-muted-foreground">Halaman ini adalah placeholder MVP. Konten lengkap akan segera hadir. Hubungi CS jika butuh bantuan segera.</p>
            <div className="mt-6 flex gap-4">
              <a href="/" className="inline-flex h-10 px-6 items-center justify-center bg-primary text-primary-foreground font-medium">Kembali ke Beranda</a>
              <a href="/products" className="inline-flex h-10 px-6 items-center justify-center border-2 border-border font-medium">Jelajahi Produk</a>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
