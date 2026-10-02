'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, User, ShieldCheck, Ship, Eye, Settings, Lock, CheckCircle2 } from 'lucide-react'

export type UserRole = 'operador_vts' | 'autoridad_maritima' | 'agente_nave' | 'administrador'

export interface RoleInfo {
  id: UserRole
  name: string
  description: string
  icon: typeof User
  color: string
  bgColor: string
  borderColor: string
  permissions: {
    canModifyManeuvers: boolean
    canAssignBerths: boolean
    canUseRadio: boolean
    canViewAllVessels: boolean
    canViewAuditLogs: boolean
    canExportReports: boolean
    canChangeThemes: boolean
    canAccessSensitiveData: boolean
  }
}

const roles: RoleInfo[] = [
  {
    id: 'operador_vts',
    name: 'Operador VTS',
    description: 'Control naviero — puede modificar maniobras y asignar sitios de atraque',
    icon: Ship,
    color: 'text-[#00FF66]',
    bgColor: 'bg-[#00FF66]/10',
    borderColor: 'border-[#00FF66]/40',
    permissions: {
      canModifyManeuvers: true,
      canAssignBerths: true,
      canUseRadio: true,
      canViewAllVessels: true,
      canViewAuditLogs: true,
      canExportReports: true,
      canChangeThemes: true,
      canAccessSensitiveData: false,
    },
  },
  {
    id: 'autoridad_maritima',
    name: 'Autoridad Marítima',
    description: 'DIRECTEMAR — vista de solo lectura con foco en seguridad y documentación',
    icon: ShieldCheck,
    color: 'text-[#00D2FF]',
    bgColor: 'bg-[#00D2FF]/10',
    borderColor: 'border-[#00D2FF]/40',
    permissions: {
      canModifyManeuvers: false,
      canAssignBerths: false,
      canUseRadio: false,
      canViewAllVessels: true,
      canViewAuditLogs: true,
      canExportReports: true,
      canChangeThemes: true,
      canAccessSensitiveData: true,
    },
  },
  {
    id: 'agente_nave',
    name: 'Agente de Nave',
    description: 'Usuario cliente — vista restringida solo a las naves de su agencia',
    icon: User,
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/40',
    permissions: {
      canModifyManeuvers: false,
      canAssignBerths: false,
      canUseRadio: false,
      canViewAllVessels: false, // Solo sus naves
      canViewAuditLogs: false,
      canExportReports: true,
      canChangeThemes: true,
      canAccessSensitiveData: false,
    },
  },
  {
    id: 'administrador',
    name: 'Administrador TI',
    description: 'Acceso total — configuración, usuarios, ciberseguridad',
    icon: Settings,
    color: 'text-red-400',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/40',
    permissions: {
      canModifyManeuvers: true,
      canAssignBerths: true,
      canUseRadio: true,
      canViewAllVessels: true,
      canViewAuditLogs: true,
      canExportReports: true,
      canChangeThemes: true,
      canAccessSensitiveData: true,
    },
  },
]

const STORAGE_KEY = 'vts-active-role'

export function useRole() {
  const [activeRole, setActiveRole] = useState<UserRole>(() => {
    if (typeof window === 'undefined') return 'operador_vts'
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as UserRole | null
      return saved || 'operador_vts'
    } catch {
      return 'operador_vts'
    }
  })

  const setRole = (role: UserRole) => {
    setActiveRole(role)
    try {
      localStorage.setItem(STORAGE_KEY, role)
    } catch {}
  }

  const roleInfo = roles.find(r => r.id === activeRole) || roles[0]
  return { activeRole, setRole, roleInfo, roles }
}

export default function RoleSelector() {
  const { activeRole, setRole, roleInfo, roles } = useRole()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('[data-role-picker]')) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <div className="relative" data-role-picker>
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-2 p-2 rounded-lg transition-colors border ${roleInfo.borderColor} ${roleInfo.bgColor}`}
        title={`Perfil activo: ${roleInfo.name}`}
      >
        <roleInfo.icon className={`w-4 h-4 ${roleInfo.color}`} />
        <span className={`text-xs font-semibold hidden sm:inline ${roleInfo.color}`}>
          {roleInfo.name}
        </span>
        <ChevronDown className="w-3 h-3 text-slate-400" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-80 z-50 bg-[var(--vts-card)] border border-slate-700/60 rounded-xl shadow-2xl shadow-black/50 overflow-hidden"
          >
            <div className="px-4 py-3 border-b border-slate-700/40 bg-[var(--vts-subcard)]">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Lock className="w-3 h-3 text-[#00D2FF]" />
                Control de Accesos
              </div>
              <div className="text-[10px] text-slate-500 mt-1">
                Perfil de usuario — ISO 27001 A.9
              </div>
            </div>

            <div className="py-1">
              {roles.map((role) => {
                const isSelected = role.id === activeRole
                return (
                  <button
                    key={role.id}
                    onClick={() => {
                      setRole(role.id)
                      setOpen(false)
                    }}
                    className={`w-full text-left p-3 transition-colors border-l-4 ${
                      isSelected
                        ? `${role.bgColor} ${role.borderColor} bg-opacity-20`
                        : 'border-transparent hover:bg-[var(--vts-subcard)]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <role.icon className={`w-5 h-5 flex-shrink-0 ${role.color}`} />
                      <div className="flex-1 min-w-0">
                        <div className={`text-sm font-semibold truncate ${isSelected ? role.color : 'text-slate-200'}`}>
                          {role.name}
                        </div>
                        <div className="text-[11px] text-slate-500 leading-snug">{role.description}</div>
                        {/* Permisos visuales */}
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {role.permissions.canModifyManeuvers && (
                            <span className="text-[8px] px-1.5 py-0.5 rounded bg-[#00FF66]/10 text-[#00FF66] border border-[#00FF66]/20 font-mono">MANIOBRA</span>
                          )}
                          {role.permissions.canAssignBerths && (
                            <span className="text-[8px] px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20 font-mono">ATRAQUE</span>
                          )}
                          {role.permissions.canUseRadio && (
                            <span className="text-[8px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono">RADIO</span>
                          )}
                          {role.permissions.canAccessSensitiveData && (
                            <span className="text-[8px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20 font-mono">DATOS</span>
                          )}
                          {role.permissions.canViewAuditLogs && (
                            <span className="text-[8px] px-1.5 py-0.5 rounded bg-violet-500/10 text-violet-400 border border-violet-500/20 font-mono">AUDIT</span>
                          )}
                          {!role.permissions.canViewAllVessels && (
                            <span className="text-[8px] px-1.5 py-0.5 rounded bg-slate-700/30 text-slate-500 border border-slate-700/40 font-mono">READ-ONLY-SU</span>
                          )}
                        </div>
                      </div>
                      {isSelected && (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                          <CheckCircle2 className="w-4 h-4 text-[#00FF66]" />
                        </motion.div>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>

            <div className="px-4 py-2.5 border-t border-slate-700/40 bg-[var(--vts-subcard)]">
              <div className="text-[10px] text-slate-500 text-center">
                4 perfiles · Matriz de control de accesos conforme ISO 27001 A.9
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export { roles }
export type { RoleInfo }
