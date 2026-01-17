'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import { useCartStore } from '@/stores/cart-store'
import { useCart, useUpdateCartItem, useRemoveCartItem } from '@/hooks/use-cart'
import { toast } from 'sonner'

export function useHybridCart() {
    const { isAuthenticated } = useAuthStore()
    const [isMounted, setIsMounted] = useState(false)
    
    // Local Cart State
    const localCart = useCartStore()
    
    // Server Cart State
    const { data: serverCart, isLoading: isServerCartLoading } = useCart()
    const updateCartItemMutation = useUpdateCartItem()
    const removeCartItemMutation = useRemoveCartItem()

    useEffect(() => {
        setIsMounted(true)
    }, [])

    // Combined Items Logic
    // We return empty array until mounted to prevent hydration mismatch (server vs client local storage)
    const items = isMounted
        ? (isAuthenticated ? (serverCart?.items || []) : localCart.items)
        : []

    const totalPrice = isMounted
        ? (isAuthenticated ? (serverCart?.totalPrice || 0) : localCart.totalPrice())
        : 0

    const totalItems = isMounted
        ? (isAuthenticated ? (serverCart?.totalItems || 0) : localCart.totalItems())
        : 0

    const updateQuantity = (itemId: string, newQuantity: number) => {
        if (newQuantity < 1) return

        if (isAuthenticated) {
            updateCartItemMutation.mutate({ itemId, data: { quantity: newQuantity } }, {
                onError: () => toast.error("Failed to update cart")
            })
        } else {
            localCart.updateQuantity(itemId, newQuantity)
        }
    }

    const removeItem = (itemId: string) => {
        if (isAuthenticated) {
            removeCartItemMutation.mutate(itemId, {
                onSuccess: () => toast.success("Item removed"),
                onError: () => toast.error("Failed to remove item")
            })
        } else {
            localCart.removeItem(itemId)
            toast.success("Item removed")
        }
    }

    return {
        items,
        totalPrice,
        totalItems,
        updateQuantity,
        removeItem,
        isAuthenticated,
        // Show loading if server cart is loading OR if not mounted yet (hydration)
        isLoading: (isAuthenticated && isServerCartLoading) || !isMounted,
        isUpdating: updateCartItemMutation.isPending || removeCartItemMutation.isPending
    }
}
