import React from 'react';
import Avatar from '../components/Avatar.jsx';
import { useDashboard } from '../hooks/useDashboard.js';

export default function Dashboard({ onTaskClick }) {
  const { stats, refetch } = useDashboard();

  if (!stats.total && !stats.doing && !stats.done && !stats.overdue && !stats.byMember.length) {
    return (
      <div className="anim-fadeInUp" style={{ flex: 1, padding: "24px 32px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 24 }}>
        <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 24, fontWeight: 700, color: "var(--text-primary)" }}>Dashboard</h2>
        <div style={{ color: "var(--text-secondary)" }}>Carregando dados do painel...</div>
      </div>
    );
  }

  return (
    <div className="anim-fadeInUp" style={{ flex: 1, padding: "24px 32px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 24 }}>
      <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 24, fontWeight: 700, color: "var(--text-primary)" }}>Dashboard</h2>
      
      {/* Visão Geral */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
        {[{ label: "Total de tarefas", val: stats.total, color: "var(--text-primary)" },
          { label: "Em andamento", val: stats.doing, color: "var(--status-medium)" },
          { label: "Concluídas", val: stats.done, color: "var(--status-ok)" },
          { label: "Atrasadas", val: stats.overdue, color: "var(--status-urgent)" }].map((m, i) => (
          <div key={i} style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 10, padding: 20, display: "flex", flexDirection: "column", gap: 8 }}>
            <span style={{ fontSize: 11, color: "var(--text-secondary)", fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 600 }}>{m.label}</span>
            <span style={{ fontSize: 32, fontFamily: "'Syne', sans-serif", fontWeight: 700, color: m.color }}>{m.val}</span>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {/* Status do Time */}
        <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 10, padding: 20 }}>
          <h3 style={{ fontSize: 11, fontWeight: 600, color: "var(--text-secondary)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 16 }}>Status do Time</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {stats.byMember.length === 0 ? (
              <p style={{ color: "var(--text-secondary)", fontSize: 13 }}>Nenhum membro ativo.</p>
            ) : stats.byMember.map((m, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Avatar initials={m.initials} size={32} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: 13, color: "var(--text-primary)", fontWeight: 500 }}>{m.name} <span style={{ color: "var(--text-secondary)", fontWeight: 400 }}>— ({m.total} tarefas)</span></span>
                    {m.overdue > 0 ? (
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--status-urgent)" }} title={`${m.overdue} tarefas atrasadas`} />
                    ) : (
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--status-ok)" }} />
                    )}
                  </div>
                  <div style={{ height: 4, background: "var(--bg-base)", borderRadius: 99, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${Math.min((m.total / stats.total) * 100, 100)}%`, background: "var(--accent)", borderRadius: 99, transition: "width 0.3s" }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tarefas Atrasadas */}
        <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 10, padding: 20 }}>
          <h3 style={{ fontSize: 11, fontWeight: 600, color: "var(--text-secondary)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 16 }}>Tarefas Atrasadas</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {(stats.overdueTasks || []).length === 0 ? (
              <p style={{ color: "var(--text-secondary)", fontSize: 13 }}>Nenhuma tarefa atrasada.</p>
            ) : (stats.overdueTasks || []).slice(0, 4).map(t => {
              const today = new Date().toISOString().split('T')[0];
              const days = Math.floor((new Date(today) - new Date(t.due_date)) / (1000 * 60 * 60 * 24));
              return (
                <div key={t.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 12, borderBottom: "1px solid var(--border)" }}>
                  <div style={{ flex: 1, paddingRight: 12 }}>
                    <p style={{ fontSize: 13, color: "var(--text-primary)", fontWeight: 500, marginBottom: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.title}</p>
                    <p style={{ fontSize: 11, color: "var(--text-secondary)" }}>{t.assignee} <span style={{ color: "var(--status-urgent)", marginLeft: 8 }}>{Math.max(1, days)} dias atrasada</span></p>
                  </div>
                  <button onClick={() => onTaskClick && onTaskClick(t)} style={{ background: "transparent", border: "1px solid var(--accent)", borderRadius: 8, color: "var(--accent)", fontSize: 11, padding: "6px 12px", cursor: "pointer", transition: "background 0.2s", whiteSpace: "nowrap" }} onMouseOver={e => e.currentTarget.style.background = "var(--accent-soft)"} onMouseOut={e => e.currentTarget.style.background = "transparent"}>Ver tarefa</button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Progresso por Projeto */}
        <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 10, padding: 20, gridColumn: "1 / -1" }}>
          <h3 style={{ fontSize: 11, fontWeight: 600, color: "var(--text-secondary)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 16 }}>Progresso por Projeto</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {stats.projects.length === 0 ? (
              <p style={{ color: "var(--text-secondary)", fontSize: 13 }}>Nenhum projeto encontrado.</p>
            ) : stats.projects.map((p, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <span style={{ fontSize: 13, color: "var(--text-primary)", width: 120, fontWeight: 500 }}>{p.name}</span>
                <div style={{ flex: 1, height: 6, background: "var(--border)", borderRadius: 99, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `100%`, background: "var(--accent)", borderRadius: 99, transition: "width 0.3s" }} />
                </div>
                <span style={{ fontSize: 13, color: "var(--text-secondary)", width: 60, textAlign: "right", fontWeight: 500 }}>{p.status || 'ativo'}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
