import { apiClient } from './client';
import { API_ENDPOINTS } from './config';

// Types
export interface OrderItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  variant?: string;
}

export interface ShippingAddress {
  name: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  shippingMethod: string;
  shippingCost: number;
  subtotal: number;
  discount: number;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: string;
  voucherCode?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type OrderStatus = 
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED';

export type PaymentStatus = 
  | 'PENDING'
  | 'PAID'
  | 'FAILED'
  | 'REFUNDED';

export interface CreateOrderRequest {
  items: { productId: string; quantity: number; variantId?: string }[];
  shippingAddress: ShippingAddress;
  shippingMethod: string;
  paymentMethod: string;
  voucherCode?: string;
  notes?: string;
}

export interface OrdersResponse {
  data: Order[];
  total: number;
  page: number;
  pageSize: number;
}

// Order API
export const orderApi = {
  createOrder: async (data: CreateOrderRequest): Promise<Order> => {
    return apiClient.post<Order>(API_ENDPOINTS.orders.create, data);
  },

  getOrders: async (page = 1, pageSize = 10): Promise<OrdersResponse> => {
    return apiClient.get<OrdersResponse>(
      `${API_ENDPOINTS.orders.list}?page=${page}&pageSize=${pageSize}`
    );
  },

  getOrder: async (id: string): Promise<Order> => {
    return apiClient.get<Order>(API_ENDPOINTS.orders.detail(id));
  },

  cancelOrder: async (id: string): Promise<Order> => {
    return apiClient.post<Order>(API_ENDPOINTS.orders.cancel(id));
  },
};

// Payment Types
export interface PaymentRequest {
  orderId: string;
  method: string;
  amount: number;
}

export interface PaymentResponse {
  id: string;
  orderId: string;
  status: PaymentStatus;
  paymentUrl?: string;
  expiresAt?: string;
}

// Payment API
export const paymentApi = {
  createPayment: async (data: PaymentRequest): Promise<PaymentResponse> => {
    return apiClient.post<PaymentResponse>(API_ENDPOINTS.payments.create, data);
  },

  getPaymentStatus: async (id: string): Promise<PaymentResponse> => {
    return apiClient.get<PaymentResponse>(API_ENDPOINTS.payments.status(id));
  },
};
