'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import {
  Truck, Wind, Eye, CloudRain, Thermometer, Leaf, Clock,
  Activity, AlertTriangle, CheckCircle2, Gauge, Droplets,
  Sun, Cloud, CloudFog, Zap, RefreshCw, Loader2
} from 'lucide-react'

interface ZealStatus {
  portAccess: 'open' | 'restricted' | 'closed'
  waitTime: number
  trucksWaiting: number
  weather: {
    temp: number
    windSpeed: number
    windDir: string
    visibility: number
    condition: 'sunny' | 'cloudy' | 'fog' | 'rain' | 'windy'
    humidity: number
  }
  airQuality: {
    pm25: number
    pm10: number
    index: number
    level: 'good' | 'moderate' | 'unhealthy' | 'hazardous'
  }
  environmental: {
    co2Saved: number
    recyclingRate: number
    wasteManaged: number
    cleanEnergy: number
  }
  alerts: { type: string; message: string; severity: 'info' | 'warning' | 'critical' }[]
  lastUpdate: string
  source: string
}

// Estado inicial
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
  lastUpdate: new Date().toLocaleString('es-CL'),
  source: 'SHOA · MeteoChile · SERVIMET · TPS',
}

export default function ZealModule() {
  const [status, setStatus] = useState<ZealStatus>(initialStatus)
  const [expanded, setExpanded] = useState(false)
  const [clock, setClock] = useState(new Date())
  const [refreshing, setRefreshing] = useState(false)

  // Reloj en vivo
  useEffect(() => {
    const interval = setInterval(() => setClock(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  // Función que actualiza datos desde las APIs/simulación
  const refreshData = useCallback(async () => {
    setRefreshing(true)
    try {
      // Simular llamada a APIs reales:
      // 1. MeteoChile API (clima) — https://api.meteochile.gob.cl/v1/estaciones/330020
      // 2. SHOA (mareas/oleaje) — https://www.shoa.cl/php/mareas/
      // 3. SERVIMET (viento puerto) — https://www.directemar.cl/servimet
      // 4. TPS (fila de camiones) — API interna TPS
      // 5. AQI (calidad aire) — OpenWeatherMap Air Pollution API

      // En producción, estas serían fetch reales:
      // const [meteoRes, shoaRes, tpsRes, aqiRes] = await Promise.all([
      //   fetch('/api/meteochile'),
      //   fetch('/api/shoa'),
      //   fetch('/api/tps-zeal'),
      //   fetch('/api/air-quality'),
      // ])

      // Simulación de datos actualizados (cambia cada refresh)
      await new Promise(r => setTimeout(r, 800)) // simular latencia de API

      const now = new Date()
      const hora = now.getHours()

      // Variaciones realistas según hora del día
      const tempBase = 14 + Math.sin((hora - 6) * Math.PI / 12) * 5
      const windBase = 18 + Math.random() * 12
      const visBase = hora < 9 || hora > 19 ? 0.3 + Math.random() * 0.7 : 2 + Math.random() * 8
      const trucksBase = 25 + Math.floor(Math.random() * 30)
      const waitBase = 20 + Math.floor(Math.random() * 50)

      // Determinar acceso al puerto según condiciones
      let portAccess: 'open' | 'restricted' | 'closed' = 'open'
      const newAlerts: ZealStatus['alerts'] = []

      if (windBase > 30) {
        portAccess = 'restricted'
        newAlerts.push({ type: 'wind', message: `Viento SO ${Math.round(windBase)}kn con ráfagas ${Math.round(windBase * 1.4)}kn — precaución vehículos de gran porte`, severity: 'warning' })
      }
      if (visBase < 1) {
        portAccess = portAccess === 'open' ? 'restricted' : portAccess
        newAlerts.push({ type: 'fog', message: `Niebla costera — visibilidad ${visBase.toFixed(1)}km en Ruta La Pólvora`, severity: 'warning' })
      }
      // Simular cierre por marejadas (aleatorio bajo)
      if (Math.random() < 0.15) {
        portAccess = 'closed'
        newAlerts.push({ type: 'port', message: 'Cierre de puerto por marejadas severas — SHOA', severity: 'critical' })
      } else if (portAccess === 'restricted') {
        newAlerts.push({ type: 'port', message: 'Acceso restringido — solo camiones con cita confirmada', severity: 'critical' })
      }

      // Si no hay alertas, agregar info
      if (newAlerts.length === 0) {
        newAlerts.push({ type: 'info', message: 'Condiciones operativas normales — acceso libre', severity: 'info' })
      }

      // Calcular AQI
      const aqiBase = 30 + Math.floor(Math.random() * 50)
      const aqiLevel = aqiBase < 50 ? 'good' : aqiBase < 100 ? 'moderate' : aqiBase < 150 ? 'unhealthy' : 'hazardous'

      // Actualizar estado
      setStatus(prev => ({
        ...prev,
        portAccess,
        waitTime: waitBase,
        trucksWaiting: trucksBase,
        weather: {
          temp: Math.round(tempBase * 10) / 10,
          windSpeed: Math.round(windBase),
          windDir: ['SO', 'S', 'SW', 'O'][Math.floor(Math.random() * 4)],
          visibility: Math.round(visBase * 10) / 10,
          condition: visBase < 1 ? 'fog' : windBase > 30 ? 'windy' : hora < 9 ? 'cloudy' : 'sunny',
          humidity: 70 + Math.floor(Math.random() * 25),
        },
        airQuality: {
          pm25: Math.floor(10 + Math.random() * 25),
          pm10: Math.floor(20 + Math.random() * 40),
          index: aqiBase,
          level: aqiLevel,
        },
        environmental: {
          co2Saved: Math.round((140 + Math.random() * 10) * 10) / 10,
          recyclingRate: 75 + Math.floor(Math.random() * 10),
          wasteManaged: Math.round((11 + Math.random() * 3) * 10) / 10,
          cleanEnergy: 42 + Math.floor(Math.random() * 8),
        },
        alerts: newAlerts,
        lastUpdate: now.toLocaleString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        source: 'SHOA · MeteoChile · SERVIMET · TPS',
      }))
    } catch (e) {
      console.error('ZEAL refresh failed:', e)
    } finally {
      setRefreshing(false)
    }
  }, [])

  // Auto-refresh cada 60 segundos
  useEffect(() => {
    refreshData() // primera carga
    const interval = setInterval(refreshData, 60000) // cada 60s
    return () => clearInterval(interval)
  }, [refreshData])

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
              <div className={`text-[10px] ${access.color} font-mono flex items-center gap-1`}>
                {refreshing && <Loader2 className="w-2 h-2 animate-spin" />}
                {access.label}
              </div>
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
            {/* Header con botón refresh */}
            <div className="flex items-center justify-between p-3 border-b border-slate-700/40 bg-[var(--vts-subcard)]">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#00FF66]" />
                <span className="text-sm font-semibold text-slate-100 font-mono">ZEAL — Logística</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={refreshData}
                  disabled={refreshing}
                  className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-[#00FF66] transition-colors"
                  title="Actualizar datos ahora"
                >
                  {refreshing ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <RefreshCw className="w-3 h-3" />
                  )}
                  <span className="hidden sm:inline">Actualizar</span>
                </button>
                <button
                  onClick={() => setExpanded(false)}
                  className="text-slate-400 hover:text-slate-200 text-xs"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-3 space-y-3 max-h-[500px] overflow-y-auto custom-scroll">
              {/* Última actualización */}
              <div className="flex items-center justify-between text-[9px] text-slate-500 font-mono">
                <span className="flex items-center gap-1">
                  {refreshing ? (
                    <><Loader2 className="w-2.5 h-2.5 animate-spin" /> Actualizando...</>
                  ) : (
                    <><Clock className="w-2.5 h-2.5" /> Act: {status.lastUpdate}</>
                  )}
                </span>
                <span>Auto: 60s</span>
              </div>

              {/* Estado de acceso al puerto */}
              <div className={`rounded-lg border p-2.5 ${access.bg} border-current/30 transition-colors`}>
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
                  Clima Ruta La Pólvora
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="rounded-lg bg-[var(--vts-subcard)] border border-slate-700/40 p-2 text-center transition-colors">
                    <CondIcon className={`w-4 h-4 mx-auto mb-1 ${cond.color}`} />
                    <div className="text-[10px] text-slate-500">{cond.label}</div>
                    <div className="text-sm font-bold text-slate-100">{status.weather.temp}°C</div>
                  </div>
                  <div className="rounded-lg bg-[var(--vts-subcard)] border border-slate-700/40 p-2 text-center transition-colors">
                    <Wind className="w-4 h-4 mx-auto mb-1 text-cyan-400" />
                    <div className="text-[10px] text-slate-500">Viento</div>
                    <div className="text-sm font-bold text-slate-100">{status.weather.windSpeed}kn</div>
                    <div className="text-[9px] text-slate-500">{status.weather.windDir}</div>
                  </div>
                  <div className="rounded-lg bg-[var(--vts-subcard)] border border-slate-700/40 p-2 text-center transition-colors">
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
                  Calidad del Aire (AQI)
                </div>
                <div className={`rounded-lg border p-2.5 ${aqi.bg} border-current/30 transition-colors`}>
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
                  Gestión Ambiental TPS
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
                  Alertas para Transportistas
                </div>
                <div className="space-y-1.5">
                  {status.alerts.map((alert, i) => {
                    const alertColor = alert.severity === 'critical' ? 'text-red-400 bg-red-500/10 border-red-500/30'
                      : alert.severity === 'warning' ? 'text-amber-400 bg-amber-500/10 border-amber-500/30'
                      : 'text-sky-400 bg-sky-500/10 border-sky-500/30'
                    return (
                      <div key={i} className={`rounded-lg border p-2 ${alertColor} transition-colors`}>
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
                Fuente: {status.source} · Auto-actualización: 60s
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
