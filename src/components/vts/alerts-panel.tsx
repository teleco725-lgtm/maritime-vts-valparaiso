'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { alerts as initialAlerts, type AlertItem } from '@/lib/vts/data'
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, ShieldAlert, ShieldCheck, Activity, Wind, Radio, Map } from 'lucide-react'

const severityConfig: Record<AlertItem['severity'], { color: string; bg: string; border: string; label: string; text: string }> = {
  critical: { color: 'text-red-600', bg: 'bg-red-500/10', border: 'border-red-500/40', label: 'CRÍTICA', text: 'text-red-400' },
  high: { color: 'text-amber-600', bg: 'bg-amber-500/15', border: 'border-amber-200', label: 'ALTA', text: 'text-amber-700' },
  medium: { color: 'text-yellow-700', bg: 'bg-yellow-500/10', border: 'border-yellow-500/40', label: 'MEDIA', text: 'text-yellow-300' },
  low: { color: 'text-[#00FF66]', bg: 'bg-[#00D2FF]/10', border: 'border-[#00D2FF]/30', label: 'BAJA', text: 'text-[#00D2FF]' },
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
    <div className="flex flex-col h-full bg-[var(--vts-card)] border border-slate-700/60 rounded-xl overflow-hidden shadow-lg shadow-black/30">
      <div className="p-4 border-b border-slate-700/50 bg-[#0f1620]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-[#00FF66] text-base font-semibold">
            <ShieldAlert className="w-5 h-5" />
            <span>Centro de Alertas</span>
          </div>
          <Badge variant="outline" className="bg-red-500/15 text-red-400 border-red-500/40 text-xs px-2 py-0.5">
            {initialAlerts.filter((a) => a.status === 'active').length} activas
          </Badge>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {[
            { id: 'all', label: 'Todas' },
            { id: 'active', label: 'Activas' },
            { id: 'acknowledged', label: 'Reconoc.' },
            { id: 'resolved', label: 'Resueltas' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id as any)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                filter === f.id
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'bg-[var(--vts-subcard)] text-slate-300 border border-slate-700/60 hover:border-[#00FF66]/40 hover:text-[#00FF66]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scroll">
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
                className={`rounded-lg border p-3 ${sc.bg} ${sc.border}`}
              >
                <div className="flex items-start gap-2">
                  <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${sc.color}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${sc.bg} ${sc.text} border ${sc.border}`}>
                        {sc.label}
                      </span>
                      {a.source && (
                        <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${
                          a.source === 'SHOA' ? 'bg-sky-500/10 text-sky-400 border-sky-500/30' :
                          a.source === 'MeteoChile' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                          a.source === 'SERVIMET' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' :
                          a.source === 'Directemar' ? 'bg-red-500/10 text-red-400 border-red-500/30' :
                          a.source === 'CSIRT' ? 'bg-violet-500/10 text-violet-400 border-violet-500/30' :
                          'bg-slate-700/30 text-slate-400 border-slate-600'
                        }`}>
                          📡 {a.source}
                        </span>
                      )}
                      <span className="text-[10px] text-slate-500">·</span>
                      <span className="text-[10px] text-slate-500">{a.timestamp}</span>
                    </div>
                    <div className="text-sm font-semibold text-slate-100 mb-1">{a.title}</div>
                    <div className="text-xs text-slate-600 leading-snug">{a.description}</div>
                    {a.vessel && (
                      <div className="mt-1.5 text-xs text-slate-500 flex items-center gap-1">
                        <span>🚢</span>
                        <span className="font-medium text-slate-700">{a.vessel}</span>
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
        .custom-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
        .custom-scroll::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}</style>
    </div>
  )
}
