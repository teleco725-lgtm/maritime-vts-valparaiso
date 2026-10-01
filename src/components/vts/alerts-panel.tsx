'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { alerts as initialAlerts, type AlertItem } from '@/lib/vts/data'
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, ShieldAlert, ShieldCheck, Activity, Wind, Radio, Map } from 'lucide-react'

const severityConfig: Record<AlertItem['severity'], { color: string; bg: string; border: string; label: string }> = {
  critical: { color: 'text-red-300', bg: 'bg-red-500/10', border: 'border-red-500/40', label: 'CRÍTICA' },
  high: { color: 'text-amber-300', bg: 'bg-amber-500/10', border: 'border-amber-500/40', label: 'ALTA' },
  medium: { color: 'text-yellow-200', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', label: 'MEDIA' },
  low: { color: 'text-sky-200', bg: 'bg-sky-500/10', border: 'border-sky-500/30', label: 'BAJA' },
}

const typeIcon: Record<AlertItem['type'], typeof AlertTriangle> = {
  proximity: Activity,
  geofence: Map,
  speed: Radio,
  comms: Radio,
  security: ShieldAlert,
  metocean: Wind,
}

export default function AlertsPanel() {
  const [filter, setFilter] = useState<'all' | 'active' | 'acknowledged' | 'resolved'>('all')
  const items = initialAlerts.filter((a) => filter === 'all' || a.status === filter)

  return (
    <div className="flex flex-col h-full bg-slate-900/50 border border-slate-700 rounded-lg overflow-hidden">
      <div className="p-3 border-b border-slate-700">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-cyan-400 text-sm font-medium">
            <ShieldAlert className="w-4 h-4" />
            <span>Centro de Alertas</span>
          </div>
          <Badge variant="outline" className="bg-red-500/10 text-red-300 border-red-500/30 text-[10px]">
            {initialAlerts.filter((a) => a.status === 'active').length} activas
          </Badge>
        </div>
        <div className="flex flex-wrap gap-1">
          {[
            { id: 'all', label: 'Todas' },
            { id: 'active', label: 'Activas' },
            { id: 'acknowledged', label: 'Reconocidas' },
            { id: 'resolved', label: 'Resueltas' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id as any)}
              className={`px-2 py-0.5 text-[10px] rounded ${
                filter === f.id
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'bg-slate-800 text-slate-400 border border-slate-700'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scroll p-2 space-y-2">
        <AnimatePresence>
          {items.map((a) => {
            const sc = severityConfig[a.severity]
            const Icon = typeIcon[a.type]
            return (
              <motion.div
                key={a.id}
                layout
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className={`rounded-lg border p-2.5 ${sc.bg} ${sc.border}`}
              >
                <div className="flex items-start gap-2">
                  <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${sc.color}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className={`text-[9px] font-bold ${sc.color}`}>{sc.label}</span>
                      <span className="text-[9px] text-slate-500">·</span>
                      <span className="text-[9px] text-slate-500">{a.timestamp}</span>
                    </div>
                    <div className="text-xs font-medium text-slate-100 mb-1">{a.title}</div>
                    <div className="text-[10px] text-slate-400 leading-snug line-clamp-3">{a.description}</div>
                    {a.vessel && (
                      <div className="mt-1 text-[10px] text-slate-500">
                        Buque: <span className="text-slate-300">{a.vessel}</span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      <style jsx>{`
        .custom-scroll::-webkit-scrollbar { width: 5px; }
        .custom-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #334155; border-radius: 3px; }
      `}</style>
    </div>
  )
}
