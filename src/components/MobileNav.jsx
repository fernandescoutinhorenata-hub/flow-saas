import React, { useState } from 'react'
import {
  LayoutDashboard, Kanban, Package, Clapperboard, MoreHorizontal,
  Clock, BarChart3, Archive, Settings as SettingsIcon, LogOut, Download,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { usePWAInstall } from '../hooks/usePWAInstall.js'
import { installPWA } from '../lib/pwa.js'

const MAIN_ITEMS = [
  { view: 'home', label: 'Dashboard', Icon: LayoutDashboard },
  { view: 'board', label: 'Quadro', Icon: Kanban },
  { view: 'producao', label: 'Produção', Icon: Package },
  { view: 'canal', label: 'Canal', Icon: Clapperboard },
]

const MORE_ITEMS = [
  { view: 'timeline', label: 'Timeline', Icon: Clock },
  { view: 'reports', label: 'Relatórios', Icon: BarChart3 },
  { view: 'archive', label: 'Arquivo', Icon: Archive },
  { view: 'settings', label: 'Configurações', Icon: SettingsIcon },
]

export default function MobileNav({ activeNav, setActiveNav }) {
  const { signOut } = useAuth()
  const pwa = usePWAInstall()
  const [showMore, setShowMore] = useState(false)
  const [installing, setInstalling] = useState(false)

  function go(view) {
    setActiveNav(view)
    setShowMore(false)
  }

  async function handleInstall() {
    setInstalling(true)
    try {
      await installPWA()
    } finally {
      setInstalling(false)
      setShowMore(false)
    }
  }

  return (
    <>
      <nav className="mobile-bottom-nav" aria-label="Navegação principal">
        {MAIN_ITEMS.map(item => {
          const Icon = item.Icon
          const active = activeNav === item.view
          return (
            <button
              key={item.view}
              onClick={() => go(item.view)}
              className={active ? 'mobile-nav-item active' : 'mobile-nav-item'}
              aria-label={item.label}
              aria-current={active ? 'page' : undefined}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </button>
          )
        })}
        <button className="mobile-nav-item" onClick={() => setShowMore(true)} aria-label="Mais">
          <MoreHorizontal size={20} />
          <span>Mais</span>
        </button>
      </nav>

      {showMore && (
        <div className="mobile-more-overlay" onClick={() => setShowMore(false)} role="presentation">
          <div className="mobile-more-sheet" role="dialog" aria-label="Mais opções" onClick={e => e.stopPropagation()}>
            <div className="mobile-more-sheet-header">
              <span>Mais</span>
              <button onClick={() => setShowMore(false)} aria-label="Fechar">✕</button>
            </div>
            <div className="mobile-more-list">
              {MORE_ITEMS.map(item => {
                const Icon = item.Icon
                return (
                  <button key={item.view} onClick={() => go(item.view)}>
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </button>
                )
              })}
              {pwa.canInstall && !pwa.isInstalled && (
                <button onClick={handleInstall} disabled={installing}>
                  <Download size={18} />
                  <span>{installing ? 'Instalando...' : 'Instalar aplicativo'}</span>
                </button>
              )}
              <div className="mobile-more-divider" />
              <button onClick={signOut}>
                <LogOut size={18} />
                <span>Sair</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
