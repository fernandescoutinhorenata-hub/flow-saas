import React from 'react';

export default function Avatar({ initials, size = 24, color = "#00FF87" }) {
  const safeInitials = initials || "?";
  const hue = safeInitials.charCodeAt(0) % 360;
  const bg = `oklch(0.35 0.08 ${hue})`;
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: bg, display: "flex", alignItems: "center",
      justifyContent: "center", fontSize: size * 0.38,
      fontWeight: 600, color: "#F0F0F0", flexShrink: 0,
      border: "1.5px solid #2A2A2A",
      fontFamily: "'DM Sans', sans-serif",
    }}>{safeInitials}</div>
  );
}
