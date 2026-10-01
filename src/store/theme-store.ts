'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Theme {
  id: string
  name: string
  description: string
  swatchColor: string
  secondaryColor: string
  vars: {
    '--vts-bg': string
    '--vts-card': string
    '--vts-subcard': string
    '--vts-deep': string
    '--vts-bg-gradient-start': string
    '--vts-bg-gradient-end': string
  }
}

export const themes: Theme[] = [
  {
    id: 'azul-aqua',
    name: 'Azul Aqua',
    description: 'Celeste oscuro · Profesional · Confiable',
    swatchColor: '#00B4D8',
    secondaryColor: '#0E2A4D',
    vars: {
      '--vts-bg': '#0E2A4D',
      '--vts-card': '#1B3A5F',
      '--vts-subcard': '#2A4D75',
      '--vts-deep': '#082140',
      '--vts-bg-gradient-start': '#0E2A4D',
      '--vts-bg-gradient-end': '#082140',
    },
  },
  {
    id: 'azul-marino',
    name: 'Azul Marino',
    description: 'Profundo · Sobrio · Ejecutivo',
    swatchColor: '#003366',
    secondaryColor: '#0A0F18',
    vars: {
      '--vts-bg': '#0A0F18',
      '--vts-card': '#111927',
      '--vts-subcard': '#1a2433',
      '--vts-deep': '#050810',
      '--vts-bg-gradient-start': '#0A0F18',
      '--vts-bg-gradient-end': '#050810',
    },
  },
  {
    id: 'verde-esmeralda',
    name: 'Verde Esmeralda',
    description: 'Natural · Seguro · Vital',
    swatchColor: '#10B981',
    secondaryColor: '#0A1F18',
    vars: {
      '--vts-bg': '#0A1F18',
      '--vts-card': '#112E25',
      '--vts-subcard': '#1A4035',
      '--vts-deep': '#05120D',
      '--vts-bg-gradient-start': '#0A1F18',
      '--vts-bg-gradient-end': '#05120D',
    },
  },
  {
    id: 'purpura-tech',
    name: 'Violeta Tech',
    description: 'Moderno · Innovador · Tecnológico',
    swatchColor: '#7C3AED',
    secondaryColor: '#0F0A1F',
    vars: {
      '--vts-bg': '#0F0A1F',
      '--vts-card': '#1A1230',
      '--vts-subcard': '#2A1E45',
      '--vts-deep': '#080510',
      '--vts-bg-gradient-start': '#0F0A1F',
      '--vts-bg-gradient-end': '#080510',
    },
  },
  {
    id: 'naranja-atardecer',
    name: 'Naranja Atardecer',
    description: 'Cálido · Energético · Distinto',
    swatchColor: '#FF6B35',
    secondaryColor: '#1F0D0A',
    vars: {
      '--vts-bg': '#1F0D0A',
      '--vts-card': '#2D1814',
      '--vts-subcard': '#3D231F',
      '--vts-deep': '#0F0705',
      '--vts-bg-gradient-start': '#1F0D0A',
      '--vts-bg-gradient-end': '#0F0705',
    },
  },
  {
    id: 'gris-grafito',
    name: 'Gris Grafito',
    description: 'Neutro · Minimalista · Profesional',
    swatchColor: '#64748B',
    secondaryColor: '#0F1115',
    vars: {
      '--vts-bg': '#0F1115',
      '--vts-card': '#1A1D24',
      '--vts-subcard': '#262A33',
      '--vts-deep': '#080A0E',
      '--vts-bg-gradient-start': '#0F1115',
      '--vts-bg-gradient-end': '#080A0E',
    },
  },
]

interface ThemeState {
  activeThemeId: string
  setTheme: (id: string) => void
  getActiveTheme: () => Theme
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      activeThemeId: 'azul-aqua',
      setTheme: (id: string) => set({ activeThemeId: id }),
      getActiveTheme: () => {
        const id = get().activeThemeId
        return themes.find((t) => t.id === id) || themes[0]
      },
    }),
    { name: 'vts-theme' }
  )
)

// Apply theme to document body via CSS variables
export function applyTheme(theme: Theme) {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  // 1. Apply via inline style on <html>
  Object.entries(theme.vars).forEach(([key, value]) => {
    root.style.setProperty(key, value)
  })
  // 2. Also inject a <style> tag as fallback (in case inline styles don't propagate)
  const styleId = 'vts-theme-vars'
  let styleEl = document.getElementById(styleId) as HTMLStyleElement | null
  if (!styleEl) {
    styleEl = document.createElement('style')
    styleEl.id = styleId
    document.head.appendChild(styleEl)
  }
  const cssVars = Object.entries(theme.vars)
    .map(([k, v]) => `${k}: ${v};`)
    .join(' ')
  styleEl.textContent = `:root { ${cssVars} }`
}
