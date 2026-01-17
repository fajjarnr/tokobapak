'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Product } from '@/lib/api/products'

interface WishlistItem {
    id: string
    productId: string
    name: string
    slug: string
    price: number
    image: string
    addedAt: string
}

interface WishlistState {
    items: WishlistItem[]
    addItem: (product: Product) => void
    removeItem: (productId: string) => void
    isInWishlist: (productId: string) => boolean
    clearWishlist: () => void
    getItemCount: () => number
}

export const useWishlistStore = create<WishlistState>()(
    persist(
        (set, get) => ({
            items: [],

            addItem: (product: Product) => {
                const { items } = get()
                const exists = items.some(item => item.productId === product.id)

                if (!exists) {
                    const newItem: WishlistItem = {
                        id: `wishlist-${product.id}`,
                        productId: product.id,
                        name: product.name,
                        slug: product.slug,
                        price: typeof product.price === 'string' ? parseFloat(product.price) : product.price,
                        image: product.images?.[0] || '/placeholder.jpg',
                        addedAt: new Date().toISOString(),
                    }
                    set({ items: [...items, newItem] })
                }
            },

            removeItem: (productId: string) => {
                const { items } = get()
                set({ items: items.filter(item => item.productId !== productId) })
            },

            isInWishlist: (productId: string) => {
                return get().items.some(item => item.productId === productId)
            },

            clearWishlist: () => {
                set({ items: [] })
            },

            getItemCount: () => {
                return get().items.length
            },
        }),
        {
            name: 'wishlist-storage',
        }
    )
)
