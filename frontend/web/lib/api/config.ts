// API Configuration for TokoBapak Backend Services
// Uses relative URLs in browser (proxied by Next.js rewrites) to avoid CORS
// Full URL only needed for SSR or when NEXT_PUBLIC_API_URL is set

const API_BASE_URL = typeof window === 'undefined'
  ? (process.env.NEXT_PUBLIC_API_URL || 'http://api-gateway')
  : '';

// Service URLs - mapped through API Gateway
export const API_ENDPOINTS = {
  // Auth & User Services
  auth: {
    login: '/api/v1/auth/login',
    register: '/api/v1/auth/register',
    refresh: '/api/v1/auth/refresh',
    logout: '/api/v1/auth/logout',
  },
  users: {
    me: '/api/v1/users/me',
    profile: '/api/v1/users/profile',
    update: '/api/v1/users',
  },

  // Product & Catalog Services
  products: {
    list: '/api/v1/products',
    detail: (id: string) => `/api/v1/products/${id}`,
    search: '/api/v1/search/products',
    suggest: '/api/v1/search/suggest',
    create: '/api/v1/products',
  },
  categories: {
    list: '/api/v1/categories',
    detail: (id: string) => `/api/v1/categories/${id}`,
    create: '/api/v1/categories',
  },

  // Cart Service
  cart: {
    get: '/api/v1/cart',
    add: '/api/v1/cart/items',
    update: (itemId: string) => `/api/v1/cart/items/${itemId}`,
    remove: (itemId: string) => `/api/v1/cart/items/${itemId}`,
    clear: '/api/v1/cart',
  },

  // Order Service
  orders: {
    create: '/api/v1/orders',
    list: '/api/v1/orders',
    detail: (id: string) => `/api/v1/orders/${id}`,
    cancel: (id: string) => `/api/v1/orders/${id}/cancel`,
  },

  // Payment Service
  payments: {
    create: '/api/v1/payments',
    status: (id: string) => `/api/v1/payments/${id}`,
    callback: '/api/v1/payments/callback',
  },

  // Review Service
  reviews: {
    byProduct: (productId: string) => `/api/v1/products/${productId}/reviews`,
    stats: (productId: string) => `/api/v1/products/${productId}/reviews/stats`,
    create: '/api/v1/reviews',
    helpful: (id: string) => `/api/v1/reviews/${id}/helpful`,
  },

  // Recommendation Service
  recommendations: {
    personalized: '/api/v1/recommendations/personalized',
    similar: '/api/v1/recommendations/similar',
    trending: '/api/v1/recommendations/trending',
  },

  // Promotion Service
  promotions: {
    active: '/api/v1/promotions/active',
    applyVoucher: '/api/v1/promotions/vouchers/apply',
  },

  // Seller Service
  sellers: {
    detail: (id: string) => `/api/v1/sellers/${id}`,
    products: (id: string) => `/api/v1/sellers/${id}/products`,
  },
};

export { API_BASE_URL };
