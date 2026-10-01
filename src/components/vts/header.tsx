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
import { Ship, LogOut, User, ShieldCheck, ChevronDown, Activity, Menu, X } from 'lucide-react'
import { motion } from 'framer-motion'

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
    <header className="sticky top-0 z-40 border-b border-white/10 bg-sky-50/60 backdrop-blur-xl shadow-sm shadow-sky-950/20">
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
              <div className="text-base font-bold text-slate-900 leading-tight">MaritimeVTS</div>
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
                    ? 'bg-sky-100 text-sky-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Status indicator */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            <span className="text-xs text-emerald-700 font-semibold">VTS Operativo</span>
          </div>

          <Badge variant="outline" className="hidden xl:flex bg-sky-50 text-sky-700 border-sky-200 text-xs px-2.5 py-1">
            <ShieldCheck className="w-3 h-3 mr-1" /> Ley 21.719
          </Badge>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 hover:bg-slate-100 rounded-lg p-1.5 pr-3 transition-colors border border-transparent hover:border-slate-200">
                <Avatar className="w-9 h-9 border-2 border-sky-200">
                  <AvatarFallback className="bg-gradient-to-br from-sky-500 to-blue-700 text-white text-sm font-semibold">
                    {user?.name?.split(' ').map((n) => n[0]).slice(0, 2).join('') || 'OP'}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:block text-left">
                  <div className="text-sm font-semibold text-slate-900 leading-tight">{user?.name?.split(' ')[0]} {user?.name?.split(' ')[1]?.[0]}.</div>
                  <div className="text-xs text-slate-500 leading-tight">{user?.role}</div>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72 bg-white border-slate-200 shadow-xl">
              <DropdownMenuLabel className="text-slate-900">
                <div className="flex flex-col gap-1">
                  <span className="font-semibold text-base">{user?.name}</span>
                  <span className="text-xs text-slate-500 font-normal">{user?.email}</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-slate-100" />
              <div className="px-2 py-2 space-y-1.5">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <User className="w-4 h-4 text-sky-600" /> {user?.role}
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
                className="text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer text-sm py-2"
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
