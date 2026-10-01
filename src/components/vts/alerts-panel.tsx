'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { alerts as initialAlerts, type AlertItem } from '@/lib/vts/data'
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, ShieldAlert, ShieldCheck, Activity, Wind, Radio, Map } from 'lucide-react'

const severityConfig: Record<AlertItem['severity'], { color: string; bg: string; border: string; label: string; text: string }> = {
  critical: { color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', label: 'CRÍTICA', text: 'text-red-700' },
  high: { color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', label: 'ALTA', text: 'text-amber-700' },
  medium: { color: 'text-yellow-700', bg: 'bg-yellow-50', border: 'border-yellow-200', label: 'MEDIA', text: 'text-yellow-800' },
  low: { color: 'text-sky-700', bg: 'bg-sky-50', border: 'border-sky-200', label: 'BAJA', text: 'text-sky-800' },
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
    <div className="flex flex-col h-full bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      <div className="p-4 border-b border-slate-200 bg-slate-50/50">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-sky-700 text-base font-semibold">
            <ShieldAlert className="w-5 h-5" />
            <span>Centro de Alertas</span>
          </div>
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-xs px-2 py-0.5">
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
                  : 'bg-white text-slate-600 border border-slate-300 hover:bg-slate-50'
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
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${sc.bg} ${sc.text} border ${sc.border}`}>
                        {sc.label}
                      </span>
                      <span className="text-[10px] text-slate-500">·</span>
                      <span className="text-[10px] text-slate-500">{a.timestamp}</span>
                    </div>
                    <div className="text-sm font-semibold text-slate-900 mb-1">{a.title}</div>
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
