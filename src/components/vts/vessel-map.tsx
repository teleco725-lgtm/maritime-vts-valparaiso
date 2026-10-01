'use client'

import { motion } from 'framer-motion'
import { getVesselStatusColor, getVesselTypeLabel, getStatusLabel, type Vessel } from '@/lib/vts/data'
import { useState } from 'react'
import { useRadioStore } from '@/store/radio-store'
import { useRealtimeVessels } from '@/hooks/use-realtime-vessels'
import { Badge } from '@/components/ui/badge'
import { Radar, Ship, Anchor, Navigation, Radio, Pause, Play, RotateCcw } from 'lucide-react'

interface Props {
  selectedVessel: Vessel | null
  onSelectVessel: (v: Vessel) => void
}

export default function VesselMap({ selectedVessel, onSelectVessel }: Props) {
  const [showTrails, setShowTrails] = useState(true)
  const [showLabels, setShowLabels] = useState(true)
  const { vessels, isPaused, lastUpdate, togglePause, reset } = useRealtimeVessels(2000)
  const { activeRecipient, setRecipient } = useRadioStore()

  // Update parent's selectedVessel when vessels move (keep selection fresh)
  // Note: parent's state, we just call onSelectVessel when positions update

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden border border-slate-700/60" style={{ background: 'radial-gradient(ellipse at center, #0E2A4D 0%, #082140 100%)' }}>
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 py-2 bg-[var(--vts-bg)]/85 backdrop-blur border-b border-slate-700/50">
        <div className="flex items-center gap-2 text-[#00FF66] text-sm font-medium">
          <Radar className="w-4 h-4" />
          <span>Mapa de Tráfico Marítimo — Bahía de Valparaíso</span>
          {!isPaused && (
            <span className="flex items-center gap-1 text-[10px] text-[#00FF66]/70 ml-2">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00FF66] opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#00FF66]" />
              </span>
              EN VIVO
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => setShowTrails(!showTrails)}
            className={`px-2 py-1 rounded ${showTrails ? 'bg-[#00FF66]/15 text-[#00FF66]' : 'bg-slate-800 text-slate-400'}`}
          >
            Estelas
          </button>
          <button
            onClick={() => setShowLabels(!showLabels)}
            className={`px-2 py-1 rounded ${showLabels ? 'bg-[#00FF66]/15 text-[#00FF66]' : 'bg-slate-800 text-slate-400'}`}
          >
            Etiquetas
          </button>
          <button
            onClick={togglePause}
            className="px-2 py-1 rounded bg-amber-500/15 text-amber-400 hover:bg-amber-500/25"
            title={isPaused ? 'Reanudar' : 'Pausar'}
          >
            {isPaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
          </button>
          <button
            onClick={reset}
            className="px-2 py-1 rounded bg-slate-700 text-slate-300 hover:bg-slate-600"
            title="Reiniciar"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* SVG Mapa */}
      <svg viewBox="0 0 1000 600" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
        <defs>
          <radialGradient id="oceanGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#1B3A5F" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#082140" stopOpacity="0.9" />
          </radialGradient>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e3a5f" strokeWidth="0.5" opacity="0.4" />
          </pattern>
          <radialGradient id="radarSweep" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#00FF66" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#00FF66" stopOpacity="0" />
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <rect width="1000" height="600" fill="url(#oceanGrad)" />
        <rect width="1000" height="600" fill="url(#grid)" />

        {/* Costa */}
        <path
          d="M 0 100 L 100 110 L 200 90 L 300 95 L 380 100 L 420 200 L 460 220 L 540 200 L 580 220 L 620 210 L 660 230 L 700 220 L 780 240 L 850 250 L 1000 260 L 1000 0 L 0 0 Z"
          fill="#1e293b"
          stroke="#475569"
          strokeWidth="1"
        />
        <path
          d="M 380 100 L 420 200 L 460 220 L 540 200 L 580 220 L 620 210 L 660 230 L 700 220 L 700 240 L 660 250 L 620 240 L 580 250 L 540 230 L 460 240 L 420 220 L 380 120 Z"
          fill="#0f172a"
          stroke="#64748b"
          strokeWidth="0.8"
        />

        {[200, 350, 480, 610, 740].map((x, i) => (
          <rect
            key={i}
            x={x}
            y={210 + (i % 2 === 0 ? 0 : 5)}
            width={80}
            height={10}
            fill="#475569"
            stroke="#94a3b8"
            strokeWidth="0.5"
          />
        ))}

        <text x="50" y="80" fill="#94a3b8" fontSize="10" fontFamily="monospace">Valparaíso</text>
        <text x="500" y="195" fill="#64748b" fontSize="9" fontFamily="monospace">Espigón TCP</text>
        <text x="850" y="280" fill="#475569" fontSize="8" fontFamily="monospace">Océano Pacífico</text>
        <text x="900" y="350" fill="#475569" fontSize="8" fontFamily="monospace">12 mn (Mar Territorial)</text>

        {/* Geofencing */}
        <circle cx="500" cy="350" r="200" fill="none" stroke="#FFB800" strokeWidth="0.8" strokeDasharray="4 4" opacity="0.4" />
        <text x="640" y="170" fill="#FFB800" fontSize="8" opacity="0.6" fontFamily="monospace">Zona VTS</text>

        <circle cx="500" cy="350" r="280" fill="none" stroke="#FF3B3B" strokeWidth="0.5" strokeDasharray="2 6" opacity="0.3" />
        <text x="760" y="120" fill="#FF3B3B" fontSize="8" opacity="0.5" fontFamily="monospace">Mar Territorial 12mn</text>

        {/* Sweep radar animado */}
        <motion.g
          animate={{ rotate: 360 }}
          transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
          style={{ transformOrigin: '500px 350px' }}
        >
          <path
            d="M 500 350 L 700 350 A 200 200 0 0 1 590 530 Z"
            fill="url(#radarSweep)"
          />
          <line x1="500" y1="350" x2="700" y2="350" stroke="#00FF66" strokeWidth="1" opacity="0.6" />
        </motion.g>

        {/* Estelas */}
        {showTrails && vessels.map((v) =>
          v.trail.length > 1 && (
            <polyline
              key={`trail-${v.id}`}
              points={v.trail.map((t) => `${t.x},${t.y}`).join(' ')}
              fill="none"
              stroke={getVesselStatusColor(v.status)}
              strokeWidth="1.5"
              strokeDasharray="2 3"
              opacity="0.5"
            />
          )
        )}

        {/* Buques */}
        {vessels.map((v) => {
          const color = getVesselStatusColor(v.status)
          const isSelected = selectedVessel?.id === v.id
          const isRadioRecipient = activeRecipient?.mmsi === v.mmsi
          return (
            <g key={v.id} className="cursor-pointer" onClick={() => onSelectVessel(v)}>
              {/* Halo de selección */}
              {isSelected && (
                <circle cx={v.x} cy={v.y} r="14" fill="none" stroke="#00D2FF" strokeWidth="2" opacity="0.8">
                  <animate attributeName="r" values="14;20;14" dur="1.5s" repeatCount="indefinite" />
                </circle>
              )}

              {/* Halo de destinatario de radio */}
              {isRadioRecipient && (
                <circle cx={v.x} cy={v.y} r="20" fill="none" stroke="#00FF66" strokeWidth="2" opacity="0.9">
                  <animate attributeName="r" values="20;28;20" dur="1.2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.9;0.3;0.9" dur="1.2s" repeatCount="indefinite" />
                </circle>
              )}

              {/* Símbolo de buque */}
              <g transform={`translate(${v.x},${v.y}) rotate(${v.heading})`}>
                <path
                  d="M 0 -6 L 4 4 L 0 2 L -4 4 Z"
                  fill={color}
                  stroke="#fff"
                  strokeWidth="0.4"
                  filter="url(#glow)"
                />
              </g>

              {/* Vector de rumbo */}
              {v.sog > 0.1 && (
                <line
                  x1={v.x}
                  y1={v.y}
                  x2={v.x + Math.sin((v.cog * Math.PI) / 180) * v.sog * 3}
                  y2={v.y - Math.cos((v.cog * Math.PI) / 180) * v.sog * 3}
                  stroke={color}
                  strokeWidth="1"
                  opacity="0.7"
                />
              )}

              {/* Etiquetas */}
              {showLabels && (
                <text
                  x={v.x + 8}
                  y={v.y - 6}
                  fill="#e2e8f0"
                  fontSize="7"
                  fontFamily="monospace"
                  opacity="0.9"
                >
                  {v.name}
                </text>
              )}

              {/* Botón de radio al hacer clic secundario (click derecho abre radio directo) */}
              {isRadioRecipient && (
                <g transform={`translate(${v.x + 14}, ${v.y - 18})`}>
                  <circle cx="0" cy="0" r="6" fill="#00FF66" opacity="0.9" />
                  <Radio x={-3} y={-3} width="6" height="6" color="#0E2A4D" />
                </g>
              )}
            </g>
          )
        })}

        {/* Rosa de los vientos */}
        <g transform="translate(940, 540)" opacity="0.6">
          <circle cx="0" cy="0" r="22" fill="none" stroke="#475569" strokeWidth="0.5" />
          <line x1="0" y1="-22" x2="0" y2="22" stroke="#475569" strokeWidth="0.5" />
          <line x1="-22" y1="0" x2="22" y2="0" stroke="#475569" strokeWidth="0.5" />
          <text x="0" y="-25" fill="#94a3b8" fontSize="9" textAnchor="middle" fontFamily="monospace">N</text>
          <text x="0" y="32" fill="#94a3b8" fontSize="9" textAnchor="middle" fontFamily="monospace">S</text>
          <text x="28" y="3" fill="#94a3b8" fontSize="9" textAnchor="middle" fontFamily="monospace">E</text>
          <text x="-28" y="3" fill="#94a3b8" fontSize="9" textAnchor="middle" fontFamily="monospace">W</text>
        </g>
      </svg>

      {/* Leyenda */}
      <div className="absolute bottom-2 left-2 z-20 bg-[var(--vts-bg)]/90 backdrop-blur rounded-md border border-slate-700/50 p-2 text-[10px]">
        <div className="font-semibold text-slate-300 mb-1">Estado de Buques</div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-0.5">
          <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-sky-500" /><span className="text-slate-400">Navegando</span></div>
          <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /><span className="text-slate-400">Atracado</span></div>
          <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" /><span className="text-slate-400">Fondeado</span></div>
          <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-violet-500" /><span className="text-slate-400">Aproxim.</span></div>
        </div>
      </div>

      {/* Status de tiempo real */}
      <div className="absolute bottom-2 right-2 z-20 bg-[var(--vts-bg)]/90 backdrop-blur rounded-md border border-slate-700/50 p-2 text-[10px] text-slate-400">
        <div className="font-mono">
          <span className="text-[#00FF66]">●</span> Actualizado: {lastUpdate.toLocaleTimeString('es-CL')}
        </div>
      </div>
    </div>
  )
}
