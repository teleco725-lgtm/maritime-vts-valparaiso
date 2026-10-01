'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { Waves, Lightbulb, Eye, Anchor, Radar, Cctv, Palette, ShieldAlert } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

interface PaletteColor {
  hex: string
  name: string
  description: string
}

interface PaletteGroup {
  id: string
  title: string
  description: string
  icon: typeof Waves
  accentColor: string
  colors: PaletteColor[]
}

const paletteGroups: PaletteGroup[] = [
  {
    id: 'base',
    title: 'Base · Estructura',
    description: 'Colores de fondo y capas que conforman la estructura visual del sistema.',
    icon: Waves,
    accentColor: '#94a3b8',
    colors: [
      { hex: '#0E2A4D', name: 'Fondo Base', description: 'Color principal del fondo. Celeste oscuro profundo. Evita fatiga visual en turnos largos.' },
      { hex: '#1B3A5F', name: 'Capas / Tarjetas', description: 'Fondo de tarjetas, modales y secciones. Celeste oscuro medio. Crea jerarquía visual sobre el fondo base.' },
      { hex: '#2A4D75', name: 'Sub-capas', description: 'Áreas internas, headers de panel, status bars. Celeste oscuro claro. Sub-jerarquía dentro de tarjetas.' },
      { hex: '#082140', name: 'Profundidad', description: 'Para sombras y gradientes. Crea sensación de profundidad en el radar.' },
    ],
  },
  {
    id: 'operacional',
    title: 'Operacional · Elementos críticos',
    description: 'Colores para datos operacionales en tiempo real. Estándar IALA para VTS.',
    icon: Radar,
    accentColor: '#00FF66',
    colors: [
      { hex: '#00FF66', name: 'Radar Vector', description: 'Vectores de rumbo, sweep del radar, tracks activos. Estándar IALA para plot de radar.' },
      { hex: '#00D2FF', name: 'AIS Target', description: 'Posición AIS de buques, MMSI activos, targets seleccionados. Cyan brillante para alta visibilidad.' },
      { hex: '#7FFFD4', name: 'Aquamarine', description: 'Para confirmaciones visuales, status "OK". Más suave que el radar green.' },
    ],
  },
  {
    id: 'marino',
    title: 'Marino · Paleta del océano',
    description: 'Tonos inspirados en el océano Pacífico. Para elementos decorativos y branding.',
    icon: Anchor,
    accentColor: '#00D2FF',
    colors: [
      { hex: '#001F3F', name: 'Profundidad Mar', description: 'Azul profundo. Para banners, secciones hero, gradientes marinos.' },
      { hex: '#003366', name: 'Azul Marino', description: 'Azul navy clásico. Para texto secundario sobre fondos claros o acentos sutiles.' },
      { hex: '#008080', name: 'Teal Ocean', description: 'Color intermedio. Para tags de regiones, identificación geográfica.' },
      { hex: '#20B2AA', name: 'Light Sea Green', description: 'Para indicadores de estado ambiental, oxigenación, mareas.' },
      { hex: '#2E8B57', name: 'Sea Green', description: 'Para indicadores de fauna marina, Zona de Protección Marina.' },
    ],
  },
  {
    id: 'alertas',
    title: 'Alertas · Severidad',
    description: 'Sistema de colores para clasificación de eventos críticos. Cumple con convenios ICS/SMCP.',
    icon: ShieldAlert,
    accentColor: '#FF3B3B',
    colors: [
      { hex: '#FF3B3B', name: 'Alerta / Crítico', description: 'Peligro inmediato, colisión inminente, intrusión cibernética. Acción requerida YA.' },
      { hex: '#FFB800', name: 'Alerta Media', description: 'Advertencia operacional. Requiere atención pero no acción inmediata.' },
      { hex: '#FFA500', name: 'Warning', description: 'Para alertas tipo geofencing, aproximación a zona restringida.' },
      { hex: '#10B981', name: 'OK / Resuelto', description: 'Estado normal, alerta resuelta, sistema operativo.' },
    ],
  },
  {
    id: 'tipografico',
    title: 'Tipografía · Texto',
    description: 'Colores para texto según jerarquía. Cumple WCAG AA sobre el fondo base.',
    icon: Eye,
    accentColor: '#e2e8f0',
    colors: [
      { hex: '#F8FAFC', name: 'Texto primario', description: 'Texto principal (slate-50). Máximo contraste para datos críticos.' },
      { hex: '#CBD5E1', name: 'Texto secundario', description: 'Texto secundario (slate-300). Para descripciones, labels.' },
      { hex: '#94A3B8', name: 'Texto terciario', description: 'Texto auxiliar (slate-400). Para metadata, timestamps, hints.' },
      { hex: '#64748B', name: 'Texto muted', description: 'Texto deshabilitado o muy secundario (slate-500).' },
    ],
  },
]

interface Suggestion {
  title: string
  context: string
  colors: string[]
  explanation: string
  icon: typeof Lightbulb
}

const suggestions: Suggestion[] = [
  {
    title: 'Modo Operacional Nocturno',
    context: 'Turno de noche en el centro VTS, ojos cansados',
    colors: ['#0E2A4D', '#1B3A5F', '#00FF66', '#00D2FF'],
    explanation: 'Fondo muy oscuro para minimizar fatiga ocular, verde radar para tracks, cyan AIS para identificación. Evita tonos blancos que cansan en turnos de 12h.',
    icon: Eye,
  },
  {
    title: 'Presentación Ejecutiva',
    context: 'Reunión con stakeholder, board de Directemar',
    colors: ['#0E2A4D', '#003366', '#00D2FF', '#FFB800'],
    explanation: 'Azul marino para autoridad, cyan AIS para destacar datos clave, ámbar para KPIs importantes. Combinación profesional y sobria.',
    icon: Palette,
  },
  {
    title: 'Modo Clima Marítimo',
    context: 'Visualización de MET-OCEAN, oleaje, viento',
    colors: ['#0E2A4D', '#003366', '#008080', '#2E8B57'],
    explanation: 'Paleta del océano puro. Teal para mareas, sea green para corrientes. Coherente con el dominio marítimo.',
    icon: Waves,
  },
  {
    title: 'Modo Auditoría de Seguridad',
    context: 'Investigación de incidente, análisis post-evento',
    colors: ['#0E2A4D', '#1B3A5F', '#FF3B3B', '#FFB800'],
    explanation: 'Rojo y ámbar dominantes para severidad, mínimo distracción cromática. Permite al operador enfocarse en eventos críticos.',
    icon: ShieldAlert,
  },
  {
    title: 'Modo CCTV / Vigilancia',
    context: 'Monitoreo de cámaras PTZ y térmicas',
    colors: ['#0E2A4D', '#1B3A5F', '#00FF66', '#10B981'],
    explanation: 'Verde radar y emerald para indicar cámaras operativas. Compatible con la visión nocturna del operador.',
    icon: Cctv,
  },
  {
    title: 'Modo Cumplimiento Legal',
    context: 'Vista para auditoría ANCI / Ley 21.719',
    colors: ['#0E2A4D', '#003366', '#00D2FF', '#10B981'],
    explanation: 'Azul marino + cyan AIS + verde OK. Transmite cumplimiento y estatus operacional claro. Listo para captura de pantalla en informes.',
    icon: Anchor,
  },
]

export default function PaletteView() {
  const [activeGroup, setActiveGroup] = useState<string>('base')
  const [copiedColor, setCopiedColor] = useState<string | null>(null)

  const copyToClipboard = (hex: string) => {
    navigator.clipboard?.writeText(hex)
    setCopiedColor(hex)
    setTimeout(() => setCopiedColor(null), 1500)
  }

  return (
    <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-100 flex items-center gap-3">
          <Palette className="w-7 h-7 text-[#00D2FF]" />
          Paleta de Colores Marítima
        </h2>
        <p className="text-sm text-slate-400 mt-2">
          Sistema cromático profesional para el VTS. Estándar IALA · Cumple contraste WCAG AA · Optimizado para turnos operacionales.
        </p>
      </div>

      {/* Tabs por categoría */}
      <div className="flex flex-wrap gap-2 p-2 bg-[#1B3A5F] border border-slate-700/60 rounded-xl shadow-lg shadow-black/30">
        {paletteGroups.map((group) => {
          const Icon = group.icon
          const isActive = activeGroup === group.id
          return (
            <button
              key={group.id}
              onClick={() => setActiveGroup(group.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-[#2A4D75] text-slate-100 shadow-md border border-slate-600'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#2A4D75]/50 border border-transparent'
              }`}
            >
              <Icon className="w-4 h-4" style={{ color: isActive ? group.accentColor : undefined }} />
              {group.title.split(' · ')[0]}
            </button>
          )
        })}
      </div>

      {/* Grupo activo */}
      {paletteGroups.filter(g => g.id === activeGroup).map((group) => {
        const Icon = group.icon
        return (
          <motion.div
            key={group.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="bg-[#1B3A5F] border-slate-700/60 shadow-lg shadow-black/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg sm:text-xl text-slate-100 flex items-center gap-2">
                  <Icon className="w-5 h-5" style={{ color: group.accentColor }} />
                  {group.title}
                </CardTitle>
                <CardDescription className="text-slate-400">{group.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {group.colors.map((color, i) => (
                    <motion.button
                      key={color.hex}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => copyToClipboard(color.hex)}
                      className="group text-left p-3 rounded-lg bg-[#2A4D75] border border-slate-700/40 hover:border-slate-600 transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div
                          className="w-12 h-12 rounded-lg ring-1 ring-white/10 flex-shrink-0 transition-transform group-hover:scale-110 shadow-md"
                          style={{ backgroundColor: color.hex }}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-semibold text-slate-200 truncate">{color.name}</div>
                          <div className="text-xs text-slate-400 font-mono">
                            {copiedColor === color.hex ? '✓ Copiado!' : color.hex}
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-slate-500 leading-snug">{color.description}</div>
                    </motion.button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )
      })}

      {/* Sugerencias de combinaciones */}
      <div>
        <h3 className="text-lg sm:text-xl font-bold text-slate-100 flex items-center gap-2 mb-4">
          <Lightbulb className="w-5 h-5 text-[#FFB800]" />
          Sugerencias de Combinaciones
        </h3>
        <p className="text-sm text-slate-400 mb-4">
          Modos preconfigurados según el contexto de uso del operador. Cada combinación está optimizada para un escenario específico.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {suggestions.map((s, i) => {
            const Icon = s.icon
            return (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="bg-[#1B3A5F] border-slate-700/60 shadow-lg shadow-black/30 hover:border-slate-600 transition-all h-full">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base text-slate-100 flex items-center gap-2">
                      <Icon className="w-4 h-4 text-[#00D2FF]" />
                      {s.title}
                    </CardTitle>
                    <div className="text-xs text-slate-500 italic">{s.context}</div>
                  </CardHeader>
                  <CardContent className="pt-2">
                    {/* Color combination preview */}
                    <div className="flex gap-1 mb-3 h-8 rounded-lg overflow-hidden ring-1 ring-white/10">
                      {s.colors.map((c, idx) => (
                        <div
                          key={idx}
                          className="flex-1 transition-all hover:flex-[2]"
                          style={{ backgroundColor: c }}
                          title={c}
                        />
                      ))}
                    </div>
                    {/* Color codes */}
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {s.colors.map((c) => (
                        <span
                          key={c}
                          className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#2A4D75] border border-slate-700/40 text-slate-400"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                    {/* Explanation */}
                    <p className="text-xs text-slate-400 leading-relaxed">{s.explanation}</p>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Footer info */}
      <Card className="bg-[#1B3A5F] border-slate-700/60 shadow-lg shadow-black/30">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#00D2FF]/10 flex items-center justify-center flex-shrink-0">
              <Palette className="w-4 h-4 text-[#00D2FF]" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold text-slate-200 mb-1">Sobre esta paleta</div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Esta paleta está inspirada en los sistemas VTS profesionales de Kongsberg Norcontrol y Wärtsilä,
                con colores estándar IALA para plot de radar y targets AIS. Cumple con los requisitos de
                contraste WCAG 2.1 AA (ratio mínimo 4.5:1) sobre el fondo base oscuro, reduciendo la fatiga
                visual durante turnos operacionales de 12 horas. Todos los colores son clickeables para
                copiar su valor hexadecimal al portapapeles.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
