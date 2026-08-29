import { createFileRoute } from '@tanstack/react-router'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'

export const Route = createFileRoute('/categories/')({ component: Categories })

function Categories() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Categories</h1>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {['Electronics', 'Fashion', 'Furniture', 'Books'].map((c) => (
            <a key={c} href={`/products?category=${c.toLowerCase()}`} className="p-8 border-2 border-border shadow-sm bg-card text-center font-bold hover:bg-accent">
              {c}
            </a>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  )
}
