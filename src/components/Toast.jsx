import React from 'react';

export default function Toast({ toasts }) {
  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 10000, display: "flex", flexDirection: "column", gap: 8 }}>
      {(toasts || []).map(t => (
        <div key={t.id} style={{
          background: "var(--bg-card)", border: "1px solid var(--border)",
          borderLeft: "3px solid var(--accent)", borderRadius: 8,
          padding: "12px 16px", color: "var(--text-primary)", fontSize: 13,
          boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
          animation: t.exiting ? "toastOut 0.3s ease forwards" : "toastIn 0.3s ease both",
          maxWidth: 300, lineHeight: 1.4,
        }}>
          {t.message}
        </div>
      ))}
    </div>
  );
}
