'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { motion } from 'framer-motion'
import { cameraFeeds, vessels as allVessels, type Vessel, getVesselStatusColor, getVesselTypeLabel } from '@/lib/vts/data'
import { Badge } from '@/components/ui/badge'
import { Cctv, Video, VideoOff, Crosshair, Navigation, Gauge, Ship, Radio } from 'lucide-react'

interface Props {
  selectedVessel?: Vessel | null
}

// Mapea cada cámara a una zona del mapa SVG (coordenadas aproximadas)
const cameraZones: Record<string, { x: number; y: number; w: number; h: number; label: string }> = {
  cam1: { x: 150, y: 180, w: 120, h: 80, label: 'Boca del Puerto' },
  cam2: { x: 300, y: 200, w: 120, h: 80, label: 'Canal de Acceso' },
  cam3: { x: 180, y: 280, w: 100, h: 60, label: 'Muelle 1 Norte' },
  cam4: { x: 320, y: 280, w: 120, h: 60, label: 'Muelle 3' },
  cam5: { x: 440, y: 260, w: 140, h: 80, label: 'Muelle 5 Centro' },
  cam6: { x: 580, y: 280, w: 120, h: 60, label: 'Muelle 7' },
  cam7: { x: 550, y: 420, w: 140, h: 100, label: 'Zona de Fondeo' },
  cam8: { x: 620, y: 150, w: 120, h: 80, label: 'Espigón Sur' },
}

export default function CameraPanel({ selectedVessel }: Props) {
  const [selected, setSelected] = useState('cam5')
  const [trackingMode, setTrackingMode] = useState(false)
  const [clock, setClock] = useState(new Date())
  const lastVesselIdRef = useRef<string | null>(null)

  // Reloj en vivo
  useEffect(() => {
    const interval = setInterval(() => setClock(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  // Auto-seleccionar la cámara más cercana al buque seleccionado
  // Calculado con useMemo para evitar setState en effect
  const autoCam = useMemo(() => {
    if (!selectedVessel) return null
    let closestCam = 'cam5'
    let minDist = Infinity
    for (const [camId, zone] of Object.entries(cameraZones)) {
      const centerX = zone.x + zone.w / 2
      const centerY = zone.y + zone.h / 2
      const dist = Math.sqrt((selectedVessel.x - centerX) ** 2 + (selectedVessel.y - centerY) ** 2)
      if (dist < minDist) {
        minDist = dist
        closestCam = camId
      }
    }
    return closestCam
  }, [selectedVessel])

  // Aplicar auto-selección solo cuando cambia el vessel
  useEffect(() => {
    if (!selectedVessel) return
    if (lastVesselIdRef.current === selectedVessel.id) return
    lastVesselIdRef.current = selectedVessel.id
    if (autoCam) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelected(autoCam)
       
      setTrackingMode(true)
    }
  }, [selectedVessel, autoCam])

  const selectedCam = cameraFeeds.find((c) => c.id === selected)!

  // Buques que están en la zona de la cámara seleccionada
  const vesselsInZone = useMemo(() => {
    const zone = cameraZones[selected]
    if (!zone) return []
    return allVessels.filter(v => {
      // Convertir coordenadas del SVG a la vista de la cámara (0-100%)
      const inX = v.x >= zone.x - 40 && v.x <= zone.x + zone.w + 40
      const inY = v.y >= zone.y - 30 && v.y <= zone.y + zone.h + 30
      return inX && inY
    })
  }, [selected])

  // El buque que se está siguiendo (seleccionado o el primero en la zona)
  const trackedVessel = selectedVessel || vesselsInZone[0] || null

  return (
    <div className="flex flex-col h-full bg-[var(--vts-card)] border border-slate-700/60 rounded-xl overflow-hidden shadow-lg shadow-black/30">
      <div className="p-3 border-b border-slate-700/50 bg-[#0f1620]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#00FF66] text-sm font-semibold font-mono">
            <Cctv className="w-4 h-4" />
            <span>CCTV · LINKED TO RADAR</span>
          </div>
          <div className="flex items-center gap-2">
            {trackingMode && trackedVessel && (
              <Badge variant="outline" className="bg-[#00FF66]/15 text-[#00FF66] border-[#00FF66]/30 text-[9px] px-1.5 py-0 animate-pulse font-mono">
                <Crosshair className="w-2.5 h-2.5 mr-1" />
                TRACKING: {trackedVessel.name.substring(0, 12)}
              </Badge>
            )}
            <Badge variant="outline" className="bg-[#00FF66]/10 text-[#00FF66] border-[#00FF66]/30 text-[10px] px-2 py-0.5">
              {cameraFeeds.filter((c) => c.online).length} en línea
            </Badge>
          </div>
        </div>
      </div>

      {/* Vista principal de cámara */}
      <div className="aspect-video bg-slate-900 relative overflow-hidden">
        {selectedCam.online ? (
          <div className="absolute inset-0">
            {/* Simulación de feed de cámara — vista realista */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-700 via-slate-800 to-slate-950" />

            {/* Textura de agua con movimiento */}
            <motion.div
              className="absolute inset-0 opacity-40"
              animate={{
                background: [
                  'radial-gradient(ellipse at 30% 60%, rgba(30,64,96,0.3) 0%, transparent 50%)',
                  'radial-gradient(ellipse at 50% 70%, rgba(30,64,96,0.3) 0%, transparent 50%)',
                  'radial-gradient(ellipse at 30% 60%, rgba(30,64,96,0.3) 0%, transparent 50%)',
                ]
              }}
              transition={{ duration: 8, repeat: Infinity }}
            />

            {/* Líneas de scanlines (CRT) */}
            <div className="absolute inset-0 opacity-20" style={{
              backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.05) 2px, rgba(255,255,255,0.05) 3px)'
            }} />

            {/* Muelle/dock simulado */}
            <div className="absolute bottom-0 left-0 right-0 h-1/4 bg-gradient-to-t from-slate-600 to-slate-700">
              <div className="absolute top-0 left-0 right-0 h-2 bg-slate-500" />
              <div className="absolute top-2 left-10 w-1 h-8 bg-slate-400" />
              <div className="absolute top-2 left-1/4 w-1 h-8 bg-slate-400" />
              <div className="absolute top-2 left-2/4 w-1 h-8 bg-slate-400" />
              <div className="absolute top-2 left-3/4 w-1 h-8 bg-slate-400" />
            </div>

            {/* Buque simulado — conectado al radar */}
            {trackedVessel && trackedVessel.sog > 0.1 && (
              <motion.div
                key={trackedVessel.id}
                initial={{ x: -100, y: '30%' }}
                animate={{
                  x: ['−100px', '120%'],
                  y: ['30%', '35%', '30%'],
                }}
                transition={{
                  duration: Math.max(5, 20 - trackedVessel.sog),
                  repeat: Infinity,
                  repeatType: 'loop',
                  ease: 'linear',
                }}
                className="absolute"
                style={{ top: '25%' }}
              >
                {/* Silueta del buque vista desde la cámara */}
                <div className="relative">
                  {/* Casco */}
                  <div
                    className="bg-slate-600 border border-slate-400"
                    style={{
                      width: `${Math.min(120, trackedVessel.length / 4)}px`,
                      height: `${Math.min(20, trackedVessel.beam / 3)}px`,
                      borderRadius: '4px 4px 2px 2px',
                      clipPath: 'polygon(15% 0, 85% 0, 100% 30%, 100% 100%, 0 100%, 0 30%)',
                      boxShadow: '0 4px 8px rgba(0,0,0,0.4)',
                    }}
                  />
                  {/* Superestructura */}
                  <div
                    className="absolute bg-slate-800 border border-slate-500"
                    style={{
                      width: `${Math.min(40, trackedVessel.length / 10)}px`,
                      height: `${Math.min(15, trackedVessel.beam / 4)}px`,
                      top: `-${Math.min(12, trackedVessel.beam / 4)}px`,
                      left: '30%',
                    }}
                  />
                  {/* Luces de navegación */}
                  <div className="absolute -top-1 left-1 w-1 h-1 rounded-full bg-red-500 animate-pulse" />
                  <div className="absolute -top-1 right-1 w-1 h-1 rounded-full bg-green-500 animate-pulse" />
                </div>
              </motion.div>
            )}

            {/* Buque atracado (estático) */}
            {trackedVessel && trackedVessel.sog < 0.1 && (
              <div
                className="absolute"
                style={{
                  bottom: '20%',
                  left: '40%',
                }}
              >
                <div className="relative">
                  <div
                    className="bg-slate-600 border border-slate-400"
                    style={{
                      width: `${Math.min(120, trackedVessel.length / 4)}px`,
                      height: `${Math.min(20, trackedVessel.beam / 3)}px`,
                      borderRadius: '4px 4px 2px 2px',
                      clipPath: 'polygon(15% 0, 85% 0, 100% 30%, 100% 100%, 0 100%, 0 30%)',
                    }}
                  />
                  <div
                    className="absolute bg-slate-800"
                    style={{
                      width: `${Math.min(40, trackedVessel.length / 10)}px`,
                      height: `${Math.min(12, trackedVessel.beam / 4)}px`,
                      top: `-${Math.min(10, trackedVessel.beam / 4)}px`,
                      left: '30%',
                    }}
                  />
                </div>
              </div>
            )}

            {/* Estela del buque */}
            {trackedVessel && trackedVessel.sog > 0.1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.4, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute"
                style={{ top: '30%', left: '15%' }}
              >
                <div className="w-20 h-1 bg-gradient-to-r from-transparent via-white/30 to-transparent rounded-full" />
              </motion.div>
            )}

            {/* HUD overlay — info del buque seguido */}
            <div className="absolute top-2 left-2 right-2 flex items-start justify-between text-[10px] font-mono text-emerald-400/90">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  <span className="font-bold">{selectedCam.name}</span>
                </div>
                {trackedVessel && (
                  <div className="text-[8px] text-emerald-400/70 space-y-0.5 pl-3">
                    <div>TARGET: {trackedVessel.name}</div>
                    <div>MMSI: {trackedVessel.mmsi} · IMO: {trackedVessel.imo}</div>
                    <div className="flex items-center gap-2">
                      <span>TYPE: {getVesselTypeLabel(trackedVessel.type)}</span>
                    </div>
                  </div>
                )}
              </div>
              <div className="text-right space-y-0.5">
                <div className="font-bold">{clock.toLocaleTimeString('es-CL')}</div>
                {trackedVessel && (
                  <div className="text-[8px] text-emerald-400/70 space-y-0.5">
                    <div className="flex items-center justify-end gap-1">
                      <Gauge className="w-2.5 h-2.5" />
                      SOG: {trackedVessel.sog.toFixed(1)} KN
                    </div>
                    <div className="flex items-center justify-end gap-1">
                      <Navigation className="w-2.5 h-2.5" />
                      COG: {trackedVessel.cog}°
                    </div>
                    <div className="flex items-center justify-end gap-1">
                      <span style={{ color: getVesselStatusColor(trackedVessel.status) }}>●</span>
                      STATUS: {trackedVessel.status.toUpperCase()}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Tracking box (rectángulo que sigue al buque) */}
            {trackingMode && trackedVessel && trackedVessel.sog > 0.1 && (
              <motion.div
                initial={{ x: -100, y: '30%' }}
                animate={{
                  x: ['-100px', '120%'],
                  y: ['25%', '30%', '25%'],
                }}
                transition={{
                  duration: Math.max(5, 20 - trackedVessel.sog),
                  repeat: Infinity,
                  repeatType: 'loop',
                  ease: 'linear',
                }}
                className="absolute"
                style={{ top: '20%' }}
              >
                <div className="relative w-36 h-16 border-2 border-emerald-400/60 rounded">
                  {/* Esquinas del tracking box */}
                  <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-emerald-400" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-emerald-400" />
                  <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-emerald-400" />
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-emerald-400" />
                  {/* Crosshair */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4">
                    <div className="absolute top-1/2 left-0 right-0 h-px bg-emerald-400/40" />
                    <div className="absolute left-1/2 top-0 bottom-0 w-px bg-emerald-400/40" />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Info inferior */}
            <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[9px] font-mono text-emerald-400/60">
              <span>{selectedCam.zone} · {selectedCam.type}</span>
              <span className="flex items-center gap-1">
                {trackedVessel ? `${trackedVessel.flag} · ${trackedVessel.destination?.substring(0, 30)}` : 'SIN TARGET'}
              </span>
            </div>

            {/* Crosshair central cuando no hay tracking */}
            {!trackingMode && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12">
                <div className="absolute inset-0 border border-emerald-400/40 rounded-full" />
                <div className="absolute top-1/2 left-0 right-0 h-px bg-emerald-400/40" />
                <div className="absolute left-1/2 top-0 bottom-0 w-px bg-emerald-400/40" />
              </div>
            )}
          </div>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500">
            <VideoOff className="w-8 h-8 mb-2" />
            <span className="text-xs">Cámara fuera de línea</span>
          </div>
        )}
      </div>

      {/* Selector de cámaras — muestra cuántos buques hay en cada zona */}
      <div className="p-2 grid grid-cols-2 sm:grid-cols-4 gap-1.5 max-h-28 overflow-y-auto">
        {cameraFeeds.map((cam) => {
          const zone = cameraZones[cam.id]
          const vesselsCount = zone
            ? allVessels.filter(v =>
                v.x >= zone.x - 40 && v.x <= zone.x + zone.w + 40 &&
                v.y >= zone.y - 30 && v.y <= zone.y + zone.h + 30
              ).length
            : 0
          return (
            <button
              key={cam.id}
              onClick={() => {
                setSelected(cam.id)
                setTrackingMode(false)
              }}
              className={`flex items-center gap-1 px-2 py-2 rounded-lg text-[10px] transition-colors border font-mono ${
                selected === cam.id
                  ? 'bg-[#00FF66]/15 text-[#00FF66] border-[#00FF66]/40'
                  : 'bg-[var(--vts-subcard)] text-slate-300 border-slate-700/60 hover:border-slate-600'
              }`}
              title={`${cam.name} — ${vesselsCount} buques en zona`}
            >
              {cam.online ? <Video className="w-3 h-3 flex-shrink-0" /> : <VideoOff className="w-3 h-3 flex-shrink-0 opacity-50" />}
              <span className="truncate">{cam.id.toUpperCase()}</span>
              {vesselsCount > 0 && (
                <span className={`ml-auto px-1 rounded text-[8px] font-bold ${
                  vesselsCount > 1 ? 'bg-[#00FF66]/20 text-[#00FF66]' : 'bg-slate-700 text-slate-400'
                }`}>
                  {vesselsCount}
                </span>
              )}
              <span className="text-[8px] text-slate-500">{cam.type.substring(0, 3)}</span>
            </button>
          )
        })}
      </div>

      {/* Status bar */}
      <div className="border-t border-slate-700/40 p-1.5 text-[8px] text-slate-500 text-center font-mono">
        {trackingMode && trackedVessel
          ? `🔒 TRACKING ${trackedVessel.name} · AUTO-CAM ${selectedCam.id.toUpperCase()} · RADAR LINKED`
          : 'CAM ${selectedCam.id.toUpperCase()} · MANUAL · RADAR LINKED'}
      </div>
    </div>
  )
}
