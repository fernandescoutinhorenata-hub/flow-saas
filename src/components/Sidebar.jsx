import React from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import Avatar from './Avatar.jsx';
import { 
  LayoutDashboard, 
  Kanban, 
  Package, 
  Clock, 
  ClipboardList, 
  BarChart3, 
  Settings as SettingsIcon 
} from 'lucide-react';

export default function Sidebar({ collapsed, activeNav, setActiveNav }) {
  const { currentUser } = useAuth();
  
  const items = [
    { view: "home",      icon: <LayoutDashboard size={18} />, label: "Dashboard" },
    { view: "board",     icon: <Kanban size={18} />,          label: "Quadro" },
    { view: "producao",  icon: <Package size={18} />,         label: "Produção" },
    { view: "timeline",  icon: <Clock size={18} />,           label: "Timeline" },
    { view: "registros", icon: <ClipboardList size={18} />,   label: "Registros" },
    { view: "reports",   icon: <BarChart3 size={18} />,       label: "Relatórios" },
    { view: "settings",  icon: <SettingsIcon size={18} />,    label: "Config." },
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
          const active = activeNav === item.view;
          return (
            <div
              key={item.view}
              onClick={() => setActiveNav(item.view)}
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
