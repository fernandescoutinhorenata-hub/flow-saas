import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

export default function OwnerPanel() {
  const { profile, loading } = useAuth()
  const [users, setUsers] = useState([])
  const [form, setForm] = useState({ 
    name: '', email: '', role: 'membro', cargo: '' 
  })
  const [toastMsg, setToastMsg] = useState('')

  useEffect(() => {
    if (!loading) {
      // Redireciona se não for dono
      if (!profile || profile.role !== 'dono') {
        window.location.href = '/'
        return
      }
      fetchUsers()
    }
  }, [profile, loading])

  async function fetchUsers() {
    const { data } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })
    setUsers(data || [])
  }

  async function handleRegister(e) {
    e.preventDefault()
    const initials = form.name
      .split(' ').map(p => p[0])
      .join('').slice(0,2).toUpperCase()
    
    try {
      // Insere na tabela users
      await supabase.from('users').insert([{
        name: form.name,
        email: form.email,
        role: form.role,
        initials,
        active: true
      }])
      
      // Cria no Auth com senha = email (temporária)
      await supabase.auth.signUp({
        email: form.email,
        password: form.email,
        options: { data: { name: form.name } }
      })

      setToastMsg('✅ Usuário cadastrado!')
      setForm({ name:'', email:'', 
                role:'membro', cargo:'' })
      fetchUsers()
    } catch(err) {
      setToastMsg('❌ Erro: ' + err.message)
    }
    setTimeout(() => setToastMsg(''), 3000)
  }

  async function handleDeactivate(id) {
    await supabase.from('users')
      .update({ active: false }).eq('id', id)
    fetchUsers()
    setToastMsg('Usuário desativado.')
    setTimeout(() => setToastMsg(''), 3000)
  }

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center',
      justifyContent:'center', height:'100vh',
      background:'#0D0D0D', color:'#00FF87',
      fontFamily:"'Syne', sans-serif", fontSize:24 }}>
      FLOW.
    </div>
  )

  if (!profile || profile.role !== 'dono') return null

  return (
    <div style={{ minHeight:'100vh', 
      background:'#0D0D0D', color:'#F0F0F0',
      fontFamily:"'DM Sans', sans-serif",
      padding:'40px' }}>
      
      {/* Header */}
      <div style={{ marginBottom:40 }}>
        <h1 style={{ fontFamily:"'Syne',sans-serif",
          fontSize:28, fontWeight:700,
          color:'#F0F0F0', marginBottom:4 }}>
          FLOW<span style={{color:'#00FF87'}}>.</span>
          <span style={{ fontSize:14, color:'#7A7A7A',
            fontFamily:"'DM Sans',sans-serif",
            fontWeight:400, marginLeft:12 }}>
            Painel do Dono
          </span>
        </h1>
        <p style={{ color:'#FF4C4C', fontSize:12 }}>
          ⚠️ Área restrita — acesso controlado pelo banco
        </p>
      </div>

      <div style={{ display:'grid', 
        gridTemplateColumns:'400px 1fr', 
        gap:32, maxWidth:1100 }}>

        {/* Formulário de cadastro */}
        <div style={{ background:'#1F1F1F',
          border:'1px solid #2A2A2A',
          borderRadius:12, padding:28 }}>
          <h2 style={{ fontSize:13, fontWeight:600,
            color:'#7A7A7A', letterSpacing:'0.12em',
            textTransform:'uppercase', marginBottom:20 }}>
            Cadastrar Usuário
          </h2>
          <form onSubmit={handleRegister}
            style={{ display:'flex', 
              flexDirection:'column', gap:12 }}>
            {[
              {key:'name', placeholder:'Nome completo'},
              {key:'email', placeholder:'Email', 
               type:'email'},
              {key:'cargo', placeholder:'Cargo/Função'},
            ].map(f => (
              <input key={f.key}
                type={f.type || 'text'}
                placeholder={f.placeholder}
                value={form[f.key]}
                onChange={e => setForm({
                  ...form, [f.key]: e.target.value
                })}
                required={f.key !== 'cargo'}
                style={{ background:'#161616',
                  border:'1px solid #2A2A2A',
                  borderRadius:8, padding:'10px 12px',
                  color:'#F0F0F0', fontSize:13,
                  outline:'none' }}
              />
            ))}
            <select value={form.role}
              onChange={e => setForm({
                ...form, role: e.target.value
              })}
              style={{ background:'#161616',
                border:'1px solid #2A2A2A',
                borderRadius:8, padding:'10px 12px',
                color:'#F0F0F0', fontSize:13,
                outline:'none', colorScheme:'dark' }}>
              <option value="membro">Membro</option>
              <option value="gestor">Gestor</option>
              <option value="admin">Admin</option>
            </select>
            <button type="submit"
              style={{ background:'#00FF87',
                border:'none', borderRadius:8,
                color:'#0D0D0D', fontWeight:600,
                fontSize:14, padding:'12px',
                cursor:'pointer', marginTop:4 }}>
              Cadastrar Usuário
            </button>
          </form>
        </div>

        {/* Lista de usuários */}
        <div style={{ background:'#1F1F1F',
          border:'1px solid #2A2A2A',
          borderRadius:12, padding:28 }}>
          <h2 style={{ fontSize:13, fontWeight:600,
            color:'#7A7A7A', letterSpacing:'0.12em',
            textTransform:'uppercase', marginBottom:20 }}>
            Usuários Cadastrados ({users.length})
          </h2>
          <div style={{ display:'flex',
            flexDirection:'column', gap:8 }}>
            {users.map(u => (
              <div key={u.id} style={{
                display:'flex', alignItems:'center',
                justifyContent:'space-between',
                padding:'12px 16px',
                background:'#161616',
                border:'1px solid #2A2A2A',
                borderRadius:8 }}>
                <div style={{ display:'flex',
                  alignItems:'center', gap:12 }}>
                  <div style={{ width:32, height:32,
                    borderRadius:'50%',
                    background:'#2A2A2A',
                    display:'flex', alignItems:'center',
                    justifyContent:'center',
                    fontSize:12, fontWeight:600,
                    color:'#F0F0F0' }}>
                    {u.initials}
                  </div>
                  <div>
                    <div style={{ fontSize:13,
                      color:'#F0F0F0', fontWeight:500 }}>
                      {u.name}
                    </div>
                    <div style={{ fontSize:11,
                      color:'#7A7A7A' }}>
                      {u.email}
                    </div>
                  </div>
                  <span style={{ fontSize:10,
                    fontWeight:700, padding:'2px 8px',
                    borderRadius:4,
                    background: u.role==='dono' 
                      ? '#FF4C4C20' 
                      : u.role==='admin' 
                      ? '#00FF8720'
                      : u.role==='gestor'
                      ? '#FFB80020' : '#2A2A2A',
                    color: u.role==='dono'
                      ? '#FF4C4C'
                      : u.role==='admin'
                      ? '#00FF87'
                      : u.role==='gestor'
                      ? '#FFB800' : '#7A7A7A',
                    textTransform:'uppercase' }}>
                    {u.role}
                  </span>
                </div>
                {u.role !== 'dono' && u.active && (
                  <button
                    onClick={() => handleDeactivate(u.id)}
                    style={{ background:'transparent',
                      border:'1px solid #FF4C4C',
                      borderRadius:6, color:'#FF4C4C',
                      fontSize:11, padding:'4px 10px',
                      cursor:'pointer' }}>
                    Desativar
                  </button>
                )}
                {!u.active && (
                  <span style={{ fontSize:11,
                    color:'#3A3A3A' }}>Inativo</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Toast */}
      {toastMsg && (
        <div style={{ position:'fixed',
          bottom:24, right:24,
          background:'#1F1F1F',
          border:'1px solid #2A2A2A',
          borderLeft:'3px solid #00FF87',
          borderRadius:8, padding:'12px 16px',
          color:'#F0F0F0', fontSize:13,
          boxShadow:'0 8px 32px rgba(0,0,0,0.5)' }}>
          {toastMsg}
        </div>
      )}
    </div>
  )
}
