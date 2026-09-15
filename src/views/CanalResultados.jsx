import React, { useState } from 'react'
import { useVideos } from '../hooks/useVideos.js'
import { useVideoMetrics } from '../hooks/useVideoMetrics.js'

function fmt(n) {
  return (Number(n) || 0).toLocaleString('pt-BR')
}

function money(n) {
  return 'R$ ' + (Number(n) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function EvolutionChart({ data }) {
  if (data.length < 2) {
    return (
      <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--text-disabled)', fontSize: 12 }}>
        Registre ao menos 2 medições para visualizar a evolução.
      </div>
    )
  }

  const W = 640
  const H = 180
  const pad = 28
  const max = Math.max(...data.map(d => d.views), 1)
  const stepX = (W - pad * 2) / (data.length - 1)

  const points = data.map((d, i) => {
    const x = pad + i * stepX
    const y = H - pad - (d.views / max) * (H - pad * 2)
    return { x, y, d }
  })

  return (
    <div>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ display: 'block', height: 180 }}>
        <polyline
          points={points.map(p => `${p.x},${p.y}`).join(' ')}
          fill="none"
          stroke="var(--accent)"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="3.5" fill="var(--accent)" />
        ))}
      </svg>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, padding: '0 4px' }}>
        {points.map((p, i) => (
          <span key={i} style={{ fontSize: 10, color: 'var(--text-disabled)', transform: 'rotate(-30deg)', transformOrigin: 'top left' }}>
            {p.d.date.slice(5)}
          </span>
        ))}
      </div>
    </div>
  )
}

function MetricsFormModal({ videos, onClose, onSubmit }) {
  const today = new Date().toISOString().split('T')[0]
  const [videoId, setVideoId] = useState(videos?.[0]?.id || '')
  const [snapshotDate, setSnapshotDate] = useState(today)
  const [views, setViews] = useState('')
  const [likes, setLikes] = useState('')
  const [comments, setComments] = useState('')
  const [watchHours, setWatchHours] = useState('')
  const [subscribers, setSubscribers] = useState('')
  const [revenue, setRevenue] = useState('')

  function handleSubmit() {
    if (!videoId) return
    onSubmit({
      video_id: videoId,
      snapshot_date: snapshotDate,
      views: Number(views) || 0,
      likes: Number(likes) || 0,
      comments: Number(comments) || 0,
      watch_hours: Number(watchHours) || 0,
      subscribers_gained: Number(subscribers) || 0,
      revenue: Number(revenue) || 0,
    })
  }

  const inputStyle = {
    width: '100%', background: 'var(--bg-card)', border: '1px solid var(--border)',
    borderRadius: 8, color: 'var(--text-primary)', fontSize: 13, padding: '9px 11px',
    outline: 'none', fontFamily: "'DM Sans', sans-serif",
  }
  const labelStyle = { fontSize: 11, color: 'var(--text-secondary)', letterSpacing: '0.12em', textTransform: 'uppercase', display: 'block', marginBottom: 6, fontWeight: 600 }

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
    >
      <div className="anim-scaleIn" style={{ background: 'var(--bg-modal)', border: '1px solid var(--border)', borderRadius: 16, width: 460, maxWidth: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 64px rgba(0,0,0,0.7)', padding: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 18, color: 'var(--text-primary)' }}>Registrar Métricas</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: 20 }}>✕</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={labelStyle}>Vídeo</label>
            <select value={videoId} onChange={e => setVideoId(e.target.value)} style={{ ...inputStyle, colorScheme: 'dark' }}>
              {(videos || []).map(v => <option key={v.id} value={v.id}>{v.title}</option>)}
            </select>
          </div>

          <div>
            <label style={labelStyle}>Data da medição</label>
            <input type="date" value={snapshotDate} onChange={e => setSnapshotDate(e.target.value)} style={{ ...inputStyle, colorScheme: 'dark' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>Views</label>
              <input type="number" min="0" value={views} onChange={e => setViews(e.target.value)} placeholder="0" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Curtidas</label>
              <input type="number" min="0" value={likes} onChange={e => setLikes(e.target.value)} placeholder="0" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Comentários</label>
              <input type="number" min="0" value={comments} onChange={e => setComments(e.target.value)} placeholder="0" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Horas assistidas</label>
              <input type="number" min="0" step="0.1" value={watchHours} onChange={e => setWatchHours(e.target.value)} placeholder="0" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Inscritos ganhos</label>
              <input type="number" min="0" value={subscribers} onChange={e => setSubscribers(e.target.value)} placeholder="0" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Receita (R$)</label>
              <input type="number" min="0" step="0.01" value={revenue} onChange={e => setRevenue(e.target.value)} placeholder="0" style={inputStyle} />
            </div>
          </div>

          <button onClick={handleSubmit} style={{ background: 'var(--accent)', color: '#0D0D0D', border: 'none', borderRadius: 8, padding: 11, cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: "'DM Sans', sans-serif", marginTop: 8 }}>
            Salvar Métricas
          </button>
        </div>
      </div>
    </div>
  )
}

export default function CanalResultados({ addToast }) {
  const { videos } = useVideos()
  const { metrics, loading, upsertMetric, deleteMetric } = useVideoMetrics()
  const [showModal, setShowModal] = useState(false)

  const latestByVideo = {}
  metrics.forEach(m => {
    const cur = latestByVideo[m.video_id]
    if (!cur || m.snapshot_date > cur.snapshot_date) latestByVideo[m.video_id] = m
  })

  const kpis = { views: 0, likes: 0, comments: 0, revenue: 0, subscribers: 0, watchHours: 0 }
  Object.values(latestByVideo).forEach(m => {
    kpis.views += Number(m.views) || 0
    kpis.likes += Number(m.likes) || 0
    kpis.comments += Number(m.comments) || 0
    kpis.revenue += Number(m.revenue) || 0
    kpis.subscribers += Number(m.subscribers_gained) || 0
    kpis.watchHours += Number(m.watch_hours) || 0
  })

  const byDate = {}
  metrics.forEach(m => {
    if (!byDate[m.snapshot_date]) byDate[m.snapshot_date] = 0
    byDate[m.snapshot_date] += Number(m.views) || 0
  })
  const evolution = Object.entries(byDate).sort((a, b) => a[0].localeCompare(b[0])).map(([date, views]) => ({ date, views }))

  const rows = (videos || []).filter(v => latestByVideo[v.id]).map(v => ({ video: v, metric: latestByVideo[v.id] }))

  async function handleSubmitMetric(metric) {
    try {
      await upsertMetric(metric)
      addToast('✅ Métricas salvas!')
      setShowModal(false)
    } catch {
      addToast('❌ Erro ao salvar métricas.')
    }
  }

  async function handleDeleteMetric(metricId) {
    try {
      await deleteMetric(metricId)
      addToast('✅ Medição removida.')
    } catch {
      addToast('❌ Erro ao remover medição.')
    }
  }

  const kpiCards = [
    { label: 'Views totais', value: fmt(kpis.views), color: 'var(--text-primary)' },
    { label: 'Curtidas', value: fmt(kpis.likes), color: 'var(--status-ok)' },
    { label: 'Receita', value: money(kpis.revenue), color: 'var(--accent)' },
    { label: 'Inscritos ganhos', value: fmt(kpis.subscribers), color: 'var(--status-medium)' },
  ]

  return (
    <div style={{ flex: 1, overflow: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>Resultados</h3>
        <button
          onClick={() => setShowModal(true)}
          style={{ background: 'var(--accent)', color: '#0D0D0D', border: 'none', padding: '8px 16px', borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: "'Syne', sans-serif" }}
        >
          + Registrar Métricas
        </button>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16 }}>
        {kpiCards.map((c, i) => (
          <div key={i} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 10, padding: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={{ fontSize: 11, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 600 }}>{c.label}</span>
            <span style={{ fontSize: 26, fontFamily: "'Syne', sans-serif", fontWeight: 700, color: c.color }}>{c.value}</span>
          </div>
        ))}
      </div>

      {/* Evolução */}
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 10, padding: 20 }}>
        <h4 style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>Evolução de Views</h4>
        {loading ? (
          <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Carregando...</div>
        ) : (
          <EvolutionChart data={evolution} />
        )}
      </div>

      {/* Tabela por vídeo */}
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 10, padding: 20 }}>
        <h4 style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>Desempenho por Vídeo</h4>
        {rows.length === 0 ? (
          <div style={{ color: 'var(--text-disabled)', fontSize: 13, padding: '16px 0', textAlign: 'center' }}>
            Nenhuma métrica registrada ainda.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '10px 8px', fontSize: 11, color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Vídeo</th>
                <th style={{ padding: '10px 8px', fontSize: 11, color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Views</th>
                <th style={{ padding: '10px 8px', fontSize: 11, color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Curtidas</th>
                <th style={{ padding: '10px 8px', fontSize: 11, color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Coment.</th>
                <th style={{ padding: '10px 8px', fontSize: 11, color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Receita</th>
                <th style={{ padding: '10px 8px', fontSize: 11, color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Últ. medição</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ video, metric }) => (
                <tr key={video.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '10px 8px', fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>{video.title}</td>
                  <td style={{ padding: '10px 8px', fontSize: 13, color: 'var(--text-primary)' }}>{fmt(metric.views)}</td>
                  <td style={{ padding: '10px 8px', fontSize: 13, color: 'var(--text-primary)' }}>{fmt(metric.likes)}</td>
                  <td style={{ padding: '10px 8px', fontSize: 13, color: 'var(--text-primary)' }}>{fmt(metric.comments)}</td>
                  <td style={{ padding: '10px 8px', fontSize: 13, color: 'var(--accent)', fontWeight: 600 }}>{money(metric.revenue)}</td>
                  <td style={{ padding: '10px 8px', fontSize: 12, color: 'var(--text-secondary)' }}>{metric.snapshot_date ? new Date(metric.snapshot_date + 'T00:00:00').toLocaleDateString('pt-BR') : '-'}</td>
                  <td style={{ padding: '10px 8px', textAlign: 'right' }}>
                    <button onClick={() => handleDeleteMetric(metric.id)} title="Remover medição" style={{ background: 'none', border: 'none', color: '#FF4C4C', cursor: 'pointer', fontSize: 14 }}>✕</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <MetricsFormModal videos={videos} onClose={() => setShowModal(false)} onSubmit={handleSubmitMetric} />
      )}
    </div>
  )
}
