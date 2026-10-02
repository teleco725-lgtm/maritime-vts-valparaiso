'use client'

import { motion } from 'framer-motion'
import { getVesselStatusColor, type Vessel } from '@/lib/vts/data'
import { useState } from 'react'
import { useRadioStore } from '@/store/radio-store'
import { useRealtimeVessels } from '@/hooks/use-realtime-vessels'
import { Radar, Ship, Anchor, Navigation, Pause, Play, RotateCcw, Radio, Crosshair, Activity, Layers } from 'lucide-react'

interface Props {
  selectedVessel: Vessel | null
  onSelectVessel: (v: Vessel) => void
}

// Símbolo militar APP-6 / NATO estándar para buques visto desde arriba
function VesselSymbol({ type, status, heading }: { type: Vessel['type'], status: Vessel['status'], heading: number }) {
  // Tamaño según tipo
  const isLarge = type === 'container' || type === 'tanker' || type === 'bulk'
  const scale = isLarge ? 1 : type === 'tug' || type === 'fishing' ? 0.6 : 0.8
  const length = isLarge ? 9 : type === 'tug' || type === 'fishing' ? 5 : 6
  const width = isLarge ? 3 : type === 'tug' || type === 'fishing' ? 1.8 : 2.2

  // Path del casco (silueta clásica marítima)
  const hullPath = `M 0 ${-length} L ${width * 0.6} ${-length * 0.7} L ${width} ${length * 0.7} L ${width * 0.8} ${length} L ${-width * 0.8} ${length} L ${-width} ${length * 0.7} L ${-width * 0.6} ${-length * 0.7} Z`

  return (
    <g transform={`rotate(${heading}) scale(${scale})`}>
      {/* Casco (sólido, sin glow) */}
      <path d={hullPath} fill="currentColor" stroke="#ffffff" strokeWidth="0.3" opacity="0.95" />

      {/* Superestructura según tipo — discreta */}
      {type === 'container' && (
        <rect x={-width * 0.5} y={-length * 0.2} width={width} height={length * 0.35} fill="#1a1a1a" opacity="0.85" />
      )}
      {type === 'tanker' && (
        <rect x={-width * 0.4} y={-length * 0.15} width={width * 0.8} height={length * 0.3} fill="#1a1a1a" opacity="0.8" />
      )}
      {type === 'bulk' && (
        <>
          <line x1="0" y1={-length * 0.5} x2="0" y2={length * 0.5} stroke="#1a1a1a" strokeWidth="0.4" opacity="0.6" />
        </>
      )}
      {type === 'tug' && (
        <rect x={-width * 0.5} y={-length * 0.3} width={width} height={length * 0.4} fill="#1a1a1a" opacity="0.85" />
      )}
      {type === 'fishing' && (
        <line x1="0" y1={-length * 0.6} x2="0" y2={-length} stroke="#1a1a1a" strokeWidth="0.3" />
      )}
    </g>
  )
}

export default function VesselMap({ selectedVessel, onSelectVessel }: Props) {
  const [showTrails, setShowTrails] = useState(true)
  const [showLabels, setShowLabels] = useState(true)
  const [showVectors, setShowVectors] = useState(true)
  const [showRings, setShowRings] = useState(true)
  const [showBearing, setShowBearing] = useState(true)
  const { vessels, trails, isPaused, lastUpdate, togglePause, reset, tickCount } = useRealtimeVessels(1000)
  const { activeRecipient, setRecipient } = useRadioStore()

  // Bearings cada 30° (estilo radar militar)
  const bearings = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330]

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden border border-slate-700/60" style={{ background: '#000810' }}>
      {/* Header — estilo sobrio Armada */}
      <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-4 py-2 bg-[#000810]/90 backdrop-blur border-b border-[#00FF66]/40">
        <div className="flex items-center gap-2 text-[#00FF66] text-sm font-medium font-mono">
          <Radar className="w-4 h-4" />
          <span className="tracking-wider">VTS RADAR — PUERTO DE VALPARAÍSO</span>
          {!isPaused && (
            <span className="flex items-center gap-1 text-[10px] text-[#00FF66]/80 ml-2 font-mono">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00FF66] opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#00FF66]" />
              </span>
              OPERATIVO · {tickCount}s
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 text-xs">
          <button
            onClick={() => setShowRings(!showRings)}
            className={`px-2 py-1 rounded text-[10px] font-mono ${showRings ? 'bg-[#00FF66]/15 text-[#00FF66]' : 'bg-slate-800 text-slate-400'}`}
            title="Anillos de rango"
          >
            RNG
          </button>
          <button
            onClick={() => setShowBearing(!showBearing)}
            className={`px-2 py-1 rounded text-[10px] font-mono ${showBearing ? 'bg-[#00FF66]/15 text-[#00FF66]' : 'bg-slate-800 text-slate-400'}`}
            title="Marcaciones"
          >
            BRG
          </button>
          <button
            onClick={() => setShowVectors(!showVectors)}
            className={`px-2 py-1 rounded text-[10px] font-mono ${showVectors ? 'bg-[#00FF66]/15 text-[#00FF66]' : 'bg-slate-800 text-slate-400'}`}
            title="Vectores predictivos"
          >
            VEC
          </button>
          <button
            onClick={() => setShowTrails(!showTrails)}
            className={`px-2 py-1 rounded text-[10px] font-mono ${showTrails ? 'bg-[#00FF66]/15 text-[#00FF66]' : 'bg-slate-800 text-slate-400'}`}
            title="Estelas"
          >
            TRK
          </button>
          <button
            onClick={() => setShowLabels(!showLabels)}
            className={`px-2 py-1 rounded text-[10px] font-mono ${showLabels ? 'bg-[#00FF66]/15 text-[#00FF66]' : 'bg-slate-800 text-slate-400'}`}
            title="Etiquetas"
          >
            LBL
          </button>
          <button
            onClick={togglePause}
            className="px-2 py-1 rounded bg-amber-500/15 text-amber-400 hover:bg-amber-500/25 text-[10px] font-mono"
            title={isPaused ? 'Reanudar' : 'Pausar'}
          >
            {isPaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
          </button>
          <button
            onClick={reset}
            className="px-2 py-1 rounded bg-slate-700 text-slate-300 hover:bg-slate-600 text-[10px] font-mono"
            title="Reiniciar"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* SVG Mapa — estilo radar Armada */}
      <svg viewBox="0 0 1000 600" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
        <defs>
          {/* Gradiente del océano — muy sutil, profesional */}
          <radialGradient id="oceanGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#001828" stopOpacity="1" />
            <stop offset="50%" stopColor="#000810" stopOpacity="1" />
            <stop offset="100%" stopColor="#000408" stopOpacity="1" />
          </radialGradient>
          {/* Grid sutil militar */}
          <pattern id="gridMinor" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#0a3320" strokeWidth="0.3" opacity="0.4" />
          </pattern>
          <pattern id="gridMajor" width="100" height="100" patternUnits="userSpaceOnUse">
            <path d="M 100 0 L 0 0 0 100" fill="none" stroke="#0a4a2c" strokeWidth="0.5" opacity="0.5" />
          </pattern>
          {/* Sweep del radar — solo un wedge sólido con trail sutil */}
          <linearGradient id="sweepGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00FF66" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#00FF66" stopOpacity="0" />
          </linearGradient>
          {/* Estela: degradado sutil */}
          <linearGradient id="trailGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00FF66" stopOpacity="0" />
            <stop offset="100%" stopColor="#00FF66" stopOpacity="0.6" />
          </linearGradient>
        </defs>

        {/* Fondo del océano — sobrio */}
        <rect width="1000" height="600" fill="url(#oceanGrad)" />
        <rect width="1000" height="600" fill="url(#gridMinor)" />
        <rect width="1000" height="600" fill="url(#gridMajor)" />

        {/* Costa de Valparaíso — sólida sin glow */}
        <path
          d="M 0 100 L 100 110 L 200 90 L 300 95 L 380 100 L 420 200 L 460 220 L 540 200 L 580 220 L 620 210 L 660 230 L 700 220 L 780 240 L 850 250 L 1000 260 L 1000 0 L 0 0 Z"
          fill="#0a1a14"
          stroke="#2a4a3c"
          strokeWidth="0.8"
        />
        {/* Espigón TCP */}
        <path
          d="M 380 100 L 420 200 L 460 220 L 540 200 L 580 220 L 620 210 L 660 230 L 700 220 L 700 240 L 660 250 L 620 240 L 580 250 L 540 230 L 460 240 L 420 220 L 380 120 Z"
          fill="#0a1a14"
          stroke="#2a4a3c"
          strokeWidth="0.6"
        />
        {/* Muelles con grúas discretas */}
        {[200, 350, 480, 610, 740].map((x, i) => (
          <g key={i}>
            <rect
              x={x}
              y={210 + (i % 2 === 0 ? 0 : 5)}
              width={80}
              height={6}
              fill="#3a4a3c"
              stroke="#4a5a4c"
              strokeWidth="0.4"
            />
            <line x1={x + 20} y1={210} x2={x + 20} y2={198} stroke="#4a5a4c" strokeWidth="0.8" />
            <line x1={x + 40} y1={210} x2={x + 40} y2={195} stroke="#4a5a4c" strokeWidth="0.8" />
            <line x1={x + 60} y1={210} x2={x + 60} y2={200} stroke="#4a5a4c" strokeWidth="0.8" />
          </g>
        ))}

        {/* Etiquetas geográficas — monospace militar */}
        <text x="50" y="80" fill="#3a5a4c" fontSize="9" fontFamily="monospace" opacity="0.7">VALPARAÍSO</text>
        <text x="500" y="195" fill="#2a4a3c" fontSize="7" fontFamily="monospace">ESPIGÓN TCP</text>
        <text x="850" y="280" fill="#2a4a3c" fontSize="6" fontFamily="monospace" opacity="0.5">OCÉANO PACÍFICO</text>

        {/* === ANILLOS DE RANGO estilo militar — sólidos sin glow === */}
        {showRings && [50, 100, 150, 200, 250].map((r, i) => (
          <g key={r}>
            <circle
              cx="500"
              cy="350"
              r={r}
              fill="none"
              stroke="#00FF66"
              strokeWidth="0.5"
              opacity={0.4 - i * 0.05}
              strokeDasharray="3 3"
            />
            {/* Etiqueta de distancia en estilo militar */}
            <text
              x={500 + r + 2}
              y={350}
              fill="#00FF66"
              fontSize="6"
              fontFamily="monospace"
              opacity="0.6"
            >
              {i === 0 ? '1NM' : i === 1 ? '5NM' : i === 2 ? '10NM' : i === 3 ? '15NM' : '20NM'}
            </text>
          </g>
        ))}

        {/* === LÍNEAS DE MARCAIÓN (bearings) cada 30° === */}
        {showBearing && bearings.map((brg) => {
          const rad = (brg * Math.PI) / 180
          const x = 500 + Math.sin(rad) * 270
          const y = 350 - Math.cos(rad) * 270
          const xText = 500 + Math.sin(rad) * 285
          const yText = 350 - Math.cos(rad) * 285
          return (
            <g key={brg}>
              <line
                x1="500"
                y1="350"
                x2={x}
                y2={y}
                stroke="#00FF66"
                strokeWidth="0.3"
                opacity="0.25"
                strokeDasharray="2 4"
              />
              <text
                x={xText}
                y={yText}
                fill="#00FF66"
                fontSize="7"
                fontFamily="monospace"
                opacity="0.5"
                textAnchor="middle"
                dominantBaseline="middle"
              >
                {String(brg).padStart(3, '0')}°
              </text>
            </g>
          )
        })}

        {/* Geofencing jurisdiccional — líneas sólidas discretas */}
        <circle cx="500" cy="350" r="200" fill="none" stroke="#FFB800" strokeWidth="0.5" strokeDasharray="4 4" opacity="0.35" />
        <text x="640" y="170" fill="#FFB800" fontSize="7" opacity="0.5" fontFamily="monospace">ZONA VTS</text>

        <circle cx="500" cy="350" r="280" fill="none" stroke="#FF3B3B" strokeWidth="0.4" strokeDasharray="3 6" opacity="0.3" />
        <text x="760" y="120" fill="#FF3B3B" fontSize="7" opacity="0.4" fontFamily="monospace">MAR TERRITORIAL 12NM</text>

        {/* === SWEEP RADAR — un solo wedge con trail sutil, estilo Armada === */}
        <motion.g
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
          style={{ transformOrigin: '500px 350px' }}
        >
          {/* Wedge principal con degradado lineal sólido */}
          <path
            d="M 500 350 L 700 350 A 200 200 0 0 1 590 530 Z"
            fill="url(#sweepGrad)"
          />
          {/* Línea de sweep sólida, sin glow */}
          <line
            x1="500"
            y1="350"
            x2="700"
            y2="350"
            stroke="#00FF66"
            strokeWidth="1.2"
            opacity="0.9"
          />
        </motion.g>

        {/* Centro del radar — punto sólido */}
        <circle cx="500" cy="350" r="2" fill="#00FF66" />
        <circle cx="500" cy="350" r="1" fill="#ffffff" />

        {/* === ESTELAS estilo militar — líneas sólidas con marcadores cada 6 min === */}
        {showTrails && vessels.map((v) => {
          const trail = trails[v.id] || []
          if (trail.length < 2) return null
          const color = getVesselStatusColor(v.status)

          // Línea sólida de la estela (sin fancy glow)
          const points = trail.map((t) => `${t.x},${t.y}`).join(' ')
          const lastIdx = trail.length - 1

          return (
            <g key={`trail-${v.id}`}>
              {/* Línea sólida de la estela */}
              <polyline
                points={points}
                fill="none"
                stroke={color}
                strokeWidth="1"
                opacity="0.5"
              />
              {/* Marcadores de tiempo cada 6 minutos (cada 6 puntos aprox) */}
              {trail.map((t, i) => {
                if (i > 0 && i % 6 === 0 && i !== lastIdx) {
                  return (
                    <circle
                      key={`${v.id}-mark-${i}`}
                      cx={t.x}
                      cy={t.y}
                      r="1"
                      fill={color}
                      opacity="0.7"
                    />
                  )
                }
                return null
              })}
            </g>
          )
        })}

        {/* === BUQUES — símbolos militares sólidos sin glow === */}
        {vessels.map((v) => {
          const color = getVesselStatusColor(v.status)
          const isSelected = selectedVessel?.id === v.id
          const isRadioRecipient = activeRecipient?.mmsi === v.mmsi

          // Vector predictivo (dónde estará en 6 minutos)
          const vectorLength = v.sog * 6
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
              {/* Marco de selección — sobrio, sin animación brillante */}
              {isSelected && (
                <g>
                  <rect x={v.x - 14} y={v.y - 14} width="28" height="28" fill="none" stroke="#00D2FF" strokeWidth="0.8" opacity="0.8" />
                  <line x1={v.x - 17} y1={v.y} x2={v.x - 13} y2={v.y} stroke="#00D2FF" strokeWidth="0.8" opacity="0.8" />
                  <line x1={v.x + 13} y1={v.y} x2={v.x + 17} y2={v.y} stroke="#00D2FF" strokeWidth="0.8" opacity="0.8" />
                  <line x1={v.x} y1={v.y - 17} x2={v.x} y2={v.y - 13} stroke="#00D2FF" strokeWidth="0.8" opacity="0.8" />
                  <line x1={v.x} y1={v.y + 13} x2={v.x} y2={v.y + 17} stroke="#00D2FF" strokeWidth="0.8" opacity="0.8" />
                </g>
              )}

              {/* Marco de destinatario de radio — círculo sólido */}
              {isRadioRecipient && (
                <g>
                  <circle cx={v.x} cy={v.y} r="18" fill="none" stroke="#00FF66" strokeWidth="1" opacity="0.8" />
                  <circle cx={v.x} cy={v.y} r="22" fill="none" stroke="#00FF66" strokeWidth="0.5" opacity="0.4" />
                </g>
              )}

              {/* Vector predictivo — línea sólida sin glow */}
              {showVectors && v.sog > 0.1 && (
                <g opacity="0.7">
                  <line
                    x1={v.x}
                    y1={v.y}
                    x2={vectorX}
                    y2={vectorY}
                    stroke={color}
                    strokeWidth="0.6"
                    strokeDasharray="2 2"
                  />
                  {/* Punta de flecha sólida */}
                  <polygon
                    points={`${vectorX},${vectorY} ${vectorX - 2},${vectorY + 2} ${vectorX + 2},${vectorY + 2}`}
                    fill={color}
                    opacity="0.7"
                    transform={`rotate(${v.cog} ${vectorX} ${vectorY})`}
                  />
                </g>
              )}

              {/* Símbolo del buque — sólido, sin glow filter */}
              <g
                transform={`translate(${v.x},${v.y})`}
                style={{ color }}
              >
                <VesselSymbol type={v.type} status={v.status} heading={v.heading} />
              </g>

              {/* Etiqueta — fondo sólido monospace militar */}
              {showLabels && (
                <g>
                  <rect
                    x={v.x + 8}
                    y={v.y - 12}
                    width={v.name.length * 4.5 + 18}
                    height="14"
                    fill="#000810"
                    stroke={isRadioRecipient ? '#00FF66' : '#2a4a3c'}
                    strokeWidth="0.4"
                    opacity="0.9"
                  />
                  <text
                    x={v.x + 11}
                    y={v.y - 5}
                    fill={isRadioRecipient ? '#00FF66' : '#cbd5e1'}
                    fontSize="6"
                    fontFamily="monospace"
                  >
                    {v.name}
                  </text>
                  <text
                    x={v.x + 11}
                    y={v.y - 1}
                    fill={color}
                    fontSize="5"
                    fontFamily="monospace"
                    opacity="0.8"
                  >
                    {v.mmsi} · {v.sog.toFixed(1)}KN
                  </text>
                </g>
              )}

              {/* Indicador de radio activo — discreto */}
              {isRadioRecipient && (
                <g transform={`translate(${v.x + 18}, ${v.y - 10})`}>
                  <rect x="-4" y="-4" width="8" height="8" fill="#00FF66" opacity="0.85" />
                  <text x="0" y="2" fill="#000810" fontSize="6" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                    R
                  </text>
                </g>
              )}
            </g>
          )
        })}

        {/* Rosa de los vientos — estilo Armada con mils (no degrees) */}
        <g transform="translate(940, 540)" opacity="0.7">
          <circle cx="0" cy="0" r="24" fill="#000810" stroke="#2a4a3c" strokeWidth="0.6" />
          <circle cx="0" cy="0" r="16" fill="none" stroke="#2a4a3c" strokeWidth="0.3" />
          <line x1="0" y1="-24" x2="0" y2="24" stroke="#2a4a3c" strokeWidth="0.4" />
          <line x1="-24" y1="0" x2="24" y2="0" stroke="#2a4a3c" strokeWidth="0.4" />
          <line x1="-17" y1="-17" x2="17" y2="17" stroke="#2a4a3c" strokeWidth="0.3" opacity="0.5" />
          <line x1="-17" y1="17" x2="17" y2="-17" stroke="#2a4a3c" strokeWidth="0.3" opacity="0.5" />
          {/* Flecha norte */}
          <polygon points="0,-24 -3,-17 3,-17" fill="#00FF66" />
          <text x="0" y="-26" fill="#00FF66" fontSize="9" textAnchor="middle" fontFamily="monospace" fontWeight="bold">N</text>
          <text x="0" y="34" fill="#5a7a6c" fontSize="9" textAnchor="middle" fontFamily="monospace">S</text>
          <text x="30" y="3" fill="#5a7a6c" fontSize="9" textAnchor="middle" fontFamily="monospace">E</text>
          <text x="-30" y="3" fill="#5a7a6c" fontSize="9" textAnchor="middle" fontFamily="monospace">W</text>
          {/* Mils (0-6400) */}
          <text x="0" y="8" fill="#3a5a4c" fontSize="5" textAnchor="middle" fontFamily="monospace">0000</text>
          <text x="8" y="0" fill="#3a5a4c" fontSize="5" textAnchor="middle" fontFamily="monospace">1600</text>
          <text x="0" y="-6" fill="#3a5a4c" fontSize="5" textAnchor="middle" fontFamily="monospace">3200</text>
          <text x="-8" y="0" fill="#3a5a4c" fontSize="5" textAnchor="middle" fontFamily="monospace">4800</text>
        </g>

        {/* Texto discreto abajo */}
        <text x="500" y="595" fill="#3a5a4c" fontSize="6" fontFamily="monospace" textAnchor="middle" opacity="0.5">
          PPI DISPLAY · RANGE 20NM · BEARING 000-360 · NATO APP-6 SYMBOLOGY
        </text>
      </svg>

      {/* HUD overlays — estilo militar sobrio */}
      <div className="absolute top-12 left-3 z-20 text-[10px] font-mono text-[#00FF66]/70 pointer-events-none">
        <div className="bg-[#000810]/80 backdrop-blur px-2 py-1.5 rounded border border-[#00FF66]/30 font-mono">
          <div className="text-[#00FF66]/60 text-[8px] mb-0.5">▼ POSITION</div>
          <div>POS: 33°02.5'S 071°37.8'W</div>
          <div>RNG: 20NM</div>
          <div>OPS: VTS-CC-VALP</div>
        </div>
      </div>

      <div className="absolute top-12 right-3 z-20 text-[10px] font-mono text-[#00FF66]/70 pointer-events-none">
        <div className="bg-[#000810]/80 backdrop-blur px-2 py-1.5 rounded border border-[#00FF66]/30 font-mono text-right">
          <div className="text-[#00FF66]/60 text-[8px] mb-0.5">▼ RADAR STATUS ▲</div>
          <div className="flex items-center gap-1.5 justify-end">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00FF66] opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#00FF66]" />
            </span>
            <span>OPERATIVO</span>
          </div>
          <div>UTC: {lastUpdate.toLocaleTimeString('es-CL', { hour12: false })}</div>
          <div>CONTACTS: {vessels.length}</div>
          <div>SWEEP: 360°/4s · 15RPM</div>
        </div>
      </div>

      {/* Leyenda — estilo Armada */}
      <div className="absolute bottom-2 left-2 z-20 bg-[#000810]/90 backdrop-blur rounded border border-[#00FF66]/30 p-2 text-[10px] font-mono">
        <div className="text-[#00FF66] mb-1.5 font-bold tracking-wider">CONTACT LEGEND</div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-0.5">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 bg-sky-500" />
            <span className="text-slate-300">UNDERWAY</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-slate-300">MOORED</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 bg-amber-500" />
            <span className="text-slate-300">ANCHORED</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 bg-violet-500" />
            <span className="text-slate-300">ARRIVAL</span>
          </div>
        </div>
      </div>

      {/* Status operativo */}
      <div className="absolute bottom-2 right-2 z-20 bg-[#000810]/90 backdrop-blur rounded border border-[#00FF66]/30 p-2 text-[10px] font-mono">
        <div className="text-[#00FF66] mb-0.5 font-bold tracking-wider">STATUS</div>
        <div className="text-slate-300">RADAR ARMADA · IALA V-103</div>
        <div className="text-slate-400 text-[8px]">CONFORME DS MOPT 1/1941</div>
      </div>
    </div>
  )
}
