import React, { useState } from 'react'
import { useIdeas, IDEA_STATUSES } from '../hooks/useIdeas.js'
import { useChannels } from '../hooks/useChannels.js'
import { useAuth } from '../context/AuthContext.jsx'
import { PLATFORMS, FORMATS } from '../hooks/useContents.js'

function statusInfo(status) {
  return IDEA_STATUSES.find(s => s.key === status) || { label: status, color: '#7A7A7A' }
}

function IdeaFormModal({ idea, channels, onClose, onSave }) {
  const [title, setTitle] = useState(idea?.title || '')
  const [description, setDescription] = useState(idea?.description || '')
  const [channelId, setChannelId] = useState(idea?.channel_id || '')
  const [platform, setPlatform] = useState(idea?.platform || '')
  const [format, setFormat] = useState(idea?.format || '')
  const [refLink, setRefLink] = useState(idea?.ref_link || '')
  const [tags, setTags] = useState(idea?.tags || '')

  const inputStyle = { width: '100%', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)', fontSize: 13, padding: '9px 11px', outline: 'none', fontFamily: "'DM Sans', sans-serif" }
  const labelStyle = { fontSize: 11, color: 'var(--text-secondary)', letterSpacing: '0.12em', textTransform: 'uppercase', display: 'block', marginBottom: 6, fontWeight: 600 }

  function buildData() {
    return {
      title: title.trim(),
      description,
      channel_id: channelId || null,
      platform: platform || null,
      format: format || null,
      ref_link: refLink || null,
      tags: tags || null,
    }
  }

  function saveAndClose() {
    if (!title.trim()) return
    onSave(buildData(), false)
  }

  function saveAndNew() {
    if (!title.trim()) return
    onSave(buildData(), true)
    setTitle('')
    setDescription('')
    setRefLink('')
    setTags('')
  }

  return (
    <div onClick={e => { if (e.target === e.currentTarget) onClose() }} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div className="anim-scaleIn" style={{ background: 'var(--bg-modal)', border: '1px solid var(--border)', borderRadius: 16, width: 440, maxWidth: '100%', maxHeight: '90vh', overflowY: 'auto', padding: 28, boxShadow: '0 24px 64px rgba(0,0,0,0.7)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 18, color: 'var(--text-primary)' }}>{idea ? 'Editar Ideia' : 'Nova Ideia'}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: 20 }}>✕</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={labelStyle}>Título *</label>
            <input autoFocus value={title} onChange={e => setTitle(e.target.value)} placeholder="Ideia do conteúdo..." style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Descrição / observação</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Detalhes da ideia (opcional)..." style={{ ...inputStyle, height: 70, resize: 'vertical' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={labelStyle}>Canal</label>
              <select value={channelId} onChange={e => setChannelId(e.target.value)} style={{ ...inputStyle, colorScheme: 'dark' }}>
                <option value="">Sem canal</option>
                {(channels || []).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Plataforma</label>
              <select value={platform} onChange={e => setPlatform(e.target.value)} style={{ ...inputStyle, colorScheme: 'dark' }}>
                <option value="">—</option>
                {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Formato</label>
              <select value={format} onChange={e => setFormat(e.target.value)} style={{ ...inputStyle, colorScheme: 'dark' }}>
                <option value="">—</option>
                {FORMATS.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Etiquetas</label>
              <input value={tags} onChange={e => setTags(e.target.value)} placeholder="tag1, tag2" style={inputStyle} />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Link de referência</label>
            <input value={refLink} onChange={e => setRefLink(e.target.value)} placeholder="https://..." style={inputStyle} />
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button onClick={onClose} style={{ flex: 1, background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-secondary)', borderRadius: 8, padding: 11, cursor: 'pointer', fontSize: 13 }}>Cancelar</button>
            <button onClick={saveAndNew} style={{ flex: 1, background: 'var(--bg-surface)', border: '1px solid var(--accent)', color: 'var(--accent)', borderRadius: 8, padding: 11, cursor: 'pointer', fontSize: 13, fontWeight: 500 }}>Salvar e adicionar outra</button>
            <button onClick={saveAndClose} style={{ flex: 1, background: 'var(--accent)', color: '#0D0D0D', border: 'none', borderRadius: 8, padding: 11, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>Salvar ideia</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function BancoIdeias({ addToast }) {
  const { ideas, loading, createIdea, updateIdea, deleteIdea, setIdeaStatus, transformIdea } = useIdeas()
  const { channels } = useChannels()
  const { currentUser } = useAuth()

  const [search, setSearch] = useState('')
  const [channelFilter, setChannelFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [platformFilter, setPlatformFilter] = useState('all')
  const [sort, setSort] = useState('recent')
  const [modal, setModal] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [transformingId, setTransformingId] = useState(null)

  const unusedCount = ideas.filter(i => i.status !== 'transformada' && i.status !== 'descartada').length

  let filtered = (ideas || []).filter(i => {
    if (search && !(i.title || '').toLowerCase().includes(search.toLowerCase())) return false
    if (channelFilter !== 'all' && i.channel_id !== channelFilter) return false
    if (statusFilter !== 'all' && i.status !== statusFilter) return false
    if (platformFilter !== 'all' && i.platform !== platformFilter) return false
    return true
  })
  filtered = [...filtered].sort((a, b) => sort === 'recent' ? new Date(b.created_at) - new Date(a.created_at) : new Date(a.created_at) - new Date(b.created_at))

  function channelName(id) { return channels.find(c => c.id === id)?.name || 'Sem canal definido' }

  async function handleSave(data, keepOpen) {
    try {
      if (modal && modal.id) {
        await updateIdea(modal.id, data)
        addToast('✅ Ideia atualizada.')
      } else {
        await createIdea({ ...data, author: currentUser?.name, author_id: currentUser?.id })
        addToast('✅ Ideia salva!')
      }
      if (!keepOpen) setModal(null)
    } catch {
      addToast('❌ Erro ao salvar ideia.')
    }
  }

  async function handleTransform(idea) {
    if (idea.status === 'transformada' || transformingId) return
    setTransformingId(idea.id)
    try {
      await transformIdea(idea)
      addToast('✅ Ideia transformada em conteúdo!')
    } catch {
      addToast('❌ Erro ao transformar ideia.')
    } finally {
      setTransformingId(null)
    }
  }

  async function handleDelete() {
    if (!confirmDelete) return
    try {
      await deleteIdea(confirmDelete.id)
      addToast('✅ Ideia excluída.')
      setConfirmDelete(null)
      setModal(null)
    } catch {
      addToast('❌ Erro ao excluir ideia.')
    }
  }

  async function handleDuplicate(idea) {
    try {
      await createIdea({
        title: idea.title + ' (cópia)',
        description: idea.description,
        channel_id: idea.channel_id,
        platform: idea.platform,
        format: idea.format,
        ref_link: idea.ref_link,
        tags: idea.tags,
        author: currentUser?.name,
        author_id: currentUser?.id,
      })
      addToast('✅ Ideia duplicada.')
    } catch {
      addToast('❌ Erro ao duplicar ideia.')
    }
  }

  const selectStyle = { background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)', fontSize: 13, padding: '7px 12px', outline: 'none', colorScheme: 'dark' }

  return (
    <div style={{ flex: 1, overflow: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Cabeçalho */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Banco de Ideias</h3>
          <span style={{ background: 'var(--accent-soft)', color: 'var(--accent)', fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>{unusedCount} {unusedCount === 1 ? 'ideia' : 'ideias'}</span>
        </div>
        <button onClick={() => setModal({})} style={{ background: 'var(--accent)', color: '#0D0D0D', border: 'none', padding: '8px 16px', borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: "'Syne', sans-serif" }}>+ Nova ideia</button>
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por título..." style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)', fontSize: 13, padding: '7px 12px', outline: 'none', fontFamily: "'DM Sans', sans-serif", width: 200 }} />
        <select value={channelFilter} onChange={e => setChannelFilter(e.target.value)} style={selectStyle}>
          <option value="all">Todos os canais</option>
          {(channels || []).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={selectStyle}>
          <option value="all">Todos os status</option>
          {IDEA_STATUSES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
        </select>
        <select value={platformFilter} onChange={e => setPlatformFilter(e.target.value)} style={selectStyle}>
          <option value="all">Todas as plataformas</option>
          {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <select value={sort} onChange={e => setSort(e.target.value)} style={selectStyle}>
          <option value="recent">Mais recentes</option>
          <option value="oldest">Mais antigas</option>
        </select>
      </div>

      {/* Lista */}
      {loading ? (
        <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Carregando ideias...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '64px 0', color: 'var(--text-secondary)', border: '1px dashed var(--border)', borderRadius: 12 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>💡</div>
          {ideas.length === 0 ? (
            <>
              <p style={{ fontSize: 15, color: 'var(--text-primary)', fontWeight: 500, marginBottom: 4 }}>Nenhuma ideia anotada ainda.</p>
              <p style={{ fontSize: 13, marginBottom: 20 }}>Anote uma ideia agora para não esquecer.</p>
              <button onClick={() => setModal({})} style={{ background: 'var(--accent)', color: '#0D0D0D', border: 'none', padding: '10px 20px', borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>Adicionar primeira ideia</button>
            </>
          ) : (
            <p style={{ fontSize: 13 }}>Nenhuma ideia para os filtros atuais.</p>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
          {filtered.map(idea => {
            const si = statusInfo(idea.status)
            return (
              <div key={idea.id} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 10, padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, color: 'var(--text-primary)', fontWeight: 500, lineHeight: 1.35, marginBottom: 4 }}>{idea.title}</div>
                    {idea.description && <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{idea.description}</div>}
                  </div>
                  <span style={{ background: si.color + '20', color: si.color, fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 4, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{si.label}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  {idea.channel_id && <span style={{ fontSize: 10, color: 'var(--accent)', background: 'var(--accent-soft)', padding: '1px 7px', borderRadius: 4 }}>{channelName(idea.channel_id)}</span>}
                  {(idea.platform || idea.format) && <span style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{[idea.platform, idea.format].filter(Boolean).join(' · ')}</span>}
                  {idea.tags && <span style={{ fontSize: 10, color: 'var(--text-disabled)' }}>#{idea.tags.split(',').map(t => t.trim()).join(' #')}</span>}
                </div>

                <div style={{ fontSize: 11, color: 'var(--text-disabled)' }}>
                  {idea.author ? `${idea.author} · ` : ''}{new Date(idea.created_at).toLocaleDateString('pt-BR')}
                </div>

                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', borderTop: '1px solid var(--border)', paddingTop: 10 }}>
                  {idea.status !== 'transformada' && (
                    <button onClick={() => handleTransform(idea)} disabled={transformingId === idea.id} title="Transformar em conteúdo" style={{ background: 'transparent', border: '1px solid var(--accent)', color: 'var(--accent)', borderRadius: 6, padding: '4px 10px', fontSize: 11, cursor: 'pointer', opacity: transformingId === idea.id ? 0.5 : 1, fontWeight: 500 }}>
                      {transformingId === idea.id ? '...' : '➜ Conteúdo'}
                    </button>
                  )}
                  {idea.status !== 'aprovada' && idea.status !== 'transformada' && idea.status !== 'descartada' && (
                    <button onClick={() => setIdeaStatus(idea.id, 'aprovada')} title="Aprovar" style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-secondary)', borderRadius: 6, padding: '4px 10px', fontSize: 11, cursor: 'pointer' }}>Aprovar</button>
                  )}
                  {idea.status !== 'descartada' && idea.status !== 'transformada' && (
                    <button onClick={() => setIdeaStatus(idea.id, 'descartada')} title="Descartar" style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-secondary)', borderRadius: 6, padding: '4px 10px', fontSize: 11, cursor: 'pointer' }}>Descartar</button>
                  )}
                  <span style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
                    <button onClick={() => setModal(idea)} title="Editar" style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 13, padding: 2 }}>✏️</button>
                    <button onClick={() => handleDuplicate(idea)} title="Duplicar" style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 13, padding: 2 }}>⧉</button>
                    <button onClick={() => setConfirmDelete(idea)} title="Excluir" style={{ background: 'none', border: 'none', color: '#FF4C4C', cursor: 'pointer', fontSize: 13, padding: 2 }}>🗑️</button>
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {modal && (
        <IdeaFormModal idea={modal.id ? modal : null} channels={channels} onClose={() => setModal(null)} onSave={handleSave} />
      )}

      {confirmDelete && (
        <div onClick={e => { if (e.target === e.currentTarget) setConfirmDelete(null) }} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div className="anim-scaleIn" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, width: 400, maxWidth: '100%', padding: 28, textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🗑️</div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10 }}>Excluir ideia?</h3>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 24 }}>A ideia <strong>{confirmDelete.title}</strong> será removida permanentemente.</p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setConfirmDelete(null)} style={{ flex: 1, background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-secondary)', borderRadius: 8, padding: 11, cursor: 'pointer', fontSize: 13 }}>Cancelar</button>
              <button onClick={handleDelete} style={{ flex: 1, background: '#FF4C4C', color: '#F0F0F0', border: 'none', borderRadius: 8, padding: 11, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>Excluir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
