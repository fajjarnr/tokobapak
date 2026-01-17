'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    orderApi,
    Order,
    OrdersResponse,
    CreateOrderRequest,
    paymentApi,
    PaymentRequest,
    PaymentResponse
} from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';

/**
 * Hook to fetch all orders for the current user
 */
export function useOrders(params?: { page?: number; limit?: number }) {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    return useQuery<OrdersResponse>({
        queryKey: ['orders', params?.page, params?.limit],
        queryFn: () => orderApi.getAll(params),
        enabled: isAuthenticated,
        staleTime: 60 * 1000, // 1 minute
    });
}

/**
 * Hook to fetch a single order by ID
 */
export function useOrder(orderId: string) {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    return useQuery<Order>({
        queryKey: ['order', orderId],
        queryFn: () => orderApi.getById(orderId),
        enabled: isAuthenticated && !!orderId,
        staleTime: 30 * 1000, // 30 seconds
    });
}

/**
 * Hook to create a new order
 */
export function useCreateOrder() {
    const queryClient = useQueryClient();

    return useMutation<Order, Error, CreateOrderRequest>({
        mutationFn: (data) => orderApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            queryClient.invalidateQueries({ queryKey: ['cart'] });
        },
    });
}

/**
 * Hook to cancel an order
 */
export function useCancelOrder() {
    const queryClient = useQueryClient();

    return useMutation<Order, Error, string>({
        mutationFn: (orderId) => orderApi.cancel(orderId),
        onSuccess: (_, orderId) => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            queryClient.invalidateQueries({ queryKey: ['order', orderId] });
        },
    });
}

/**
 * Hook to initiate a payment
 */
export function useInitiatePayment() {
    const queryClient = useQueryClient();

    return useMutation<PaymentResponse, Error, PaymentRequest>({
        mutationFn: (data) => paymentApi.initiate(data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['order', variables.orderId] });
        },
    });
}

/**
 * Hook to get payment status
 */
export function usePaymentStatus(paymentId: string) {
    return useQuery<PaymentResponse>({
        queryKey: ['payment', paymentId],
        queryFn: () => paymentApi.getStatus(paymentId),
        enabled: !!paymentId,
        refetchInterval: 5000, // Poll every 5 seconds for payment status
    });
}

/**
 * Hook to confirm a payment
 */
export function useConfirmPayment() {
    const queryClient = useQueryClient();

    return useMutation<PaymentResponse, Error, { paymentId: string; transactionId: string }>({
        mutationFn: ({ paymentId, transactionId }) => paymentApi.confirm(paymentId, transactionId),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['payment', data.id] });
            queryClient.invalidateQueries({ queryKey: ['order', data.orderId] });
            queryClient.invalidateQueries({ queryKey: ['orders'] });
        },
    });
}
