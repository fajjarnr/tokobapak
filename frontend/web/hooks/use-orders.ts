'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { 
  orderApi, 
  paymentApi,
  Order, 
  OrdersResponse, 
  CreateOrderRequest,
  PaymentRequest,
  PaymentResponse,
} from '@/lib/api';

export function useOrders(page = 1, pageSize = 10) {
  return useQuery<OrdersResponse>({
    queryKey: ['orders', page, pageSize],
    queryFn: () => orderApi.getOrders(page, pageSize),
  });
}

export function useOrder(id: string) {
  return useQuery<Order>({
    queryKey: ['order', id],
    queryFn: () => orderApi.getOrder(id),
    enabled: !!id,
  });
}

export function useCreateOrder() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation<Order, Error, CreateOrderRequest>({
    mutationFn: (data) => orderApi.createOrder(data),
    onSuccess: (order) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      router.push(`/checkout/payment?orderId=${order.id}`);
    },
  });
}

export function useCancelOrder() {
  const queryClient = useQueryClient();

  return useMutation<Order, Error, string>({
    mutationFn: (orderId) => orderApi.cancelOrder(orderId),
    onSuccess: (order) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', order.id] });
    },
  });
}

// Payment Hooks
export function useCreatePayment() {
  const queryClient = useQueryClient();

  return useMutation<PaymentResponse, Error, PaymentRequest>({
    mutationFn: (data) => paymentApi.createPayment(data),
    onSuccess: (payment) => {
      queryClient.invalidateQueries({ queryKey: ['order', payment.orderId] });
    },
  });
}

export function usePaymentStatus(id: string) {
  return useQuery<PaymentResponse>({
    queryKey: ['payment', id],
    queryFn: () => paymentApi.getPaymentStatus(id),
    enabled: !!id,
    refetchInterval: (query) => {
      // Poll every 5 seconds while pending
      const data = query.state.data;
      if (data && data.status === 'PENDING') {
        return 5000;
      }
      return false;
    },
  });
}
