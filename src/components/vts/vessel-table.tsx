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
    <div className="flex flex-col h-full bg-slate-900/50 border border-slate-700 rounded-lg overflow-hidden">
      <div className="p-3 border-b border-slate-700 space-y-2">
        <div className="flex items-center gap-2 text-cyan-400 text-sm font-medium">
          <Ship className="w-4 h-4" />
          <span>Registro de Buques — AIS / SNRB / IMO</span>
          <Badge variant="outline" className="ml-auto bg-slate-800 text-slate-300 border-slate-600">
            {filtered.length} naves
          </Badge>
        </div>
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nombre, MMSI o IMO..."
            className="pl-8 h-8 bg-slate-800 border-slate-700 text-slate-200 text-sm"
          />
        </div>
        <div className="flex flex-wrap gap-1">
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
              className={`px-2 py-1 text-[11px] rounded ${
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
                className={`border-b border-slate-800 p-3 cursor-pointer transition-colors ${
                  isSelected ? 'bg-cyan-500/10 border-l-2 border-l-cyan-400' : 'hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: getVesselStatusColor(v.status) }}
                    />
                    <span className="font-semibold text-sm text-slate-100 truncate">{v.name}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 flex-shrink-0">{v.flag}</span>
                </div>
                <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px] text-slate-400">
                  <div className="flex items-center gap-1">
                    <span className="text-slate-500">MMSI:</span>
                    <span className="font-mono text-slate-300">{v.mmsi}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-slate-500">IMO:</span>
                    <span className="font-mono text-slate-300">{v.imo}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Ship className="w-2.5 h-2.5" />
                    <span>{getVesselTypeLabel(v.type)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {v.status === 'moored' ? <Anchor className="w-2.5 h-2.5" /> : <Navigation className="w-2.5 h-2.5" />}
                    <span>{getStatusLabel(v.status)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Gauge className="w-2.5 h-2.5" />
                    <span>{v.sog.toFixed(1)} kn</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" />
                    <span className="truncate">{v.eta}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-1.5">
                  <Badge variant="outline" className="text-[9px] bg-slate-800/60 border-slate-700 text-slate-300">
                    {v.registry}
                  </Badge>
                  <div className="flex items-center gap-1 text-[10px]">
                    <span className="text-slate-500">IA:</span>
                    <span className={v.confidence > 98 ? 'text-emerald-400' : v.confidence > 95 ? 'text-amber-400' : 'text-red-400'}>
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
        .custom-scroll::-webkit-scrollbar-thumb { background: #334155; border-radius: 3px; }
      `}</style>
    </div>
  )
}
