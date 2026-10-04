'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import {
  Truck, Wind, Eye, CloudRain, Thermometer, Leaf, Clock,
  Activity, AlertTriangle, CheckCircle2, Gauge, Droplets,
  Sun, Cloud, CloudFog, Zap
} from 'lucide-react'

// Datos simulados pero realistas para ZEAL Valparaíso
// En producción se conectaría a: MeteoChile API, SHOA, Dirección Meteorológica
interface ZealStatus {
  portAccess: 'open' | 'restricted' | 'closed'
  waitTime: number // minutos
  trucksWaiting: number
  weather: {
    temp: number
    windSpeed: number
    windDir: string
    visibility: number // km
    condition: 'sunny' | 'cloudy' | 'fog' | 'rain' | 'windy'
    humidity: number
  }
  airQuality: {
    pm25: number
    pm10: number
    index: number // 0-500 AQI
    level: 'good' | 'moderate' | 'unhealthy' | 'hazardous'
  }
  environmental: {
    co2Saved: number // toneladas CO2 evitadas este mes
    recyclingRate: number // %
    wasteManaged: number // toneladas
    cleanEnergy: number // % energía renovable
  }
  alerts: { type: string; message: string; severity: 'info' | 'warning' | 'critical' }[]
}

const initialStatus: ZealStatus = {
  portAccess: 'restricted',
  waitTime: 45,
  trucksWaiting: 38,
  weather: {
    temp: 16,
    windSpeed: 24,
    windDir: 'SO',
    visibility: 0.8,
    condition: 'fog',
    humidity: 87,
  },
  airQuality: {
    pm25: 18,
    pm10: 35,
    index: 62,
    level: 'moderate',
  },
  environmental: {
    co2Saved: 142.5,
    recyclingRate: 78,
    wasteManaged: 12.3,
    cleanEnergy: 45,
  },
  alerts: [
    { type: 'wind', message: 'Viento SO 24kn con ráfagas 35kn — precaución vehículos de gran porte', severity: 'warning' },
    { type: 'fog', message: 'Niebla costera — visibilidad 0.8km en Ruta La Pólvora', severity: 'warning' },
    { type: 'port', message: 'Acceso restringido por marejadas — solo camiones con cita confirmada', severity: 'critical' },
  ],
}

export default function ZealModule() {
  const [status, setStatus] = useState<ZealStatus>(initialStatus)
  const [expanded, setExpanded] = useState(false)
  const [clock, setClock] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => setClock(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  const conditionConfig = {
    sunny: { icon: Sun, color: 'text-amber-400', label: 'Despejado' },
    cloudy: { icon: Cloud, color: 'text-slate-400', label: 'Nublado' },
    fog: { icon: CloudFog, color: 'text-slate-300', label: 'Niebla' },
    rain: { icon: CloudRain, color: 'text-sky-400', label: 'Lluvia' },
    windy: { icon: Wind, color: 'text-cyan-400', label: 'Ventisca' },
  }

  const aqiConfig = {
    good: { color: 'text-emerald-400', bg: 'bg-emerald-500/10', label: 'BUENA', emoji: '🟢' },
    moderate: { color: 'text-amber-400', bg: 'bg-amber-500/10', label: 'MODERADA', emoji: '🟡' },
    unhealthy: { color: 'text-orange-400', bg: 'bg-orange-500/10', label: 'NO SALUDABLE', emoji: '🟠' },
    hazardous: { color: 'text-red-400', bg: 'bg-red-500/10', label: 'PELIGROSA', emoji: '🔴' },
  }

  const accessConfig = {
    open: { color: 'text-emerald-400', bg: 'bg-emerald-500/10', label: 'ABIERTO', icon: CheckCircle2 },
    restricted: { color: 'text-amber-400', bg: 'bg-amber-500/10', label: 'RESTRINGIDO', icon: AlertTriangle },
    closed: { color: 'text-red-400', bg: 'bg-red-500/10', label: 'CERRADO', icon: AlertTriangle },
  }

  const cond = conditionConfig[status.weather.condition]
  const aqi = aqiConfig[status.airQuality.level]
  const access = accessConfig[status.portAccess]
  const AccessIcon = access.icon
  const CondIcon = cond.icon

  return (
    <div className="fixed bottom-6 left-6 z-40">
      {/* Botón flotante cuando está colapsado */}
      <AnimatePresence>
        {!expanded && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={() => setExpanded(true)}
            className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[var(--vts-card)] border border-slate-700/60 shadow-lg shadow-black/30 hover:border-[#00FF66]/40 transition-colors"
          >
            <Truck className="w-5 h-5 text-[#00FF66]" />
            <div className="text-left">
              <div className="text-xs font-semibold text-slate-200 font-mono">ZEAL</div>
              <div className={`text-[10px] ${access.color} font-mono`}>{access.label}</div>
            </div>
            <span className="flex items-center gap-1 text-[10px] text-slate-500 ml-2">
              <Clock className="w-3 h-3" />
              {status.waitTime}min
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Panel expandido */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="w-80 bg-[var(--vts-card)] border border-slate-700/60 rounded-xl shadow-2xl shadow-black/50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b border-slate-700/40 bg-[var(--vts-subcard)]">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#00FF66]" />
                <span className="text-sm font-semibold text-slate-100 font-mono">ZEAL — Logística</span>
              </div>
              <button
                onClick={() => setExpanded(false)}
                className="text-slate-400 hover:text-slate-200 text-xs"
              >
                ✕
              </button>
            </div>

            <div className="p-3 space-y-3 max-h-[500px] overflow-y-auto custom-scroll">
              {/* Estado de acceso al puerto */}
              <div className={`rounded-lg border p-2.5 ${access.bg} border-current/30`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AccessIcon className={`w-4 h-4 ${access.color}`} />
                    <span className="text-xs font-semibold text-slate-200">Acceso Puerto</span>
                  </div>
                  <span className={`text-xs font-bold ${access.color} font-mono`}>{access.label}</span>
                </div>
                <div className="flex items-center justify-between mt-1.5 text-[10px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Truck className="w-3 h-3" />
                    {status.trucksWaiting} camiones en fila
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    ~{status.waitTime} min espera
                  </span>
                </div>
              </div>

              {/* Clima para transportistas */}
              <div>
                <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1.5 font-semibold">
                  🌡️ Clima Ruta La Pólvora
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="rounded-lg bg-[var(--vts-subcard)] border border-slate-700/40 p-2 text-center">
                    <CondIcon className={`w-4 h-4 mx-auto mb-1 ${cond.color}`} />
                    <div className="text-[10px] text-slate-500">{cond.label}</div>
                    <div className="text-sm font-bold text-slate-100">{status.weather.temp}°C</div>
                  </div>
                  <div className="rounded-lg bg-[var(--vts-subcard)] border border-slate-700/40 p-2 text-center">
                    <Wind className="w-4 h-4 mx-auto mb-1 text-cyan-400" />
                    <div className="text-[10px] text-slate-500">Viento</div>
                    <div className="text-sm font-bold text-slate-100">{status.weather.windSpeed}kn</div>
                    <div className="text-[9px] text-slate-500">{status.weather.windDir}</div>
                  </div>
                  <div className="rounded-lg bg-[var(--vts-subcard)] border border-slate-700/40 p-2 text-center">
                    <Eye className="w-4 h-4 mx-auto mb-1 text-slate-400" />
                    <div className="text-[10px] text-slate-500">Visibilidad</div>
                    <div className={`text-sm font-bold ${status.weather.visibility < 1 ? 'text-red-400' : 'text-slate-100'}`}>
                      {status.weather.visibility}km
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-1.5 text-[10px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <Droplets className="w-3 h-3" />
                    Humedad: {status.weather.humidity}%
                  </span>
                  <span className="font-mono">{clock.toLocaleTimeString('es-CL')}</span>
                </div>
              </div>

              {/* Calidad del aire */}
              <div>
                <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1.5 font-semibold">
                  🍃 Calidad del Aire (AQI)
                </div>
                <div className={`rounded-lg border p-2.5 ${aqi.bg} border-current/30`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-lg font-bold ${aqi.color}`}>{status.airQuality.index}</span>
                    <span className={`text-xs font-bold ${aqi.color}`}>{aqi.label}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-1.5 text-[10px] text-slate-400">
                    <span>PM2.5: {status.airQuality.pm25} µg/m³</span>
                    <span>PM10: {status.airQuality.pm10} µg/m³</span>
                  </div>
                </div>
              </div>

              {/* Gestión ambiental TPS */}
              <div>
                <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1.5 font-semibold">
                  🌱 Gestión Ambiental TPS
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-lg bg-[var(--vts-subcard)] border border-emerald-500/20 p-2">
                    <div className="flex items-center gap-1 mb-0.5">
                      <Leaf className="w-3 h-3 text-emerald-400" />
                      <span className="text-[9px] text-slate-500">CO₂ evitado</span>
                    </div>
                    <div className="text-sm font-bold text-emerald-400">{status.environmental.co2Saved}t</div>
                    <div className="text-[8px] text-slate-500">este mes</div>
                  </div>
                  <div className="rounded-lg bg-[var(--vts-subcard)] border border-emerald-500/20 p-2">
                    <div className="flex items-center gap-1 mb-0.5">
                      <Activity className="w-3 h-3 text-emerald-400" />
                      <span className="text-[9px] text-slate-500">Reciclaje</span>
                    </div>
                    <div className="text-sm font-bold text-emerald-400">{status.environmental.recyclingRate}%</div>
                    <div className="text-[8px] text-slate-500">residuos</div>
                  </div>
                  <div className="rounded-lg bg-[var(--vts-subcard)] border border-sky-500/20 p-2">
                    <div className="flex items-center gap-1 mb-0.5">
                      <Zap className="w-3 h-3 text-sky-400" />
                      <span className="text-[9px] text-slate-500">Energía limpia</span>
                    </div>
                    <div className="text-sm font-bold text-sky-400">{status.environmental.cleanEnergy}%</div>
                    <div className="text-[8px] text-slate-500">renovable</div>
                  </div>
                  <div className="rounded-lg bg-[var(--vts-subcard)] border border-amber-500/20 p-2">
                    <div className="flex items-center gap-1 mb-0.5">
                      <Gauge className="w-3 h-3 text-amber-400" />
                      <span className="text-[9px] text-slate-500">Residuos</span>
                    </div>
                    <div className="text-sm font-bold text-amber-400">{status.environmental.wasteManaged}t</div>
                    <div className="text-[8px] text-slate-500">gestionados</div>
                  </div>
                </div>
              </div>

              {/* Alertas para transportistas */}
              <div>
                <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1.5 font-semibold">
                  🚨 Alertas para Transportistas
                </div>
                <div className="space-y-1.5">
                  {status.alerts.map((alert, i) => {
                    const alertColor = alert.severity === 'critical' ? 'text-red-400 bg-red-500/10 border-red-500/30'
                      : alert.severity === 'warning' ? 'text-amber-400 bg-amber-500/10 border-amber-500/30'
                      : 'text-sky-400 bg-sky-500/10 border-sky-500/30'
                    return (
                      <div key={i} className={`rounded-lg border p-2 ${alertColor}`}>
                        <div className="flex items-start gap-1.5">
                          <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                          <span className="text-[11px] leading-snug">{alert.message}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Footer del módulo */}
              <div className="border-t border-slate-700/40 pt-2 text-[9px] text-slate-500 text-center font-mono">
                Fuente: SHOA · MeteoChile · SERVIMET · TPS Sostenibilidad
              </div>
            </div>

            <style jsx>{`
              .custom-scroll::-webkit-scrollbar { width: 4px; }
              .custom-scroll::-webkit-scrollbar-track { background: transparent; }
              .custom-scroll::-webkit-scrollbar-thumb { background: #334155; border-radius: 2px; }
            `}</style>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
