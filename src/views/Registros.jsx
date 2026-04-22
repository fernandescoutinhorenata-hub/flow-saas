import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { TICKET_STATUS, TICKET_TYPES } from '../data.js';
import TicketCard from './TicketCard.jsx';
import TicketModal from './TicketModal.jsx';
import NewTicketModal from './NewTicketModal.jsx';

export default function Registros({ tickets, onUpdateStatus, onCreate, onRespond }) {
  const { currentUser } = useAuth();
  const [filter, setFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [activeTicket, setActiveTicket] = useState(null);
  const [showNew, setShowNew] = useState(false);

  const myTickets = (tickets || []).filter(t => {
    if (currentUser && currentUser.role === "membro") return t.authorId === currentUser.id;
    return true;
  });

  const filtered = myTickets.filter(t => {
    if (filter !== "all" && t.status !== filter) return false;
    if (typeFilter !== "all" && t.type !== typeFilter) return false;
    return true;
  });

  return (
    <div style={{ flex: 1, padding: 32, overflowY: "auto", display: "flex", flexDirection: "column", gap: 32 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 24, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>Registros</h2>
          <div style={{ display: "flex", gap: 12 }}>
            {["all", "aberto", "em_analise", "resolvido"].map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{
                background: "none", border: "none", cursor: "pointer",
                color: filter === f ? "var(--accent)" : "var(--text-secondary)",
                fontSize: 13, padding: "4px 0", borderBottom: filter === f ? "2px solid var(--accent)" : "2px solid transparent",
                fontFamily: "'DM Sans', sans-serif", transition: "all 0.15s"
              }}>
                {f === "all" ? "Todos" : TICKET_STATUS[f].label}
              </button>
            ))}
          </div>
        </div>
        <button onClick={() => setShowNew(true)} style={{
          background: "transparent", border: "1px solid var(--accent)", borderRadius: 8,
          color: "var(--accent)", fontSize: 13, fontWeight: 500, padding: "8px 16px",
          cursor: "pointer", fontFamily: "'DM Sans', sans-serif", transition: "all 0.15s"
        }} onMouseOver={e => e.currentTarget.style.background = "var(--accent-soft)"} onMouseOut={e => e.currentTarget.style.background = "transparent"}>
          + Novo Registro
        </button>
      </div>

      {/* Type Pills */}
      <div style={{ display: "flex", gap: 8 }}>
        {["all", "duvida", "observacao", "problema", "sugestao"].map(t => (
          <button key={t} onClick={() => setTypeFilter(t)} style={{
            background: typeFilter === t ? "var(--accent-soft)" : "transparent",
            border: `1px solid ${typeFilter === t ? "var(--accent)" : "var(--border)"}`,
            borderRadius: 16, color: typeFilter === t ? "var(--accent)" : "var(--text-secondary)",
            padding: "4px 12px", fontSize: 11, fontWeight: 500, cursor: "pointer", transition: "all 0.15s"
          }}>
            {t === "all" ? "Todos os tipos" : TICKET_TYPES[t].label}
          </button>
        ))}
      </div>

      {/* List */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
        {(filtered || []).map(t => (
          <TicketCard key={t.id} ticket={t} onClick={() => setActiveTicket(t)} />
        ))}
        {(filtered || []).length === 0 && (
          <div style={{ gridColumn: "1/-1", padding: 64, textAlign: "center", color: "var(--text-disabled)", border: "1px dashed var(--border)", borderRadius: 12 }}>
            Nenhum registro encontrado.
          </div>
        )}
      </div>

      {activeTicket && (
        <TicketModal
          ticket={activeTicket}
          onClose={() => setActiveTicket(null)}
          onUpdateStatus={onUpdateStatus}
          onRespond={onRespond}
        />
      )}

      {showNew && (
        <NewTicketModal
          onClose={() => setShowNew(false)}
          onCreate={onCreate}
        />
      )}
    </div>
  );
}
