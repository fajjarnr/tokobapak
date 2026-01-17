import { apiClient } from './client'
import { API_ENDPOINTS } from './config'

export interface OrderItem {
  productId: string
  quantity: number
  price: number
  name: string
  image: string
}

export interface ShippingAddress {
  firstName: string
  lastName: string
  address: string
  city: string
  postalCode: string
  phone: string
}

export interface CreateOrderRequest {
  items: OrderItem[]
  shippingAddress: ShippingAddress
  shippingMethod: string
  paymentMethod: string
  totalAmount: number
}

export interface Order {
  id: string
  userId: string
  items: OrderItem[]
  status: string
  totalAmount: number
  createdAt: string
  shippingAddress: ShippingAddress
  paymentMethod: string
  shippingMethod: string
  trackingNumber?: string
}

export const orderApi = {
  create: async (data: CreateOrderRequest) => {
    return apiClient.post<Order>(API_ENDPOINTS.orders.create, data)
  },
  getAll: async () => {
    return apiClient.get<Order[]>(API_ENDPOINTS.orders.list)
  },
  getById: async (id: string) => {
    return apiClient.get<Order>(API_ENDPOINTS.orders.detail(id))
  },
  cancel: async (id: string) => {
    return apiClient.post<Order>(API_ENDPOINTS.orders.cancel(id))
  }
}
