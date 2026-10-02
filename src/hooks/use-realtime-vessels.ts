'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { vessels as initialVessels, type Vessel } from '@/lib/vts/data'

interface TrailPoint {
  x: number
  y: number
  ts: number  // timestamp para efecto de desvanecimiento
}

interface MovementState {
  vessels: Vessel[]
  trails: Record<string, TrailPoint[]>  // estelas por separado con timestamps
  lastUpdate: Date
  isPaused: boolean
  tickCount: number
}

// Hook que simula movimiento realista de buques en tiempo real
// - Actualización cada 1000ms para fluidez tipo video game
// - Cada tipo de buque tiene comportamiento distinto:
//   * arrival: curva hacia puerto, reduce velocidad al acercarse
//   * underway: rumbo con ligeros ajustes (zigzag natural)
//   * moored: oscilación mínima por oleaje
//   * anchored: deriva alrededor del punto de ancla
//   * restricted: movimiento muy limitado
// - Estelas con timestamps para efecto de desvanecimiento
export function useRealtimeVessels(intervalMs = 1000) {
  const [state, setState] = useState<MovementState>({
    vessels: initialVessels,
    trails: Object.fromEntries(initialVessels.map((v) => [v.id, [] as TrailPoint[]])),
    lastUpdate: new Date(),
    isPaused: false,
    tickCount: 0,
  })

  const tick = useCallback(() => {
    setState((prev) => {
      if (prev.isPaused) return prev
      const now = Date.now()
      const tickCount = prev.tickCount + 1

      // Updated vessels with realistic behavior
      const updated = prev.vessels.map((v) => {
        const trail = prev.trails[v.id] || []

        // Add current position to trail with timestamp
        const newTrailPoint: TrailPoint = { x: v.x, y: v.y, ts: now }
        const newTrail = [...trail, newTrailPoint].slice(-30) // Keep last 30 points

        // === MOVIMIENTO SEGÚN ESTADO ===
        let dx = 0, dy = 0, newSog = v.sog, newCog = v.cog, newHeading = v.heading

        if (v.status === 'moored') {
          // Atracado: oscilación mínima por oleaje (visual sutil)
          dx = Math.sin(now / 3000) * 0.15
          dy = Math.cos(now / 4000) * 0.10
          // Heading oscila levemente con la marea
          newHeading = v.heading + Math.sin(now / 5000) * 2
        } else if (v.status === 'anchored') {
          // Fondeado: deriva en círculo pequeño alrededor del punto de ancla
          const angle = (now / 8000) % (Math.PI * 2)
          const radius = 3 // deriva de 3 píxeles
          dx = Math.cos(angle) * radius * 0.05 - (v.x - (v.x - Math.sin(angle - 0.05) * radius)) * 0.05
          dy = Math.sin(angle) * radius * 0.05 - (v.y - (v.y - Math.cos(angle - 0.05) * radius)) * 0.05
          newHeading = (angle * 180 / Math.PI) + 90 // Gira con la corriente
        } else if (v.status === 'arrival' || (v.status === 'underway' && v.sog > 0)) {
          // En movimiento: navegación con ajustes naturales
          const speedFactor = v.sog * 0.4 // factor de velocidad visual
          const rad = (v.cog * Math.PI) / 180
          dx = Math.sin(rad) * speedFactor
          dy = -Math.cos(rad) * speedFactor

          // Ligeras variaciones de rumbo (zigzag natural por corrientes)
          const courseVariation = Math.sin(now / 2000 + v.x * 0.01) * 3
          newCog = v.cog + courseVariation
          newHeading = newCog + (Math.sin(now / 1500) * 5) // heading vs COG

          // Si está en aproximación, reduce velocidad
          if (v.status === 'arrival') {
            const distToPort = Math.sqrt((v.x - 500) ** 2 + (v.y - 350) ** 2)
            if (distToPort < 200) {
              newSog = Math.max(2, v.sog * 0.985) // reduce gradualmente
            }
          }
        } else if (v.status === 'restricted') {
          // Restringido: casi sin movimiento
          dx = (Math.random() - 0.5) * 0.2
          dy = (Math.random() - 0.5) * 0.2
        }

        // Apply movement
        let newX = v.x + dx
        let newY = v.y + dy

        // Wraparound suave (los buques que salen vuelven a aparecer al otro lado)
        if (newX < -20) newX = 1020
        if (newX > 1020) newX = -20
        if (newY < -20) newY = 620
        if (newY > 620) newY = -20

        // Actualizar lat/lng según movimiento
        const newLat = v.lat + dy * 0.00005
        const newLng = v.lng + dx * 0.00005

        return {
          ...v,
          x: newX,
          y: newY,
          lat: newLat,
          lng: newLng,
          sog: newSog,
          cog: newCog,
          heading: newHeading,
          trail: newTrail.map((t) => ({ x: t.x, y: t.y })), // mantener compatibilidad
          lastUpdate: 'hace <1 seg',
        }
      })

      // Actualizar trails
      const newTrails = { ...prev.trails }
      updated.forEach((v) => {
        if (!newTrails[v.id]) newTrails[v.id] = []
        // Use the existing trail (already updated above via trail points)
        newTrails[v.id] = (prev.trails[v.id] || []).concat([{ x: v.x, y: v.y, ts: now }]).slice(-30)
      })

      return {
        vessels: updated,
        trails: newTrails,
        lastUpdate: new Date(),
        isPaused: prev.isPaused,
        tickCount,
      }
    })
  }, [])

  useEffect(() => {
    if (state.isPaused) return
    const interval = setInterval(tick, intervalMs)
    return () => clearInterval(interval)
  }, [tick, intervalMs, state.isPaused])

  const togglePause = useCallback(() => {
    setState((prev) => ({ ...prev, isPaused: !prev.isPaused }))
  }, [state.isPaused])

  const reset = useCallback(() => {
    setState({
      vessels: initialVessels,
      trails: Object.fromEntries(initialVessels.map((v) => [v.id, []])),
      lastUpdate: new Date(),
      isPaused: false,
      tickCount: 0,
    })
  }, [])

  return {
    vessels: state.vessels,
    trails: state.trails,
    isPaused: state.isPaused,
    lastUpdate: state.lastUpdate,
    tickCount: state.tickCount,
    togglePause,
    reset,
  }
}
