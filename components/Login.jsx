import React, { useState } from 'react';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setTimeout(() => {
      setSent(true);
      setLoading(false);
      setTimeout(() => onLogin(), 1400);
    }, 900);
  }

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center",
      justifyContent: "center", background: "var(--bg-base)",
    }}>
      <div className="anim-fadeInUp" style={{
        background: "var(--bg-card)", border: "1px solid var(--border)",
        borderRadius: 16, padding: "48px 40px", width: 380,
        boxShadow: "0 24px 64px rgba(0,0,0,0.7)",
      }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 8 }}>
          <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 36, color: "var(--text-primary)", letterSpacing: "-1px" }}>
            FLOW<span style={{ color: "var(--accent)" }}>.</span>
          </span>
        </div>
        <p style={{ textAlign: "center", color: "var(--text-secondary)", fontSize: 13, marginBottom: 36, lineHeight: 1.5 }}>
          Gestão simples. Execução precisa.
        </p>

        {!sent ? (
          <form onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={{
                width: "100%", padding: "12px 14px", background: "var(--bg-surface)",
                border: "1px solid var(--border)", borderRadius: 8,
                color: "var(--text-primary)", fontSize: 14,
                outline: "none", marginBottom: 12,
                fontFamily: "'DM Sans', sans-serif",
                transition: "border-color 0.2s",
              }}
              onFocus={e => e.target.style.borderColor = "#00FF8760"}
              onBlur={e => e.target.style.borderColor = "var(--border)"}
            />
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%", padding: "13px", background: loading ? "var(--accent-dark)" : "var(--accent)",
                border: "none", borderRadius: 8, color: "#0D0D0D",
                fontFamily: "'DM Sans', sans-serif", fontWeight: 500, fontSize: 14,
                cursor: "pointer", transition: "background 0.2s ease",
              }}
              onMouseOver={e => { if (!loading) e.target.style.background = "var(--accent-dark)"; }}
              onMouseOut={e => { if (!loading) e.target.style.background = "var(--accent)"; }}
            >
              {loading ? "Enviando..." : "Entrar com Magic Link"}
            </button>
          </form>
        ) : (
          <div className="anim-fadeInUp" style={{
            textAlign: "center", padding: "20px 0",
          }}>
            <div style={{ fontSize: 28, marginBottom: 12 }}>✉️</div>
            <p style={{ color: "var(--accent)", fontWeight: 500, marginBottom: 6 }}>Link enviado!</p>
            <p style={{ color: "var(--text-secondary)", fontSize: 12 }}>Verificando acesso…</p>
          </div>
        )}

        <p style={{ textAlign: "center", marginTop: 24, fontSize: 11, color: "var(--text-disabled)" }}>
          Sem senha. Sem stress.
        </p>
      </div>
    </div>
  );
}
