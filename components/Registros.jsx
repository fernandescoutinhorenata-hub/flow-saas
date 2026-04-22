import React, { useState } from 'react';
import Avatar from './Avatar.jsx';
import { timeAgo } from '../utils.js';

const TICKET_TYPES = {
  duvida:     { label: "Dúvida",     color: "#00FF87" },
  observacao: { label: "Observação", color: "#7A7A7A" },
  problema:   { label: "Problema",   color: "#FF4C4C" },
  sugestao:   { label: "Sugestão",   color: "#FFB800" },
};

const TICKET_STATUS = {
  aberto:     { label: "Aberto",     bg: "#00FF8720", text: "#00FF87" },
  em_analise: { label: "Em Análise", bg: "#FFB80020", text: "#FFB800" },
  resolvido:  { label: "Resolvido",  bg: "#3A3A3A",   text: "#7A7A7A" },
};

export default function Registros({ tickets, onUpdateStatus, onCreate, onRespond, currentUser }) {
  const [filter, setFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [activeTicket, setActiveTicket] = useState(null);
  const [showNew, setShowNew] = useState(false);

  const myTickets = tickets.filter(t => {
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
        {filtered.map(t => (
          <TicketCard key={t.id} ticket={t} onClick={() => setActiveTicket(t)} />
        ))}
        {filtered.length === 0 && (
          <div style={{ gridColumn: "1/-1", padding: 64, textAlign: "center", color: "var(--text-disabled)", border: "1px dashed var(--border)", borderRadius: 12 }}>
            Nenhum registro encontrado.
          </div>
        )}
      </div>

      {activeTicket && (
        <TicketDetailModal
          ticket={activeTicket}
          onClose={() => setActiveTicket(null)}
          onUpdateStatus={onUpdateStatus}
          onRespond={onRespond}
          currentUser={currentUser}
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

function TicketCard({ ticket, onClick }) {
  const typeInfo = TICKET_TYPES[ticket.type];
  const statusInfo = TICKET_STATUS[ticket.status];
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 10,
        padding: "16px 16px 16px 20px", cursor: "pointer", position: "relative",
        transition: "all 0.15s",
        borderColor: hovered ? "var(--accent-soft)" : "var(--border)",
        boxShadow: hovered ? "0 4px 24px rgba(0,0,0,0.4)" : "0 4px 24px rgba(0,0,0,0.2)",
      }}
    >
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, background: typeInfo.color, borderRadius: "10px 0 0 10px" }} />
      
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: typeInfo.color, textTransform: "uppercase", letterSpacing: "0.05em" }}>{typeInfo.label}</span>
        <span style={{ background: statusInfo.bg, color: statusInfo.text, fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 4, textTransform: "uppercase" }}>{statusInfo.label}</span>
      </div>

      <h3 style={{ fontSize: 14, fontWeight: 500, color: "var(--text-primary)", marginBottom: 12 }}>{ticket.title}</h3>

      {ticket.taskTitle && (
        <div style={{ display: "flex", alignItems: "center", gap: 6, background: "var(--bg-surface)", padding: "4px 8px", borderRadius: 4, marginBottom: 16 }}>
          <span style={{ fontSize: 11 }}>📌</span>
          <span style={{ fontSize: 11, color: "var(--text-secondary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{ticket.taskTitle}</span>
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: "auto" }}>
        <Avatar initials={ticket.authorInitials} size={20} />
        <span style={{ fontSize: 12, color: "var(--text-secondary)", flex: 1 }}>{ticket.author}</span>
        <span style={{ fontSize: 11, color: "var(--text-disabled)" }}>{timeAgo(ticket.createdAt)}</span>
      </div>
    </div>
  );
}

function TicketDetailModal({ ticket, onClose, onUpdateStatus, onRespond, currentUser }) {
  const [responseText, setResponseText] = useState("");
  const isAuthor = currentUser && ticket.authorId === currentUser.id;
  const canRespond = currentUser && (currentUser.role === "admin" || currentUser.role === "gestor");
  const typeInfo = TICKET_TYPES[ticket.type];

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: "var(--bg-modal)", width: "100%", maxWidth: 900, borderRadius: 16, border: "1px solid var(--border)", overflow: "hidden", maxHeight: "90vh", display: "flex", flexDirection: "column" }}>
        
        {/* Header */}
        <div style={{ padding: "20px 28px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: "var(--text-primary)" }}>{ticket.title}</h2>
            <span style={{ fontSize: 10, fontWeight: 700, color: typeInfo.color, textTransform: "uppercase", letterSpacing: "0.05em", border: `1px solid ${typeInfo.color}`, padding: "2px 6px", borderRadius: 4 }}>{typeInfo.label}</span>
            <span style={{ background: TICKET_STATUS[ticket.status].bg, color: TICKET_STATUS[ticket.status].text, fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 4, textTransform: "uppercase" }}>{TICKET_STATUS[ticket.status].label}</span>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--text-secondary)", fontSize: 20, cursor: "pointer" }}>&times;</button>
        </div>

        {/* Content */}
        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
          <div style={{ flex: "0 0 65%", padding: 28, overflowY: "auto", borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: 24 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-secondary)", letterSpacing: "0.12em", textTransform: "uppercase", display: "block", marginBottom: 12 }}>Descrição</label>
              <p style={{ fontSize: 14, color: "var(--text-primary)", lineHeight: 1.6 }}>{ticket.description}</p>
            </div>

            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-secondary)", letterSpacing: "0.12em", textTransform: "uppercase", display: "block", marginBottom: 16 }}>Respostas</label>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {ticket.responses.map(r => (
                  <div key={r.id} style={{ background: "var(--bg-surface)", borderRadius: 8, padding: 16, border: "1px solid var(--border)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <Avatar initials={r.authorInitials} size={24} />
                        <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)" }}>{r.author}</span>
                        {r.role && <span style={{ fontSize: 10, fontWeight: 700, color: r.role === "admin" ? "var(--accent)" : "#FFB800", textTransform: "uppercase", background: "rgba(0,0,0,0.3)", padding: "1px 5px", borderRadius: 3 }}>{r.role}</span>}
                      </div>
                      <span style={{ fontSize: 11, color: "var(--text-disabled)" }}>{timeAgo(r.createdAt)}</span>
                    </div>
                    <p style={{ fontSize: 14, color: "var(--text-primary)", lineHeight: 1.5 }}>{r.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {canRespond && (
              <div style={{ marginTop: "auto", paddingTop: 24, borderTop: "1px solid var(--border)" }}>
                <textarea
                  value={responseText}
                  onChange={e => setResponseText(e.target.value)}
                  placeholder="Escreva sua resposta..."
                  style={{ width: "100%", height: 100, background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 8, padding: 12, color: "var(--text-primary)", outline: "none", fontFamily: "inherit", resize: "none", marginBottom: 12 }}
                />
                <button
                  onClick={() => { onRespond(ticket.id, responseText); setResponseText(""); }}
                  style={{ background: "var(--accent)", color: "#0D0D0D", border: "none", padding: "10px 24px", borderRadius: 8, fontWeight: 600, cursor: "pointer", float: "right" }}
                >Responder</button>
              </div>
            )}
          </div>

          <div style={{ flex: "0 0 35%", padding: 28, background: "#16161640", display: "flex", flexDirection: "column", gap: 24 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-secondary)", letterSpacing: "0.12em", textTransform: "uppercase" }}>Detalhes</label>
            <div>
              <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 8 }}>Status</div>
              {canRespond ? (
                <select value={ticket.status} onChange={e => onUpdateStatus(ticket.id, e.target.value)} style={{ width: "100%", background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-primary)", padding: "8px 12px", borderRadius: 8, outline: "none" }}>
                  <option value="aberto">Aberto</option>
                  <option value="em_analise">Em Análise</option>
                  <option value="resolvido">Resolvido</option>
                </select>
              ) : (
                <span style={{ background: TICKET_STATUS[ticket.status].bg, color: TICKET_STATUS[ticket.status].text, fontSize: 12, fontWeight: 600, padding: "4px 10px", borderRadius: 6 }}>{TICKET_STATUS[ticket.status].label}</span>
              )}
            </div>
            <div>
              <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 8 }}>Autor</div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Avatar initials={ticket.authorInitials} size={32} />
                <span style={{ fontSize: 14, color: "var(--text-primary)" }}>{ticket.author}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function NewTicketModal({ onClose, onCreate }) {
  const [type, setType] = useState("duvida");
  const [priority, setPriority] = useState("normal");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: "var(--bg-modal)", width: "100%", maxWidth: 500, borderRadius: 16, border: "1px solid var(--border)", padding: 32 }}>
        <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 700, color: "var(--text-primary)", marginBottom: 24 }}>Novo Registro</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-secondary)", letterSpacing: "0.12em", textTransform: "uppercase", display: "block", marginBottom: 12 }}>Tipo</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {Object.keys(TICKET_TYPES).map(t => (
                <button key={t} onClick={() => setType(t)} style={{
                  padding: "8px", borderRadius: 8, fontSize: 12, cursor: "pointer",
                  background: type === t ? `${TICKET_TYPES[t].color}15` : "var(--bg-surface)",
                  border: `1px solid ${type === t ? TICKET_TYPES[t].color : "var(--border)"}`,
                  color: type === t ? TICKET_TYPES[t].color : "var(--text-secondary)"
                }}>{TICKET_TYPES[t].label}</button>
              ))}
            </div>
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-secondary)", letterSpacing: "0.12em", textTransform: "uppercase", display: "block", marginBottom: 8 }}>Título</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} style={{ width: "100%", background: "var(--bg-card)", border: "1px solid var(--border)", padding: "12px", borderRadius: 8, color: "var(--text-primary)" }} />
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-secondary)", letterSpacing: "0.12em", textTransform: "uppercase", display: "block", marginBottom: 8 }}>Descrição</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} style={{ width: "100%", height: 100, background: "var(--bg-card)", border: "1px solid var(--border)", padding: "12px", borderRadius: 8, color: "var(--text-primary)", resize: "none" }} />
          </div>
        </div>
        <div style={{ display: "flex", gap: 12, marginTop: 32 }}>
          <button onClick={onClose} style={{ flex: 1, background: "transparent", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text-secondary)", padding: "12px", cursor: "pointer" }}>Cancelar</button>
          <button onClick={() => { onCreate({ type, priority, title, description }); onClose(); }} style={{ flex: 1, background: "var(--accent)", color: "#0D0D0D", border: "none", borderRadius: 8, padding: "12px", fontWeight: 600, cursor: "pointer" }}>Abrir Registro</button>
        </div>
      </div>
    </div>
  );
}
