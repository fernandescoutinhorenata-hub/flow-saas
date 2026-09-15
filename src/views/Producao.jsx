import React, { useState } from 'react'
import Avatar from '../components/Avatar.jsx'
import BancoIdeias from './BancoIdeias.jsx'
import { useContents, CONTENT_STAGES, PLATFORMS, FORMATS, DEFAULT_CHECKLIST } from '../hooks/useContents.js'
import { useChannels } from '../hooks/useChannels.js'
import { useUsers } from '../hooks/useUsers.js'
import { formatDate } from '../utils.js'

const PRIORITIES = [
  { key: 'low', label: 'Baixa', color: '#00FF87' },
  { key: 'medium', label: 'Média', color: '#FFB800' },
  { key: 'high', label: 'Alta', color: '#FF7A00' },
  { key: 'urgent', label: 'Urgente', color: '#FF4C4C' },
]

function localKey(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function ContentFormModal({ content, channels, users, onClose, onSave, onDelete }) {
  const [title, setTitle] = useState(content?.title || '')
  const [channelId, setChannelId] = useState(content?.channel_id || '')
  const [platform, setPlatform] = useState(content?.platform || 'YouTube')
  const [format, setFormat] = useState(content?.format || 'Short')
  const [niche, setNiche] = useState(content?.niche || '')
  const [stage, setStage] = useState(content?.stage || 'ideias')
  const [assigneeId, setAssigneeId] = useState(content?.assignee_id || '')
  const [priority, setPriority] = useState(content?.priority || 'medium')
  const [publishDate, setPublishDate] = useState(content?.publish_date || '')
  const [description, setDescription] = useState(content?.description || '')
  const [idea, setIdea] = useState(content?.idea || '')
  const [hook, setHook] = useState(content?.hook || '')
  const [script, setScript] = useState(content?.script || '')
  const [publicTitle, setPublicTitle] = useState(content?.public_title || '')
  const [narration, setNarration] = useState(content?.narration || '')
  const [cta, setCta] = useState(content?.cta || '')
  const [caption, setCaption] = useState(content?.caption || '')
  const [hashtags, setHashtags] = useState(content?.hashtags || '')
  const [imageLinks, setImageLinks] = useState(content?.image_links || '')
  const [videoLinks, setVideoLinks] = useState(content?.video_links || '')
  const [prompts, setPrompts] = useState(content?.prompts || '')
  const [narrationLink, setNarrationLink] = useState(content?.narration_link || '')
  const [editLink, setEditLink] = useState(content?.edit_link || '')
  const [folderLink, setFolderLink] = useState(content?.folder_link || '')
  const [thumbnailUrl, setThumbnailUrl] = useState(content?.thumbnail_url || '')
  const [publishedUrl, setPublishedUrl] = useState(content?.published_url || '')
  const [checklist, setChecklist] = useState(() => {
    const existing = content?.checklist
    if (Array.isArray(existing) && existing.length) return existing
    return DEFAULT_CHECKLIST.map(label => ({ label, done: false }))
  })

  function submit() {
    if (!title.trim()) return
    const assigneeUser = (users || []).find(u => u.id === assigneeId)
    onSave({
      title: title.trim(),
      channel_id: channelId || null,
      platform, format, niche: niche || null, stage,
      assignee_id: assigneeUser?.id || null,
      assignee: assigneeUser?.name || null,
      priority,
      publish_date: publishDate || null,
      description, idea, hook, script, public_title: publicTitle, narration, cta, caption, hashtags,
      image_links: imageLinks, video_links: videoLinks, prompts, narration_link: narrationLink,
      edit_link: editLink, folder_link: folderLink, thumbnail_url: thumbnailUrl,
      published_url: publishedUrl,
      checklist,
    })
  }

  function toggleCheck(i) {
    setChecklist(prev => prev.map((c, idx) => idx === i ? { ...c, done: !c.done } : c))
  }
  function addCheck() {
    setChecklist(prev => [...prev, { label: '', done: false }])
  }
  function removeCheck(i) {
    setChecklist(prev => prev.filter((_, idx) => idx !== i))
  }

  const inputStyle = { width: '100%', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)', fontSize: 13, padding: '9px 11px', outline: 'none', fontFamily: "'DM Sans', sans-serif" }
  const labelStyle = { fontSize: 11, color: 'var(--text-secondary)', letterSpacing: '0.12em', textTransform: 'uppercase', display: 'block', marginBottom: 6, fontWeight: 600 }
  const sectionStyle = { fontSize: 12, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '6px 0 2px' }

  const doneCount = checklist.filter(c => c.done).length

  return (
    <div onClick={e => { if (e.target === e.currentTarget) onClose() }} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div className="anim-scaleIn" style={{ background: 'var(--bg-modal)', border: '1px solid var(--border)', borderRadius: 16, width: 720, maxWidth: '100%', maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 24px 64px rgba(0,0,0,0.7)', padding: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 18, color: 'var(--text-primary)' }}>{content ? 'Editar Conteúdo' : 'Novo Conteúdo'}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: 20 }}>✕</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={labelStyle}>Título interno *</label>
            <input autoFocus value={title} onChange={e => setTitle(e.target.value)} placeholder="Título do conteúdo..." style={inputStyle} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 10 }}>
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
                {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Formato</label>
              <select value={format} onChange={e => setFormat(e.target.value)} style={{ ...inputStyle, colorScheme: 'dark' }}>
                {FORMATS.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Prioridade</label>
              <select value={priority} onChange={e => setPriority(e.target.value)} style={{ ...inputStyle, colorScheme: 'dark' }}>
                {PRIORITIES.map(p => <option key={p.key} value={p.key}>{p.label}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Etapa</label>
              <select value={stage} onChange={e => setStage(e.target.value)} style={{ ...inputStyle, colorScheme: 'dark' }}>
                {CONTENT_STAGES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Responsável</label>
              <select value={assigneeId} onChange={e => setAssigneeId(e.target.value)} style={{ ...inputStyle, colorScheme: 'dark' }}>
                <option value="">Sem responsável</option>
                {(users || []).map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Publicação prevista</label>
              <input type="date" value={publishDate} onChange={e => setPublishDate(e.target.value)} style={{ ...inputStyle, colorScheme: 'dark' }} />
            </div>
            <div>
              <label style={labelStyle}>Nicho</label>
              <input value={niche} onChange={e => setNiche(e.target.value)} placeholder="Nicho/categoria" style={inputStyle} />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Descrição</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Descrição geral..." style={{ ...inputStyle, height: 60, resize: 'vertical' }} />
          </div>

          <div style={sectionStyle}>Ideia e pesquisa</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={labelStyle}>Ideia principal</label>
              <textarea value={idea} onChange={e => setIdea(e.target.value)} style={{ ...inputStyle, height: 50, resize: 'vertical' }} />
            </div>
            <div>
              <label style={labelStyle}>Gancho</label>
              <textarea value={hook} onChange={e => setHook(e.target.value)} style={{ ...inputStyle, height: 50, resize: 'vertical' }} />
            </div>
          </div>

          <div style={sectionStyle}>Roteiro</div>
          <div>
            <label style={labelStyle}>Título público</label>
            <input value={publicTitle} onChange={e => setPublicTitle(e.target.value)} placeholder="Título que aparece para o público" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Roteiro completo</label>
            <textarea value={script} onChange={e => setScript(e.target.value)} placeholder="Roteiro/narração..." style={{ ...inputStyle, height: 90, resize: 'vertical' }} />
          </div>
          <div>
            <label style={labelStyle}>Texto da narração</label>
            <textarea value={narration} onChange={e => setNarration(e.target.value)} placeholder="Narração..." style={{ ...inputStyle, height: 60, resize: 'vertical' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={labelStyle}>CTA</label>
              <input value={cta} onChange={e => setCta(e.target.value)} placeholder="Call to action" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Legenda</label>
              <input value={caption} onChange={e => setCaption(e.target.value)} placeholder="Legenda do vídeo" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Hashtags</label>
              <input value={hashtags} onChange={e => setHashtags(e.target.value)} placeholder="#tag1 #tag2" style={inputStyle} />
            </div>
          </div>

          <div style={sectionStyle}>Materiais</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={labelStyle}>Links de imagens</label>
              <textarea value={imageLinks} onChange={e => setImageLinks(e.target.value)} style={{ ...inputStyle, height: 50, resize: 'vertical' }} />
            </div>
            <div>
              <label style={labelStyle}>Links de vídeos</label>
              <textarea value={videoLinks} onChange={e => setVideoLinks(e.target.value)} style={{ ...inputStyle, height: 50, resize: 'vertical' }} />
            </div>
            <div>
              <label style={labelStyle}>Prompts utilizados</label>
              <textarea value={prompts} onChange={e => setPrompts(e.target.value)} style={{ ...inputStyle, height: 50, resize: 'vertical' }} />
            </div>
            <div>
              <label style={labelStyle}>Link da narração</label>
              <input value={narrationLink} onChange={e => setNarrationLink(e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Link da edição</label>
              <input value={editLink} onChange={e => setEditLink(e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Pasta externa</label>
              <input value={folderLink} onChange={e => setFolderLink(e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Thumbnail (URL)</label>
              <input value={thumbnailUrl} onChange={e => setThumbnailUrl(e.target.value)} style={inputStyle} />
            </div>
          </div>

          <div style={sectionStyle}>Publicação</div>
          <div>
            <label style={labelStyle}>URL do conteúdo publicado</label>
            <input value={publishedUrl} onChange={e => setPublishedUrl(e.target.value)} placeholder="https://..." style={inputStyle} />
          </div>

          <div style={sectionStyle}>Checklist ({doneCount}/{checklist.length})</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {checklist.map((c, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div onClick={() => toggleCheck(i)} style={{ width: 16, height: 16, borderRadius: 4, border: c.done ? '1.5px solid var(--accent)' : '1.5px solid var(--border)', background: c.done ? 'var(--accent-soft)' : 'transparent', flexShrink: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {c.done && <span style={{ color: 'var(--accent)', fontSize: 10 }}>✓</span>}
                </div>
                <input value={c.label} onChange={e => setChecklist(prev => prev.map((x, idx) => idx === i ? { ...x, label: e.target.value } : x))} style={{ flex: 1, background: 'transparent', border: 'none', borderBottom: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: 13, padding: '4px 0', outline: 'none' }} />
                <button onClick={() => removeCheck(i)} style={{ background: 'none', border: 'none', color: '#FF4C4C', cursor: 'pointer', fontSize: 13 }}>✕</button>
              </div>
            ))}
            <button onClick={addCheck} style={{ background: 'none', border: '1px dashed var(--border)', borderRadius: 6, color: 'var(--text-secondary)', fontSize: 12, padding: '6px', cursor: 'pointer' }}>+ Adicionar item</button>
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            {content && (
              <button onClick={() => onDelete(content)} style={{ background: 'transparent', border: '1px solid #FF4C4C', color: '#FF4C4C', borderRadius: 8, padding: 11, cursor: 'pointer', fontSize: 13, fontWeight: 500 }}>Excluir</button>
            )}
            <button onClick={submit} style={{ flex: 1, background: 'var(--accent)', color: '#0D0D0D', border: 'none', borderRadius: 8, padding: 11, cursor: 'pointer', fontSize: 14, fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>
              {content ? 'Salvar' : 'Criar Conteúdo'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Producao({ addToast }) {
  const { contents, loading, createContent, updateContent, deleteContent, moveContent } = useContents()
  const { channels } = useChannels()
  const { users } = useUsers()

  const [channelFilter, setChannelFilter] = useState('all')
  const [platformFilter, setPlatformFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState('esteira')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [dragId, setDragId] = useState(null)

  const today = new Date()
  const todayKey = localKey(today)
  const weekStart = new Date(today); weekStart.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1))
  const weekStartKey = localKey(weekStart)

  const filtered = (contents || []).filter(c => {
    if (channelFilter !== 'all' && c.channel_id !== channelFilter) return false
    if (platformFilter !== 'all' && c.platform !== platformFilter) return false
    if (search && !(c.title || '').toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const counts = {
    total: filtered.filter(c => c.stage !== 'publicado').length,
    roteiro: filtered.filter(c => c.stage === 'roteiro').length,
    edicao: filtered.filter(c => c.stage === 'edicao').length,
    revisao: filtered.filter(c => c.stage === 'revisao').length,
    agendado: filtered.filter(c => c.stage === 'agendado').length,
    publicadoSemana: filtered.filter(c => c.stage === 'publicado' && c.published_at && localKey(new Date(c.published_at)) >= weekStartKey).length,
    atrasado: filtered.filter(c => c.publish_date && c.publish_date < todayKey && c.stage !== 'publicado').length,
  }

  function channelName(id) { return channels.find(c => c.id === id)?.name || '—' }

  async function handleSave(data) {
    try {
      if (editing) {
        await updateContent(editing.id, data)
        addToast('✅ Conteúdo atualizado.')
      } else {
        await createContent(data)
        addToast('✅ Conteúdo criado.')
      }
      setShowModal(false)
      setEditing(null)
    } catch {
      addToast('❌ Erro ao salvar conteúdo.')
    }
  }

  async function handleDrop(e, stageId) {
    e.preventDefault()
    if (!dragId) return
    try {
      await moveContent(dragId, stageId)
      addToast(stageId === 'publicado' ? '✅ Conteúdo publicado!' : 'Conteúdo movido.')
    } catch {
      addToast('❌ Erro ao mover conteúdo.')
    }
    setDragId(null)
  }

  async function handleDelete() {
    if (!confirmDelete) return
    try {
      await deleteContent(confirmDelete.id)
      addToast('✅ Conteúdo excluído.')
      setConfirmDelete(null)
      setEditing(null)
      setShowModal(false)
    } catch {
      addToast('❌ Erro ao excluir conteúdo.')
    }
  }

  const pColor = (p) => PRIORITIES.find(x => x.key === p)?.color || '#7A7A7A'

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
      {/* Cabeçalho + capacidade */}
      <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Produção</h2>
            <div style={{ display: 'flex', gap: 4, background: 'var(--bg-surface)', padding: 4, borderRadius: 8, border: '1px solid var(--border)' }}>
              {[{ key: 'esteira', label: 'Esteira' }, { key: 'ideias', label: 'Banco de Ideias' }].map(t => (
                <button key={t.key} onClick={() => setTab(t.key)} style={{ background: tab === t.key ? 'var(--bg-card)' : 'transparent', border: tab === t.key ? '1px solid var(--border)' : '1px solid transparent', color: tab === t.key ? 'var(--text-primary)' : 'var(--text-secondary)', padding: '6px 14px', borderRadius: 6, fontSize: 13, cursor: 'pointer', fontWeight: tab === t.key ? 600 : 400, transition: 'all 0.15s', fontFamily: "'DM Sans', sans-serif" }}>{t.label}</button>
              ))}
            </div>
          </div>
          {tab === 'esteira' && (
            <button onClick={() => { setEditing(null); setShowModal(true) }} style={{ background: 'var(--accent)', color: '#0D0D0D', border: 'none', padding: '8px 16px', borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: "'Syne', sans-serif" }}>+ Novo conteúdo</button>
          )}
        </div>

        {tab === 'esteira' && (
          <>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[
            { label: 'Em produção', val: counts.total, color: 'var(--text-primary)' },
            { label: 'Roteiro', val: counts.roteiro, color: 'var(--text-secondary)' },
            { label: 'Edição', val: counts.edicao, color: 'var(--text-secondary)' },
            { label: 'Revisão', val: counts.revisao, color: 'var(--text-secondary)' },
            { label: 'Agendados', val: counts.agendado, color: 'var(--status-medium)' },
            { label: 'Publicados na semana', val: counts.publicadoSemana, color: 'var(--status-ok)' },
            { label: 'Atrasados', val: counts.atrasado, color: 'var(--status-urgent)' },
          ].map((k, i) => (
            <div key={i} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{k.label}</span>
              <span style={{ fontSize: 16, fontFamily: "'Syne', sans-serif", fontWeight: 700, color: k.color }}>{k.val}</span>
            </div>
          ))}
        </div>

        {/* Filtros */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por título..." style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)', fontSize: 13, padding: '7px 12px', outline: 'none', fontFamily: "'DM Sans', sans-serif", width: 220 }} />
          <select value={channelFilter} onChange={e => setChannelFilter(e.target.value)} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)', fontSize: 13, padding: '7px 12px', outline: 'none', colorScheme: 'dark' }}>
            <option value="all">Todos os canais</option>
            {(channels || []).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select value={platformFilter} onChange={e => setPlatformFilter(e.target.value)} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)', fontSize: 13, padding: '7px 12px', outline: 'none', colorScheme: 'dark' }}>
            <option value="all">Todas as plataformas</option>
            {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
          </>
        )}
      </div>

      {tab === 'esteira' && (
      <div style={{ display: 'flex', gap: 10, padding: 16, overflowX: 'auto', flex: 1, alignItems: 'flex-start' }}>
        {CONTENT_STAGES.map(stage => {
          const stageContents = filtered.filter(c => c.stage === stage.id)
          return (
            <div
              key={stage.id}
              style={{ width: 240, flexShrink: 0 }}
              onDragOver={e => e.preventDefault()}
              onDrop={e => handleDrop(e, stage.id)}
            >
              <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 12, minHeight: 140 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, alignItems: 'center' }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{stage.label}</span>
                  <span style={{ background: 'var(--border)', color: 'var(--text-secondary)', fontSize: 11, padding: '2px 7px', borderRadius: 4 }}>{stageContents.length}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {stageContents.map(c => {
                    const checklist = Array.isArray(c.checklist) ? c.checklist : []
                    const done = checklist.filter(i => i.done).length
                    const overdue = c.publish_date && c.publish_date < todayKey && c.stage !== 'publicado'
                    return (
                      <div
                        key={c.id}
                        draggable
                        onDragStart={e => { e.dataTransfer.effectAllowed = 'move'; setDragId(c.id) }}
                        onDragEnd={() => setDragId(null)}
                        onClick={() => { setEditing(c); setShowModal(true) }}
                        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderLeft: `3px solid ${pColor(c.priority)}`, borderRadius: 8, padding: '10px 12px', cursor: 'pointer', opacity: dragId === c.id ? 0.35 : 1, transition: 'all 0.15s' }}
                      >
                        <div style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500, marginBottom: 4, lineHeight: 1.3 }}>{c.title}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 6 }}>
                          <span style={{ fontSize: 10, color: 'var(--accent)', background: 'var(--accent-soft)', padding: '1px 6px', borderRadius: 4 }}>{channelName(c.channel_id)}</span>
                          <span style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{c.platform} · {c.format}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          {c.publish_date && (
                            <span style={{ fontSize: 10, color: overdue ? '#FF4C4C' : 'var(--text-secondary)' }}>{overdue ? '⚠ ' : ''}{formatDate(c.publish_date)}</span>
                          )}
                          {checklist.length > 0 && (
                            <span style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--text-secondary)' }}>{done}/{checklist.length} ✓</span>
                          )}
                          {c.assignee && <Avatar initials={(users.find(u => u.id === c.assignee_id)?.initials) || c.assignee.slice(0, 2).toUpperCase()} size={18} />}
                        </div>
                      </div>
                    )
                  })}
                  {stageContents.length === 0 && (
                    <div style={{ height: 50, border: '1px dashed var(--border)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-disabled)', fontSize: 12 }}>
                      {loading ? '...' : 'Nenhum conteúdo nesta etapa.'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
      )}

      {tab === 'ideias' && (
        <BancoIdeias addToast={addToast} />
      )}

      {showModal && (
        <ContentFormModal content={editing} channels={channels} users={users} onClose={() => { setShowModal(false); setEditing(null) }} onSave={handleSave} onDelete={(c) => { setConfirmDelete(c); setShowModal(false) }} />
      )}

      {confirmDelete && (
        <div onClick={e => { if (e.target === e.currentTarget) setConfirmDelete(null) }} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div className="anim-scaleIn" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, width: 400, maxWidth: '100%', padding: 28, textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🗑️</div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10 }}>Excluir conteúdo?</h3>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 24 }}>O conteúdo <strong>{confirmDelete.title}</strong> será removido permanentemente.</p>
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
