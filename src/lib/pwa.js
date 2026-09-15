// PWA: gerenciamento do prompt de instalação e atualização.
// Estado compartilhado (módulo) para múltiplos consumidores sem duplicar listeners.

let deferredPrompt = null
let listeners = []
let state = { canInstall: false, isInstalled: false, updateAvailable: false }
let initialized = false

function setState(partial) {
  state = { ...state, ...partial }
  listeners.forEach((l) => l(state))
}

export function getPWAState() {
  return state
}

export function subscribePWA(fn) {
  listeners.push(fn)
  return () => {
    listeners = listeners.filter((l) => l !== fn)
  }
}

export function initPWA() {
  if (initialized || typeof window === 'undefined') return
  initialized = true

  if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) {
    setState({ isInstalled: true })
  }

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferredPrompt = e
    setState({ canInstall: true })
  })

  window.addEventListener('appinstalled', () => {
    setState({ isInstalled: true, canInstall: false })
  })

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').then((reg) => {
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing
        if (!newWorker) return
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            setState({ updateAvailable: true })
          }
        })
      })
    }).catch(() => {})
  }
}

export async function installPWA() {
  if (!deferredPrompt) return false
  const prompt = deferredPrompt
  prompt.prompt()
  const choice = await prompt.userChoice
  deferredPrompt = null
  if (choice.outcome === 'accepted') {
    setState({ isInstalled: true, canInstall: false })
  } else {
    setState({ canInstall: false })
  }
  return true
}

export function applyUpdate() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistration().then((reg) => {
      if (reg && reg.waiting) reg.waiting.postMessage({ type: 'SKIP_WAITING' })
    })
  }
  window.location.reload()
}
