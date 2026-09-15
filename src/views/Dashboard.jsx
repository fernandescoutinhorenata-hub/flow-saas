import React from 'react';
import Avatar from '../components/Avatar.jsx';
import { useDashboard } from '../hooks/useDashboard.js';
import { useChannels } from '../hooks/useChannels.js';
import { useVideos } from '../hooks/useVideos.js';
import { formatDate } from '../utils.js';

function localKey(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export default function Dashboard({ onTaskClick }) {
  const { stats, tasks, projects, loading } = useDashboard();
  const { channels } = useChannels();
  const { videos } = useVideos();

  const today = localKey(new Date())
  const tomorrowDate = new Date()
  tomorrowDate.setDate(tomorrowDate.getDate() + 1)
  const tomorrow = localKey(tomorrowDate)

  const scheduled = (videos || []).filter(v => v.publish_date)
  const upcomingVideos = scheduled.filter(v => v.publish_date >= today && v.status !== 'publicado')
  const needProduce = upcomingVideos.length <= 1

  const projectsWithProgress = (projects || []).map(p => {
    const pTasks = (tasks || []).filter(t => t.project_id === p.id)
    const done = pTasks.filter(t => t.status === 'done').length
    return { ...p, total: pTasks.length, done, pct: pTasks.length ? Math.round((done / pTasks.length) * 100) : 0 }
  })

  const channelsWithVideos = (channels || []).map(c => {
    const cVideos = scheduled.filter(v => v.channel_id === c.id)
    const upcoming = cVideos.filter(v => v.publish_date >= today && v.status !== 'publicado')
    const next = [...upcoming].sort((a, b) => a.publish_date.localeCompare(b.publish_date))[0]
    return { ...c, count: cVideos.length, next }
  })

  if (loading) {
    return (
      <div style={{ flex: 1, padding: '24px 32px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
        <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 24, fontWeight: 700, color: 'var(--text-primary)' }}>Dashboard</h2>
        <div style={{ color: 'var(--text-secondary)' }}>Carregando dados do painel...</div>
      </div>
    );
  }

  const kpis = [
    { label: 'Total de tarefas', val: stats.total, color: 'var(--text-primary)' },
    { label: 'Em andamento', val: stats.doing, color: 'var(--status-medium)' },
    { label: 'Vídeos programados', val: upcomingVideos.length, color: 'var(--accent)' },
    { label: 'Canais', val: channels.length, color: 'var(--status-ok)' },
  ];

  return (
    <div style={{ flex: 1, padding: '24px 32px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
      <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 24, fontWeight: 700, color: 'var(--text-primary)' }}>Dashboard</h2>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16 }}>
        {kpis.map((m, i) => (
          <div key={i} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 10, padding: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={{ fontSize: 11, color: 'var(--text-secondary)', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 600 }}>{m.label}</span>
            <span style={{ fontSize: 32, fontFamily: "'Syne', sans-serif", fontWeight: 700, color: m.color }}>{m.val}</span>
          </div>
        ))}
      </div>

      {/* Alerta produzir conteúdo */}
      {needProduce && (
        <div style={{ background: '#FFB80015', border: '1px solid #FFB800', borderRadius: 12, padding: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#FFB800', marginBottom: 6 }}>⚠️ Precisa produzir conteúdo!</div>
          <div style={{ fontSize: 13, color: 'var(--text-primary)' }}>
            {upcomingVideos.length === 0
              ? 'Nenhum vídeo programado.'
              : `Falta apenas 1 vídeo programado — "${upcomingVideos[0].title}" publica ${upcomingVideos[0].publish_date === tomorrow ? 'amanhã' : formatDate(upcomingVideos[0].publish_date)}.`}
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Tarefas atrasadas */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 10, padding: 20 }}>
          <h3 style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 16 }}>Tarefas Atrasadas</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {(stats.overdueTasks || []).length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Nenhuma tarefa atrasada.</p>
            ) : (stats.overdueTasks || []).slice(0, 5).map(t => {
              const days = Math.max(1, Math.floor((new Date(today) - new Date(t.due_date + 'T00:00:00')) / (1000 * 60 * 60 * 24)));
              return (
                <div key={t.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
                  <div style={{ flex: 1, paddingRight: 12 }}>
                    <p style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500, marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.title}</p>
                    <p style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{t.assignee} <span style={{ color: 'var(--status-urgent)', marginLeft: 8 }}>{days} dias atrasada</span></p>
                  </div>
                  <button onClick={() => onTaskClick && onTaskClick(t)} style={{ background: 'transparent', border: '1px solid var(--accent)', borderRadius: 8, color: 'var(--accent)', fontSize: 11, padding: '6px 12px', cursor: 'pointer', whiteSpace: 'nowrap' }}>Ver tarefa</button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Progresso por Projeto */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 10, padding: 20 }}>
          <h3 style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 16 }}>Progresso por Projeto</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {projectsWithProgress.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Nenhum projeto encontrado.</p>
            ) : projectsWithProgress.map((p, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 13, color: 'var(--text-primary)', width: 120, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</span>
                <div style={{ flex: 1, height: 6, background: 'var(--border)', borderRadius: 99, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${p.pct}%`, background: p.pct === 100 ? 'var(--status-ok)' : 'var(--accent)', borderRadius: 99, transition: 'width 0.3s' }} />
                </div>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)', width: 40, textAlign: 'right', fontWeight: 600 }}>{p.pct}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Canais */}
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 10, padding: 20 }}>
        <h3 style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 16 }}>Canais</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {channelsWithVideos.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Nenhum canal criado ainda.</p>
          ) : channelsWithVideos.map(c => (
            <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 12, paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--accent-soft)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, flexShrink: 0 }}>
                {c.name.charAt(0).toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, color: 'var(--text-primary)', fontWeight: 500 }}>{c.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                  {c.count} {c.count === 1 ? 'vídeo programado' : 'vídeos programados'}
                  {c.next ? ` · próximo: ${formatDate(c.next.publish_date)}` : ''}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
