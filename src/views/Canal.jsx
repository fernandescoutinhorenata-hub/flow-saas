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
  const { videos, createVideo } = useVideos()

  const [showNewChannel, setShowNewChannel] = useState(false)
  const [newChannelName, setNewChannelName] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [nameDraft, setNameDraft] = useState('')

  const [showNewVideo, setShowNewVideo] = useState(false)
  const [videoChannel, setVideoChannel] = useState('')
  const [title, setTitle] = useState('')
  const [publishDate, setPublishDate] = useState('')

  const today = localKey(new Date())
  const tomorrowDate = new Date()
  tomorrowDate.setDate(tomorrowDate.getDate() + 1)
  const tomorrow = localKey(tomorrowDate)

  const scheduled = (videos || []).filter(v => v.publish_date)
  const upcoming = scheduled.filter(v => v.publish_date >= today && v.status !== 'publicado')
  const lastUpcoming = upcoming.length ? [...upcoming].sort((a, b) => b.publish_date.localeCompare(a.publish_date))[0] : null
  const needProduce = upcoming.length <= 1

  async function handleCreateChannel() {
    if (!newChannelName.trim()) return
    try {
      await createChannel(newChannelName.trim())
      addToast('✅ Canal criado!')
      setShowNewChannel(false)
      setNewChannelName('')
    } catch {
      addToast('❌ Erro ao criar canal.')
    }
  }

  function startRename(c) {
    setEditingId(c.id)
    setNameDraft(c.name)
  }

  async function saveRename() {
    const n = nameDraft.trim()
    if (n && editingId) {
      try {
        await updateChannel(editingId, { name: n })
        addToast('✅ Canal renomeado.')
      } catch {
        addToast('❌ Erro ao renomear canal.')
      }
    }
    setEditingId(null)
  }

  async function handleDeleteChannel() {
    if (!confirmDelete) return
    try {
      await deleteChannel(confirmDelete.id)
      addToast('✅ Canal excluído.')
      setConfirmDelete(null)
    } catch {
      addToast('❌ Erro ao excluir canal.')
    }
  }

  async function handleCreateVideo() {
    if (!title.trim() || !publishDate) return
    try {
      await createVideo({ title: title.trim(), status: 'ideia', priority: 'medium', publish_date: publishDate, channel_id: videoChannel || null })
      addToast('✅ Vídeo programado!')
      setShowNewVideo(false)
      setTitle('')
      setPublishDate('')
      setVideoChannel('')
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

  return (
    <div style={{ flex: 1, overflow: 'auto', padding: 24, display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Canais</h2>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => setShowNewChannel(true)} style={{ background: 'transparent', border: '1px solid var(--accent)', color: 'var(--accent)', padding: '8px 16px', borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>+ Novo Canal</button>
          <button onClick={() => { setShowNewVideo(true); setVideoChannel(channels[0]?.id || '') }} style={{ background: 'var(--accent)', color: '#0D0D0D', border: 'none', padding: '8px 16px', borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: "'Syne', sans-serif" }}>+ Programar Vídeo</button>
        </div>
      </div>

      {/* Alerta produzir conteúdo */}
      {needProduce && (
        <div style={{ background: '#FFB80015', border: '1px solid #FFB800', borderRadius: 12, padding: 16, marginBottom: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#FFB800', marginBottom: 6 }}>⚠️ Precisa produzir conteúdo!</div>
          <div style={{ fontSize: 13, color: 'var(--text-primary)' }}>
            {upcoming.length === 0
              ? 'Nenhum vídeo programado.'
              : `Falta apenas 1 vídeo programado — "${lastUpcoming.title}" publica ${lastUpcoming.publish_date === tomorrow ? 'amanhã' : formatDate(lastUpcoming.publish_date)}.`}
          </div>
        </div>
      )}

      {channels.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '64px 0', color: 'var(--text-secondary)' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📺</div>
          <p>Nenhum canal criado ainda.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {channels.map(c => {
            const channelVideos = scheduled.filter(v => v.channel_id === c.id)
            const sorted = [...channelVideos].sort((a, b) => (a.publish_date || '').localeCompare(b.publish_date || ''))
            return (
              <div key={c.id} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
                {/* Cabeçalho do canal */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
                  {editingId === c.id ? (
                    <input autoFocus value={nameDraft} onChange={e => setNameDraft(e.target.value)} onBlur={saveRename} onKeyDown={e => e.key === 'Enter' && saveRename()} style={{ flex: 1, fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', background: 'transparent', border: 'none', borderBottom: '1px solid var(--accent)', outline: 'none' }} />
                  ) : (
                    <h3 onClick={() => startRename(c)} title="Clique para renomear" style={{ flex: 1, fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', margin: 0, cursor: 'pointer' }}>{c.name}</h3>
                  )}
                  <span style={{ background: 'var(--accent-soft)', color: 'var(--accent)', fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>
                    {sorted.length} {sorted.length === 1 ? 'programado' : 'programados'}
                  </span>
                  <button onClick={() => setConfirmDelete(c)} title="Excluir canal" style={{ background: 'none', border: 'none', color: '#FF4C4C', cursor: 'pointer', fontSize: 14, padding: '4px' }}>🗑️</button>
                </div>

                {/* Tabela de vídeos do canal */}
                {sorted.length === 0 ? (
                  <div style={{ padding: '20px', color: 'var(--text-disabled)', fontSize: 13 }}>Nenhum vídeo programado.</div>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border)' }}>
                        <th style={{ padding: '10px 20px', fontSize: 11, color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'left' }}>Vídeo</th>
                        <th style={{ padding: '10px 20px', fontSize: 11, color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'right' }}>Data de publicação</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sorted.map(v => (
                        <tr key={v.id} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td style={{ padding: '12px 20px', fontSize: 14, color: 'var(--text-primary)' }}>{v.title}</td>
                          <td style={{ padding: '12px 20px', fontSize: 13, color: 'var(--text-secondary)', textAlign: 'right', whiteSpace: 'nowrap' }}>{formatDate(v.publish_date)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )
          })}
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
                <label style={{ fontSize: 11, color: 'var(--text-secondary)', letterSpacing: '0.12em', textTransform: 'uppercase', display: 'block', marginBottom: 6, fontWeight: 600 }}>Canal</label>
                <select value={videoChannel} onChange={e => setVideoChannel(e.target.value)} style={{ width: '100%', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)', fontSize: 14, padding: '10px 12px', outline: 'none', fontFamily: "'DM Sans', sans-serif", colorScheme: 'dark' }}>
                  {channels.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
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

      {/* Modal excluir canal */}
      {confirmDelete && (
        <div onClick={e => { if (e.target === e.currentTarget) setConfirmDelete(null) }} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div className="anim-scaleIn" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, width: 400, maxWidth: '100%', padding: 28, textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🗑️</div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10 }}>Excluir canal?</h3>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 24, lineHeight: 1.5 }}>O canal <strong>{confirmDelete.name}</strong> e todos os seus vídeos serão removidos permanentemente.</p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setConfirmDelete(null)} style={{ flex: 1, background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-secondary)', borderRadius: 8, padding: 11, cursor: 'pointer', fontSize: 13 }}>Cancelar</button>
              <button onClick={handleDeleteChannel} style={{ flex: 1, background: '#FF4C4C', color: '#F0F0F0', border: 'none', borderRadius: 8, padding: 11, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>Excluir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
