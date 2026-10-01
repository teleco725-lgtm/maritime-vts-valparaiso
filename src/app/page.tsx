'use client'

import { useAuthStore } from '@/store/auth-store'
import { useHasHydrated } from '@/hooks/use-has-hydrated'
import LoginView from '@/components/vts/login-view'
import Dashboard from '@/components/vts/dashboard'

export default function Home() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const hydrated = useHasHydrated()

  if (!hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-slate-500 text-sm">Cargando sistema...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <LoginView />
  }

  return <Dashboard />
}
