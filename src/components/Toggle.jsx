import React from 'react';

export default function Toggle({ checked, onChange }) {
  return (
    <div 
      onClick={() => onChange(!checked)}
      style={{
        width: 36, height: 20, borderRadius: 10,
        background: checked ? "var(--accent)" : "var(--border)",
        position: "relative", cursor: "pointer", transition: "all 0.2s"
      }}
    >
      <div style={{
        position: "absolute", top: 3, left: checked ? 19 : 3,
        width: 14, height: 14, borderRadius: "50%",
        background: checked ? "#0D0D0D" : "#7A7A7A",
        transition: "all 0.2s"
      }} />
    </div>
  );
}
