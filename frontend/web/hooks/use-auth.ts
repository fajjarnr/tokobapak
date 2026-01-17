'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { authApi, userApi, LoginRequest, RegisterRequest, AuthResponse, User } from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';

export function useLogin() {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation<AuthResponse, Error, LoginRequest>({
    mutationFn: (data) => authApi.login(data),
    onSuccess: (response) => {
      // Store tokens
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth-storage', JSON.stringify({
          state: {
            token: response.accessToken,
            refreshToken: response.refreshToken,
            user: response.user,
            isAuthenticated: true,
          },
        }));
      }
      
      // Update Zustand store
      setUser({
        id: response.user.id,
        name: response.user.name,
        email: response.user.email,
        image: response.user.avatarUrl,
      });

      router.push('/');
    },
  });
}

export function useRegister() {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation<AuthResponse, Error, RegisterRequest>({
    mutationFn: (data) => authApi.register(data),
    onSuccess: (response) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth-storage', JSON.stringify({
          state: {
            token: response.accessToken,
            refreshToken: response.refreshToken,
            user: response.user,
            isAuthenticated: true,
          },
        }));
      }
      
      setUser({
        id: response.user.id,
        name: response.user.name,
        email: response.user.email,
        image: response.user.avatarUrl,
      });

      router.push('/');
    },
  });
}

export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const logout = useAuthStore((state) => state.logout);

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      logout();
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth-storage');
      }
      queryClient.clear();
      router.push('/login');
    },
    onError: () => {
      // Even on error, clear local state
      logout();
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth-storage');
      }
      router.push('/login');
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: userApi.updateProfile,
    onSuccess: (user: User) => {
      setUser({
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.avatarUrl,
      });
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
}
