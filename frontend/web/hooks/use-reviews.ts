'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  reviewApi, 
  Review, 
  ReviewStats, 
  ReviewsResponse, 
  CreateReviewRequest 
} from '@/lib/api';

export function useProductReviews(productId: string, page = 1, pageSize = 10) {
  return useQuery<ReviewsResponse>({
    queryKey: ['reviews', productId, page, pageSize],
    queryFn: () => reviewApi.getProductReviews(productId, page, pageSize),
    enabled: !!productId,
  });
}

export function useReviewStats(productId: string) {
  return useQuery<ReviewStats>({
    queryKey: ['review-stats', productId],
    queryFn: () => reviewApi.getReviewStats(productId),
    enabled: !!productId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCreateReview() {
  const queryClient = useQueryClient();

  return useMutation<Review, Error, CreateReviewRequest>({
    mutationFn: (data) => reviewApi.createReview(data),
    onSuccess: (review) => {
      queryClient.invalidateQueries({ queryKey: ['reviews', review.productId] });
      queryClient.invalidateQueries({ queryKey: ['review-stats', review.productId] });
    },
  });
}

export function useMarkReviewHelpful() {
  const queryClient = useQueryClient();

  return useMutation<{ helpfulCount: number }, Error, { reviewId: string; productId: string }>({
    mutationFn: ({ reviewId }) => reviewApi.markHelpful(reviewId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['reviews', variables.productId] });
    },
  });
}
