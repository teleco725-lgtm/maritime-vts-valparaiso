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
      <div className="h-full flex items-center justify-center text-slate-500 text-xs text-center p-4">
        <div>
          <Ship className="w-8 h-8 mx-auto mb-2 opacity-30" />
          Seleccione un buque del mapa o de la lista para ver sus detalles.
        </div>
      </div>
    )
  }

  const fields = [
    { label: 'MMSI', value: vessel.mmsi, icon: Database },
    { label: 'IMO', value: vessel.imo, icon: Database },
    { label: 'Tipo', value: getVesselTypeLabel(vessel.type), icon: Ship },
    { label: 'Estado', value: getStatusLabel(vessel.status), icon: vessel.status === 'moored' ? Anchor : Navigation },
    { label: 'SOG', value: `${vessel.sog.toFixed(1)} kn`, icon: Gauge },
    { label: 'Rumbo', value: `${vessel.cog}°`, icon: Compass },
    { label: 'Eslora', value: `${vessel.length} m`, icon: Ruler },
    { label: 'Manga', value: `${vessel.beam} m`, icon: Ruler },
    { label: 'Calado', value: `${vessel.draft} m`, icon: Ruler },
    { label: 'Lat.', value: vessel.lat.toFixed(4), icon: MapPin },
    { label: 'Lng.', value: vessel.lng.toFixed(4), icon: MapPin },
    { label: 'ETA', value: vessel.eta, icon: Clock },
  ]

  return (
    <div className="h-full flex flex-col bg-slate-900/50 border border-slate-700 rounded-lg overflow-hidden">
      <div className="p-3 border-b border-slate-700 bg-slate-900/70">
        <div className="flex items-center justify-between mb-1">
          <span className="font-semibold text-slate-100 text-sm truncate">{vessel.name}</span>
          <Badge variant="outline" className="bg-slate-800 text-slate-300 border-slate-600 text-[9px]">
            {vessel.flag}
          </Badge>
        </div>
        <div className="text-[10px] text-slate-500">{vessel.destination}</div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 custom-scroll">
        <motion.div
          key={vessel.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-1.5"
        >
          {fields.map((f, i) => {
            const Icon = f.icon
            return (
              <motion.div
                key={f.label}
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.02 }}
                className="flex items-center gap-2 text-xs bg-slate-800/40 rounded px-2 py-1.5"
              >
                <Icon className="w-3 h-3 text-cyan-400 flex-shrink-0" />
                <span className="text-slate-500 w-14 flex-shrink-0">{f.label}</span>
                <span className="text-slate-200 font-mono ml-auto text-right">{f.value}</span>
              </motion.div>
            )
          })}

          {/* Confidence IA */}
          <div className="mt-3 pt-3 border-t border-slate-700">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <Cpu className="w-3 h-3 text-cyan-400" /> Confianza IA Fusión
              </span>
              <span className={vessel.confidence > 98 ? 'text-emerald-400' : vessel.confidence > 95 ? 'text-amber-400' : 'text-red-400'}>
                {vessel.confidence.toFixed(1)}%
              </span>
            </div>
            <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${vessel.confidence}%` }}
                transition={{ duration: 0.6 }}
                className={vessel.confidence > 98 ? 'bg-emerald-500' : vessel.confidence > 95 ? 'bg-amber-500' : 'bg-red-500'}
              />
            </div>
            <div className="text-[9px] text-slate-500 mt-1">Fusión Kalman + LSTM · última actualización {vessel.lastUpdate}</div>
          </div>

          {/* Registro */}
          <div className="mt-2 flex items-center justify-between text-[10px]">
            <span className="text-slate-500">Registro:</span>
            <Badge variant="outline" className="bg-slate-800 text-slate-300 border-slate-700">
              {vessel.registry}
            </Badge>
          </div>
        </motion.div>
      </div>

      <style jsx>{`
        .custom-scroll::-webkit-scrollbar { width: 5px; }
        .custom-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #334155; border-radius: 3px; }
      `}</style>
    </div>
  )
}
