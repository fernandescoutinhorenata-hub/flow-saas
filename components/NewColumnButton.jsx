import React, { useState } from 'react';

export default function NewColumnButton({ onAdd }) {
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState("");

  const handleConfirm = () => {
    if (label.trim()) {
      onAdd(label.trim());
      setLabel("");
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setLabel("");
    setIsEditing(false);
  };

  if (!isEditing) {
    return (
      <div
        onClick={() => setIsEditing(true)}
        style={{
          width: 280, height: "100%", minHeight: 120, flexShrink: 0,
          border: "2px dashed #2A2A2A", borderRadius: 12,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          cursor: "pointer", transition: "all 0.2s", color: "#3A3A3A", gap: 12,
        }}
        onMouseOver={e => {
          e.currentTarget.style.borderColor = "var(--accent)";
          e.currentTarget.style.color = "var(--accent)";
          e.currentTarget.style.background = "var(--accent-soft)";
        }}
        onMouseOut={e => {
          e.currentTarget.style.borderColor = "#2A2A2A";
          e.currentTarget.style.color = "#3A3A3A";
          e.currentTarget.style.background = "transparent";
        }}
      >
        <span style={{ fontSize: 32 }}>+</span>
        <span style={{ fontSize: 14, fontWeight: 500 }}>Nova Coluna</span>
      </div>
    );
  }

  return (
    <div style={{ width: 280, flexShrink: 0 }}>
      <div style={{
        background: "var(--bg-surface)", border: "1px solid var(--accent)",
        borderRadius: 12, padding: 12, minHeight: 120,
      }}>
        <input
          autoFocus
          value={label}
          onChange={e => setLabel(e.target.value)}
          onKeyDown={e => {
            if (e.key === "Enter") handleConfirm();
            if (e.key === "Escape") handleCancel();
          }}
          placeholder="Nome da coluna..."
          style={{
            width: "100%", background: "#161616", border: "1px solid var(--accent)",
            padding: "8px 12px", borderRadius: 8, color: "var(--text-primary)",
            outline: "none", fontFamily: "'DM Sans', sans-serif", fontSize: 13
          }}
        />
        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          <button onClick={handleConfirm} style={{ flex: 1, background: "var(--accent)", color: "#0D0D0D", border: "none", padding: "6px", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Adicionar</button>
          <button onClick={handleCancel} style={{ flex: 1, background: "transparent", border: "1px solid var(--border)", color: "var(--text-secondary)", padding: "6px", borderRadius: 6, fontSize: 12, cursor: "pointer" }}>Cancelar</button>
        </div>
      </div>
    </div>
  );
}
