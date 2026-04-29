import React, { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'

export default function Login() {
  const { signIn, verifyOtp } = useAuth()
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState('email') // 'email' ou 'otp'
  const [countdown, setCountdown] = useState(0)

  useEffect(() => {
    let timer
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000)
    }
    return () => clearTimeout(timer)
  }, [countdown])

  async function handleSendOtp(e) {
    if (e) e.preventDefault()
    if (!email) {
      setError('Por favor, insira seu email.')
      return
    }
    
    setLoading(true)
    setError('')
    try {
      await signIn(email)
      setStep('otp')
      setCountdown(60)
    } catch (err) {
      console.error(err)
      setError('Erro ao enviar código. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  async function handleVerifyOtp(e) {
    if (e) e.preventDefault()
    if (!otp || otp.length < 6) {
      setError('Por favor, insira o código de 6 dígitos.')
      return
    }

    setLoading(true)
    setError('')
    try {
      await verifyOtp(email, otp)
    } catch (err) {
      console.error(err)
      setError('Código inválido ou expirado.')
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
          {step === 'email' ? 'Gestão simples. Execução precisa.' : 'Verificação de segurança'}
        </p>

        <form onSubmit={step === 'email' ? handleSendOtp : handleVerifyOtp}>
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            
            {step === 'email' ? (
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
            ) : (
              <div style={{ marginBottom: 4 }}>
                <label style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8, display: 'block' }}>Código recebido no email</label>
                <input type="text" placeholder="000000" maxLength={6}
                  value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                  style={{ width:'100%', padding:'12px 14px',
                    background:'var(--bg-surface)',
                    border:'1px solid var(--border)',
                    borderRadius:8, color:'var(--text-primary)',
                    fontSize:24, letterSpacing: '8px', textAlign: 'center', outline:'none',
                    fontFamily:"'Syne', sans-serif", fontWeight: 700 }}
                  onFocus={e => e.target.style.borderColor='#00FF8760'}
                  onBlur={e => e.target.style.borderColor='var(--border)'}
                  autoFocus
                />
                <p style={{ color:'var(--text-disabled)', fontSize:11, marginTop: 12, textAlign: 'center' }}>
                  Enviamos um código para <strong>{email}</strong>
                </p>
              </div>
            )}
            
            {error && (
              <p style={{ color:'#FF4C4C', fontSize:12, textAlign:'center' }}>{error}</p>
            )}

            <button type="submit" disabled={loading}
              style={{ width:'100%', padding:13,
                background: loading ? 'var(--accent-dark)' : 'var(--accent)',
                border:'none', borderRadius:8, 
                color:'#0D0D0D',
                fontFamily:"'DM Sans', sans-serif",
                fontWeight:600, fontSize:14, cursor:'pointer',
                transition:'background 0.2s', marginTop: 8 }}>
              {loading ? (step === 'email' ? 'Enviando...' : 'Verificando...') : (step === 'email' ? 'Entrar com Email' : 'Verificar Código')}
            </button>

            {step === 'otp' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
                <button 
                  type="button"
                  onClick={handleSendOtp} 
                  disabled={loading || countdown > 0}
                  style={{ background: 'none', border: 'none', color: countdown > 0 ? 'var(--text-disabled)' : 'var(--text-secondary)', fontSize: 12, cursor: countdown > 0 ? 'default' : 'pointer' }}
                >
                  {countdown > 0 ? `Reenviar código em ${countdown}s` : 'Reenviar código'}
                </button>
                <button 
                  type="button"
                  onClick={() => { setStep('email'); setOtp(''); setError(''); }}
                  style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: 12, cursor: 'pointer' }}
                >
                  Alterar email
                </button>
              </div>
            )}
          </div>
        </form>

        <p style={{ textAlign:'center', marginTop:24, fontSize:11, color:'var(--text-disabled)' }}>
          Acesso restrito à equipe.
        </p>
      </div>
    </div>
  )
}
