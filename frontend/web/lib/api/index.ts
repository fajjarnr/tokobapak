// API Client and Configuration
export { apiClient } from './client';
export { API_BASE_URL, API_ENDPOINTS } from './config';

// Auth & User
export { authApi, userApi } from './auth';
export type { 
  LoginRequest, 
  RegisterRequest, 
  AuthResponse, 
  User, 
  UpdateProfileRequest 
} from './auth';

// Products & Categories
export { productApi, categoryApi, recommendationApi, sellerApi } from './products';
export type { 
  Product, 
  ProductVariant, 
  Category, 
  Seller, 
  ProductsResponse, 
  SearchParams 
} from './products';

// Cart
export { cartApi } from './cart';
export type { 
  Cart, 
  CartItem, 
  AddToCartRequest, 
  UpdateCartItemRequest 
} from './cart';

// Orders & Payments
export { orderApi, paymentApi } from './orders';
export type { 
  Order, 
  OrderItem, 
  OrderStatus, 
  PaymentStatus, 
  ShippingAddress, 
  CreateOrderRequest, 
  OrdersResponse, 
  PaymentRequest, 
  PaymentResponse 
} from './orders';

// Reviews
export { reviewApi } from './reviews';
export type { 
  Review, 
  ReviewStats, 
  CreateReviewRequest, 
  ReviewsResponse 
} from './reviews';

// Promotions
export { promotionApi } from './promotions';
export type { 
  Promotion, 
  ApplyVoucherRequest, 
  VoucherResult 
} from './promotions';
