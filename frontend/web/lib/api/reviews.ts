import { apiClient } from './client';
import { API_ENDPOINTS } from './config';

// Types
export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  title?: string;
  content: string;
  images?: string[];
  helpfulCount: number;
  verifiedPurchase: boolean;
  createdAt: string;
}

export interface ReviewStats {
  productId: string;
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    '1': number;
    '2': number;
    '3': number;
    '4': number;
    '5': number;
  };
}

export interface CreateReviewRequest {
  productId: string;
  rating: number;
  title?: string;
  content: string;
  images?: string[];
}

export interface ReviewsResponse {
  data: Review[];
  total: number;
  page: number;
  pageSize: number;
}

// Review API
export const reviewApi = {
  getProductReviews: async (
    productId: string,
    page = 1,
    pageSize = 10
  ): Promise<ReviewsResponse> => {
    return apiClient.get<ReviewsResponse>(
      `${API_ENDPOINTS.reviews.byProduct(productId)}?page=${page}&pageSize=${pageSize}`,
      { auth: false }
    );
  },

  getReviewStats: async (productId: string): Promise<ReviewStats> => {
    return apiClient.get<ReviewStats>(API_ENDPOINTS.reviews.stats(productId), { auth: false });
  },

  createReview: async (data: CreateReviewRequest): Promise<Review> => {
    return apiClient.post<Review>(API_ENDPOINTS.reviews.create, data);
  },

  markHelpful: async (reviewId: string): Promise<{ helpfulCount: number }> => {
    return apiClient.post(API_ENDPOINTS.reviews.helpful(reviewId));
  },
};
