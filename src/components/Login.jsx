import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)

  async function handleSubmit(e) {
    if (e) e.preventDefault()
    if (!email) {
      setError('Por favor, informe seu email.')
      return
    }
    
    setLoading(true)
    setError('')
    try {
      await signIn(email)
      setSent(true)
    } catch (err) {
      console.error(err)
      setError(err.message || 'Erro ao tentar entrar. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div style={{ minHeight:'100vh', display:'flex', 
        alignItems:'center', justifyContent:'center',
        background:'#0D0D0D' }}>
        <div className="anim-fadeInUp" style={{
          background:'#1F1F1F', 
          border:'1px solid #2A2A2A',
          borderRadius:16, padding:'48px 40px', width:400,
          boxShadow:'0 24px 64px rgba(0,0,0,0.7)',
          textAlign:'center'
        }}>
          <div style={{ fontSize: 48, marginBottom: 24 }}>📧</div>
          <h2 style={{ fontFamily:"'Syne', sans-serif", fontWeight:700, fontSize:24, color:'#F0F0F0', marginBottom:12 }}>
            Link enviado!
          </h2>
          <p style={{ color:'#7A7A7A', fontSize:15, lineHeight:1.6, marginBottom:32 }}>
            Enviamos um link de acesso para <strong style={{ color:'#00FF87' }}>{email}</strong>.<br/>
            Clique no link para entrar no app.
          </p>
          
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            <button 
              onClick={handleSubmit}
              disabled={loading}
              style={{ width:'100%', padding:13, background:'transparent', border:'1px solid #2A2A2A', borderRadius:8, color:'#F0F0F0', fontFamily:"'DM Sans', sans-serif", fontWeight:600, fontSize:14, cursor:'pointer' }}>
              {loading ? 'Reenviando...' : 'Reenviar email'}
            </button>
            <button 
              onClick={() => setSent(false)}
              style={{ width:'100%', padding:13, background:'transparent', border:'none', borderRadius:8, color:'#7A7A7A', fontFamily:"'DM Sans', sans-serif", fontSize:13, cursor:'pointer' }}>
              Usar outro email
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight:'100vh', display:'flex', 
      alignItems:'center', justifyContent:'center',
      background:'#0D0D0D' }}>
      <div className="anim-fadeInUp" style={{
        background:'#1F1F1F', 
        border:'1px solid #2A2A2A',
        borderRadius:16, padding:'48px 40px', width:380,
        boxShadow:'0 24px 64px rgba(0,0,0,0.7)'
      }}>
        <div style={{ textAlign:'center', marginBottom:8 }}>
          <span style={{ fontFamily:"'Syne', sans-serif", 
            fontWeight:700, fontSize:36, 
            color:'#F0F0F0' }}>
            FLOW<span style={{ color:'#00FF87' }}>.</span>
          </span>
        </div>
        
        <p style={{ textAlign:'center', 
          color:'#7A7A7A', 
          fontSize:13, marginBottom:36 }}>
          Gestão simples. Execução precisa.
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label style={{ fontSize: 11, color: '#7A7A7A', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Seu email corporativo</label>
              <input type="email" placeholder="nome@empresa.com"
                autoFocus
                value={email} onChange={e => setEmail(e.target.value)}
                style={{ width:'100%', padding:'14px',
                  background:'#161616',
                  border:'1px solid #2A2A2A',
                  borderRadius:8, color:'#F0F0F0',
                  fontSize:14, outline:'none',
                  fontFamily:"'DM Sans', sans-serif",
                  transition: 'all 0.2s' }}
                onFocus={e => e.target.style.borderColor='#00FF87'}
                onBlur={e => e.target.style.borderColor='#2A2A2A'}
              />
            </div>
            
            {error && (
              <p style={{ color:'#FF4C4C', fontSize:12, textAlign:'center', lineHeight:1.4, background:'rgba(255,76,76,0.1)', padding:10, borderRadius:6 }}>{error}</p>
            )}

            <button type="submit" disabled={loading}
              style={{ width:'100%', padding:14,
                background: loading ? '#00cc6a' : '#00FF87',
                border:'none', borderRadius:8, 
                color:'#0D0D0D',
                fontFamily:"'Syne', sans-serif",
                fontWeight:600, fontSize:15, cursor:'pointer',
                transition:'all 0.2s' }}>
              {loading ? 'Validando...' : 'Entrar'}
            </button>
          </div>
        </form>

        <p style={{ textAlign:'center', marginTop:32, fontSize:11, color:'#3A3A3A' }}>
          Acesso restrito à equipe Flow.
        </p>
      </div>
    </div>
  )
}
