import React, { useState } from 'react';
import { TICKET_TYPES, TICKET_STATUS } from '../data.js';
import Avatar from '../components/Avatar.jsx';
import { timeAgo } from '../utils.js';

export default function TicketCard({ ticket, onClick }) {
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
        boxShadow: hovered ? "0 0 0 1px #00FF8720, 0 4px 24px rgba(0,0,0,0.4)" : "0 4px 24px rgba(0,0,0,0.4)",
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

      {ticket.responses.length > 0 && (
        <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 4, color: "var(--text-secondary)", fontSize: 11 }}>
          <span>💬</span>
          <span>{ticket.responses.length} {ticket.responses.length === 1 ? "resposta" : "respostas"}</span>
        </div>
      )}
    </div>
  );
}
