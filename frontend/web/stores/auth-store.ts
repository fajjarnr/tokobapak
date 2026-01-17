import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
    id: string
    name: string
    email: string
    image?: string
}

interface AuthState {
    user: User | null
    token: string | null
    refreshToken: string | null
    isAuthenticated: boolean
}

interface AuthActions {
    setUser: (user: User | null) => void
    setTokens: (token: string, refreshToken: string) => void
    logout: () => void
}

type AuthStore = AuthState & AuthActions

export const useAuthStore = create<AuthStore>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            refreshToken: null,
            isAuthenticated: false,
            setUser: (user) => set({ user, isAuthenticated: !!user }),
            setTokens: (token, refreshToken) => set({ token, refreshToken }),
            logout: () => set({ 
                user: null, 
                token: null, 
                refreshToken: null, 
                isAuthenticated: false 
            }),
        }),
        {
            name: 'auth-storage',
        }
    )
)
