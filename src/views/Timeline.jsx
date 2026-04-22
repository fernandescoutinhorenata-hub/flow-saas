import React, { useState } from 'react';
import Avatar from '../components/Avatar.jsx';
import { useTimeline } from '../hooks/useTimeline.js';
import { timeAgo } from '../utils.js';

export default function Timeline() {
  const [period, setPeriod] = useState("week");
  const { events, loading } = useTimeline();

  // Função para formatar a data de agrupamento
  const getGroupDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return "HOJE";
    if (date.toDateString() === yesterday.toDateString()) return "ONTEM";
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  };

  const groupedEvents = (events || []).reduce((acc, event) => {
    const group = getGroupDate(event.created_at);
    if (!acc[group]) acc[group] = [];
    acc[group].push(event);
    return acc;
  }, {});

  const sortedGroups = Object.keys(groupedEvents);

  if (loading) {
    return (
      <div className="anim-fadeInUp" style={{ flex: 1, padding: "24px 32px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 24 }}>
        <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 24, fontWeight: 700, color: "var(--text-primary)" }}>Timeline</h2>
        <div style={{ color: "var(--text-secondary)" }}>Carregando eventos...</div>
      </div>
    );
  }

  return (
    <div className="anim-fadeInUp" style={{ flex: 1, padding: "24px 32px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 24, fontWeight: 700, color: "var(--text-primary)" }}>Timeline</h2>
        <div style={{ display: "flex", gap: 2, background: "var(--bg-surface)", padding: 4, borderRadius: 8, border: "1px solid var(--border)" }}>
          {[{ key: "week", label: "Esta semana" }, { key: "month", label: "Este mês" }, { key: "3months", label: "Últimos 3 meses" }].map(p => (
            <button key={p.key} onClick={() => setPeriod(p.key)} style={{
              background: period === p.key ? "var(--bg-card)" : "transparent",
              border: period === p.key ? "1px solid var(--border)" : "1px solid transparent",
              color: period === p.key ? "var(--text-primary)" : "var(--text-secondary)",
              padding: "6px 12px", borderRadius: 6, fontSize: 12, cursor: "pointer", transition: "all 0.2s"
            }}>{p.label}</button>
          ))}
        </div>
      </div>

      <div style={{ position: "relative", paddingLeft: 40, marginTop: 16 }}>
        {/* Eixo central */}
        <div style={{ position: "absolute", top: 0, bottom: 0, left: 16, width: 2, background: "var(--border)", borderRadius: 2 }} />
        
        {sortedGroups.length === 0 && (
          <div style={{ color: "var(--text-secondary)", paddingLeft: 10 }}>Nenhuma atividade registrada</div>
        )}

        {sortedGroups.map((groupDate, gi) => (
          <div key={gi} style={{ marginBottom: 32 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-secondary)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 16, position: "relative", left: -40 }}>
              <span style={{ background: "var(--bg-base)", paddingRight: 8 }}>{groupDate}</span>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {(groupedEvents[groupDate] || []).map(item => {
                const isDone = item.new_status === 'done';
                const isMoved = item.action.includes('moveu');
                const color = isDone ? 'var(--status-ok)' : (isMoved ? 'var(--status-medium)' : 'var(--text-secondary)');
                const initials = item.user_name ? item.user_name.substring(0, 2).toUpperCase() : '??';

                return (
                  <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 16, position: "relative" }}>
                    <div style={{ position: "absolute", left: -29, width: 10, height: 10, borderRadius: "50%", background: color, border: "2px solid var(--bg-base)", zIndex: 2 }} />
                    <Avatar initials={initials} size={28} />
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      <span style={{ fontSize: 13, color: "var(--text-primary)" }}>{item.user_name} {item.action}</span>
                      <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>{timeAgo(item.created_at)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
