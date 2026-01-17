import { apiClient } from './client'
import { API_ENDPOINTS } from './config'
import { LoginInput, RegisterInput } from '@/lib/validations/auth'

export interface AuthResponse {
  token: string
  refreshToken: string
  user: {
    id: string
    email: string
    name: string
    role: string
  }
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
    return apiClient.get(API_ENDPOINTS.users.me)
  },
  updateProfile: async (data: any) => {
    return apiClient.put(API_ENDPOINTS.users.update, data)
  }
}
