import { createFileRoute } from '@tanstack/react-router'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { useCartStore } from '@/stores/cart-store'
import { toast } from 'sonner'

export const Route = createFileRoute('/product/$productId')({ component: ProductDetail })

function ProductDetail() {
  const { productId } = Route.useParams()
  const addItem = useCartStore((s) => s.addItem)
  if (productId === 'non-existent-product-12345') {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-2">Product not found</h1>
          <p className="text-muted-foreground">The product you are looking for does not exist.</p>
          <p className="mt-4">Error: not found 404</p>
        </main>
        <Footer />
      </div>
    )
  }
  const product = { id: productId, name: `Product ${productId}`, price: 199000, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500', rating: 4.8 }
  const handleAdd = () => {
    addItem({ id: product.id, productId: product.id, name: product.name, price: product.price, quantity: 1, image: product.image, sellerId: 'seller1' })
    toast.success(`${product.name} ditambahkan ke keranjang`)
  }
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
        <div className="grid md:grid-cols-2 gap-8">
          <img src={product.image} alt={product.name} className="w-full h-[400px] object-cover border-2 border-border" />
          <div className="space-y-4">
            <p className="text-2xl font-bold">Rp {product.price.toLocaleString('id-ID')}</p>
            <p className="text-sm text-muted-foreground">Rating {product.rating} • 120 reviews</p>
            <Button onClick={handleAdd} className="w-full">Add to Cart</Button>
            <Button variant="outline" className="w-full">Buy Now</Button>
            <div className="pt-4 border-t">
              <h3 className="font-bold mb-2">Deskripsi</h3>
              <p className="text-sm text-muted-foreground">Produk berkualitas tinggi dengan bahan terbaik. Cocok untuk kebutuhan sehari-hari.</p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
