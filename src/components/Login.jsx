import React, { useState } from 'react'
import { useAuth } from '../hooks/useAuth'

export default function Login() {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await signIn(email, password)
    } catch (err) {
      setError('Email ou senha incorretos.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight:'100vh', display:'flex', 
      alignItems:'center', justifyContent:'center',
      background:'var(--bg-base)' }}>
      <div className="anim-fadeInUp" style={{
        background:'var(--bg-card)', 
        border:'1px solid var(--border)',
        borderRadius:16, padding:'48px 40px', width:380,
        boxShadow:'0 24px 64px rgba(0,0,0,0.7)'
      }}>
        <div style={{ textAlign:'center', marginBottom:8 }}>
          <span style={{ fontFamily:"'Syne', sans-serif", 
            fontWeight:700, fontSize:36, 
            color:'var(--text-primary)' }}>
            FLOW<span style={{ color:'var(--accent)' }}>.</span>
          </span>
        </div>
        <p style={{ textAlign:'center', 
          color:'var(--text-secondary)', 
          fontSize:13, marginBottom:36 }}>
          Gestão simples. Execução precisa.
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ display:'flex', 
            flexDirection:'column', gap:12 }}>
            <input type="email" placeholder="seu@email.com"
              value={email} onChange={e => setEmail(e.target.value)}
              style={{ width:'100%', padding:'12px 14px',
                background:'var(--bg-surface)',
                border:'1px solid var(--border)',
                borderRadius:8, color:'var(--text-primary)',
                fontSize:14, outline:'none',
                fontFamily:"'DM Sans', sans-serif" }}
              onFocus={e => e.target.style.borderColor='#00FF8760'}
              onBlur={e => e.target.style.borderColor='var(--border)'}
            />
            <input type="password" placeholder="••••••••"
              value={password} onChange={e => setPassword(e.target.value)}
              style={{ width:'100%', padding:'12px 14px',
                background:'var(--bg-surface)',
                border:'1px solid var(--border)',
                borderRadius:8, color:'var(--text-primary)',
                fontSize:14, outline:'none',
                fontFamily:"'DM Sans', sans-serif" }}
              onFocus={e => e.target.style.borderColor='#00FF8760'}
              onBlur={e => e.target.style.borderColor='var(--border)'}
            />
            {error && (
              <p style={{ color:'#FF4C4C', fontSize:12, 
                textAlign:'center' }}>{error}</p>
            )}
            <button type="submit" disabled={loading}
              style={{ width:'100%', padding:13,
                background: loading ? 'var(--accent-dark)' 
                  : 'var(--accent)',
                border:'none', borderRadius:8, 
                color:'#0D0D0D',
                fontFamily:"'DM Sans', sans-serif",
                fontWeight:500, fontSize:14, cursor:'pointer',
                transition:'background 0.2s' }}>
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </div>
        </form>
        <p style={{ textAlign:'center', marginTop:24, 
          fontSize:11, color:'var(--text-disabled)' }}>
          Acesso restrito à equipe.
        </p>
      </div>
    </div>
  )
}
