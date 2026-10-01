'use client'

import { useSyncExternalStore } from 'react'

const emptySubscribe = () => () => {}

// Detecta si estamos en el cliente (después de hidratación)
export function useHasHydrated() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,  // client snapshot
    () => false  // server snapshot
  )
}
