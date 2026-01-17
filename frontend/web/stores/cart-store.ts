import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface CartItem {
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
    addItem: (item: CartItem) => void
    removeItem: (itemId: string) => void
    updateQuantity: (itemId: string, quantity: number) => void
    clearCart: () => void
    totalPrice: () => number
    totalItems: () => number
}

export const useCartStore = create<CartStore>()(
    persist(
        (set, get) => ({
            items: [],
            addItem: (newItem) => {
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
            },
            removeItem: (itemId) =>
                set({ items: get().items.filter((item) => item.id !== itemId) }),
            updateQuantity: (itemId, quantity) =>
                set({
                    items: get().items.map((item) =>
                        item.id === itemId ? { ...item, quantity } : item
                    ),
                }),
            clearCart: () => set({ items: [] }),
            totalPrice: () =>
                get().items.reduce((total, item) => total + item.price * item.quantity, 0),
            totalItems: () => get().items.reduce((total, item) => total + item.quantity, 0),
        }),
        {
            name: 'cart-storage',
        }
    )
)
