'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  productApi, 
  categoryApi, 
  recommendationApi,
  Product,
  ProductsResponse,
  SearchParams,
  Category,
} from '@/lib/api';

// Product Hooks
export function useProducts(params?: SearchParams) {
  return useQuery<ProductsResponse>({
    queryKey: ['products', params],
    queryFn: () => productApi.getProducts(params),
  });
}

export function useProduct(id: string) {
  return useQuery<Product>({
    queryKey: ['product', id],
    queryFn: () => productApi.getProduct(id),
    enabled: !!id,
  });
}

export function useProductSearch(params: SearchParams) {
  return useQuery<ProductsResponse>({
    queryKey: ['product-search', params],
    queryFn: () => productApi.searchProducts(params),
    enabled: !!params.query,
  });
}

export function useProductSuggestions(query: string) {
  return useQuery<{ suggestions: string[] }>({
    queryKey: ['product-suggestions', query],
    queryFn: () => productApi.getSuggestions(query),
    enabled: query.length >= 2,
    staleTime: 30 * 1000,
  });
}

// Category Hooks
export function useCategories() {
  return useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: () => categoryApi.getCategories(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCategory(id: string) {
  return useQuery<Category>({
    queryKey: ['category', id],
    queryFn: () => categoryApi.getCategory(id),
    enabled: !!id,
  });
}

// Recommendation Hooks
export function usePersonalizedRecommendations(userId: string, limit = 10) {
  return useQuery({
    queryKey: ['recommendations', 'personalized', userId, limit],
    queryFn: () => recommendationApi.getPersonalized(userId, limit),
    enabled: !!userId,
  });
}

export function useSimilarProducts(productId: string, limit = 5) {
  return useQuery({
    queryKey: ['recommendations', 'similar', productId, limit],
    queryFn: () => recommendationApi.getSimilar(productId, limit),
    enabled: !!productId,
  });
}

export function useTrendingProducts(limit = 10) {
  return useQuery({
    queryKey: ['recommendations', 'trending', limit],
    queryFn: () => recommendationApi.getTrending(limit),
  });
}
