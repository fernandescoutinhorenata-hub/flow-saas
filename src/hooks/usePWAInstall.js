import { useSyncExternalStore } from 'react'
import { getPWAState, subscribePWA } from '../lib/pwa.js'

export function usePWAInstall() {
  return useSyncExternalStore(subscribePWA, getPWAState, getPWAState)
}
