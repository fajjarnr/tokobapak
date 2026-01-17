import { apiClient } from './client'
import { API_ENDPOINTS } from './config'

// Order Status enum
export type OrderStatus =
  | 'pending'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded'

// Payment Status enum
export type PaymentStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'refunded'

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
  status: OrderStatus
  paymentStatus?: PaymentStatus
  totalAmount: number
  createdAt: string
  updatedAt?: string
  shippingAddress: ShippingAddress
  paymentMethod: string
  shippingMethod: string
  trackingNumber?: string
}

// Orders pagination response
export interface OrdersResponse {
  orders: Order[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// Payment types
export interface PaymentRequest {
  orderId: string
  paymentMethod: string
  amount: number
  currency?: string
}

export interface PaymentResponse {
  id: string
  orderId: string
  status: PaymentStatus
  amount: number
  currency: string
  paymentUrl?: string
  transactionId?: string
  createdAt: string
}

export const orderApi = {
  create: async (data: CreateOrderRequest) => {
    return apiClient.post<Order>(API_ENDPOINTS.orders.create, data)
  },
  getAll: async (params?: { page?: number; limit?: number }) => {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.set('page', params.page.toString())
    if (params?.limit) queryParams.set('limit', params.limit.toString())
    const url = queryParams.toString()
      ? `${API_ENDPOINTS.orders.list}?${queryParams.toString()}`
      : API_ENDPOINTS.orders.list
    return apiClient.get<OrdersResponse>(url)
  },
  getById: async (id: string) => {
    return apiClient.get<Order>(API_ENDPOINTS.orders.detail(id))
  },
  cancel: async (id: string) => {
    return apiClient.post<Order>(API_ENDPOINTS.orders.cancel(id))
  }
}

export const paymentApi = {
  initiate: async (data: PaymentRequest) => {
    return apiClient.post<PaymentResponse>('/payments/initiate', data)
  },
  getStatus: async (paymentId: string) => {
    return apiClient.get<PaymentResponse>(`/payments/${paymentId}`)
  },
  confirm: async (paymentId: string, transactionId: string) => {
    return apiClient.post<PaymentResponse>(`/payments/${paymentId}/confirm`, { transactionId })
  }
}
