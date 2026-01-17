import { apiClient } from './client';
import { API_ENDPOINTS } from './config';

// Types
export interface Promotion {
  id: string;
  name: string;
  description?: string;
  type: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_SHIPPING';
  discountValue: number;
  minPurchase: number;
  maxDiscount?: number;
  startDate: string;
  endDate: string;
}

export interface ApplyVoucherRequest {
  voucherCode: string;
  userId: string;
  orderTotal: number;
  orderId: string;
}

export interface VoucherResult {
  valid: boolean;
  discountAmount: number;
  finalTotal: number;
  message: string;
}

// Promotion API
export const promotionApi = {
  getActivePromotions: async (): Promise<Promotion[]> => {
    return apiClient.get<Promotion[]>(API_ENDPOINTS.promotions.active, { auth: false });
  },

  applyVoucher: async (data: ApplyVoucherRequest): Promise<VoucherResult> => {
    return apiClient.post<VoucherResult>(API_ENDPOINTS.promotions.applyVoucher, data);
  },
};
