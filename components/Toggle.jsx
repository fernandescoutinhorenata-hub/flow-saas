import React from 'react';

export default function Toggle({ checked, onChange }) {
  return (
    <div
      onClick={() => onChange(!checked)}
      style={{
        width: 32, height: 18, borderRadius: 99, cursor: "pointer", transition: "background 0.2s",
        background: checked ? "var(--accent)" : "var(--border)",
        position: "relative",
      }}
    >
      <div style={{
        position: "absolute", top: 2, left: checked ? 14 : 2,
        width: 14, height: 14, borderRadius: "50%",
        background: checked ? "#0D0D0D" : "#7A7A7A",
        transition: "left 0.2s",
      }}/>
    </div>
  );
}
