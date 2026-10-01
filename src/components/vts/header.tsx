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
    <header className="sticky top-0 z-40 border-b border-slate-800/60" style={{ background: 'rgba(15, 18, 22, 0.85)', backdropFilter: 'blur(12px)' }}>
      <div className="flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleMobileNav}
            className="lg:hidden p-1.5 hover:bg-slate-800 rounded"
            aria-label="Toggle menu"
          >
            {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
              <Ship className="w-4 h-4 text-white" />
            </div>
            <div className="hidden sm:block">
              <div className="text-sm font-semibold text-slate-100 leading-tight">MaritimeVTS</div>
              <div className="text-[10px] text-slate-500 leading-tight">TCP Valparaíso</div>
            </div>
          </div>

          <nav className="hidden lg:flex items-center gap-1 ml-6">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  activeView === item.id
                    ? 'bg-cyan-500/15 text-cyan-300'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Status indicator */}
          <div className="hidden md:flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/30">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
            </span>
            <span className="text-[10px] text-emerald-300 font-medium">VTS Operativo</span>
          </div>

          <Badge variant="outline" className="hidden xl:flex bg-slate-800 text-slate-300 border-slate-700 text-[10px]">
            <ShieldCheck className="w-2.5 h-2.5 mr-1" /> Ley 21.719
          </Badge>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 hover:bg-slate-800 rounded-md p-1 pr-2 transition-colors">
                <Avatar className="w-7 h-7 border border-slate-700">
                  <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-blue-700 text-white text-xs">
                    {user?.name?.split(' ').map((n) => n[0]).slice(0, 2).join('') || 'OP'}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-medium text-slate-100 leading-tight">{user?.name?.split(' ')[0]} {user?.name?.split(' ')[1]?.[0]}.</div>
                  <div className="text-[9px] text-slate-500 leading-tight">{user?.role}</div>
                </div>
                <ChevronDown className="w-3 h-3 text-slate-500" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 bg-slate-900 border-slate-700">
              <DropdownMenuLabel className="text-slate-200">
                <div className="flex flex-col gap-1">
                  <span className="font-medium">{user?.name}</span>
                  <span className="text-xs text-slate-500 font-normal">{user?.email}</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-slate-800" />
              <div className="px-2 py-1.5 space-y-1">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <User className="w-3 h-3" /> {user?.role}
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <ShieldCheck className="w-3 h-3" /> {user?.organization}
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Activity className="w-3 h-3" /> Proveedor: {user?.provider === 'microsoft' ? 'Microsoft 365' : user?.provider === 'google' ? 'Google' : 'Demo'}
                </div>
              </div>
              <DropdownMenuSeparator className="bg-slate-800" />
              <DropdownMenuItem
                onClick={() => logout()}
                className="text-red-400 hover:text-red-300 hover:bg-red-500/10 cursor-pointer"
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
