'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { type Vessel, getVesselTypeLabel, getStatusLabel } from '@/lib/vts/data'
import { Badge } from '@/components/ui/badge'
import { Ship, Anchor, Navigation, Gauge, Compass, Ruler, Clock, MapPin, Database, Cpu } from 'lucide-react'

interface Props {
  vessel: Vessel | null
}

export default function VesselDetail({ vessel }: Props) {
  if (!vessel) {
    return (
      <div className="h-full flex items-center justify-center text-slate-500 text-sm text-center p-4 bg-[#111927] border border-slate-700/60 rounded-xl shadow-lg shadow-black/30">
        <div>
          <Ship className="w-12 h-12 mx-auto mb-3 opacity-30 text-slate-400" />
          <div className="font-medium text-slate-600 mb-1">Seleccione un buque</div>
          <div className="text-xs text-slate-500">Haga clic en el mapa o en la lista para ver detalles</div>
        </div>
      </div>
    )
  }

  const fields = [
    { label: 'MMSI', value: vessel.mmsi, icon: Database },
    { label: 'IMO', value: vessel.imo, icon: Database },
    { label: 'Tipo', value: getVesselTypeLabel(vessel.type), icon: Ship },
    { label: 'Estado', value: getStatusLabel(vessel.status), icon: vessel.status === 'moored' ? Anchor : Navigation },
    { label: 'Velocidad', value: `${vessel.sog.toFixed(1)} nudos`, icon: Gauge },
    { label: 'Rumbo', value: `${vessel.cog}°`, icon: Compass },
    { label: 'Eslora', value: `${vessel.length} m`, icon: Ruler },
    { label: 'Manga', value: `${vessel.beam} m`, icon: Ruler },
    { label: 'Calado', value: `${vessel.draft} m`, icon: Ruler },
    { label: 'Latitud', value: vessel.lat.toFixed(4), icon: MapPin },
    { label: 'Longitud', value: vessel.lng.toFixed(4), icon: MapPin },
    { label: 'Llegada', value: vessel.eta, icon: Clock },
  ]

  return (
    <div className="h-full flex flex-col bg-[#111927] border border-slate-700/60 rounded-xl overflow-hidden shadow-lg shadow-black/30">
      <div className="p-4 border-b border-slate-700/50 bg-[#0f1620]">
        <div className="flex items-center justify-between mb-1">
          <span className="font-bold text-slate-100 text-base truncate">{vessel.name}</span>
          <Badge variant="secondary" className="bg-[#1a2433] text-sky-800 border-slate-700/50 text-xs px-2 py-0.5">
            {vessel.flag}
          </Badge>
        </div>
        <div className="text-xs text-slate-600">{vessel.destination}</div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 custom-scroll">
        <motion.div
          key={vessel.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-2"
        >
          {fields.map((f, i) => {
            const Icon = f.icon
            return (
              <motion.div
                key={f.label}
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.02 }}
                className="flex items-center gap-2 text-sm bg-[#1a2433] rounded-lg px-3 py-2 border border-slate-700/40"
              >
                <Icon className="w-4 h-4 text-[#00D2FF] flex-shrink-0" />
                <span className="text-slate-500 w-20 flex-shrink-0 text-xs">{f.label}</span>
                <span className="text-slate-100 font-mono ml-auto text-right font-medium">{f.value}</span>
              </motion.div>
            )
          })}

          {/* Confidence IA */}
          <div className="mt-4 pt-4 border-t border-slate-700/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-600 flex items-center gap-1.5 font-medium">
                <Cpu className="w-4 h-4 text-[#00D2FF]" /> Precisión IA
              </span>
              <span className={`font-bold text-base ${vessel.confidence > 98 ? 'text-emerald-600' : vessel.confidence > 95 ? 'text-amber-600' : 'text-red-600'}`}>
                {vessel.confidence.toFixed(1)}%
              </span>
            </div>
            <div className="h-2 bg-[#1a2433] rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${vessel.confidence}%` }}
                transition={{ duration: 0.6 }}
                className={vessel.confidence > 98 ? 'bg-[#00FF66]/150' : vessel.confidence > 95 ? 'bg-amber-500/150' : 'bg-red-500'}
              />
            </div>
            <div className="text-xs text-slate-500 mt-1.5">Fusión Kalman + LSTM · actualizado {vessel.lastUpdate}</div>
          </div>

          {/* Registro */}
          <div className="mt-3 flex items-center justify-between text-sm bg-[#00D2FF]/10 rounded-lg px-3 py-2 border border-sky-100">
            <span className="text-slate-600">Registro:</span>
            <Badge variant="outline" className="bg-[#1a2433] text-slate-300 border-slate-700/60">
              {vessel.registry}
            </Badge>
          </div>
        </motion.div>
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
