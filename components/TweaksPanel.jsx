import React, { useState, useEffect } from 'react';
import Toggle from './Toggle.jsx';

const TWEAK_DEFAULTS = {
  "accentColor": "#00FF87",
  "cardRadius": 2,
  "compactMode": false,
  "showAnimations": true
};

export default function TweaksPanel() {
  const [visible, setVisible] = useState(false);
  const [tweaks, setTweaks] = useState(TWEAK_DEFAULTS);

  useEffect(() => {
    window.addEventListener("message", e => {
      if (e.data?.type === "__activate_edit_mode")   setVisible(true);
      if (e.data?.type === "__deactivate_edit_mode") setVisible(false);
    });
    window.parent.postMessage({ type: "__edit_mode_available" }, "*");
  }, []);

  function set(key, val) {
    const next = { ...tweaks, [key]: val };
    setTweaks(next);
    window.parent.postMessage({ type: "__edit_mode_set_keys", edits: next }, "*");
    // Apply live
    if (key === "accentColor") {
      document.documentElement.style.setProperty("--accent", val);
      document.documentElement.style.setProperty("--accent-dark", val);
    }
    if (key === "cardRadius") {
      document.documentElement.style.setProperty("--card-radius", val + "px");
    }
  }

  if (!visible) return null;

  return (
    <div style={{
      position: "fixed", bottom: 24, left: 24, zIndex: 9000,
      background: "var(--bg-modal)", border: "1px solid var(--border)",
      borderRadius: 12, padding: "16px 18px", width: 220,
      boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
    }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-secondary)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 14 }}>Tweaks</div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>Cor accent</span>
          <input type="color" value={tweaks.accentColor} onChange={e => set("accentColor", e.target.value)}
            style={{ width: 32, height: 24, border: "none", background: "none", cursor: "pointer", borderRadius: 4 }} />
        </label>

        <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>Raio dos cards</span>
          <input type="range" min={0} max={20} value={tweaks.cardRadius} onChange={e => set("cardRadius", +e.target.value)}
            style={{ width: 80, accentColor: "var(--accent)" }} />
        </label>

        <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>Modo compacto</span>
          <Toggle checked={tweaks.compactMode} onChange={val => set("compactMode", val)} />
        </label>
      </div>
    </div>
  );
}
