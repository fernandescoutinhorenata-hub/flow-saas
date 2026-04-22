import React, { useState } from 'react';
import { COLUMNS } from '../data.js';

export default function NewTaskModal({ onClose, onCreate, columns }) {
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("medium");
  const [due, setDue] = useState("2025-07-01");
  const [status, setStatus] = useState("backlog");

  function handleCreate() {
    if (!title.trim()) return;
    onCreate({ title, priority, due, status });
  }

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}
    >
      <div className="anim-scaleIn" style={{
        background: "var(--bg-modal)", border: "1px solid var(--border)",
        borderRadius: 16, width: 420, padding: "28px",
        boxShadow: "0 24px 64px rgba(0,0,0,0.7)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 18, color: "var(--text-primary)" }}>Nova Tarefa</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)", fontSize: 18 }}>✕</button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <input
            autoFocus
            placeholder="Título da tarefa..."
            value={title}
            onChange={e => setTitle(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleCreate()}
            style={{
              background: "var(--bg-card)", border: "1px solid var(--border)",
              borderRadius: 8, color: "var(--text-primary)", fontSize: 14,
              padding: "11px 12px", outline: "none", fontFamily: "'DM Sans', sans-serif",
            }}
            onFocus={e => e.target.style.borderColor = "#00FF8760"}
            onBlur={e => e.target.style.borderColor = "var(--border)"}
          />

          <div>
            <label style={{ fontSize: 11, color: "var(--text-secondary)", letterSpacing: "0.12em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Prioridade</label>
            <div style={{ display: "flex", gap: 6 }}>
              {[{ key: "low", label: "Baixa", color: "#00FF87" }, { key: "medium", label: "Média", color: "#FFB800" }, { key: "urgent", label: "Urgente", color: "#FF4C4C" }].map(b => (
                <button key={b.key} onClick={() => setPriority(b.key)} style={{
                  flex: 1, padding: "7px 4px", borderRadius: 6, fontSize: 11, fontWeight: 500,
                  cursor: "pointer", transition: "all 0.15s", fontFamily: "'DM Sans', sans-serif",
                  border: priority === b.key ? `1px solid ${b.color}` : "1px solid var(--border)",
                  background: priority === b.key ? b.color + "20" : "var(--bg-card)",
                  color: priority === b.key ? b.color : "var(--text-secondary)",
                }}>{b.label}</button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ fontSize: 11, color: "var(--text-secondary)", letterSpacing: "0.12em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Coluna</label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value)}
              style={{
                width: "100%", background: "var(--bg-card)", border: "1px solid var(--border)",
                borderRadius: 8, color: "var(--text-primary)", fontSize: 13, padding: "9px 10px",
                outline: "none", fontFamily: "'DM Sans', sans-serif", colorScheme: "dark",
              }}
            >
              {columns.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          </div>

          <div>
            <label style={{ fontSize: 11, color: "var(--text-secondary)", letterSpacing: "0.12em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Prazo</label>
            <input type="date" value={due} onChange={e => setDue(e.target.value)}
              style={{
                width: "100%", background: "var(--bg-card)", border: "1px solid var(--border)",
                borderRadius: 8, color: "var(--text-primary)", fontSize: 13, padding: "9px 10px",
                outline: "none", fontFamily: "'DM Sans', sans-serif", colorScheme: "dark",
              }}
            />
          </div>

          <button onClick={handleCreate} style={{
            background: "var(--accent)", border: "none", borderRadius: 8,
            color: "#0D0D0D", fontFamily: "'DM Sans', sans-serif",
            fontWeight: 500, fontSize: 14, padding: "11px",
            cursor: "pointer", transition: "background 0.2s", marginTop: 4,
          }}
            onMouseOver={e => e.target.style.background = "var(--accent-dark)"}
            onMouseOut={e => e.target.style.background = "var(--accent)"}
          >
            Criar Tarefa
          </button>
        </div>
      </div>
    </div>
  );
}
