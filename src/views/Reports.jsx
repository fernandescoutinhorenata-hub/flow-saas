import React, { useState } from 'react';
import Avatar from '../components/Avatar.jsx';
import { isOverdue } from '../utils.js';

export default function Reports({ tasks }) {
  const [filters, setFilters] = useState({ period: "month", member: "all", project: "all" });

  const total = tasks.length;
  const done = tasks.filter(t => t.status === "done").length;
  const overdue = tasks.filter(t => isOverdue(t.due) && t.status !== "done").length;

  const members = [
    { name: "Ana S.", avatar: "AS", created: 12, done: 10, overdue: 0, rate: 83 },
    { name: "Lucas M.", avatar: "LM", created: 15, done: 12, overdue: 2, rate: 80 },
    { name: "Carla T.", avatar: "CT", created: 8, done: 8, overdue: 0, rate: 100 },
    { name: "João P.", avatar: "JP", created: 10, done: 5, overdue: 3, rate: 50 },
  ];

  return (
    <div className="anim-fadeInUp" style={{ flex: 1, padding: "24px 32px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 32 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 24, fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>Relatórios</h2>
          <div style={{ display: "flex", gap: 12 }}>
            <select value={filters.period} onChange={e => setFilters({...filters, period: e.target.value})} style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", color: "var(--text-primary)", padding: "8px 12px", borderRadius: 8, outline: "none", fontFamily: "'DM Sans', sans-serif", fontSize: 13 }}>
              <option value="month">Este Mês</option>
              <option value="quarter">Este Trimestre</option>
            </select>
            <select value={filters.member} onChange={e => setFilters({...filters, member: e.target.value})} style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", color: "var(--text-primary)", padding: "8px 12px", borderRadius: 8, outline: "none", fontFamily: "'DM Sans', sans-serif", fontSize: 13 }}>
              <option value="all">Todos Membros</option>
              <option value="AS">Ana S.</option>
            </select>
            <select value={filters.project} onChange={e => setFilters({...filters, project: e.target.value})} style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", color: "var(--text-primary)", padding: "8px 12px", borderRadius: 8, outline: "none", fontFamily: "'DM Sans', sans-serif", fontSize: 13 }}>
              <option value="all">Todos Projetos</option>
              <option value="alpha">Projeto Alpha</option>
            </select>
          </div>
        </div>
        <button style={{ background: "transparent", border: "1px solid var(--accent)", borderRadius: 8, color: "var(--accent)", padding: "8px 16px", cursor: "pointer", transition: "background 0.2s", fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 500 }} onMouseOver={e => e.currentTarget.style.background = "var(--accent-soft)"} onMouseOut={e => e.currentTarget.style.background = "transparent"}>Exportar CSV</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {/* Resumo */}
        <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 10, padding: 20 }}>
          <h3 style={{ fontSize: 11, fontWeight: 600, color: "var(--text-secondary)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 16 }}>Resumo do Período</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
            <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 8, padding: 16, display: "flex", flexDirection: "column", gap: 8 }}>
              <span style={{ fontSize: 12, color: "var(--text-secondary)", fontFamily: "'DM Sans', sans-serif" }}>Criadas</span>
              <span style={{ fontSize: 24, fontFamily: "'Syne', sans-serif", fontWeight: 700, color: "var(--text-primary)" }}>{total}</span>
            </div>
            <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 8, padding: 16, display: "flex", flexDirection: "column", gap: 8 }}>
              <span style={{ fontSize: 12, color: "var(--text-secondary)", fontFamily: "'DM Sans', sans-serif" }}>Concluídas</span>
              <span style={{ fontSize: 24, fontFamily: "'Syne', sans-serif", fontWeight: 700, color: "var(--status-ok)" }}>{done}</span>
            </div>
            <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 8, padding: 16, display: "flex", flexDirection: "column", gap: 8 }}>
              <span style={{ fontSize: 12, color: "var(--text-secondary)", fontFamily: "'DM Sans', sans-serif" }}>Atrasadas</span>
              <span style={{ fontSize: 24, fontFamily: "'Syne', sans-serif", fontWeight: 700, color: "var(--status-urgent)" }}>{overdue}</span>
            </div>
          </div>
        </div>

        {/* Distribuição por Prioridade */}
        <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 10, padding: 20 }}>
          <h3 style={{ fontSize: 11, fontWeight: 600, color: "var(--text-secondary)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 16 }}>Distribuição por Prioridade</h3>
          <div style={{ display: "flex", alignItems: "flex-end", height: 120, gap: 32, padding: "0 20px" }}>
            {[{ label: "Urgente", val: 30, color: "var(--status-urgent)" },
              { label: "Média", val: 50, color: "var(--status-medium)" },
              { label: "Baixa", val: 20, color: "var(--status-ok)" }].map((b, i) => (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, height: "100%", justifyContent: "flex-end" }}>
                <span style={{ fontSize: 12, color: "var(--text-primary)" }}>{b.val}%</span>
                <div style={{ width: "100%", height: `${b.val}%`, background: b.color, borderRadius: "4px 4px 0 0" }} />
                <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>{b.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Performance por Membro */}
      <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 10, padding: 20 }}>
        <h3 style={{ fontSize: 11, fontWeight: 600, color: "var(--text-secondary)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 16 }}>Performance por Membro</h3>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)" }}>
              <th style={{ padding: "12px 8px", fontSize: 11, color: "var(--text-secondary)", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase" }}>Membro</th>
              <th style={{ padding: "12px 8px", fontSize: 11, color: "var(--text-secondary)", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase" }}>Criadas</th>
              <th style={{ padding: "12px 8px", fontSize: 11, color: "var(--text-secondary)", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase" }}>Concluídas</th>
              <th style={{ padding: "12px 8px", fontSize: 11, color: "var(--text-secondary)", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase" }}>Atrasadas</th>
              <th style={{ padding: "12px 8px", fontSize: 11, color: "var(--text-secondary)", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase" }}>Taxa de Conclusão</th>
            </tr>
          </thead>
          <tbody>
            {members.map((m, i) => (
              <tr key={i} style={{ borderBottom: "1px solid var(--border)" }}>
                <td style={{ padding: "12px 8px", display: "flex", alignItems: "center", gap: 12, borderLeft: m.rate === 100 ? "3px solid var(--accent)" : "3px solid transparent", marginLeft: -3 }}>
                  <Avatar initials={m.avatar} size={28} /> <span style={{ fontSize: 13, color: "var(--text-primary)", fontWeight: 500 }}>{m.name}</span>
                </td>
                <td style={{ padding: "12px 8px", fontSize: 13, color: "var(--text-primary)" }}>{m.created}</td>
                <td style={{ padding: "12px 8px", fontSize: 13, color: "var(--text-primary)" }}>{m.done}</td>
                <td style={{ padding: "12px 8px", fontSize: 13, color: "var(--status-urgent)" }}>{m.overdue > 0 ? m.overdue : "-"}</td>
                <td style={{ padding: "12px 8px", fontSize: 13, color: "var(--text-primary)", fontWeight: 500 }}>{m.rate}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
