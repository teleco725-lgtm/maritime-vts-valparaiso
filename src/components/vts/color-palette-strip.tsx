'use client'

import { motion } from 'framer-motion'
import { Waves } from 'lucide-react'

interface PaletteColor {
  hex: string
  name: string
  category: 'base' | 'capas' | 'operacional' | 'marino' | 'alerta'
  textColor: string
}

const palette: PaletteColor[] = [
  { hex: '#0A0F18', name: 'Fondo Base', category: 'base', textColor: '#94a3b8' },
  { hex: '#111927', name: 'Capas / Tarjetas', category: 'capas', textColor: '#94a3b8' },
  { hex: '#1a2433', name: 'Sub-capas', category: 'capas', textColor: '#94a3b8' },
  { hex: '#00FF66', name: 'Radar Vector', category: 'operacional', textColor: '#0A0F18' },
  { hex: '#00D2FF', name: 'AIS Target', category: 'operacional', textColor: '#0A0F18' },
  { hex: '#FF3B3B', name: 'Alerta / Crítico', category: 'alerta', textColor: '#0A0F18' },
  { hex: '#FFB800', name: 'Alerta Media', category: 'alerta', textColor: '#0A0F18' },
  { hex: '#001F3F', name: 'Profundidad Mar', category: 'marino', textColor: '#94a3b8' },
  { hex: '#003366', name: 'Azul Marino', category: 'marino', textColor: '#94a3b8' },
  { hex: '#008080', name: 'Teal Ocean', category: 'marino', textColor: '#94a3b8' },
  { hex: '#20B2AA', name: 'Light Sea Green', category: 'marino', textColor: '#0A0F18' },
  { hex: '#2E8B57', name: 'Sea Green', category: 'marino', textColor: '#0A0F18' },
]

const categoryLabels: Record<PaletteColor['category'], string> = {
  base: 'Base',
  capas: 'Capas',
  operacional: 'Operacional',
  marino: 'Marino',
  alerta: 'Alertas',
}

const categoryColors: Record<PaletteColor['category'], string> = {
  base: 'text-slate-400',
  capas: 'text-slate-400',
  operacional: 'text-[#00FF66]',
  marino: 'text-[#00D2FF]',
  alerta: 'text-[#FF3B3B]',
}

export default function ColorPaletteStrip() {
  // Group by category
  const categories = Object.keys(categoryLabels) as PaletteColor['category'][]
  const grouped = categories.map((cat) => ({
    category: cat,
    colors: palette.filter((c) => c.category === cat),
  }))

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-[#111927] border border-slate-700/50 rounded-xl p-3 sm:p-4 shadow-lg shadow-black/30"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-[#00D2FF] text-sm font-semibold">
          <Waves className="w-4 h-4" />
          <span>Paleta Marítima VTS</span>
        </div>
        <div className="text-[10px] text-slate-500 hidden sm:block">
          Estándar profesional IALA · Centro de Control Marítimo
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
        {grouped.map((group) => (
          <div key={group.category} className="space-y-1.5">
            <div className={`text-[10px] uppercase tracking-wider font-semibold ${categoryColors[group.category]}`}>
              {categoryLabels[group.category]}
            </div>
            <div className="space-y-1">
              {group.colors.map((color) => (
                <div
                  key={color.hex}
                  className="flex items-center gap-2 p-1.5 rounded-md bg-[#0A0F18]/60 border border-slate-700/30 hover:border-slate-600 transition-colors group cursor-default"
                  title={`${color.name} — ${color.hex}`}
                >
                  <div
                    className="w-5 h-5 rounded ring-1 ring-white/10 flex-shrink-0 transition-transform group-hover:scale-110"
                    style={{ backgroundColor: color.hex }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-[11px] text-slate-300 font-medium truncate">{color.name}</div>
                    <div className="text-[9px] text-slate-500 font-mono">{color.hex}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  )
}
