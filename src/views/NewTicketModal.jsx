import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { TICKET_TYPES } from '../data.js';

export default function NewTicketModal({ onClose, onCreate }) {
  const { currentUser } = useAuth();
  const [type, setType] = useState("duvida");
  const [priority, setPriority] = useState("normal");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  return (
    <div className="anim-fadeIn" style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div className="anim-scaleIn" style={{ background: "var(--bg-modal)", width: "100%", maxWidth: 500, borderRadius: 16, border: "1px solid var(--border)", padding: 32 }}>
        <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 700, color: "var(--text-primary)", marginBottom: 24 }}>Novo Registro</h2>
        
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-secondary)", letterSpacing: "0.12em", textTransform: "uppercase", display: "block", marginBottom: 12 }}>Tipo de Registro</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {Object.keys(TICKET_TYPES).map(t => (
                <button key={t} onClick={() => setType(t)} style={{
                  padding: "8px", borderRadius: 8, fontSize: 12, fontWeight: 500, cursor: "pointer", transition: "all 0.2s",
                  background: type === t ? `${TICKET_TYPES[t].color}15` : "var(--bg-surface)",
                  border: `1px solid ${type === t ? TICKET_TYPES[t].color : "var(--border)"}`,
                  color: type === t ? TICKET_TYPES[t].color : "var(--text-secondary)"
                }}>{TICKET_TYPES[t].label}</button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-secondary)", letterSpacing: "0.12em", textTransform: "uppercase", display: "block", marginBottom: 8 }}>Título</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="O que está acontecendo?" style={{ width: "100%", background: "var(--bg-card)", border: "1px solid var(--border)", padding: "12px", borderRadius: 8, color: "var(--text-primary)", outline: "none" }} />
          </div>

          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-secondary)", letterSpacing: "0.12em", textTransform: "uppercase", display: "block", marginBottom: 8 }}>Descrição</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Dê mais detalhes..." style={{ width: "100%", height: 120, background: "var(--bg-card)", border: "1px solid var(--border)", padding: "12px", borderRadius: 8, color: "var(--text-primary)", outline: "none", resize: "none" }} />
          </div>

          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-secondary)", letterSpacing: "0.12em", textTransform: "uppercase", display: "block", marginBottom: 12 }}>Prioridade</label>
            <div style={{ display: "flex", gap: 8 }}>
              {[
                { id: "baixa",   label: "Baixa",   color: "#7A7A7A" },
                { id: "normal",  label: "Normal",  color: "#FFB800" },
                { id: "urgente", label: "Urgente", color: "#FF4C4C" }
              ].map(p => (
                <button key={p.id} onClick={() => setPriority(p.id)} style={{
                  flex: 1, padding: "8px", borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: "pointer", transition: "all 0.2s",
                  background: priority === p.id ? `${p.color}20` : "var(--bg-surface)",
                  border: `1px solid ${priority === p.id ? p.color : "var(--border)"}`,
                  color: priority === p.id ? p.color : "var(--text-secondary)"
                }}>{p.label}</button>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 12, marginTop: 32 }}>
          <button onClick={onClose} style={{ flex: 1, background: "transparent", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text-secondary)", padding: "12px", fontWeight: 500, cursor: "pointer" }}>Cancelar</button>
          <button onClick={() => { onCreate({ type, priority, title, description }); onClose(); }} style={{ flex: 1, background: "var(--accent)", color: "#0D0D0D", border: "none", borderRadius: 8, padding: "12px", fontWeight: 600, cursor: "pointer" }}>Abrir Registro</button>
        </div>
      </div>
    </div>
  );
}
