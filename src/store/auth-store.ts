'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type AuthProvider = 'microsoft' | 'google' | 'guest'

export interface User {
  id: string
  name: string
  email: string
  role: string
  organization: string
  provider: AuthProvider
  avatar?: string
  loginAt: string
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isAuthenticating: boolean
  login: (provider: AuthProvider) => Promise<User>
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isAuthenticating: false,
      login: async (provider: AuthProvider) => {
        set({ isAuthenticating: true })
        // Simulación de OAuth2 con Microsoft/Google
        await new Promise((r) => setTimeout(r, 1200))
        const profiles: Record<AuthProvider, User> = {
          microsoft: {
            id: 'ms-9f3c1e7a',
            name: 'Cap. Andrés Martínez Soto',
            email: 'andres.martinez@tcpvalparaiso.onmicrosoft.com',
            role: 'Operador VTS Senior',
            organization: 'TCP Valparaíso — Terminal Pacífico Sur',
            provider: 'microsoft',
            loginAt: new Date().toISOString(),
          },
          google: {
            id: 'g-7b2d4f88',
            name: 'Ing. Carla Rojas Vega',
            email: 'c.rojas@directemar.cl',
            role: 'Supervisora de Tráfico Marítimo',
            organization: 'Directemar — Autoridad Marítima Nacional',
            provider: 'google',
            loginAt: new Date().toISOString(),
          },
          guest: {
            id: 'guest-001',
            name: 'Visitante Ejecutivo',
            email: 'guest@vts-demo.cl',
            role: 'Visita Institucional',
            organization: 'Acceso Demostrativo',
            provider: 'guest',
            loginAt: new Date().toISOString(),
          },
        }
        const user = profiles[provider]
        set({ user, isAuthenticated: true, isAuthenticating: false })
        return user
      },
      logout: () => set({ user: null, isAuthenticated: false, isAuthenticating: false }),
    }),
    { name: 'vts-auth' }
  )
)
