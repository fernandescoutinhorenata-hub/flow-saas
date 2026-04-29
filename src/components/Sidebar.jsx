import React from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import Avatar from './Avatar.jsx';

export default function Sidebar({ collapsed, activeNav, setActiveNav }) {
  const { currentUser } = useAuth();
  
  const items = [
    { id: "home",     icon: "⬡", label: "Dashboard" },
    { id: "board",    icon: "▦", label: "Quadro" },
    { id: "timeline", icon: "▤", label: "Timeline" },
    { id: "registros", icon: "📋", label: "Registros" },
    { id: "reports",  icon: "◈", label: "Relatórios" },
    { id: "settings", icon: "⚙", label: "Config." },
  ];

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
          const active = activeNav === item.id;
          return (
            <div
              key={item.id}
              onClick={() => setActiveNav(item.id)}
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
              <span style={{ fontSize: 15, color: active ? "var(--accent)" : "var(--text-secondary)", flexShrink: 0, width: 18, textAlign: "center" }}>{item.icon}</span>
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
