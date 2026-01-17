'use client';

import { useQuery, useMutation } from '@tanstack/react-query';
import { promotionApi, Promotion, ApplyVoucherRequest, VoucherResult } from '@/lib/api';

export function useActivePromotions() {
  return useQuery<Promotion[]>({
    queryKey: ['promotions', 'active'],
    queryFn: () => promotionApi.getActivePromotions(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useApplyVoucher() {
  return useMutation<VoucherResult, Error, ApplyVoucherRequest>({
    mutationFn: (data) => promotionApi.applyVoucher(data),
  });
}
