'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Palette, Check } from 'lucide-react'
import { themes, useThemeStore, applyTheme } from '@/store/theme-store'

export function ThemePicker() {
  const [open, setOpen] = useState(false)
  const { activeThemeId, setTheme } = useThemeStore()
  const activeTheme = themes.find((t) => t.id === activeThemeId) || themes[0]

  // Apply theme on mount and whenever it changes
  useEffect(() => {
    applyTheme(activeTheme)
  }, [activeThemeId, activeTheme])

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('[data-theme-picker]')) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <div className="relative" data-theme-picker>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 p-2 rounded-lg hover:bg-[var(--vts-subcard)] transition-colors border border-slate-700/40 hover:border-[#00D2FF]/40"
        aria-label="Cambiar tema de colores"
        title={`Tema actual: ${activeTheme.name}`}
      >
        {/* Color swatch — muestra el color actual */}
        <div
          className="w-5 h-5 rounded-full ring-2 ring-white/10 transition-transform hover:scale-110"
          style={{ backgroundColor: activeTheme.swatchColor }}
        />
        <Palette className="w-4 h-4 text-slate-300 hidden sm:block" />
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-80 z-50 bg-[var(--vts-card)] border border-slate-700/60 rounded-xl shadow-2xl shadow-black/50 overflow-hidden"
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-slate-700/40 bg-[var(--vts-subcard)]">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Palette className="w-3 h-3 text-[#00D2FF]" />
                Diseño Visual
              </div>
              <div className="text-[10px] text-slate-500 mt-1">
                Selecciona el tema cromático del sistema
              </div>
            </div>

            {/* Theme list */}
            <div className="py-1 max-h-[400px] overflow-y-auto custom-scroll">
              {themes.map((theme) => {
                const isSelected = theme.id === activeThemeId
                return (
                  <button
                    key={theme.id}
                    onClick={() => {
                      setTheme(theme.id)
                      applyTheme(theme)
                      setOpen(false)
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 transition-colors text-left ${
                      isSelected
                        ? 'bg-[#00D2FF]/5 hover:bg-[#00D2FF]/10'
                        : 'hover:bg-[var(--vts-subcard)]'
                    }`}
                  >
                    {/* Color swatch */}
                    <div className="flex-shrink-0 flex items-center gap-1">
                      <div
                        className="w-4 h-4 rounded-full ring-1 ring-white/10"
                        style={{ backgroundColor: theme.swatchColor }}
                      />
                      <div
                        className="w-4 h-4 rounded-full ring-1 ring-white/10 -ml-1.5"
                        style={{ backgroundColor: theme.secondaryColor }}
                      />
                    </div>

                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm font-semibold truncate ${isSelected ? 'text-[#00D2FF]' : 'text-slate-200'}`}>
                        {theme.name}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">
                        {theme.description}
                      </div>
                    </div>

                    {/* Check mark for selected */}
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="flex-shrink-0"
                      >
                        <Check className="w-4 h-4 text-[#00FF66]" strokeWidth={3} />
                      </motion.div>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Footer */}
            <div className="px-4 py-2.5 border-t border-slate-700/40 bg-[var(--vts-subcard)]">
              <div className="text-[10px] text-slate-500 text-center">
                {themes.length} temas disponibles · Estándar IALA
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .custom-scroll::-webkit-scrollbar { width: 5px; }
        .custom-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #334155; border-radius: 3px; }
      `}</style>
    </div>
  )
}
