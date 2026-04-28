import React, { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'

export default function Login() {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)
  const [countdown, setCountdown] = useState(0)

  useEffect(() => {
    let timer
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000)
    }
    return () => clearTimeout(timer)
  }, [countdown])

  async function handleSubmit(e) {
    if (e) e.preventDefault()
    if (!email) {
      setError('Por favor, insira seu email.')
      return
    }
    
    setLoading(true)
    setError('')
    try {
      await signIn(email)
      setSent(true)
      setCountdown(60)
    } catch (err) {
      console.error(err)
      setError('Erro ao enviar link. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div style={{ minHeight:'100vh', display:'flex', 
        alignItems:'center', justifyContent:'center',
        background:'var(--bg-base)' }}>
        <div className="anim-fadeInUp" style={{
          background:'var(--bg-card)', 
          border:'1px solid var(--border)',
          borderRadius:16, padding:'48px 40px', width:380,
          boxShadow:'0 24px 64px rgba(0,0,0,0.7)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: 48, marginBottom: 24 }}>✉️</div>
          <h2 style={{ fontFamily:"'Syne', sans-serif", fontSize: 24, color: 'var(--text-primary)', marginBottom: 12 }}>Link enviado!</h2>
          <p style={{ color:'var(--text-secondary)', fontSize:14, marginBottom:32, lineHeight: 1.6 }}>
            Verifique seu email <strong>{email}</strong> para acessar o sistema. O link expira em breve.
          </p>
          
          <button 
            onClick={handleSubmit} 
            disabled={loading || countdown > 0}
            style={{ width:'100%', padding:13,
              background: (loading || countdown > 0) ? 'transparent' : 'var(--accent)',
              border: (loading || countdown > 0) ? '1px solid var(--border)' : 'none', 
              borderRadius:8, 
              color: (loading || countdown > 0) ? 'var(--text-secondary)' : '#0D0D0D',
              fontFamily:"'DM Sans', sans-serif",
              fontWeight:500, fontSize:14, cursor: (loading || countdown > 0) ? 'default' : 'pointer',
              transition:'all 0.2s' }}>
            {loading ? 'Enviando...' : countdown > 0 ? `Reenviar em ${countdown}s` : 'Reenviar link'}
          </button>
          
          <button 
            onClick={() => setSent(false)} 
            style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: 13, marginTop: 16, cursor: 'pointer' }}
          >
            Voltar para o login
          </button>
        </div>
      </div>
    )
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
            <div style={{ marginBottom: 4 }}>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8, display: 'block' }}>Email corporativo</label>
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
            </div>
            
            <p style={{ color:'var(--text-disabled)', fontSize:11, marginBottom: 8 }}>
              Você receberá um link de acesso no seu email. Não é necessário senha.
            </p>

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
              {loading ? 'Enviando link...' : 'Entrar com Email'}
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
