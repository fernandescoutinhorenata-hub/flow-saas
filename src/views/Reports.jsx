import React, { useState } from 'react';
import Avatar from '../components/Avatar.jsx';
import { useReports } from '../hooks/useReports.js';

export default function Reports() {
  const [filters, setFilters] = useState({ period: "month", member: "all", project: "all" });
  const { data } = useReports();

  const total = (data.tasks || []).length;
  const done = (data.tasks || []).filter(t => t.status === "done").length;
  const overdue = (data.tasks || []).filter(t => t.due_date && new Date(t.due_date) < new Date() && t.status !== "done").length;

  const handleExportCSV = () => {
    let csvContent = "Membro,Criadas,Concluídas,Atrasadas,Taxa de Conclusão\n";
    data.byMember.forEach(m => {
      const rate = m.created > 0 ? Math.round((m.done / m.created) * 100) : 0;
      csvContent += `${m.name},${m.created},${m.done},${m.overdue},${rate}%\n`;
    });
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "relatorio_membros.csv";
    link.click();
  };

  const totalPriorities = data.byPriority.urgent + data.byPriority.medium + data.byPriority.low || 1;
  const urgentPct = Math.round((data.byPriority.urgent / totalPriorities) * 100);
  const mediumPct = Math.round((data.byPriority.medium / totalPriorities) * 100);
  const lowPct = Math.round((data.byPriority.low / totalPriorities) * 100);

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
              {data.byMember.map((m, i) => (
                <option key={i} value={m.name}>{m.name}</option>
              ))}
            </select>
            <select value={filters.project} onChange={e => setFilters({...filters, project: e.target.value})} style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", color: "var(--text-primary)", padding: "8px 12px", borderRadius: 8, outline: "none", fontFamily: "'DM Sans', sans-serif", fontSize: 13 }}>
              <option value="all">Todos Projetos</option>
            </select>
          </div>
        </div>
        <button onClick={handleExportCSV} style={{ background: "transparent", border: "1px solid var(--accent)", borderRadius: 8, color: "var(--accent)", padding: "8px 16px", cursor: "pointer", transition: "background 0.2s", fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 500 }} onMouseOver={e => e.currentTarget.style.background = "var(--accent-soft)"} onMouseOut={e => e.currentTarget.style.background = "transparent"}>Exportar CSV</button>
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
            {[{ label: "Urgente", val: urgentPct || 0, color: "var(--status-urgent)" },
              { label: "Média", val: mediumPct || 0, color: "var(--status-medium)" },
              { label: "Baixa", val: lowPct || 0, color: "var(--status-ok)" }].map((b, i) => (
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
            {(data.byMember || []).map((m, i) => {
              const rate = m.created > 0 ? Math.round((m.done / m.created) * 100) : 0;
              return (
              <tr key={i} style={{ borderBottom: "1px solid var(--border)" }}>
                <td style={{ padding: "12px 8px", display: "flex", alignItems: "center", gap: 12, borderLeft: rate === 100 ? "3px solid var(--accent)" : "3px solid transparent", marginLeft: -3 }}>
                  <Avatar initials={m.initials} size={28} /> <span style={{ fontSize: 13, color: "var(--text-primary)", fontWeight: 500 }}>{m.name}</span>
                </td>
                <td style={{ padding: "12px 8px", fontSize: 13, color: "var(--text-primary)" }}>{m.created}</td>
                <td style={{ padding: "12px 8px", fontSize: 13, color: "var(--text-primary)" }}>{m.done}</td>
                <td style={{ padding: "12px 8px", fontSize: 13, color: "var(--status-urgent)" }}>{m.overdue > 0 ? m.overdue : "-"}</td>
                <td style={{ padding: "12px 8px", fontSize: 13, color: "var(--text-primary)", fontWeight: 500 }}>{rate}%</td>
              </tr>
            )})}
            {data.byMember.length === 0 && (
              <tr><td colSpan="5" style={{ padding: "12px 8px", textAlign: "center", color: "var(--text-secondary)" }}>Nenhum dado disponível</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
