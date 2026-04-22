import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { TICKET_TYPES, TICKET_STATUS } from '../data.js';
import Avatar from '../components/Avatar.jsx';
import { timeAgo } from '../utils.js';

export default function TicketModal({ ticket, onClose, onUpdateStatus, onRespond }) {
  const { currentUser, hasPermission } = useAuth();
  const [responseText, setResponseText] = useState("");
  const isAuthor = ticket.authorId === currentUser.id;
  const canRespond = hasPermission("manage_members") || currentUser.role === "gestor";
  const typeInfo = TICKET_TYPES[ticket.type];

  return (
    <div className="anim-fadeIn" style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div className="anim-scaleIn" style={{ background: "var(--bg-modal)", width: "100%", maxWidth: 900, borderRadius: 16, border: "1px solid var(--border)", overflow: "hidden", maxHeight: "90vh", display: "flex", flexDirection: "column" }}>
        
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
          {/* Left Column */}
          <div style={{ flex: "0 0 65%", padding: 28, overflowY: "auto", borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: 24 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-secondary)", letterSpacing: "0.12em", textTransform: "uppercase", display: "block", marginBottom: 12 }}>Descrição</label>
              <p style={{ fontSize: 14, color: "var(--text-primary)", lineHeight: 1.6 }}>{ticket.description}</p>
            </div>

            {ticket.taskId && (
              <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 10, padding: 16, cursor: "pointer" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 16 }}>📌</span>
                  <div>
                    <div style={{ fontSize: 11, color: "var(--text-secondary)", textTransform: "uppercase", fontWeight: 600 }}>Tarefa Vinculada</div>
                    <div style={{ fontSize: 14, color: "var(--accent)", fontWeight: 500 }}>{ticket.taskTitle}</div>
                  </div>
                </div>
              </div>
            )}

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
                {ticket.responses.length === 0 && (
                  <div style={{ textAlign: "center", padding: "32px 0", color: "var(--text-disabled)", fontStyle: "italic" }}>
                    Aguardando resposta da equipe...
                  </div>
                )}
              </div>
            </div>

            {canRespond ? (
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
            ) : (
              <div style={{ textAlign: "center", color: "var(--text-disabled)", fontSize: 12, marginTop: 16 }}>Apenas administradores podem responder</div>
            )}
          </div>

          {/* Right Column */}
          <div style={{ flex: "0 0 35%", padding: 28, background: "#16161640", display: "flex", flexDirection: "column", gap: 24 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-secondary)", letterSpacing: "0.12em", textTransform: "uppercase" }}>Detalhes</label>
            
            <div>
              <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 8 }}>Status</div>
              {canRespond ? (
                <select value={ticket.status} onChange={e => onUpdateStatus(ticket.id, e.target.value)} style={{ width: "100%", background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-primary)", padding: "8px 12px", borderRadius: 8, outline: "none", appearance: "none" }}>
                  <option value="aberto">Aberto</option>
                  <option value="em_analise">Em Análise</option>
                  <option value="resolvido">Resolvido</option>
                </select>
              ) : (
                <span style={{ background: TICKET_STATUS[ticket.status].bg, color: TICKET_STATUS[ticket.status].text, fontSize: 12, fontWeight: 600, padding: "4px 10px", borderRadius: 6 }}>{TICKET_STATUS[ticket.status].label}</span>
              )}
            </div>

            <div>
              <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 8 }}>Prioridade</div>
              <span style={{ fontSize: 12, color: ticket.priority === "urgente" ? "#FF4C4C" : (ticket.priority === "baixa" ? "#00FF87" : "#FFB800"), fontWeight: 600, textTransform: "capitalize" }}>{ticket.priority}</span>
            </div>

            <div>
              <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 8 }}>Autor</div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Avatar initials={ticket.authorInitials} size={32} />
                <span style={{ fontSize: 14, color: "var(--text-primary)" }}>{ticket.author}</span>
              </div>
            </div>

            <div>
              <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 8 }}>Criado em</div>
              <span style={{ fontSize: 13, color: "var(--text-primary)" }}>{new Date(ticket.createdAt).toLocaleString("pt-BR")}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: "16px 28px", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "flex-end", gap: 12 }}>
          {canRespond && ticket.status !== "resolvido" && (
            <button onClick={() => onUpdateStatus(ticket.id, "resolvido")} style={{ background: "var(--accent)", color: "#0D0D0D", border: "none", padding: "10px 24px", borderRadius: 8, fontWeight: 600, cursor: "pointer" }}>Marcar como Resolvido</button>
          )}
          {isAuthor && ticket.status !== "resolvido" && (
            <button onClick={() => onUpdateStatus(ticket.id, "resolvido")} style={{ background: "transparent", border: "1px solid #FF4C4C", color: "#FF4C4C", padding: "10px 24px", borderRadius: 8, fontWeight: 600, cursor: "pointer" }}>Fechar ticket</button>
          )}
        </div>
      </div>
    </div>
  );
}
