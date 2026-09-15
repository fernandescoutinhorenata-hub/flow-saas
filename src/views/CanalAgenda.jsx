import React, { useState } from 'react'
import { VIDEO_STAGES } from '../hooks/useVideos.js'
import { PRIORITY_COLORS } from '../data.js'

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const MONTHS = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']

function toKey(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

const selectStyle = {
  background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-primary)',
  borderRadius: 6, padding: '6px 10px', fontSize: 12, outline: 'none',
  fontFamily: "'DM Sans', sans-serif", colorScheme: 'dark',
}

export default function CanalAgenda({ videos, users, onVideoClick }) {
  const today = new Date()
  const [viewDate, setViewDate] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1))
  const [assigneeFilter, setAssigneeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()

  const filtered = (videos || []).filter(v => {
    if (assigneeFilter !== 'all' && v.assignee_id !== assigneeFilter) return false
    if (statusFilter !== 'all' && v.status !== statusFilter) return false
    return true
  })

  const byDate = {}
  let scheduledCount = 0
  filtered.forEach(v => {
    if (!v.publish_date) return
    if (!byDate[v.publish_date]) byDate[v.publish_date] = []
    byDate[v.publish_date].push(v)
    scheduledCount++
  })

  const startWeekday = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const cells = []
  for (let i = 0; i < startWeekday; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d))
  while (cells.length % 7 !== 0) cells.push(null)

  const todayKey = toKey(today)
  const hasFilter = assigneeFilter !== 'all' || statusFilter !== 'all'

  function prevMonth() { setViewDate(new Date(year, month - 1, 1)) }
  function nextMonth() { setViewDate(new Date(year, month + 1, 1)) }
  function goToday() { setViewDate(new Date(today.getFullYear(), today.getMonth(), 1)) }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', borderBottom: '1px solid var(--border)', flexShrink: 0, flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={prevMonth} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', color: 'var(--text-primary)', borderRadius: 6, width: 30, height: 30, cursor: 'pointer', fontSize: 16 }}>‹</button>
          <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 16, color: 'var(--text-primary)', minWidth: 160, textAlign: 'center' }}>
            {MONTHS[month]} {year}
          </div>
          <button onClick={nextMonth} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', color: 'var(--text-primary)', borderRadius: 6, width: 30, height: 30, cursor: 'pointer', fontSize: 16 }}>›</button>
          <button onClick={goToday} style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-secondary)', borderRadius: 6, padding: '6px 12px', fontSize: 12, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>Hoje</button>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <select value={assigneeFilter} onChange={e => setAssigneeFilter(e.target.value)} style={selectStyle}>
            <option value="all">Todos responsáveis</option>
            {(users || []).map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={selectStyle}>
            <option value="all">Todos status</option>
            {VIDEO_STAGES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{scheduledCount} vídeo(s)</span>
        </div>
      </div>

      {/* Weekdays */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        {WEEKDAYS.map(d => (
          <div key={d} style={{ padding: '8px', textAlign: 'center', fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', flex: 1, minHeight: 0, overflow: 'auto' }}>
        {cells.map((cell, i) => {
          if (!cell) {
            return <div key={`empty-${i}`} style={{ borderRight: '1px solid var(--border)', borderBottom: '1px solid var(--border)', background: 'var(--bg-base)' }} />
          }
          const key = toKey(cell)
          const dayVideos = byDate[key] || []
          const isToday = key === todayKey
          const isWeekend = cell.getDay() === 0 || cell.getDay() === 6
          return (
            <div key={key} style={{ borderRight: '1px solid var(--border)', borderBottom: '1px solid var(--border)', background: isToday ? 'var(--accent-soft)' : (isWeekend ? 'var(--bg-base)' : 'var(--bg-surface)'), padding: 6, minHeight: 110, overflow: 'hidden' }}>
              <div style={{ fontSize: 12, fontWeight: isToday ? 700 : 500, color: isToday ? 'var(--accent)' : (isWeekend ? 'var(--text-disabled)' : 'var(--text-secondary)'), marginBottom: 6 }}>
                {cell.getDate()}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {dayVideos.map(v => (
                  <div
                    key={v.id}
                    onClick={() => onVideoClick && onVideoClick(v)}
                    title={v.title}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--bg-card)', border: '1px solid var(--border)', borderLeft: `3px solid ${PRIORITY_COLORS[v.priority] || '#7A7A7A'}`, borderRadius: 5, padding: '4px 6px', cursor: 'pointer', transition: 'all 0.15s' }}
                    onMouseOver={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                    onMouseOut={e => e.currentTarget.style.borderColor = 'var(--border)'}
                  >
                    <span style={{ fontSize: 11, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1 }}>{v.title}</span>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {scheduledCount === 0 && (
        <div style={{ textAlign: 'center', padding: '14px', color: 'var(--text-disabled)', fontSize: 12, flexShrink: 0 }}>
          {hasFilter ? 'Nenhum vídeo para os filtros atuais.' : 'Nenhum vídeo com data de publicação neste mês.'}
        </div>
      )}
    </div>
  )
}
