import { apiClient } from './client';
import { API_ENDPOINTS } from './config';

// Types
export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  images: string[];
  categoryId: string;
  category?: Category;
  sellerId: string;
  seller?: Seller;
  rating: number;
  reviewCount: number;
  stock: number;
  variants?: ProductVariant[];
  createdAt: string;
}

export interface ProductVariant {
  id: string;
  name: string;
  options: string[];
  price?: number;
  stock?: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string;
  parentId?: string;
  children?: Category[];
}

export interface Seller {
  id: string;
  storeName: string;
  logoUrl?: string;
  rating: number;
  verified: boolean;
}

export interface ProductsResponse {
  data: Product[];
  total: number;
  page: number;
  pageSize: number;
}

export interface SearchParams {
  query?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  pageSize?: number;
  sort?: string;
}

// Product API
export const productApi = {
  getProducts: async (params?: SearchParams): Promise<ProductsResponse> => {
    const queryString = params
      ? '?' + new URLSearchParams(params as Record<string, string>).toString()
      : '';
    return apiClient.get<ProductsResponse>(`${API_ENDPOINTS.products.list}${queryString}`, { auth: false });
  },

  getProduct: async (id: string): Promise<Product> => {
    return apiClient.get<Product>(API_ENDPOINTS.products.detail(id), { auth: false });
  },

  searchProducts: async (params: SearchParams): Promise<ProductsResponse> => {
    const queryString = '?' + new URLSearchParams(params as Record<string, string>).toString();
    return apiClient.get<ProductsResponse>(`${API_ENDPOINTS.products.search}${queryString}`, { auth: false });
  },

  getSuggestions: async (query: string): Promise<{ suggestions: string[] }> => {
    return apiClient.get(`${API_ENDPOINTS.products.suggest}?q=${encodeURIComponent(query)}`, { auth: false });
  },
};

// Category API
export const categoryApi = {
  getCategories: async (): Promise<Category[]> => {
    const response = await apiClient.get<{ data: Category[] }>(API_ENDPOINTS.categories.list, { auth: false });
    return response.data || [];
  },

  getCategory: async (id: string): Promise<Category> => {
    return apiClient.get<Category>(API_ENDPOINTS.categories.detail(id), { auth: false });
  },
};

// Recommendation API
export const recommendationApi = {
  getPersonalized: async (userId: string, limit = 10): Promise<{ recommendations: Product[] }> => {
    return apiClient.post(API_ENDPOINTS.recommendations.personalized, { user_id: userId, limit });
  },

  getSimilar: async (productId: string, limit = 5): Promise<{ similar_products: Product[] }> => {
    return apiClient.post(API_ENDPOINTS.recommendations.similar, { product_id: productId, limit }, { auth: false });
  },

  getTrending: async (limit = 10): Promise<{ trending: Product[] }> => {
    return apiClient.get(`${API_ENDPOINTS.recommendations.trending}?limit=${limit}`, { auth: false });
  },
};

// Seller API
export const sellerApi = {
  getSeller: async (id: string): Promise<Seller> => {
    return apiClient.get<Seller>(API_ENDPOINTS.sellers.detail(id), { auth: false });
  },
};
