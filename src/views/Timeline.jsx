import React, { useState } from 'react';
import Avatar from '../components/Avatar.jsx';

export default function Timeline() {
  const [period, setPeriod] = useState("week");
  
  const events = [
    { date: "HOJE", items: [
      { id: 1, text: "Ana S. concluiu Redesign da tela de login", time: "há 2h", assigneeInitials: "AS", type: "done", color: "var(--status-ok)" },
      { id: 2, text: "Lucas M. moveu Integração com API para Revisão", time: "há 5h", assigneeInitials: "LM", type: "moved", color: "var(--status-medium)" }
    ]},
    { date: "ONTEM", items: [
      { id: 3, text: "Carla T. criou Documentar fluxo de onboarding", time: "ontem às 14h", assigneeInitials: "CT", type: "created", color: "var(--text-secondary)" },
      { id: 4, text: "Tarefa Testes de usabilidade está atrasada", time: "ontem às 09h", assigneeInitials: "JP", type: "overdue", color: "var(--status-urgent)" },
      { id: 5, text: "Ana S. comentou em DatePicker", time: "3 jun", assigneeInitials: "AS", type: "comment", color: "var(--text-secondary)" }
    ]}
  ];

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
        
        {(events || []).map((group, gi) => (
          <div key={gi} style={{ marginBottom: 32 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-secondary)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 16, position: "relative", left: -40 }}>
              <span style={{ background: "var(--bg-base)", paddingRight: 8 }}>{group.date}</span>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {(group.items || []).map(item => (
                <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 16, position: "relative" }}>
                  <div style={{ position: "absolute", left: -29, width: 10, height: 10, borderRadius: "50%", background: item.color, border: "2px solid var(--bg-base)", zIndex: 2 }} />
                  <Avatar initials={item.assigneeInitials} size={28} />
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <span style={{ fontSize: 13, color: "var(--text-primary)" }}>{item.text}</span>
                    <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>{item.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
