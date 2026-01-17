import { apiClient } from './client';
import { API_ENDPOINTS } from './config';

// Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  phone?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatarUrl?: string;
  role: 'CUSTOMER' | 'SELLER' | 'ADMIN';
  verified: boolean;
  createdAt: string;
}

export interface UpdateProfileRequest {
  name?: string;
  phone?: string;
  avatarUrl?: string;
}

// Auth API
export const authApi = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    return apiClient.post<AuthResponse>(API_ENDPOINTS.auth.login, data, { auth: false });
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    return apiClient.post<AuthResponse>(API_ENDPOINTS.auth.register, data, { auth: false });
  },

  refreshToken: async (refreshToken: string): Promise<{ accessToken: string }> => {
    return apiClient.post(API_ENDPOINTS.auth.refresh, { refreshToken }, { auth: false });
  },

  logout: async (): Promise<void> => {
    return apiClient.post(API_ENDPOINTS.auth.logout);
  },
};

// User API
export const userApi = {
  getProfile: async (): Promise<User> => {
    return apiClient.get<User>(API_ENDPOINTS.users.me);
  },

  updateProfile: async (data: UpdateProfileRequest): Promise<User> => {
    return apiClient.put<User>(API_ENDPOINTS.users.profile, data);
  },
};
