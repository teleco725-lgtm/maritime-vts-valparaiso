'use client'

import { useEffect } from 'react'
import { useThemeStore, applyTheme, themes } from '@/store/theme-store'

/**
 * Inicializa el tema activo al cargar la página.
 * Aplica las variables CSS al <html> desde el estado persistido en localStorage.
 */
export function ThemeInitializer() {
  const activeThemeId = useThemeStore((s) => s.activeThemeId)
  const theme = themes.find((t) => t.id === activeThemeId) || themes[0]

  // Apply on mount and whenever the theme changes
  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  return null
}
