'use client'

import { motion } from 'framer-motion'
import { getVesselStatusColor, type Vessel } from '@/lib/vts/data'
import { useState } from 'react'
import { useRadioStore } from '@/store/radio-store'
import { useRealtimeVessels } from '@/hooks/use-realtime-vessels'
import { Radar, Ship, Pause, Play, RotateCcw, Crosshair, Radio, Activity } from 'lucide-react'

interface Props {
  selectedVessel: Vessel | null
  onSelectVessel: (v: Vessel) => void
}

interface TrailPoint {
  x: number
  y: number
  ts: number
}

// Convierte estado de buque a tipo de forma SVG para el icono
function getVesselShape(type: Vessel['type']): 'container' | 'tanker' | 'bulk' | 'tug' | 'fishing' | 'default' {
  switch (type) {
    case 'container': return 'container'
    case 'tanker': return 'tanker'
    case 'bulk': return 'bulk'
    case 'tug': return 'tug'
    case 'fishing': return 'fishing'
    default: return 'default'
  }
}

// Renderiza forma SVG realista de buque visto desde arriba
function VesselIcon({ type, color, heading }: { type: Vessel['type'], color: string, heading: number }) {
  const shape = getVesselShape(type)

  // Tamaño base según tipo
  const scale = shape === 'tug' || shape === 'fishing' ? 0.6 : 1
  const length = (shape === 'container' || shape === 'tanker') ? 10 : (shape === 'bulk' ? 8 : 5)
  const width = (shape === 'container' || shape === 'tanker') ? 3.5 : (shape === 'bulk' ? 3 : 2)

  // Path del casco (forma alargada con proa afilada)
  const hullPath = `
    M 0 ${-length}
    L ${width * 0.7} ${-length * 0.6}
    L ${width} ${length * 0.7}
    L ${width * 0.8} ${length}
    L ${-width * 0.8} ${length}
    L ${-width} ${length * 0.7}
    L ${-width * 0.7} ${-length * 0.6}
    Z
  `

  return (
    <g transform={`rotate(${heading}) scale(${scale})`}>
      {/* Glow halo */}
      <circle cx="0" cy="0" r={length * 0.9} fill={color} opacity="0.15" />
      <circle cx="0" cy="0" r={length * 0.6} fill={color} opacity="0.25" />

      {/* Hull */}
      <path d={hullPath} fill={color} stroke="#ffffff" strokeWidth="0.4" opacity="0.95" />

      {/* Cabin/superstructure */}
      {shape === 'container' && (
        <>
          <rect x={-width * 0.5} y={-length * 0.3} width={width} height={length * 0.4} fill="#1e293b" opacity="0.9" />
          <rect x={-width * 0.3} y={-length * 0.5} width={width * 0.6} height={length * 0.15} fill="#0f172a" opacity="0.95" />
        </>
      )}
      {shape === 'tanker' && (
        <>
          <rect x={-width * 0.4} y={-length * 0.2} width={width * 0.8} height={length * 0.3} fill="#0f172a" opacity="0.8" />
          <rect x={-width * 0.3} y={-length * 0.6} width={width * 0.6} height={length * 0.12} fill="#dc2626" opacity="0.7" />
        </>
      )}
      {shape === 'bulk' && (
        <>
          <circle cx="0" cy="-length * 0.3" r="0.8" fill="#0f172a" opacity="0.7" />
          <circle cx="0" cy="0" r="0.8" fill="#0f172a" opacity="0.7" />
          <circle cx="0" cy={length * 0.3} r="0.8" fill="#0f172a" opacity="0.7" />
        </>
      )}
      {shape === 'tug' && (
        <>
          <rect x={-width * 0.5} y={-length * 0.3} width={width} height={length * 0.5} fill="#0f172a" opacity="0.9" />
          <rect x={-width * 0.4} y={-length * 0.5} width={width * 0.8} height={length * 0.2} fill="#fbbf24" opacity="0.9" />
        </>
      )}
      {shape === 'fishing' && (
        <>
          <rect x={-width * 0.4} y={-length * 0.2} width={width * 0.8} height={length * 0.4} fill="#0f172a" opacity="0.85" />
          <line x1="0" y1={-length * 0.6} x2="0" y2={-length} stroke="#ffffff" strokeWidth="0.3" />
        </>
      )}
    </g>
  )
}

export default function VesselMap({ selectedVessel, onSelectVessel }: Props) {
  const [showTrails, setShowTrails] = useState(true)
  const [showLabels, setShowLabels] = useState(true)
  const [showVectors, setShowVectors] = useState(true)
  const [showRings, setShowRings] = useState(true)
  const { vessels, trails, isPaused, lastUpdate, togglePause, reset, tickCount } = useRealtimeVessels(1000)
  const { activeRecipient, setRecipient } = useRadioStore()

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden border border-slate-700/60" style={{ background: 'radial-gradient(ellipse at center, #082140 0%, #050d1f 100%)' }}>
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-4 py-2 bg-[#082140]/85 backdrop-blur border-b border-[#00FF66]/30">
        <div className="flex items-center gap-2 text-[#00FF66] text-sm font-medium">
          <Radar className="w-4 h-4" />
          <span>VTS Radar — Bahía de Valparaíso</span>
          {!isPaused && (
            <span className="flex items-center gap-1 text-[10px] text-[#00FF66]/70 ml-2">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00FF66] opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#00FF66]" />
              </span>
              EN VIVO · {tickCount}s
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 text-xs">
          <button
            onClick={() => setShowRings(!showRings)}
            className={`px-2 py-1 rounded text-[10px] ${showRings ? 'bg-[#00FF66]/15 text-[#00FF66]' : 'bg-slate-800 text-slate-400'}`}
            title="Anillos de rango"
          >
            <Crosshair className="w-3 h-3" />
          </button>
          <button
            onClick={() => setShowVectors(!showVectors)}
            className={`px-2 py-1 rounded text-[10px] ${showVectors ? 'bg-[#00FF66]/15 text-[#00FF66]' : 'bg-slate-800 text-slate-400'}`}
            title="Vectores predictivos"
          >
            <Activity className="w-3 h-3" />
          </button>
          <button
            onClick={() => setShowTrails(!showTrails)}
            className={`px-2 py-1 rounded text-[10px] ${showTrails ? 'bg-[#00FF66]/15 text-[#00FF66]' : 'bg-slate-800 text-slate-400'}`}
            title="Estelas"
          >
            Estelas
          </button>
          <button
            onClick={() => setShowLabels(!showLabels)}
            className={`px-2 py-1 rounded text-[10px] ${showLabels ? 'bg-[#00FF66]/15 text-[#00FF66]' : 'bg-slate-800 text-slate-400'}`}
            title="Etiquetas"
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

      {/* SVG Mapa — estilo video game realista */}
      <svg viewBox="0 0 1000 600" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
        <defs>
          {/* Gradientes */}
          <radialGradient id="oceanGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#0a1d35" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#082140" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#050d1f" stopOpacity="1" />
          </radialGradient>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1a3a5c" strokeWidth="0.3" opacity="0.3" />
          </pattern>
          <pattern id="fineGrid" width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#0a2540" strokeWidth="0.2" opacity="0.5" />
          </pattern>
          <radialGradient id="radarSweep" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#00FF66" stopOpacity="0.4" />
            <stop offset="50%" stopColor="#00FF66" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#00FF66" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="radarSweep2" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#00FF66" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#00FF66" stopOpacity="0" />
          </radialGradient>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="strongGlow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="trailGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00FF66" stopOpacity="0" />
            <stop offset="100%" stopColor="#00FF66" stopOpacity="0.8" />
          </linearGradient>
        </defs>

        {/* Fondo del océano con textura */}
        <rect width="1000" height="600" fill="url(#oceanGrad)" />
        <rect width="1000" height="600" fill="url(#fineGrid)" />
        <rect width="1000" height="600" fill="url(#grid)" />

        {/* Costa de Valparaíso */}
        <path
          d="M 0 100 L 100 110 L 200 90 L 300 95 L 380 100 L 420 200 L 460 220 L 540 200 L 580 220 L 620 210 L 660 230 L 700 220 L 780 240 L 850 250 L 1000 260 L 1000 0 L 0 0 Z"
          fill="#0a1628"
          stroke="#1a3a5c"
          strokeWidth="0.8"
        />
        {/* Sombra de la costa */}
        <path
          d="M 0 100 L 100 110 L 200 90 L 300 95 L 380 100 L 420 200 L 460 220 L 540 200 L 580 220 L 620 210 L 660 230 L 700 220 L 780 240 L 850 250 L 1000 260 L 1000 290 L 0 290 Z"
          fill="#050d1f"
          opacity="0.5"
        />
        {/* Espigón TCP con relieve */}
        <path
          d="M 380 100 L 420 200 L 460 220 L 540 200 L 580 220 L 620 210 L 660 230 L 700 220 L 700 240 L 660 250 L 620 240 L 580 250 L 540 230 L 460 240 L 420 220 L 380 120 Z"
          fill="#0a1628"
          stroke="#2a4a6c"
          strokeWidth="0.6"
        />
        {/* Muelles con detalle */}
        {[200, 350, 480, 610, 740].map((x, i) => (
          <g key={i}>
            <rect
              x={x}
              y={210 + (i % 2 === 0 ? 0 : 5)}
              width={80}
              height={8}
              fill="#3a5a7c"
              stroke="#5a7a9c"
              strokeWidth="0.5"
            />
            {/* Detalle de grúas en muelle */}
            <line x1={x + 20} y1={210} x2={x + 20} y2={195} stroke="#5a7a9c" strokeWidth="1" />
            <circle cx={x + 20} cy={195} r="2" fill="#5a7a9c" />
            <line x1={x + 40} y1={210} x2={x + 40} y2={192} stroke="#5a7a9c" strokeWidth="1" />
            <circle cx={x + 40} cy={192} r="2" fill="#5a7a9c" />
            <line x1={x + 60} y1={210} x2={x + 60} y2={198} stroke="#5a7a9c" strokeWidth="1" />
            <circle cx={x + 60} cy={198} r="2" fill="#5a7a9c" />
          </g>
        ))}

        {/* Etiquetas geográficas */}
        <text x="50" y="80" fill="#5a7a9c" fontSize="10" fontFamily="monospace" opacity="0.7">VALPARAÍSO</text>
        <text x="500" y="195" fill="#3a5a7c" fontSize="8" fontFamily="monospace">ESPIGÓN TCP</text>
        <text x="850" y="280" fill="#3a5a7c" fontSize="7" fontFamily="monospace" opacity="0.6">OCÉANO PACÍFICO</text>

        {/* === ANILLOS DE RANGO con etiquetas de distancia === */}
        {showRings && [50, 100, 150, 200, 250].map((r, i) => (
          <g key={r}>
            <circle
              cx="500"
              cy="350"
              r={r}
              fill="none"
              stroke="#00FF66"
              strokeWidth="0.4"
              opacity={0.15 + i * 0.05}
              strokeDasharray="2 4"
            />
            {/* Etiqueta de distancia */}
            <text
              x={500 + r}
              y={350}
              fill="#00FF66"
              fontSize="6"
              fontFamily="monospace"
              opacity="0.5"
            >
              {i === 0 ? '1nm' : i === 1 ? '5nm' : i === 2 ? '10nm' : i === 3 ? '15nm' : '20nm'}
            </text>
          </g>
        ))}

        {/* Geofencing jurisdiccional */}
        <circle cx="500" cy="350" r="200" fill="none" stroke="#FFB800" strokeWidth="0.6" strokeDasharray="3 5" opacity="0.3" />
        <text x="640" y="170" fill="#FFB800" fontSize="7" opacity="0.5" fontFamily="monospace">ZONA VTS</text>

        <circle cx="500" cy="350" r="280" fill="none" stroke="#FF3B3B" strokeWidth="0.4" strokeDasharray="2 6" opacity="0.25" />
        <text x="760" y="120" fill="#FF3B3B" fontSize="7" opacity="0.4" fontFamily="monospace">MAR TERRITORIAL 12nm</text>

        {/* === SWEEP RADAR con trail luminoso === */}
        <motion.g
          animate={{ rotate: 360 }}
          transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
          style={{ transformOrigin: '500px 350px' }}
        >
          {/* Wedge principal */}
          <path
            d="M 500 350 L 700 350 A 200 200 0 0 1 590 530 Z"
            fill="url(#radarSweep)"
          />
          {/* Trail secundario (ángulo mayor, más tenue) */}
          <path
            d="M 500 350 L 700 350 A 200 200 0 0 1 680 510 Z"
            fill="url(#radarSweep2)"
          />
          {/* Trail terciario */}
          <path
            d="M 500 350 L 700 350 A 200 200 0 0 1 650 470 Z"
            fill="url(#radarSweep2)"
            opacity="0.5"
          />
          {/* Línea de sweep brillante */}
          <line
            x1="500"
            y1="350"
            x2="700"
            y2="350"
            stroke="#00FF66"
            strokeWidth="1.5"
            opacity="0.9"
            filter="url(#strongGlow)"
          />
        </motion.g>

        {/* Centro del radar */}
        <circle cx="500" cy="350" r="3" fill="#00FF66" filter="url(#strongGlow)" />
        <circle cx="500" cy="350" r="1.5" fill="#ffffff" />

        {/* === ESTELAS con efecto de desvanecimiento === */}
        {showTrails && vessels.map((v) => {
          const trail = trails[v.id] || []
          if (trail.length < 2) return null
          const color = getVesselStatusColor(v.status)

          // Renderizar cada segmento de trail con opacidad decreciente
          const segments = []
          for (let i = 1; i < trail.length; i++) {
            const prev = trail[i - 1]
            const curr = trail[i]
            const age = i / trail.length // 0 = más viejo, 1 = más reciente
            const opacity = age * 0.7 // más visible lo reciente

            segments.push(
              <line
                key={`${v.id}-trail-${i}`}
                x1={prev.x}
                y1={prev.y}
                x2={curr.x}
                y2={curr.y}
                stroke={color}
                strokeWidth={1 + age * 1.5} // más grueso lo reciente
                opacity={opacity}
                strokeLinecap="round"
              />
            )
          }
          return <g key={`trail-${v.id}`}>{segments}</g>
        })}

        {/* === BUQUES === */}
        {vessels.map((v) => {
          const color = getVesselStatusColor(v.status)
          const isSelected = selectedVessel?.id === v.id
          const isRadioRecipient = activeRecipient?.mmsi === v.mmsi

          // Vector predictivo (dónde estará en 60 segundos)
          const vectorLength = v.sog * 8
          const vectorRad = (v.cog * Math.PI) / 180
          const vectorX = v.x + Math.sin(vectorRad) * vectorLength
          const vectorY = v.y - Math.cos(vectorRad) * vectorLength

          return (
            <g
              key={v.id}
              className="cursor-pointer"
              onClick={() => {
                onSelectVessel(v)
                setRecipient(v)
              }}
            >
              {/* Halo de selección */}
              {isSelected && (
                <circle cx={v.x} cy={v.y} r="14" fill="none" stroke="#00D2FF" strokeWidth="1.5" opacity="0.9">
                  <animate attributeName="r" values="14;22;14" dur="1.5s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.9;0.3;0.9" dur="1.5s" repeatCount="indefinite" />
                </circle>
              )}

              {/* Halo de destinatario de radio */}
              {isRadioRecipient && (
                <g>
                  <circle cx={v.x} cy={v.y} r="20" fill="none" stroke="#00FF66" strokeWidth="1.5" opacity="0.9">
                    <animate attributeName="r" values="20;30;20" dur="1.2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.9;0.2;0.9" dur="1.2s" repeatCount="indefinite" />
                  </circle>
                  <circle cx={v.x} cy={v.y} r="28" fill="none" stroke="#00FF66" strokeWidth="0.8" opacity="0.4">
                    <animate attributeName="r" values="28;38;28" dur="1.2s" repeatCount="indefinite" />
                  </circle>
                </g>
              )}

              {/* Vector predictivo */}
              {showVectors && v.sog > 0.1 && (
                <g opacity="0.6">
                  <line
                    x1={v.x}
                    y1={v.y}
                    x2={vectorX}
                    y2={vectorY}
                    stroke={color}
                    strokeWidth="0.8"
                    strokeDasharray="2 3"
                  />
                  {/* Punta de flecha */}
                  <circle cx={vectorX} cy={vectorY} r="1.5" fill={color} opacity="0.8" />
                </g>
              )}

              {/* Símbolo del buque (realista) */}
              <g
                transform={`translate(${v.x},${v.y})`}
                filter="url(#glow)"
              >
                <VesselIcon type={v.type} color={color} heading={v.heading} />
              </g>

              {/* Etiqueta */}
              {showLabels && (
                <g>
                  {/* Fondo de etiqueta */}
                  <rect
                    x={v.x + 6}
                    y={v.y - 12}
                    width={v.name.length * 4 + 8}
                    height="8"
                    fill="#050d1f"
                    opacity="0.6"
                    rx="1"
                  />
                  <text
                    x={v.x + 10}
                    y={v.y - 6}
                    fill={isRadioRecipient ? '#00FF66' : '#cbd5e1'}
                    fontSize="6"
                    fontFamily="monospace"
                  >
                    {v.name}
                  </text>
                  {/* Velocidad debajo */}
                  {v.sog > 0.1 && (
                    <text
                      x={v.x + 10}
                      y={v.y + 2}
                      fill={color}
                      fontSize="5"
                      fontFamily="monospace"
                      opacity="0.8"
                    >
                      {v.sog.toFixed(1)}kn
                    </text>
                  )}
                </g>
              )}

              {/* Indicador de radio activo */}
              {isRadioRecipient && (
                <g transform={`translate(${v.x + 16}, ${v.y - 14})`}>
                  <circle cx="0" cy="0" r="5" fill="#00FF66" opacity="0.9" filter="url(#strongGlow)" />
                  <text x="0" y="2" fill="#050d1f" fontSize="6" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                    📻
                  </text>
                </g>
              )}
            </g>
          )
        })}

        {/* Rosa de los vientos */}
        <g transform="translate(940, 540)" opacity="0.7">
          <circle cx="0" cy="0" r="22" fill="#050d1f" stroke="#1a3a5c" strokeWidth="0.5" />
          <circle cx="0" cy="0" r="15" fill="none" stroke="#2a4a6c" strokeWidth="0.3" />
          <line x1="0" y1="-22" x2="0" y2="22" stroke="#1a3a5c" strokeWidth="0.4" />
          <line x1="-22" y1="0" x2="22" y2="0" stroke="#1a3a5c" strokeWidth="0.4" />
          {/* Indicador norte con flecha */}
          <polygon points="0,-22 -3,-15 3,-15" fill="#00FF66" />
          <text x="0" y="-25" fill="#00FF66" fontSize="9" textAnchor="middle" fontFamily="monospace">N</text>
          <text x="0" y="32" fill="#5a7a9c" fontSize="9" textAnchor="middle" fontFamily="monospace">S</text>
          <text x="28" y="3" fill="#5a7a9c" fontSize="9" textAnchor="middle" fontFamily="monospace">E</text>
          <text x="-28" y="3" fill="#5a7a9c" fontSize="9" textAnchor="middle" fontFamily="monospace">W</text>
        </g>

        {/* Líneas de escaneo CRT (efecto video game) */}
        <pattern id="scanlines" width="4" height="4" patternUnits="userSpaceOnUse">
          <rect width="4" height="2" fill="transparent" />
          <rect y="2" width="4" height="2" fill="#000000" opacity="0.05" />
        </pattern>
        <rect width="1000" height="600" fill="url(#scanlines)" pointerEvents="none" />
      </svg>

      {/* HUD overlay — esquinas con info tipo video game */}
      <div className="absolute top-12 left-3 z-20 text-[10px] font-mono text-[#00FF66]/70 pointer-events-none">
        <div className="bg-[#082140]/60 backdrop-blur px-2 py-1 rounded border border-[#00FF66]/20">
          <div>POS: 33°02'S 71°37'W</div>
          <div>RNG: 20nm</div>
        </div>
      </div>

      <div className="absolute top-12 right-3 z-20 text-[10px] font-mono text-[#00FF66]/70 pointer-events-none">
        <div className="bg-[#082140]/60 backdrop-blur px-2 py-1 rounded border border-[#00FF66]/20">
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00FF66] opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#00FF66]" />
            </span>
            SCAN: {lastUpdate.toLocaleTimeString('es-CL')}
          </div>
          <div>TARGETS: {vessels.length}</div>
        </div>
      </div>

      {/* Leyenda */}
      <div className="absolute bottom-2 left-2 z-20 bg-[#082140]/90 backdrop-blur rounded-md border border-[#00FF66]/30 p-2 text-[10px]">
        <div className="font-semibold text-[#00FF66] mb-1.5">ESTADO DE BUQUES</div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-0.5">
          <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-sky-500" /><span className="text-slate-300">Navegando</span></div>
          <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /><span className="text-slate-300">Atracado</span></div>
          <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" /><span className="text-slate-300">Fondeado</span></div>
          <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-violet-500" /><span className="text-slate-300">Aproxim.</span></div>
        </div>
      </div>

      {/* Velocidad del sweep */}
      <div className="absolute bottom-2 right-2 z-20 bg-[#082140]/90 backdrop-blur rounded-md border border-[#00FF66]/30 p-2 text-[10px] font-mono">
        <div className="text-[#00FF66]">SWEEP: 360°/5s</div>
        <div className="text-slate-400">RPM: 12</div>
      </div>
    </div>
  )
}
