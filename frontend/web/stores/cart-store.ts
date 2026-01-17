import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { toast } from 'sonner'
import { cartApi } from '@/lib/api/cart'
import { useAuthStore } from './auth-store'

export interface CartItem {
    id: string
    productId: string
    name: string
    price: number
    quantity: number
    image: string
    variant?: string
    sellerId?: string
    stock?: number
}

interface CartStore {
    items: CartItem[]
    isLoading: boolean
    addItem: (item: CartItem) => Promise<void>
    removeItem: (itemId: string) => Promise<void>
    updateQuantity: (itemId: string, quantity: number) => Promise<void>
    clearCart: () => Promise<void>
    fetchCart: () => Promise<void>
    totalPrice: () => number
    totalItems: () => number
}

export const useCartStore = create<CartStore>()(
    persist(
        (set, get) => ({
            items: [],
            isLoading: false,

            fetchCart: async () => {
                const { isAuthenticated } = useAuthStore.getState()
                if (!isAuthenticated) return

                set({ isLoading: true })
                try {
                    const cart = await cartApi.getCart()
                    set({ items: cart.items as CartItem[] })
                } catch (error) {
                    console.error('Failed to fetch cart:', error)
                } finally {
                    set({ isLoading: false })
                }
            },

            addItem: async (newItem) => {
                const { isAuthenticated } = useAuthStore.getState()

                if (isAuthenticated) {
                    set({ isLoading: true })
                    try {
                        const cart = await cartApi.addItem({
                            productId: newItem.productId || newItem.id, // Fallback if id is productId
                            quantity: newItem.quantity,
                            variantId: newItem.variant,
                        })
                        set({ items: cart.items as CartItem[] })
                        toast.success('Added to cart')
                    } catch (error) {
                        console.error('Add to cart error:', error)
                        toast.error('Failed to add to cart')
                    } finally {
                        set({ isLoading: false })
                    }
                } else {
                    const items = get().items
                    const existingItem = items.find((item) => item.id === newItem.id)

                    if (existingItem) {
                        set({
                            items: items.map((item) =>
                                item.id === newItem.id
                                    ? { ...item, quantity: item.quantity + newItem.quantity }
                                    : item
                            ),
                        })
                    } else {
                        set({ items: [...items, newItem] })
                    }
                    toast.success('Added to cart')
                }
            },

            removeItem: async (itemId) => {
                const { isAuthenticated } = useAuthStore.getState()

                if (isAuthenticated) {
                    set({ isLoading: true })
                    try {
                        const cart = await cartApi.removeItem(itemId)
                        set({ items: cart.items as CartItem[] })
                        toast.success('Removed from cart')
                    } catch (error) {
                        console.error('Remove item error:', error)
                        toast.error('Failed to remove item')
                    } finally {
                        set({ isLoading: false })
                    }
                } else {
                    set({ items: get().items.filter((item) => item.id !== itemId) })
                    toast.success('Removed from cart')
                }
            },

            updateQuantity: async (itemId, quantity) => {
                const { isAuthenticated } = useAuthStore.getState()

                if (quantity <= 0) {
                    return get().removeItem(itemId)
                }

                if (isAuthenticated) {
                    try {
                        const cart = await cartApi.updateItem(itemId, { quantity })
                        set({ items: cart.items as CartItem[] })
                    } catch (error) {
                        console.error('Update quantity error:', error)
                        toast.error('Failed to update quantity')
                    }
                } else {
                    set({
                        items: get().items.map((item) =>
                            item.id === itemId ? { ...item, quantity } : item
                        ),
                    })
                }
            },

            clearCart: async () => {
                const { isAuthenticated } = useAuthStore.getState()
                if (isAuthenticated) {
                    try {
                        await cartApi.clearCart()
                        set({ items: [] })
                    } catch (error) {
                        console.error('Clear cart error:', error)
                    }
                } else {
                    set({ items: [] })
                }
            },

            totalPrice: () =>
                get().items.reduce((total, item) => total + item.price * item.quantity, 0),

            totalItems: () => get().items.reduce((total, item) => total + item.quantity, 0),
        }),
        {
            name: 'cart-storage',
            partialize: (state) => ({ items: state.items }),
        }
    )
)
