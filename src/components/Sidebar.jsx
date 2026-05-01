import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import Avatar from './Avatar.jsx';
import { 
  LayoutDashboard, 
  Kanban, 
  Package, 
  Clock, 
  ClipboardList, 
  BarChart3, 
  Settings as SettingsIcon,
  Archive
} from 'lucide-react';

export default function Sidebar({ collapsed, activeNav, setActiveNav, mobileOpen, setMobileOpen }) {
  const { currentUser } = useAuth();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth <= 768);
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const items = [
    { view: "home",      icon: <LayoutDashboard size={18} />, label: "Dashboard" },
    { view: "board",     icon: <Kanban size={18} />,          label: "Quadro" },
    { view: "producao",  icon: <Package size={18} />,         label: "Produção" },
    { view: "timeline",  icon: <Clock size={18} />,           label: "Timeline" },
    { view: "registros", icon: <ClipboardList size={18} />,   label: "Registros" },
    { view: "reports",   icon: <BarChart3 size={18} />,       label: "Relatórios" },
    { view: "archive",   icon: <Archive size={18} />,        label: "Arquivo" },
    { view: "settings",  icon: <SettingsIcon size={18} />,    label: "Config." },
  ];

  function handleNavClick(view) {
    setActiveNav(view);
    if (isMobile && setMobileOpen) setMobileOpen(false);
  }

  // Mobile: escondida por padrão, abre como overlay
  if (isMobile) {
    if (!mobileOpen) return null;

    return (
      <>
        {/* Backdrop */}
        <div
          className="sidebar-mobile-backdrop"
          onClick={() => setMobileOpen(false)}
        />
        {/* Painel da sidebar */}
        <div
          className="sidebar-mobile-panel"
          style={{
            background: "var(--bg-base)",
            borderRight: "1px solid var(--border)",
            display: "flex",
            flexDirection: "column",
            gap: 2,
            padding: "12px 8px",
            overflowY: "auto",
          }}
        >
          {/* Logo no topo mobile */}
          <div style={{
            fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 20,
            color: "var(--text-primary)", letterSpacing: "-0.5px",
            padding: "8px 12px 16px", borderBottom: "1px solid var(--border)", marginBottom: 8
          }}>
            FLOW<span style={{ color: "var(--accent)" }}>.</span>
          </div>

          <div style={{ flex: 1 }}>
            {items.map(item => {
              const active = activeNav === item.view;
              return (
                <div
                  key={item.view}
                  onClick={() => handleNavClick(item.view)}
                  style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "12px 16px",
                    borderRadius: 8, cursor: "pointer",
                    background: active ? "var(--bg-surface)" : "transparent",
                    transition: "background 0.15s",
                    borderLeft: active ? "2px solid var(--accent)" : "2px solid transparent",
                    marginBottom: 2,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 18, color: active ? "var(--accent)" : "var(--text-secondary)" }}>
                    {item.icon}
                  </div>
                  <span style={{ fontSize: 14, color: active ? "var(--accent)" : "var(--text-secondary)", fontWeight: active ? 600 : 400 }}>
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* User section */}
          <div style={{
            marginTop: "auto", padding: "12px 8px",
            borderTop: "1px solid var(--border)",
            display: "flex", alignItems: "center", gap: 10,
          }}>
            <Avatar initials={currentUser?.initials || "?"} size={28} />
            <div style={{ overflow: "hidden" }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {currentUser?.name || "Usuário"}
              </div>
              <div style={{ fontSize: 10, color: "var(--text-secondary)", textTransform: "capitalize" }}>
                {currentUser?.role || "membro"}
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Desktop: comportamento original
  return (
    <div style={{
      width: collapsed ? 52 : 220, flexShrink: 0,
      background: "var(--bg-base)", borderRight: "1px solid var(--border)",
      display: "flex", flexDirection: "column", gap: 2,
      padding: "12px 8px", transition: "width 0.2s ease",
      overflow: "hidden",
    }}>
      <div style={{ flex: 1 }}>
        {(items || []).map(item => {
          const active = activeNav === item.view;
          return (
            <div
              key={item.view}
              onClick={() => handleNavClick(item.view)}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "10px 12px",
                borderRadius: 8, cursor: "pointer",
                background: active ? "var(--bg-surface)" : "transparent",
                position: "relative",
                transition: "background 0.15s",
                borderLeft: active ? "2px solid var(--accent)" : "2px solid transparent",
              }}
              onMouseOver={e => { if (!active) e.currentTarget.style.background = "var(--bg-surface)"; }}
              onMouseOut={e => { if (!active) e.currentTarget.style.background = "transparent"; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 18, color: active ? "var(--accent)" : "var(--text-secondary)" }}>
                {item.icon}
              </div>
              {!collapsed && <span style={{ fontSize: 13, color: active ? "var(--accent)" : "var(--text-secondary)", fontWeight: active ? 500 : 400, whiteSpace: "nowrap" }}>{item.label}</span>}
            </div>
          );
        })}
      </div>

      {/* User Profile section at bottom */}
      <div style={{
        marginTop: "auto", padding: "12px 8px",
        borderTop: "1px solid var(--border)",
        display: "flex", alignItems: "center", gap: 10,
        minHeight: 50
      }}>
        <Avatar initials={currentUser?.initials || "?"} size={28} />
        {!collapsed && (
          <div style={{ overflow: "hidden" }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {currentUser?.name || "Usuário"}
            </div>
            <div style={{ fontSize: 10, color: "var(--text-secondary)", textTransform: "capitalize" }}>
              {currentUser?.role || "membro"}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
