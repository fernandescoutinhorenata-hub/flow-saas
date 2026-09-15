import React, { useState } from 'react'
import Avatar from '../components/Avatar.jsx'
import CanalAgenda from './CanalAgenda.jsx'
import CanalResultados from './CanalResultados.jsx'
import { useVideos, VIDEO_STAGES } from '../hooks/useVideos.js'
import { PRIORITY_COLORS, PRIORITY_LABELS } from '../data.js'
import { formatDate, isOverdue } from '../utils.js'

const PRIORITY_OPTIONS = [
  { key: 'low', label: 'Baixa' },
  { key: 'medium', label: 'Média' },
  { key: 'urgent', label: 'Urgente' },
]

function VideoCard({ video, isDragging, onDragStart, onDragEnd, onClick }) {
  const dueDate = video.due_date || video.publish_date || null
  const overdue = dueDate && isOverdue(dueDate) && video.status !== 'publicado'
  const pColor = PRIORITY_COLORS[video.priority] || '#7A7A7A'

  return (
    <div
      draggable
      onDragStart={e => onDragStart(e, video.id)}
      onDragEnd={onDragEnd}
      onClick={() => onClick(video)}
      className="anim-fadeInUp"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 10,
        padding: '12px 12px 12px 16px',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
        opacity: isDragging ? 0.35 : 1,
        transition: 'all 0.15s',
        boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
      }}
    >
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: pColor, borderRadius: '10px 0 0 10px' }} />

      <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', lineHeight: 1.4, marginBottom: 6 }}>
        {video.title}
      </p>

      {video.pauta && (
        <p style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: 8, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {video.pauta}
        </p>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
        {video.assignee_initials ? (
          <Avatar initials={video.assignee_initials} size={20} />
        ) : (
          <div style={{ width: 20, height: 20, borderRadius: '50%', border: '1px dashed #7A7A7A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7A7A7A', fontSize: 11 }}>+</div>
        )}

        {video.publish_date && (
          <span style={{ fontSize: 11, color: overdue ? '#FF4C4C' : 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 3 }}>
            {overdue && '⚠ '}📅 {formatDate(video.publish_date)}
          </span>
        )}

        <span style={{ marginLeft: 'auto', fontSize: 9, fontWeight: 700, color: pColor, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {PRIORITY_LABELS[video.priority] || 'Média'}
        </span>
      </div>
    </div>
  )
}

function VideoFormModal({ initial, users, onClose, onSave, onDelete }) {
  const [title, setTitle] = useState(initial?.title || '')
  const [pauta, setPauta] = useState(initial?.pauta || '')
  const [description, setDescription] = useState(initial?.description || '')
  const [priority, setPriority] = useState(initial?.priority || 'medium')
  const [publishDate, setPublishDate] = useState(initial?.publish_date || '')
  const [dueDate, setDueDate] = useState(initial?.due_date || '')
  const [youtubeUrl, setYoutubeUrl] = useState(initial?.youtube_url || '')
  const [assigneeId, setAssigneeId] = useState(initial?.assignee_id || '')
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  const isEditing = !!initial

  function handleSubmit() {
    if (!title.trim()) return
    const assigneeUser = (users || []).find(u => u.id === assigneeId)
    onSave({
      title: title.trim(),
      pauta: pauta.trim(),
      description,
      priority,
      publish_date: publishDate || null,
      due_date: dueDate || null,
      youtube_url: youtubeUrl.trim() || null,
      assignee: assigneeUser?.name || null,
      assignee_id: assigneeUser?.id || null,
      assignee_initials: assigneeUser?.initials || null,
    })
  }

  const inputStyle = {
    width: '100%', background: 'var(--bg-card)', border: '1px solid var(--border)',
    borderRadius: 8, color: 'var(--text-primary)', fontSize: 13, padding: '9px 11px',
    outline: 'none', fontFamily: "'DM Sans', sans-serif",
  }

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
    >
      <div className="anim-scaleIn" style={{
        background: 'var(--bg-modal)', border: '1px solid var(--border)', borderRadius: 16,
        width: 480, maxWidth: '100%', maxHeight: '90vh', overflowY: 'auto',
        boxShadow: '0 24px 64px rgba(0,0,0,0.7)', padding: 28,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 18, color: 'var(--text-primary)' }}>
            {isEditing ? 'Editar Vídeo' : 'Novo Vídeo'}
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: 20 }}>✕</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={labelStyle}>Título</label>
            <input autoFocus value={title} onChange={e => setTitle(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSubmit()} placeholder="Título do vídeo..." style={inputStyle} />
          </div>

          <div>
            <label style={labelStyle}>Pauta / Tema</label>
            <input value={pauta} onChange={e => setPauta(e.target.value)} placeholder="Sobre o que é o vídeo?" style={inputStyle} />
          </div>

          <div>
            <label style={labelStyle}>Descrição</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Detalhes do roteiro/abordagem..." style={{ ...inputStyle, height: 70, resize: 'vertical' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>Prioridade</label>
              <select value={priority} onChange={e => setPriority(e.target.value)} style={{ ...inputStyle, colorScheme: 'dark' }}>
                {PRIORITY_OPTIONS.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Responsável</label>
              <select value={assigneeId} onChange={e => setAssigneeId(e.target.value)} style={{ ...inputStyle, colorScheme: 'dark' }}>
                <option value="">Sem responsável</option>
                {(users || []).map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>Data de publicação</label>
              <input type="date" value={publishDate} onChange={e => setPublishDate(e.target.value)} style={{ ...inputStyle, colorScheme: 'dark' }} />
            </div>
            <div>
              <label style={labelStyle}>Prazo interno</label>
              <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} style={{ ...inputStyle, colorScheme: 'dark' }} />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Link do YouTube</label>
            <input value={youtubeUrl} onChange={e => setYoutubeUrl(e.target.value)} placeholder="https://youtube.com/..." style={inputStyle} />
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            {isEditing && (
              confirmingDelete ? (
                <div style={{ display: 'flex', gap: 8, flex: 1 }}>
                  <button onClick={() => setConfirmingDelete(false)} style={{ flex: 1, background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-secondary)', borderRadius: 8, padding: 11, cursor: 'pointer', fontSize: 13, fontWeight: 500 }}>Cancelar</button>
                  <button onClick={() => { onDelete(initial); }} style={{ flex: 1, background: '#FF4C4C', color: '#F0F0F0', border: 'none', borderRadius: 8, padding: 11, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>Excluir definitivamente</button>
                </div>
              ) : (
                <button onClick={() => setConfirmingDelete(true)} style={{ background: 'transparent', border: '1px solid #FF4C4C', color: '#FF4C4C', borderRadius: 8, padding: 11, cursor: 'pointer', fontSize: 13, fontWeight: 500 }}>Excluir</button>
              )
            )}
            <button onClick={handleSubmit} style={{ flex: 1, background: 'var(--accent)', color: '#0D0D0D', border: 'none', borderRadius: 8, padding: 11, cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>
              {isEditing ? 'Salvar' : 'Criar Vídeo'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

const labelStyle = { fontSize: 11, color: 'var(--text-secondary)', letterSpacing: '0.12em', textTransform: 'uppercase', display: 'block', marginBottom: 6, fontWeight: 600 }

export default function Canal({ users, addToast }) {
  const { videos, loading, createVideo, updateVideo, deleteVideo, moveVideo } = useVideos()
  const [showNew, setShowNew] = useState(false)
  const [editing, setEditing] = useState(null)
  const [dragId, setDragId] = useState(null)
  const [tab, setTab] = useState('pipeline')

  function handleDragStart(e, id) {
    e.dataTransfer.effectAllowed = 'move'
    setDragId(id)
  }

  function handleDrop(e, stageId) {
    e.preventDefault()
    if (!dragId) return
    const video = videos.find(v => v.id === dragId)
    if (!video || video.status === stageId) return
    moveVideo(dragId, stageId)
    setDragId(null)
  }

  async function handleSaveVideo(data) {
    try {
      if (editing) {
        await updateVideo(editing.id, data)
        addToast('✅ Vídeo atualizado!')
      } else {
        await createVideo(data)
        addToast('✅ Vídeo criado!')
      }
      setShowNew(false)
      setEditing(null)
    } catch {
      addToast('❌ Erro ao salvar vídeo.')
    }
  }

  async function handleDeleteVideo(video) {
    try {
      await deleteVideo(video.id)
      addToast('✅ Vídeo excluído.')
      setEditing(null)
    } catch {
      addToast('❌ Erro ao excluir vídeo.')
    }
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg-base)', minWidth: 0 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid var(--border)', flexShrink: 0, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            Canal
          </h2>
          <div style={{ display: 'flex', gap: 4, background: 'var(--bg-surface)', padding: 4, borderRadius: 8, border: '1px solid var(--border)' }}>
            {[{ key: 'pipeline', label: 'Pipeline' }, { key: 'agenda', label: 'Agenda' }, { key: 'resultados', label: 'Resultados' }].map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                style={{
                  background: tab === t.key ? 'var(--bg-card)' : 'transparent',
                  border: tab === t.key ? '1px solid var(--border)' : '1px solid transparent',
                  color: tab === t.key ? 'var(--text-primary)' : 'var(--text-secondary)',
                  padding: '6px 14px', borderRadius: 6, fontSize: 13, cursor: 'pointer',
                  fontWeight: tab === t.key ? 600 : 400, transition: 'all 0.15s',
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >{t.label}</button>
            ))}
          </div>
        </div>
        <button
          onClick={() => setShowNew(true)}
          style={{ background: 'var(--accent)', color: '#0D0D0D', border: 'none', padding: '8px 16px', borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: "'Syne', sans-serif" }}
        >
          + Novo Vídeo
        </button>
      </div>

      {tab === 'pipeline' && (
      <div className="kanban-board" style={{ display: 'flex', gap: 10, padding: 16, flex: 1, alignItems: 'stretch', minWidth: 0 }}>
        {VIDEO_STAGES.map(stage => {
          const stageVideos = (videos || []).filter(v => v.status === stage.id)
          return (
            <div
              key={stage.id}
              style={{ flex: '1 1 0', minWidth: 150, display: 'flex', flexDirection: 'column', minHeight: 0 }}
              onDragOver={e => e.preventDefault()}
              onDrop={e => handleDrop(e, stage.id)}
            >
              <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 12, display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflowY: 'auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, padding: '0 2px' }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>{stage.label}</span>
                  <span style={{ background: 'var(--border)', color: 'var(--text-secondary)', fontSize: 11, padding: '2px 7px', borderRadius: 4 }}>{stageVideos.length}</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {stageVideos.map(video => (
                    <VideoCard
                      key={video.id}
                      video={video}
                      isDragging={dragId === video.id}
                      onDragStart={handleDragStart}
                      onDragEnd={() => setDragId(null)}
                      onClick={v => setEditing(v)}
                    />
                  ))}
                  {stageVideos.length === 0 && (
                    <div style={{ height: 60, border: '1px dashed var(--border)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-disabled)', fontSize: 12 }}>
                      {loading ? '...' : 'Solte aqui'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
      )}

      {tab === 'agenda' && (
        <CanalAgenda videos={videos} users={users} onVideoClick={v => setEditing(v)} />
      )}

      {tab === 'resultados' && (
        <CanalResultados addToast={addToast} />
      )}

      {showNew && (
        <VideoFormModal users={users} onClose={() => setShowNew(false)} onSave={handleSaveVideo} />
      )}
      {editing && (
        <VideoFormModal initial={editing} users={users} onClose={() => setEditing(null)} onSave={handleSaveVideo} onDelete={handleDeleteVideo} />
      )}
    </div>
  )
}
