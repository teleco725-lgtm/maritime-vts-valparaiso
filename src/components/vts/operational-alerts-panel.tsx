'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useMemo, useEffect } from 'react'
import { vessels as allVessels, type Vessel } from '@/lib/vts/data'
import { Badge } from '@/components/ui/badge'
import {
  AlertTriangle, AlertCircle, Activity, Map, Radio, Clock, Gauge,
  Ship, Anchor, Navigation, Crosshair, TrendingDown, Bell, BellRing, Shield
} from 'lucide-react'

interface CPAAlert {
  id: string
  type: 'cpa' | 'geofence' | 'maneuver'
  severity: 'critical' | 'high' | 'medium' | 'low'
  vessel1: string
  vessel2?: string
  title: string
  description: string
  detail: string
  timestamp: string
}

// Cálculo real de CPA (Closest Point of Approach) y TCPA (Time to CPA)
// entre dos buques en movimiento
function calculateCPA(v1: Vessel, v2: Vessel): { cpa: number, tcpa: number } | null {
  if (v1.sog < 0.1 && v2.sog < 0.1) return null

  // Convertir a nudos a unidades por segundo (1 nudo = 1852m/h = 0.5144 m/s)
  // Para simplificar, usamos unidades del mapa SVG (1 unidad ≈ 1 metro escalado)
  const speedScale = 0.4 // mismo factor que usa use-realtime-vessels
  const v1vx = Math.sin((v1.cog * Math.PI) / 180) * v1.sog * speedScale
  const v1vy = -Math.cos((v1.cog * Math.PI) / 180) * v1.sog * speedScale
  const v2vx = Math.sin((v2.cog * Math.PI) / 180) * v2.sog * speedScale
  const v2vy = -Math.cos((v2.cog * Math.PI) / 180) * v2.sog * speedScale

  const dvx = v2vx - v1vx
  const dvy = v2vy - v1vy
  const dx = v2.x - v1.x
  const dy = v2.y - v1.y

  const denominator = dvx * dvx + dvy * dvy
  if (denominator < 0.001) return null

  const tcpaTicks = -(dx * dvx + dy * dvy) / denominator
  if (tcpaTicks < 0) return null // divergiendo

  const cpaX = dx + dvx * tcpaTicks
  const cpaY = dy + dvy * tcpaTicks
  const cpa = Math.sqrt(cpaX * cpaX + cpaY * cpaY)

  // Convertir ticks a segundos (1 tick = 1 segundo)
  const tcpaSeconds = tcpaTicks

  return { cpa, tcpa: tcpaSeconds }
}

// Distancia actual entre dos buques
function distance(v1: Vessel, v2: Vessel): number {
  return Math.sqrt((v2.x - v1.x) ** 2 + (v2.y - v1.y) ** 2)
}

const STATUS_CHANGES = [
  { from: 'arrival', to: 'underway', label: 'Inicio de maniobra de aproximación' },
  { from: 'underway', to: 'moored', label: 'Atraque completado' },
  { from: 'moored', to: 'underway', label: 'Zarpe iniciado' },
  { from: 'underway', to: 'anchored', label: 'Fondeo confirmado' },
  { from: 'anchored', to: 'underway', label: 'Levantó ancla' },
]

interface Props {
  vessels: Vessel[]
}

export default function OperationalAlertsPanel({ vessels }: Props) {
  const [filter, setFilter] = useState<'all' | 'cpa' | 'geofence' | 'maneuver'>('all')
  const [currentTime, setCurrentTime] = useState(new Date())

  // Recalcular alertas cada 2 segundos
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 2000)
    return () => clearInterval(interval)
  }, [])

  // Generar alertas dinámicamente
  const alerts = useMemo<CPAAlert[]>(() => {
    const result: CPAAlert[] = []

    // 1. CPA/TCPA — pares de buques en movimiento
    const underwayVessels = vessels.filter(v => v.sog > 0.1)
    for (let i = 0; i < underwayVessels.length; i++) {
      for (let j = i + 1; j < underwayVessels.length; j++) {
        const v1 = underwayVessels[i]
        const v2 = underwayVessels[j]
        const cpaResult = calculateCPA(v1, v2)
        const currentDist = distance(v1, v2)

        if (!cpaResult) continue

        const { cpa, tcpa } = cpaResult
        // Convertir CPA a "millas náuticas" aproximadas (1 unidad ≈ 0.05 NM)
        const cpaNM = cpa * 0.05
        const tcpaMin = tcpa / 60

        // Solo alertas relevantes
        if (currentDist > 80) continue // si están muy lejos, ignorar

        let severity: CPAAlert['severity'] = 'low'
        let title = `Proximidad ${v1.name} ↔ ${v2.name}`
        let detail = `CPA: ${cpaNM.toFixed(2)}NM · TCPA: ${tcpaMin.toFixed(1)}min · Dst actual: ${(currentDist * 0.05).toFixed(2)}NM`

        if (cpaNM < 0.5 && tcpaMin < 5) {
          severity = 'critical'
          title = `RIESGO DE COLISIÓN ${v1.name} ↔ ${v2.name}`
        } else if (cpaNM < 1.0 && tcpaMin < 10) {
          severity = 'high'
          title = `Acercamiento crítico ${v1.name} ↔ ${v2.name}`
        } else if (cpaNM < 2.0 && tcpaMin < 15) {
          severity = 'medium'
          title = `Acercamiento vigilado ${v1.name} ↔ ${v2.name}`
        } else {
          continue
        }

        result.push({
          id: `cpa-${v1.id}-${v2.id}`,
          type: 'cpa',
          severity,
          vessel1: v1.name,
          vessel2: v2.name,
          title,
          description: detail,
          detail: `MMSI ${v1.mmsi} ↔ MMSI ${v2.mmsi}`,
          timestamp: 'en vivo',
        })
      }
    }

    // 2. Geofence — buques próximos a zonas restringidas
    vessels.forEach(v => {
      // Zona restringida: alrededor de la costa (y < 110 en el SVG = cerca de costa)
      const distToCoast = v.y - 110
      if (distToCoast < 30 && distToCoast > 0 && v.sog > 5) {
        result.push({
          id: `geo-coast-${v.id}`,
          type: 'geofence',
          severity: distToCoast < 15 ? 'high' : 'medium',
          vessel1: v.name,
          title: `Proximidad a costa de ${v.name}`,
          description: `Buque a ${(distToCoast * 0.05).toFixed(2)}NM de costa · SOG ${v.sog.toFixed(1)}kn — velocidad excesiva para zona`,
          detail: `MMSI ${v.mmsi} · Coordenadas ${v.lat.toFixed(4)}, ${v.lng.toFixed(4)}`,
          timestamp: 'en vivo',
        })
      }

      // Zona de fondeo (centro del puerto, x: 600-700, y: 460-490)
      const inAnchorageZone = v.x > 580 && v.x < 720 && v.y > 450 && v.y < 500
      if (inAnchorageZone && v.status !== 'anchored' && v.status !== 'moored' && v.sog > 1) {
        result.push({
          id: `geo-anchor-${v.id}`,
          type: 'geofence',
          severity: 'medium',
          vessel1: v.name,
          title: `Tránsito por zona de fondeo de ${v.name}`,
          description: `Buque en tránsito por zona de fondeo sin autorización de fondeo`,
          detail: `MMSI ${v.mmsi} · Velocidad ${v.sog.toFixed(1)}kn en zona de fondeo`,
          timestamp: 'en vivo',
        })
      }

      // Mar territorial — buques cerca del límite 12NM (radio 280)
      const distFromCenter = Math.sqrt((v.x - 500) ** 2 + (v.y - 350) ** 2)
      if (distFromCenter > 270 && distFromCenter < 290) {
        result.push({
          id: `geo-terrlimit-${v.id}`,
          type: 'geofence',
          severity: 'low',
          vessel1: v.name,
          title: `Cerca de límite de mar territorial`,
          description: `Buque próximo al límite de las 12NM (zona VTS)`,
          detail: `MMSI ${v.mmsi} · Dist. al límite: ${((290 - distFromCenter) * 0.05).toFixed(2)}NM`,
          timestamp: 'en vivo',
        })
      }
    })

    // 3. Cambios de estado (simulado con eventos recientes)
    const recentManeuvers = [
      { id: 'man-1', vessel: 'MSC ISABELLA', from: 'arrival', to: 'underway', desc: 'Inicio de maniobra de aproximación', time: 'hace 3 min' },
      { id: 'man-2', vessel: 'EVER GIVEN', from: 'arrival', to: 'moored', desc: 'Atraque completado en Muelle 3', time: 'hace 12 min' },
      { id: 'man-3', vessel: 'TUG ALONSO', from: 'moored', to: 'underway', desc: 'Zarpe para asistencia a HAPAG-LLOYD', time: 'hace 8 min' },
      { id: 'man-4', vessel: 'HAPAG-LLOYD QUITO', from: 'underway', to: 'anchored', desc: 'Fondeo en Zona No.3', time: 'hace 25 min' },
    ]

    recentManeuvers.forEach(m => {
      result.push({
        id: m.id,
        type: 'maneuver',
        severity: 'medium',
        vessel1: m.vessel,
        title: m.desc,
        description: `Cambio de estado: ${m.from} → ${m.to}`,
        detail: m.time,
        timestamp: m.time,
      })
    })

    return result.sort((a, b) => {
      const sevOrder = { critical: 0, high: 1, medium: 2, low: 3 }
      return sevOrder[a.severity] - sevOrder[b.severity]
    })
  }, [vessels, currentTime])

  const filteredAlerts = filter === 'all' ? alerts : alerts.filter(a => a.type === filter)

  const config = {
    critical: { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30', label: 'CRÍTICA' },
    high: { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', label: 'ALTA' },
    medium: { color: 'text-yellow-300', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', label: 'MEDIA' },
    low: { color: 'text-sky-300', bg: 'bg-sky-500/10', border: 'border-sky-500/30', label: 'BAJA' },
  }

  const typeIcon = {
    cpa: Crosshair,
    geofence: Map,
    maneuver: Activity,
  }

  const criticalCount = alerts.filter(a => a.severity === 'critical').length
  const highCount = alerts.filter(a => a.severity === 'high').length

  return (
    <div className="flex flex-col h-full bg-[var(--vts-card)] border border-slate-700/60 rounded-xl overflow-hidden shadow-lg shadow-black/30">
      <div className="p-4 border-b border-slate-700/40 bg-[var(--vts-subcard)]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-[#00FF66] text-base font-semibold font-mono">
            {criticalCount > 0 || highCount > 0 ? (
              <BellRing className="w-5 h-5 animate-pulse text-red-400" />
            ) : (
              <Bell className="w-5 h-5" />
            )}
            <span>Alertas Operacionales</span>
          </div>
          <div className="flex gap-1">
            {criticalCount > 0 && (
              <Badge variant="outline" className="bg-red-500/15 text-red-400 border-red-500/40 text-[10px] px-2">
                {criticalCount} CRÍT
              </Badge>
            )}
            {highCount > 0 && (
              <Badge variant="outline" className="bg-amber-500/15 text-amber-400 border-amber-500/40 text-[10px] px-2">
                {highCount} ALTA
              </Badge>
            )}
            <Badge variant="outline" className="bg-[#00FF66]/15 text-[#00FF66] border-[#00FF66]/30 text-[10px] px-2">
              {alerts.length} TOTAL
            </Badge>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {[
            { id: 'all', label: 'Todas' },
            { id: 'cpa', label: 'CPA/TCPA' },
            { id: 'geofence', label: 'Geofence' },
            { id: 'maneuver', label: 'Maniobras' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id as any)}
              className={`px-2.5 py-1 text-[11px] font-medium rounded font-mono transition-colors ${
                filter === f.id
                  ? 'bg-[#00FF66]/15 text-[#00FF66] border border-[#00FF66]/40'
                  : 'bg-[#1a2433] text-slate-400 border border-slate-700/40 hover:text-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1.5 custom-scroll">
        <AnimatePresence>
          {filteredAlerts.map((a) => {
            const c = config[a.severity]
            const Icon = typeIcon[a.type]
            return (
              <motion.div
                key={a.id}
                layout
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className={`rounded-lg border p-2.5 ${c.bg} ${c.border}`}
              >
                <div className="flex items-start gap-2">
                  <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${c.color}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${c.bg} ${c.color} border ${c.border}`}>
                        {c.label}
                      </span>
                      <span className="text-[9px] text-slate-500">·</span>
                      <span className="text-[9px] text-slate-500 font-mono">{a.timestamp}</span>
                    </div>
                    <div className="text-xs font-semibold text-slate-100 mb-0.5">{a.title}</div>
                    <div className="text-[11px] text-slate-400 leading-snug">{a.description}</div>
                    {a.detail && (
                      <div className="text-[10px] text-slate-600 font-mono mt-0.5">{a.detail}</div>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
          {filteredAlerts.length === 0 && (
            <div className="text-center py-8 text-slate-500 text-sm">
              <Shield className="w-8 h-8 mx-auto mb-2 opacity-30" />
              No hay alertas de este tipo
            </div>
          )}
        </AnimatePresence>
      </div>

      <div className="border-t border-slate-700/40 bg-[var(--vts-subcard)] p-2 text-[9px] text-slate-500 text-center font-mono">
        CPA = Closest Point of Approach · TCPA = Time to CPA · Cálculo en tiempo real
      </div>

      <style jsx>{`
        .custom-scroll::-webkit-scrollbar { width: 5px; }
        .custom-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #334155; border-radius: 3px; }
      `}</style>
    </div>
  )
}
