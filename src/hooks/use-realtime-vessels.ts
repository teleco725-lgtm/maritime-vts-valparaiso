'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { vessels as initialVessels, type Vessel } from '@/lib/vts/data'

interface MovementState {
  vessels: Vessel[]
  lastUpdate: Date
  isPaused: boolean
}

// Hook que simula el movimiento real de buques en tiempo real
// - Cada 2 segundos actualiza la posición de buques en navegación
// - Los buques atracados (moored) no se mueven
// - Los buques en aproximación (arrival) mueven hacia el puerto
// - Los buques fondeados (anchored) tienen ligera deriva
export function useRealtimeVessels(intervalMs = 2000) {
  const [state, setState] = useState<MovementState>({
    vessels: initialVessels,
    lastUpdate: new Date(),
    isPaused: false,
  })
  const vesselsRef = useRef(initialVessels)

  const tick = useCallback(() => {
    setState((prev) => {
      if (prev.isPaused) return prev
      const updated = prev.vessels.map((v) => {
        // Buques atracados no se mueven
        if (v.status === 'moored') return v

        // Avance basado en SOG (nudos) y COG (rumbo)
        // Convertimos a coordenadas SVG (cada 1 nudos ~ 1 px por tick)
        const speedFactor = v.sog * 0.15
        const rad = (v.cog * Math.PI) / 180
        let dx = Math.sin(rad) * speedFactor
        let dy = -Math.cos(rad) * speedFactor

        // Pequeña deriva para fondeados
        if (v.status === 'anchored') {
          dx = (Math.random() - 0.5) * 0.5
          dy = (Math.random() - 0.5) * 0.5
        }

        let newX = v.x + dx
        let newY = v.y + dy

        // Wraparound para buques que salen del mapa (1000 x 600)
        if (newX < 0) newX = 1000 + newX
        if (newX > 1000) newX = newX - 1000
        if (newY < 0) newY = 600 + newY
        if (newY > 600) newY = newY - 600

        // Actualizar trail con última posición
        const newTrail = [...(v.trail || []), { x: v.x, y: v.y }].slice(-10)

        return {
          ...v,
          x: newX,
          y: newY,
          trail: newTrail,
          lastUpdate: 'hace <1 seg',
          // Actualizar lat/lng según movimiento simulado
          lat: v.lat + dy * 0.0001,
          lng: v.lng + dx * 0.0001,
        }
      })
      vesselsRef.current = updated
      return { ...prev, vessels: updated, lastUpdate: new Date() }
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
      lastUpdate: new Date(),
      isPaused: false,
    })
    vesselsRef.current = initialVessels
  }, [])

  return {
    vessels: state.vessels,
    isPaused: state.isPaused,
    lastUpdate: state.lastUpdate,
    togglePause,
    reset,
  }
}
