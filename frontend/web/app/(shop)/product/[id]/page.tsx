import { Metadata } from 'next'
import { productApi } from '@/lib/api'
import { ProductDetailView } from '@/components/product/product-detail-view'

type Props = {
    params: Promise<{ id: string }>
}

export async function generateMetadata(
    { params }: Props
): Promise<Metadata> {
    const id = (await params).id
    const product = await productApi.getProduct(id)

    return {
        title: `${product.name} - TokoBapak`,
        description: product.description.substring(0, 160),
        openGraph: {
            title: product.name,
            description: product.description.substring(0, 160),
            images: product.images,
        },
    }
}

export default async function ProductPage({ params }: Props) {
    const id = (await params).id
    
    // Fetch data on server for SEO and hydration
    const product = await productApi.getProduct(id)

    // Render Client Component
    return <ProductDetailView id={id} initialData={product} />
}
