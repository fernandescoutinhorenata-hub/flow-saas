import React, { useState } from 'react'
import { useVideos } from '../hooks/useVideos.js'
import { formatDate } from '../utils.js'

function localKey(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export default function Canal({ addToast }) {
  const { videos, loading, createVideo } = useVideos()
  const [channelName, setChannelName] = useState(() => localStorage.getItem('flow_channel_name') || 'Canal Dark')
  const [editingName, setEditingName] = useState(false)
  const [nameDraft, setNameDraft] = useState(channelName)
  const [showNew, setShowNew] = useState(false)
  const [title, setTitle] = useState('')
  const [publishDate, setPublishDate] = useState('')

  const today = localKey(new Date())
  const tomorrowDate = new Date()
  tomorrowDate.setDate(tomorrowDate.getDate() + 1)
  const tomorrow = localKey(tomorrowDate)

  const upcoming = (videos || []).filter(v => v.publish_date && v.publish_date >= today && v.status !== 'publicado')
  const dueTomorrow = (videos || []).filter(v => v.publish_date === tomorrow && v.status !== 'publicado')
  const overdue = (videos || []).filter(v => v.publish_date && v.publish_date < today && v.status !== 'publicado')

  function saveChannelName() {
    const n = nameDraft.trim() || 'Canal Dark'
    setChannelName(n)
    localStorage.setItem('flow_channel_name', n)
    setEditingName(false)
  }

  async function handleCreate() {
    if (!title.trim() || !publishDate) return
    try {
      await createVideo({ title: title.trim(), status: 'ideia', priority: 'medium', publish_date: publishDate })
      addToast('✅ Vídeo programado!')
      setShowNew(false)
      setTitle('')
      setPublishDate('')
    } catch {
      addToast('❌ Erro ao programar vídeo.')
    }
  }

  return (
    <div style={{ flex: 1, overflow: 'auto', padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ width: '100%', maxWidth: 640, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Canal</h2>
        <button
          onClick={() => setShowNew(true)}
          style={{ background: 'var(--accent)', color: '#0D0D0D', border: 'none', padding: '8px 16px', borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: "'Syne', sans-serif" }}
        >
          + Programar Vídeo
        </button>
      </div>

      {/* Canal */}
      <div style={{ width: '100%', maxWidth: 640, background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 32, textAlign: 'center', marginBottom: 16 }}>
        {editingName ? (
          <input
            autoFocus
            value={nameDraft}
            onChange={e => setNameDraft(e.target.value)}
            onBlur={saveChannelName}
            onKeyDown={e => e.key === 'Enter' && saveChannelName()}
            style={{ fontFamily: "'Syne', sans-serif", fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', textAlign: 'center', background: 'transparent', border: 'none', borderBottom: '1px solid var(--accent)', outline: 'none', width: '100%', maxWidth: 400 }}
          />
        ) : (
          <h2
            onClick={() => { setNameDraft(channelName); setEditingName(true) }}
            title="Clique para editar"
            style={{ fontFamily: "'Syne', sans-serif", fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', margin: 0, cursor: 'pointer' }}
          >
            {channelName}
          </h2>
        )}
        <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 8 }}>canal de conteúdo</p>
      </div>

      {/* Vídeos programados */}
      <div style={{ width: '100%', maxWidth: 640, background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 28, textAlign: 'center', marginBottom: 16 }}>
        <div style={{ fontSize: 48, fontFamily: "'Syne', sans-serif", fontWeight: 800, color: 'var(--accent)', lineHeight: 1 }}>
          {loading ? '...' : upcoming.length}
        </div>
        <div style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 8 }}>
          {upcoming.length === 1 ? 'vídeo programado' : 'vídeos programados'}
        </div>
      </div>

      {/* Alerta: produzir conteúdo (1 dia antes) */}
      {dueTomorrow.length > 0 && (
        <div style={{ width: '100%', maxWidth: 640, background: '#FFB80015', border: '1px solid #FFB800', borderRadius: 12, padding: 20, marginBottom: 12 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#FFB800', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
            ⚠️ Precisa produzir conteúdo!
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {dueTomorrow.map(v => (
              <div key={v.id} style={{ fontSize: 13, color: 'var(--text-primary)' }}>
                • {v.title} <span style={{ color: 'var(--text-secondary)' }}>— publica amanhã</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Atrasados */}
      {overdue.length > 0 && (
        <div style={{ width: '100%', maxWidth: 640, background: '#FF4C4C15', border: '1px solid #FF4C4C', borderRadius: 12, padding: 20, marginBottom: 12 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#FF4C4C', marginBottom: 10 }}>Atrasados</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {overdue.map(v => (
              <div key={v.id} style={{ fontSize: 13, color: 'var(--text-primary)' }}>
                • {v.title} <span style={{ color: 'var(--text-secondary)' }}>— era {formatDate(v.publish_date)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Próximas publicações */}
      {upcoming.length > 0 && (
        <div style={{ width: '100%', maxWidth: 640, background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 24, marginBottom: 12 }}>
          <h4 style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 14 }}>Próximas publicações</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[...upcoming].sort((a, b) => a.publish_date.localeCompare(b.publish_date)).map(v => (
              <div key={v.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: 14, color: 'var(--text-primary)' }}>{v.title}</span>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{formatDate(v.publish_date)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal programar vídeo */}
      {showNew && (
        <div onClick={e => { if (e.target === e.currentTarget) setShowNew(false) }} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div className="anim-scaleIn" style={{ background: 'var(--bg-modal)', border: '1px solid var(--border)', borderRadius: 16, width: 400, maxWidth: '100%', boxShadow: '0 24px 64px rgba(0,0,0,0.7)', padding: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 18, color: 'var(--text-primary)' }}>Programar Vídeo</h3>
              <button onClick={() => setShowNew(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: 20 }}>✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 11, color: 'var(--text-secondary)', letterSpacing: '0.12em', textTransform: 'uppercase', display: 'block', marginBottom: 6, fontWeight: 600 }}>Título do vídeo</label>
                <input autoFocus value={title} onChange={e => setTitle(e.target.value)} placeholder="Título do vídeo..." style={{ width: '100%', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)', fontSize: 14, padding: '10px 12px', outline: 'none', fontFamily: "'DM Sans', sans-serif" }} />
              </div>
              <div>
                <label style={{ fontSize: 11, color: 'var(--text-secondary)', letterSpacing: '0.12em', textTransform: 'uppercase', display: 'block', marginBottom: 6, fontWeight: 600 }}>Data de publicação</label>
                <input type="date" value={publishDate} onChange={e => setPublishDate(e.target.value)} min={today} style={{ width: '100%', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)', fontSize: 14, padding: '10px 12px', outline: 'none', fontFamily: "'DM Sans', sans-serif", colorScheme: 'dark' }} />
              </div>
              <button onClick={handleCreate} style={{ background: 'var(--accent)', color: '#0D0D0D', border: 'none', borderRadius: 8, padding: 12, cursor: 'pointer', fontSize: 14, fontWeight: 600, fontFamily: "'DM Sans', sans-serif", marginTop: 4 }}>
                Programar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
