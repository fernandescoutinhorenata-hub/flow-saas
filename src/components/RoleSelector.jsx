import React from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useUsers } from '../hooks/useUsers.js';

export default function RoleSelector() {
  const { currentUser, setCurrentUser } = useAuth()
  const { users } = useUsers()

  // Mostra apenas usuários ativos
  const activeUsers = users.filter(u => u.active)

  return (
    <div style={{
      position:'fixed', bottom:24, left:24, 
      zIndex:9000,
      background:'var(--bg-modal)', 
      border:'1px solid var(--border)',
      borderRadius:12, padding:'16px 18px', 
      width:220,
      boxShadow:'0 8px 32px rgba(0,0,0,0.6)',
    }}>
      <div style={{ fontSize:11, fontWeight:600, 
        color:'var(--text-secondary)', 
        letterSpacing:'0.12em', 
        textTransform:'uppercase', 
        marginBottom:14 }}>
        Testar como:
      </div>
      <div style={{ display:'flex', 
        flexDirection:'column', gap:8 }}>
        {activeUsers.map(u => {
          const isMe = currentUser?.id === u.id
          return (
            <button key={u.id}
              onClick={() => setCurrentUser(u)}
              style={{
                padding:'8px 12px', borderRadius:8, 
                fontSize:13, cursor:'pointer',
                background: isMe 
                  ? 'var(--accent-soft)' 
                  : 'var(--bg-surface)',
                border: isMe 
                  ? '1px solid var(--accent)' 
                  : '1px solid var(--border)',
                color: isMe 
                  ? 'var(--accent)' 
                  : 'var(--text-primary)',
                fontFamily:"'DM Sans', sans-serif",
                textAlign:'left', 
                transition:'all 0.2s'
              }}>
              {u.name} ({u.role})
            </button>
          )
        })}
        {activeUsers.length === 0 && (
          <p style={{ fontSize:12, 
            color:'var(--text-secondary)' }}>
            Carregando usuários...
          </p>
        )}
      </div>
    </div>
  )
}
