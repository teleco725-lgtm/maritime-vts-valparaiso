'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { vessels, getVesselStatusColor, getVesselTypeLabel, getStatusLabel, type Vessel } from '@/lib/vts/data'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search, Ship, Anchor, Navigation, Gauge, MapPin, Clock } from 'lucide-react'

interface Props {
  selectedVessel: Vessel | null
  onSelectVessel: (v: Vessel) => void
}

export default function VesselTable({ selectedVessel, onSelectVessel }: Props) {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<'all' | Vessel['status']>('all')

  const filtered = useMemo(() => {
    return vessels.filter((v) => {
      const matchesQuery = v.name.toLowerCase().includes(query.toLowerCase()) ||
        v.mmsi.includes(query) || v.imo.includes(query)
      const matchesFilter = filter === 'all' || v.status === filter
      return matchesQuery && matchesFilter
    })
  }, [query, filter])

  return (
    <div className="flex flex-col h-full bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      <div className="p-4 border-b border-slate-200 space-y-3 bg-slate-50/50">
        <div className="flex items-center gap-2 text-sky-700 text-base font-semibold">
          <Ship className="w-5 h-5" />
          <span>Registro de Buques</span>
          <Badge variant="secondary" className="ml-auto bg-sky-100 text-sky-700 border-sky-200 text-xs px-2 py-0.5">
            {filtered.length} naves
          </Badge>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nombre, MMSI o IMO..."
            className="pl-10 h-10 bg-white border-slate-300 text-slate-800 text-sm"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {[
            { id: 'all', label: 'Todos' },
            { id: 'underway', label: 'Navegando' },
            { id: 'arrival', label: 'Aproxim.' },
            { id: 'moored', label: 'Atracados' },
            { id: 'anchored', label: 'Fondeados' },
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

      <div className="flex-1 overflow-y-auto custom-scroll">
        <AnimatePresence>
          {filtered.map((v) => {
            const isSelected = selectedVessel?.id === v.id
            return (
              <motion.div
                key={v.id}
                layout
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                onClick={() => onSelectVessel(v)}
                className={`border-b border-slate-100 p-3 cursor-pointer transition-colors ${
                  isSelected ? 'bg-sky-50 border-l-4 border-l-sky-500' : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0 ring-2 ring-offset-1 ring-slate-200"
                      style={{ backgroundColor: getVesselStatusColor(v.status) }}
                    />
                    <span className="font-semibold text-sm text-slate-900 truncate">{v.name}</span>
                  </div>
                  <span className="text-xs text-slate-500 flex-shrink-0 font-medium">{v.flag}</span>
                </div>
                <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-slate-600">
                  <div className="flex items-center gap-1">
                    <span className="text-slate-400">MMSI:</span>
                    <span className="font-mono text-slate-700">{v.mmsi}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-slate-400">IMO:</span>
                    <span className="font-mono text-slate-700">{v.imo}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Ship className="w-3 h-3 text-sky-600" />
                    <span>{getVesselTypeLabel(v.type)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {v.status === 'moored' ? <Anchor className="w-3 h-3 text-emerald-600" /> : <Navigation className="w-3 h-3 text-sky-600" />}
                    <span>{getStatusLabel(v.status)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Gauge className="w-3 h-3 text-violet-600" />
                    <span>{v.sog.toFixed(1)} kn</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-600" />
                    <span className="truncate">{v.eta}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <Badge variant="outline" className="text-[10px] bg-white border-slate-300 text-slate-600">
                    {v.registry}
                  </Badge>
                  <div className="flex items-center gap-1 text-xs">
                    <span className="text-slate-400">Precisión IA:</span>
                    <span className={`font-semibold ${v.confidence > 98 ? 'text-emerald-600' : v.confidence > 95 ? 'text-amber-600' : 'text-red-600'}`}>
                      {v.confidence.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      <style jsx>{`
        .custom-scroll::-webkit-scrollbar { width: 6px; }
        .custom-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
        .custom-scroll::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}</style>
    </div>
  )
}
