import { apiClient } from './client'
import { API_ENDPOINTS } from './config'
import { LoginInput, RegisterInput } from '@/lib/validations/auth'

// Re-export types from validations for compatibility
export type LoginRequest = LoginInput
export type RegisterRequest = RegisterInput

export interface User {
  id: string
  email: string
  name: string
  role: string
  phone?: string
  avatar?: string
  createdAt?: string
  updatedAt?: string
}

export interface UpdateProfileRequest {
  name?: string
  phone?: string
  avatar?: string
}

export interface AuthResponse {
  token: string
  refreshToken: string
  user: User
}

export const authApi = {
  login: async (credentials: LoginInput) => {
    return apiClient.post<AuthResponse>(API_ENDPOINTS.auth.login, credentials)
  },
  register: async (userData: RegisterInput) => {
    return apiClient.post<AuthResponse>(API_ENDPOINTS.auth.register, userData)
  },
  refresh: async (refreshToken: string) => {
    return apiClient.post<AuthResponse>(API_ENDPOINTS.auth.refresh, { refreshToken })
  },
  logout: async () => {
    return apiClient.post(API_ENDPOINTS.auth.logout)
  }
}

export const userApi = {
  getMe: async () => {
    return apiClient.get<User>(API_ENDPOINTS.users.me)
  },
  updateProfile: async (data: UpdateProfileRequest) => {
    return apiClient.put<User>(API_ENDPOINTS.users.update, data)
  }
}

