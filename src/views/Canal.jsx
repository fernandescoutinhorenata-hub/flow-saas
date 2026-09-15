import React, { useState } from 'react'
import { useChannels } from '../hooks/useChannels.js'
import { useVideos } from '../hooks/useVideos.js'
import { formatDate } from '../utils.js'

function localKey(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export default function Canal({ addToast }) {
  const { channels, loading: channelsLoading, createChannel, updateChannel, deleteChannel } = useChannels()
  const [selectedId, setSelectedId] = useState(null)
  const [showNewChannel, setShowNewChannel] = useState(false)
  const [newChannelName, setNewChannelName] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)

  const selected = channels.find(c => c.id === selectedId) || channels[0] || null

  const { videos, loading: videosLoading, createVideo } = useVideos(selected?.id || null)

  const [showNewVideo, setShowNewVideo] = useState(false)
  const [title, setTitle] = useState('')
  const [publishDate, setPublishDate] = useState('')

  const [editingName, setEditingName] = useState(false)
  const [nameDraft, setNameDraft] = useState('')

  const today = localKey(new Date())
  const tomorrowDate = new Date()
  tomorrowDate.setDate(tomorrowDate.getDate() + 1)
  const tomorrow = localKey(tomorrowDate)

  const upcoming = (videos || []).filter(v => v.publish_date && v.publish_date >= today && v.status !== 'publicado')
  const dueTomorrow = (videos || []).filter(v => v.publish_date === tomorrow && v.status !== 'publicado')
  const overdue = (videos || []).filter(v => v.publish_date && v.publish_date < today && v.status !== 'publicado')

  async function handleCreateChannel() {
    if (!newChannelName.trim()) return
    try {
      const c = await createChannel(newChannelName.trim())
      addToast('✅ Canal criado!')
      setShowNewChannel(false)
      setNewChannelName('')
      if (c) setSelectedId(c.id)
    } catch {
      addToast('❌ Erro ao criar canal.')
    }
  }

  function startRename() {
    setNameDraft(selected?.name || '')
    setEditingName(true)
  }

  async function saveRename() {
    const n = nameDraft.trim()
    if (n && selected) {
      try {
        await updateChannel(selected.id, { name: n })
        addToast('✅ Canal renomeado.')
      } catch {
        addToast('❌ Erro ao renomear canal.')
      }
    }
    setEditingName(false)
  }

  async function handleDeleteChannel() {
    if (!selected) return
    try {
      await deleteChannel(selected.id)
      addToast('✅ Canal excluído.')
      setConfirmDelete(false)
      setSelectedId(null)
    } catch {
      addToast('❌ Erro ao excluir canal.')
    }
  }

  async function handleCreateVideo() {
    if (!title.trim() || !publishDate) return
    try {
      await createVideo({ title: title.trim(), status: 'ideia', priority: 'medium', publish_date: publishDate })
      addToast('✅ Vídeo programado!')
      setShowNewVideo(false)
      setTitle('')
      setPublishDate('')
    } catch {
      addToast('❌ Erro ao programar vídeo.')
    }
  }

  if (channelsLoading) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', fontFamily: "'DM Sans', sans-serif" }}>
        Carregando canais...
      </div>
    )
  }

  if (channels.length === 0) {
    return (
      <div style={{ flex: 1, overflow: 'auto', padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>📺</div>
        <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>Nenhum canal ainda</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24 }}>Crie o seu primeiro canal para começar o controle.</p>
        <button
          onClick={() => setShowNewChannel(true)}
          style={{ background: 'var(--accent)', color: '#0D0D0D', border: 'none', padding: '12px 24px', borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: "'Syne', sans-serif" }}
        >
          + Criar Canal
        </button>

        {showNewChannel && (
          <div onClick={e => { if (e.target === e.currentTarget) setShowNewChannel(false) }} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
            <div className="anim-scaleIn" style={{ background: 'var(--bg-modal)', border: '1px solid var(--border)', borderRadius: 16, width: 380, maxWidth: '100%', padding: 28, boxShadow: '0 24px 64px rgba(0,0,0,0.7)' }}>
              <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 18, color: 'var(--text-primary)', marginBottom: 20 }}>Novo Canal</h3>
              <input autoFocus value={newChannelName} onChange={e => setNewChannelName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleCreateChannel()} placeholder="Nome do canal..." style={{ width: '100%', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)', fontSize: 14, padding: '11px 12px', outline: 'none', fontFamily: "'DM Sans', sans-serif", marginBottom: 16 }} />
              <button onClick={handleCreateChannel} style={{ width: '100%', background: 'var(--accent)', color: '#0D0D0D', border: 'none', borderRadius: 8, padding: 12, cursor: 'pointer', fontSize: 14, fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>Criar Canal</button>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div style={{ flex: 1, overflow: 'auto', padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ width: '100%', maxWidth: 640, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Canais</h2>
        <button onClick={() => setShowNewChannel(true)} style={{ background: 'transparent', border: '1px solid var(--accent)', color: 'var(--accent)', padding: '8px 16px', borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>+ Novo Canal</button>
      </div>

      {/* Seletor de canais */}
      <div style={{ width: '100%', maxWidth: 640, display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8, marginBottom: 20, flexShrink: 0 }}>
        {channels.map(c => {
          const active = selected?.id === c.id
          return (
            <button
              key={c.id}
              onClick={() => setSelectedId(c.id)}
              style={{
                background: active ? 'var(--accent-soft)' : 'var(--bg-surface)',
                border: active ? '1px solid var(--accent)' : '1px solid var(--border)',
                color: active ? 'var(--accent)' : 'var(--text-primary)',
                padding: '8px 16px', borderRadius: 20, fontSize: 13, fontWeight: active ? 600 : 500,
                cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.15s', fontFamily: "'DM Sans', sans-serif",
              }}
            >{c.name}</button>
          )
        })}
      </div>

      {selected && (
        <div style={{ width: '100%', maxWidth: 640, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Header do canal */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
            {editingName ? (
              <input autoFocus value={nameDraft} onChange={e => setNameDraft(e.target.value)} onBlur={saveRename} onKeyDown={e => e.key === 'Enter' && saveRename()} style={{ flex: 1, fontFamily: "'Syne', sans-serif", fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', background: 'transparent', border: 'none', borderBottom: '1px solid var(--accent)', outline: 'none' }} />
            ) : (
              <h2 onClick={startRename} title="Clique para renomear" style={{ fontFamily: "'Syne', sans-serif", fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', margin: 0, cursor: 'pointer', flex: 1 }}>{selected.name}</h2>
            )}
            <button onClick={() => setShowNewVideo(true)} style={{ background: 'var(--accent)', color: '#0D0D0D', border: 'none', padding: '8px 16px', borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: "'Syne', sans-serif" }}>+ Programar Vídeo</button>
            <button onClick={() => setConfirmDelete(true)} title="Excluir canal" style={{ background: 'none', border: 'none', color: '#FF4C4C', cursor: 'pointer', fontSize: 16, padding: '4px' }}>🗑️</button>
          </div>

          {confirmDelete && (
            <div style={{ background: '#FF4C4C10', border: '1px solid #FF4C4C', borderRadius: 10, padding: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ flex: 1, fontSize: 13, color: 'var(--text-primary)' }}>Excluir o canal <strong>{selected.name}</strong> e todos os seus vídeos?</span>
              <button onClick={() => setConfirmDelete(false)} style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-secondary)', borderRadius: 6, padding: '6px 12px', fontSize: 12, cursor: 'pointer' }}>Cancelar</button>
              <button onClick={handleDeleteChannel} style={{ background: '#FF4C4C', color: '#F0F0F0', border: 'none', borderRadius: 6, padding: '6px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Excluir</button>
            </div>
          )}

          {/* Vídeos programados */}
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 28, textAlign: 'center' }}>
            <div style={{ fontSize: 48, fontFamily: "'Syne', sans-serif", fontWeight: 800, color: 'var(--accent)', lineHeight: 1 }}>
              {videosLoading ? '...' : upcoming.length}
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 8 }}>
              {upcoming.length === 1 ? 'vídeo programado' : 'vídeos programados'}
            </div>
          </div>

          {/* Alerta produzir conteúdo */}
          {dueTomorrow.length > 0 && (
            <div style={{ background: '#FFB80015', border: '1px solid #FFB800', borderRadius: 12, padding: 20 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#FFB800', marginBottom: 10 }}>⚠️ Precisa produzir conteúdo!</div>
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
            <div style={{ background: '#FF4C4C15', border: '1px solid #FF4C4C', borderRadius: 12, padding: 20 }}>
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
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 24 }}>
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
        </div>
      )}

      {/* Modal novo canal */}
      {showNewChannel && (
        <div onClick={e => { if (e.target === e.currentTarget) setShowNewChannel(false) }} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div className="anim-scaleIn" style={{ background: 'var(--bg-modal)', border: '1px solid var(--border)', borderRadius: 16, width: 380, maxWidth: '100%', padding: 28, boxShadow: '0 24px 64px rgba(0,0,0,0.7)' }}>
            <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 18, color: 'var(--text-primary)', marginBottom: 20 }}>Novo Canal</h3>
            <input autoFocus value={newChannelName} onChange={e => setNewChannelName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleCreateChannel()} placeholder="Nome do canal..." style={{ width: '100%', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)', fontSize: 14, padding: '11px 12px', outline: 'none', fontFamily: "'DM Sans', sans-serif", marginBottom: 16 }} />
            <button onClick={handleCreateChannel} style={{ width: '100%', background: 'var(--accent)', color: '#0D0D0D', border: 'none', borderRadius: 8, padding: 12, cursor: 'pointer', fontSize: 14, fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>Criar Canal</button>
          </div>
        </div>
      )}

      {/* Modal programar vídeo */}
      {showNewVideo && (
        <div onClick={e => { if (e.target === e.currentTarget) setShowNewVideo(false) }} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div className="anim-scaleIn" style={{ background: 'var(--bg-modal)', border: '1px solid var(--border)', borderRadius: 16, width: 400, maxWidth: '100%', boxShadow: '0 24px 64px rgba(0,0,0,0.7)', padding: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 18, color: 'var(--text-primary)' }}>Programar Vídeo</h3>
              <button onClick={() => setShowNewVideo(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: 20 }}>✕</button>
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
              <button onClick={handleCreateVideo} style={{ background: 'var(--accent)', color: '#0D0D0D', border: 'none', borderRadius: 8, padding: 12, cursor: 'pointer', fontSize: 14, fontWeight: 600, fontFamily: "'DM Sans', sans-serif", marginTop: 4 }}>
                Programar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
