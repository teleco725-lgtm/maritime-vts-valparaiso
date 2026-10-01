'use client'

import { useAuthStore } from '@/store/auth-store'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { Ship, LogOut, User, ShieldCheck, ChevronDown, Activity, Menu, X, Palette } from 'lucide-react'
import { motion } from 'framer-motion'
import { ThemePicker } from './theme-picker'

interface Props {
  activeView: string
  onNavigate: (view: string) => void
  onToggleMobileNav: () => void
  mobileNavOpen: boolean
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'reports', label: 'Informes' },
  { id: 'compliance', label: 'Cumplimiento' },
]

export default function Header({ activeView, onNavigate, onToggleMobileNav, mobileNavOpen }: Props) {
  const { user, logout } = useAuthStore()

  return (
    <header className="sticky top-0 z-40 border-b border-slate-700/50 bg-[var(--vts-bg)]/85 backdrop-blur-xl shadow-lg shadow-black/40">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleMobileNav}
            className="lg:hidden p-2 hover:bg-slate-100 rounded-lg text-slate-700"
            aria-label="Abrir menú"
          >
            {mobileNavOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center shadow-md shadow-sky-500/30">
              <Ship className="w-5 h-5 text-white" strokeWidth={2.2} />
            </div>
            <div className="hidden sm:block">
              <div className="text-base font-bold text-slate-100 leading-tight">MaritimeVTS</div>
              <div className="text-xs text-slate-500 leading-tight">TCP Valparaíso</div>
            </div>
          </div>

          <nav className="hidden lg:flex items-center gap-1 ml-6">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                  activeView === item.id
                    ? 'bg-[#00D2FF]/15 text-[#00D2FF] shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[var(--vts-subcard)]/50'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Status indicator */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#00FF66]/10 border border-[#00FF66]/30">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00FF66]/150 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#00FF66]/150" />
            </span>
            <span className="text-xs text-emerald-700 font-semibold">VTS Operativo</span>
          </div>

          <Badge variant="outline" className="hidden xl:flex bg-[#00D2FF]/10 text-[#00D2FF] border-[#00D2FF]/30 text-xs px-2.5 py-1">
            <ShieldCheck className="w-3 h-3 mr-1" /> Ley 21.719
          </Badge>

          {/* Theme picker — selector de paleta de colores */}
          <ThemePicker />

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 hover:bg-slate-100 rounded-lg p-1.5 pr-3 transition-colors border border-transparent hover:border-slate-700/50">
                <Avatar className="w-9 h-9 border-2 border-slate-700/50">
                  <AvatarFallback className="bg-gradient-to-br from-sky-500 to-blue-700 text-white text-sm font-semibold">
                    {user?.name?.split(' ').map((n) => n[0]).slice(0, 2).join('') || 'OP'}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:block text-left">
                  <div className="text-sm font-semibold text-slate-100 leading-tight">{user?.name?.split(' ')[0]} {user?.name?.split(' ')[1]?.[0]}.</div>
                  <div className="text-xs text-slate-500 leading-tight">{user?.role}</div>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72 bg-[var(--vts-card)] border-slate-700/60 shadow-xl shadow-black/50">
              <DropdownMenuLabel className="text-slate-100">
                <div className="flex flex-col gap-1">
                  <span className="font-semibold text-base">{user?.name}</span>
                  <span className="text-xs text-slate-500 font-normal">{user?.email}</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-slate-100" />
              <div className="px-2 py-2 space-y-1.5">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <User className="w-4 h-4 text-[#00D2FF]" /> {user?.role}
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" /> {user?.organization}
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Activity className="w-4 h-4 text-violet-600" /> Proveedor: {user?.provider === 'microsoft' ? 'Microsoft 365' : user?.provider === 'google' ? 'Google' : 'Demo'}
                </div>
              </div>
              <DropdownMenuSeparator className="bg-slate-100" />
              <DropdownMenuItem
                onClick={() => logout()}
                className="text-red-600 hover:text-red-700 hover:bg-red-500/15 cursor-pointer text-sm py-2"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Cerrar Sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
