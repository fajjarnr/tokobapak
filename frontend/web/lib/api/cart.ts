import { apiClient } from './client';
import { API_ENDPOINTS } from './config';

// Types
export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  variant?: string;
  sellerId: string;
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  totalPrice: number;
  totalItems: number;
  updatedAt: string;
}

export interface AddToCartRequest {
  productId: string;
  quantity: number;
  variantId?: string;
}

export interface UpdateCartItemRequest {
  quantity: number;
}

// Cart API
export const cartApi = {
  getCart: async (): Promise<Cart> => {
    return apiClient.get<Cart>(API_ENDPOINTS.cart.get);
  },

  addItem: async (data: AddToCartRequest): Promise<Cart> => {
    return apiClient.post<Cart>(API_ENDPOINTS.cart.add, data);
  },

  updateItem: async (itemId: string, data: UpdateCartItemRequest): Promise<Cart> => {
    return apiClient.patch<Cart>(API_ENDPOINTS.cart.update(itemId), data);
  },

  removeItem: async (itemId: string): Promise<Cart> => {
    return apiClient.delete<Cart>(API_ENDPOINTS.cart.remove(itemId));
  },

  clearCart: async (): Promise<void> => {
    return apiClient.delete(API_ENDPOINTS.cart.clear);
  },
};
