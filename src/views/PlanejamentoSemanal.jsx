import React, { useState } from 'react'
import Avatar from '../components/Avatar.jsx'
import { useTasks } from '../hooks/useTasks.js'
import { useGoals } from '../hooks/useGoals.js'
import { useChannels } from '../hooks/useChannels.js'
import { useUsers } from '../hooks/useUsers.js'
import { useAuth } from '../context/AuthContext.jsx'

const DAYS = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo']
const PRIORITIES = [
  { key: 'low', label: 'Baixa', color: '#00FF87' },
  { key: 'medium', label: 'Média', color: '#FFB800' },
  { key: 'high', label: 'Alta', color: '#FF7A00' },
  { key: 'urgent', label: 'Urgente', color: '#FF4C4C' },
]
const TASK_TYPES = ['tarefa', 'meta', 'reunião', 'publicação', 'produção', 'outro']
const RECURRENCES = [
  { key: 'none', label: 'Não repetir' },
  { key: 'daily', label: 'Todos os dias' },
  { key: 'weekdays', label: 'Dias úteis' },
  { key: 'weekly', label: 'Semanalmente' },
  { key: 'monthly', label: 'Mensalmente' },
]

function localKey(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function startOfWeek(d) {
  const date = new Date(d)
  const day = date.getDay()
  const diff = day === 0 ? -6 : 1 - day
  date.setDate(date.getDate() + diff)
  date.setHours(0, 0, 0, 0)
  return date
}

function addDays(date, n) {
  const d = new Date(date)
  d.setDate(d.getDate() + n)
  return d
}

function nextRecurringDate(dateStr, recurrence) {
  const d = new Date(dateStr + 'T00:00:00')
  switch (recurrence) {
    case 'daily': d.setDate(d.getDate() + 1); break
    case 'weekdays': do { d.setDate(d.getDate() + 1) } while (d.getDay() === 0 || d.getDay() === 6); break
    case 'weekly': d.setDate(d.getDate() + 7); break
    case 'monthly': d.setMonth(d.getMonth() + 1); break
    default: return null
  }
  return localKey(d)
}

function fmtDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('pt-BR')
}

function TaskFormModal({ task, channels, users, onClose, onSave, onDelete }) {
  const [title, setTitle] = useState(task?.title || '')
  const [description, setDescription] = useState(task?.description || '')
  const [date, setDate] = useState(task?.date || '')
  const [priority, setPriority] = useState(task?.priority || 'medium')
  const [assigneeId, setAssigneeId] = useState(task?.assignee_id || '')
  const [taskType, setTaskType] = useState(task?.task_type || 'tarefa')
  const [recurrence, setRecurrence] = useState(task?.recurrence || 'none')
  const [channelId, setChannelId] = useState(task?.channel_id || '')

  function submit() {
    if (!title.trim()) return
    const assigneeUser = (users || []).find(u => u.id === assigneeId)
    onSave({
      title: title.trim(),
      description,
      date: date || null,
      priority,
      task_type: taskType,
      recurrence,
      channel_id: channelId || null,
      assignee: assigneeUser?.name || null,
      assignee_id: assigneeUser?.id || null,
      assignee_initials: assigneeUser?.initials || null,
    })
  }

  const inputStyle = { width: '100%', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)', fontSize: 14, padding: '10px 12px', outline: 'none', fontFamily: "'DM Sans', sans-serif" }
  const labelStyle = { fontSize: 11, color: 'var(--text-secondary)', letterSpacing: '0.12em', textTransform: 'uppercase', display: 'block', marginBottom: 6, fontWeight: 600 }

  return (
    <div onClick={e => { if (e.target === e.currentTarget) onClose() }} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div className="anim-scaleIn" style={{ background: 'var(--bg-modal)', border: '1px solid var(--border)', borderRadius: 16, width: 480, maxWidth: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 64px rgba(0,0,0,0.7)', padding: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 18, color: 'var(--text-primary)' }}>{task ? 'Editar Tarefa' : 'Nova Tarefa'}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: 20 }}>✕</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={labelStyle}>Título *</label>
            <input autoFocus value={title} onChange={e => setTitle(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()} placeholder="Título da tarefa..." style={inputStyle} />
          </div>

          <div>
            <label style={labelStyle}>Descrição</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Detalhes..." style={{ ...inputStyle, height: 70, resize: 'vertical' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>Data</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ ...inputStyle, colorScheme: 'dark' }} />
            </div>
            <div>
              <label style={labelStyle}>Prioridade</label>
              <select value={priority} onChange={e => setPriority(e.target.value)} style={{ ...inputStyle, colorScheme: 'dark' }}>
                {PRIORITIES.map(p => <option key={p.key} value={p.key}>{p.label}</option>)}
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
              <label style={labelStyle}>Canal</label>
              <select value={channelId} onChange={e => setChannelId(e.target.value)} style={{ ...inputStyle, colorScheme: 'dark' }}>
                <option value="">Sem canal</option>
                {(channels || []).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Tipo</label>
              <select value={taskType} onChange={e => setTaskType(e.target.value)} style={{ ...inputStyle, colorScheme: 'dark' }}>
                {TASK_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Recorrência</label>
              <select value={recurrence} onChange={e => setRecurrence(e.target.value)} style={{ ...inputStyle, colorScheme: 'dark' }}>
                {RECURRENCES.map(r => <option key={r.key} value={r.key}>{r.label}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
            {task && (
              <button onClick={() => onDelete(task)} style={{ background: 'transparent', border: '1px solid #FF4C4C', color: '#FF4C4C', borderRadius: 8, padding: 12, cursor: 'pointer', fontSize: 13, fontWeight: 500 }}>Excluir</button>
            )}
            <button onClick={submit} style={{ flex: 1, background: 'var(--accent)', color: '#0D0D0D', border: 'none', borderRadius: 8, padding: 12, cursor: 'pointer', fontSize: 14, fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>
              {task ? 'Salvar' : 'Criar Tarefa'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function GoalModal({ goal, channels, users, onClose, onSave }) {
  const [title, setTitle] = useState(goal?.title || '')
  const [description, setDescription] = useState(goal?.description || '')
  const [target, setTarget] = useState(goal?.target != null ? String(goal.target) : '')
  const [current, setCurrent] = useState(goal?.current != null ? String(goal.current) : '0')
  const [unit, setUnit] = useState(goal?.unit || '')
  const [channelId, setChannelId] = useState(goal?.channel_id || '')
  const [assigneeId, setAssigneeId] = useState(goal?.assignee_id || '')

  function submit() {
    if (!title.trim()) return
    const assigneeUser = (users || []).find(u => u.id === assigneeId)
    onSave({
      title: title.trim(),
      description,
      target: target === '' ? null : Number(target),
      current: current === '' ? 0 : Number(current),
      unit: unit || null,
      channel_id: channelId || null,
      assignee: assigneeUser?.name || null,
      assignee_id: assigneeUser?.id || null,
    })
  }

  const inputStyle = { width: '100%', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)', fontSize: 14, padding: '10px 12px', outline: 'none', fontFamily: "'DM Sans', sans-serif" }
  const labelStyle = { fontSize: 11, color: 'var(--text-secondary)', letterSpacing: '0.12em', textTransform: 'uppercase', display: 'block', marginBottom: 6, fontWeight: 600 }

  return (
    <div onClick={e => { if (e.target === e.currentTarget) onClose() }} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div className="anim-scaleIn" style={{ background: 'var(--bg-modal)', border: '1px solid var(--border)', borderRadius: 16, width: 440, maxWidth: '100%', maxHeight: '90vh', overflowY: 'auto', padding: 28, boxShadow: '0 24px 64px rgba(0,0,0,0.7)' }}>
        <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 18, color: 'var(--text-primary)', marginBottom: 20 }}>{goal ? 'Editar Meta' : 'Nova Meta'}</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={labelStyle}>Título *</label>
            <input autoFocus value={title} onChange={e => setTitle(e.target.value)} placeholder="Ex: Publicar 21 vídeos" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Descrição</label>
            <input value={description} onChange={e => setDescription(e.target.value)} placeholder="Opcional" style={inputStyle} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            <div>
              <label style={labelStyle}>Meta</label>
              <input type="number" min="0" value={target} onChange={e => setTarget(e.target.value)} placeholder="21" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Realizado</label>
              <input type="number" min="0" value={current} onChange={e => setCurrent(e.target.value)} placeholder="0" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Unidade</label>
              <input value={unit} onChange={e => setUnit(e.target.value)} placeholder="vídeos" style={inputStyle} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>Canal</label>
              <select value={channelId} onChange={e => setChannelId(e.target.value)} style={{ ...inputStyle, colorScheme: 'dark' }}>
                <option value="">Geral</option>
                {(channels || []).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
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
          <button onClick={submit} style={{ background: 'var(--accent)', color: '#0D0D0D', border: 'none', borderRadius: 8, padding: 12, cursor: 'pointer', fontSize: 14, fontWeight: 600, fontFamily: "'DM Sans', sans-serif", marginTop: 4 }}>
            {goal ? 'Salvar' : 'Criar Meta'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function PlanejamentoSemanal({ selectedProject, addToast }) {
  const { allTasks, createTask, updateTask, deleteTask } = useTasks(selectedProject?.id)
  const { goals, createGoal, updateGoal, deleteGoal } = useGoals()
  const { channels } = useChannels()
  const { users } = useUsers()
  const { currentUser } = useAuth()

  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()))
  const [filter, setFilter] = useState('all')
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [goalModal, setGoalModal] = useState(null)
  const [showGoals, setShowGoals] = useState(true)
  const [dragId, setDragId] = useState(null)

  const today = new Date()
  const todayKey = localKey(today)
  const weekEnd = addDays(weekStart, 6)
  const weekStartKey = localKey(weekStart)
  const weekEndKey = localKey(weekEnd)

  const days = DAYS.map((name, i) => ({ name, date: addDays(weekStart, i), key: localKey(addDays(weekStart, i)) }))

  const filtered = (allTasks || []).filter(t => {
    if (filter === 'mine') return t.assignee_initials === currentUser?.initials || t.assignee === currentUser?.name
    if (filter === 'overdue') return t.date && t.date < todayKey && !t.done
    if (filter === 'pending') return !t.done
    if (filter === 'done') return t.done
    return true
  })

  const inbox = filtered.filter(t => !t.date)
  const byDate = {}
  filtered.forEach(t => { if (t.date) { byDate[t.date] = byDate[t.date] || []; byDate[t.date].push(t) } })

  const weekTasks = filtered.filter(t => t.date && t.date >= weekStartKey && t.date <= weekEndKey)
  const doneCount = weekTasks.filter(t => t.done).length
  const progressPct = weekTasks.length ? Math.round((doneCount / weekTasks.length) * 100) : 0

  const weekGoals = goals.filter(g => {
    if (g.status === 'concluida') return false
    return true
  })

  function prevWeek() { setWeekStart(addDays(weekStart, -7)) }
  function nextWeek() { setWeekStart(addDays(weekStart, 7)) }
  function goToday() { setWeekStart(startOfWeek(new Date())) }

  async function handleSaveTask(data) {
    try {
      if (editingTask) {
        await updateTask(editingTask.id, data)
        addToast('✅ Tarefa atualizada.')
      } else {
        await createTask(data)
        addToast('✅ Tarefa criada.')
      }
      setShowTaskModal(false)
      setEditingTask(null)
    } catch {
      addToast('❌ Erro ao salvar tarefa.')
    }
  }

  async function handleDrop(e, dateKey) {
    e.preventDefault()
    if (!dragId) return
    try {
      await updateTask(dragId, { date: dateKey || null })
      addToast(dateKey ? 'Tarefa movida.' : 'Tarefa movida para a caixa de entrada.')
    } catch {
      addToast('❌ Erro ao mover tarefa.')
    }
    setDragId(null)
  }

  async function toggleDone(task) {
    const nextDone = !task.done
    try {
      await updateTask(task.id, { done: nextDone })
      if (nextDone && task.recurrence && task.recurrence !== 'none' && task.date) {
        const next = nextRecurringDate(task.date, task.recurrence)
        if (next) {
          await createTask({ title: task.title, description: task.description, priority: task.priority, task_type: task.task_type, recurrence: task.recurrence, assignee: task.assignee, assignee_id: task.assignee_id, assignee_initials: task.assignee_initials, date: next })
          addToast('✅ Concluída. Nova ocorrência criada.')
        } else {
          addToast('✅ Tarefa concluída.')
        }
      } else {
        addToast('✅ Tarefa concluída.')
      }
    } catch {
      addToast('❌ Erro ao atualizar tarefa.')
    }
  }

  async function handleDeleteTask(task) {
    try {
      await deleteTask(task.id)
      addToast('✅ Tarefa excluída.')
      setEditingTask(null)
      setShowTaskModal(false)
    } catch {
      addToast('❌ Erro ao excluir tarefa.')
    }
  }

  async function handleSaveGoal(data) {
    try {
      if (goalModal && goalModal.id) {
        await updateGoal(goalModal.id, data)
        addToast('✅ Meta atualizada.')
      } else {
        await createGoal({ ...data, start_date: weekStartKey, end_date: weekEndKey, status: 'pendente' })
        addToast('✅ Meta criada.')
      }
      setGoalModal(null)
    } catch {
      addToast('❌ Erro ao salvar meta.')
    }
  }

  async function handleGoalProgress(goal, delta) {
    const cur = Number(goal.current) || 0
    const next = Math.max(0, cur + delta)
    try {
      await updateGoal(goal.id, { current: next, status: goal.target != null && next >= Number(goal.target) ? 'concluida' : 'pendente' })
    } catch {
      addToast('❌ Erro ao atualizar meta.')
    }
  }

  async function handleDeleteGoal(goal) {
    try {
      await deleteGoal(goal.id)
      addToast('✅ Meta excluída.')
    } catch {
      addToast('❌ Erro ao excluir meta.')
    }
  }

  const pColor = (p) => PRIORITIES.find(x => x.key === p)?.color || '#7A7A7A'

  return (
    <div style={{ flex: 1, overflow: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 20, minWidth: 0 }}>
      {/* Cabeçalho */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Planejamento semanal</h2>
          <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{fmtDate(weekStartKey)} a {fmtDate(weekEndKey)}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button onClick={prevWeek} style={navBtn}>‹</button>
          <button onClick={goToday} style={{ ...navBtn, width: 'auto', padding: '6px 12px' }}>Hoje</button>
          <button onClick={nextWeek} style={navBtn}>›</button>
          <button onClick={() => { setEditingTask(null); setShowTaskModal(true) }} style={{ background: 'var(--accent)', color: '#0D0D0D', border: 'none', padding: '8px 16px', borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: "'Syne', sans-serif" }}>+ Nova tarefa</button>
        </div>
      </div>

      {/* Progresso + filtros */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 220 }}>
          <div style={{ flex: 1, height: 8, background: 'var(--border)', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progressPct}%`, background: 'var(--accent)', borderRadius: 99, transition: 'width 0.3s' }} />
          </div>
          <span style={{ fontSize: 13, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{doneCount}/{weekTasks.length} concluídas</span>
        </div>
        <div style={{ display: 'flex', gap: 2 }}>
          {[{ key: 'all', label: 'Todas' }, { key: 'mine', label: 'Minhas' }, { key: 'overdue', label: 'Atrasadas' }, { key: 'pending', label: 'Pendentes' }, { key: 'done', label: 'Concluídas' }].map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: filter === f.key ? 'var(--text-primary)' : 'var(--text-secondary)', fontSize: 13, padding: '6px 10px', borderRadius: 6, borderBottom: filter === f.key ? '2px solid var(--accent)' : '2px solid transparent', fontFamily: "'DM Sans', sans-serif", fontWeight: filter === f.key ? 600 : 400 }}>{f.label}</button>
          ))}
        </div>
      </div>

      {/* Metas da semana */}
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <h3 style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer', margin: 0 }} onClick={() => setShowGoals(!showGoals)}>
            {showGoals ? '▾' : '▸'} Metas da semana
          </h3>
          <button onClick={() => setGoalModal({})} style={{ background: 'transparent', border: '1px solid var(--accent)', color: 'var(--accent)', borderRadius: 6, padding: '4px 12px', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>+ Nova meta</button>
        </div>
        {showGoals && (
          weekGoals.length === 0 ? (
            <p style={{ color: 'var(--text-disabled)', fontSize: 13 }}>Nenhuma meta cadastrada para esta semana.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {weekGoals.map(g => {
                const target = Number(g.target)
                const cur = Number(g.current) || 0
                const pct = target > 0 ? Math.min(100, Math.round((cur / target) * 100)) : 0
                const done = g.status === 'concluida' || (target > 0 && cur >= target)
                return (
                  <div key={g.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500, textDecoration: done ? 'line-through' : 'none' }}>{g.title}</span>
                        <button onClick={() => setGoalModal(g)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 12, padding: 2 }} title="Editar">✏️</button>
                        <button onClick={() => handleDeleteGoal(g)} style={{ background: 'none', border: 'none', color: '#FF4C4C', cursor: 'pointer', fontSize: 12, padding: 2 }} title="Excluir">🗑️</button>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                        <div style={{ flex: 1, height: 5, background: 'var(--border)', borderRadius: 99, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${pct}%`, background: done ? 'var(--status-ok)' : 'var(--accent)', borderRadius: 99 }} />
                        </div>
                        <span style={{ fontSize: 11, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{cur}{target > 0 ? `/${target}` : ''}{g.unit ? ` ${g.unit}` : ''}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button onClick={() => handleGoalProgress(g, -1)} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-secondary)', borderRadius: 5, width: 26, height: 26, cursor: 'pointer', fontSize: 14 }}>−</button>
                      <button onClick={() => handleGoalProgress(g, 1)} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-secondary)', borderRadius: 5, width: 26, height: 26, cursor: 'pointer', fontSize: 14 }}>+</button>
                    </div>
                  </div>
                )
              })}
            </div>
          )
        )}
      </div>

      {/* Quadro semanal */}
      <div style={{ display: 'flex', gap: 10, overflowX: 'auto', flex: 1, alignItems: 'stretch', minHeight: 300 }}>
        {/* Caixa de entrada */}
        <div
          style={{ width: 200, flexShrink: 0, display: 'flex', flexDirection: 'column' }}
          onDragOver={e => e.preventDefault()}
          onDrop={e => handleDrop(e, null)}
        >
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 12, display: 'flex', flexDirection: 'column', flex: 1, minHeight: 120 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Caixa de entrada</span>
              <span style={{ color: 'var(--text-disabled)', fontSize: 11 }}>{inbox.length}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, overflowY: 'auto' }}>
              {inbox.map(t => <TaskCard key={t.id} task={t} isDragging={dragId === t.id} onDragStart={e => { e.dataTransfer.effectAllowed = 'move'; setDragId(t.id) }} onDragEnd={() => setDragId(null)} onToggle={() => toggleDone(t)} onClick={() => { setEditingTask(t); setShowTaskModal(true) }} pColor={pColor} />)}
              {inbox.length === 0 && <div style={{ color: 'var(--text-disabled)', fontSize: 12, textAlign: 'center', padding: 16 }}>Sua caixa de entrada está vazia.</div>}
            </div>
          </div>
        </div>

        {/* Dias da semana */}
        {days.map(d => {
          const dayTasks = byDate[d.key] || []
          const isToday = d.key === todayKey
          return (
            <div
              key={d.key}
              style={{ flex: '1 1 0', minWidth: 150, display: 'flex', flexDirection: 'column' }}
              onDragOver={e => e.preventDefault()}
              onDrop={e => handleDrop(e, d.key)}
            >
              <div style={{ background: isToday ? 'var(--accent-soft)' : 'var(--bg-surface)', border: isToday ? '1px solid var(--accent)' : '1px solid var(--border)', borderRadius: 12, padding: 12, display: 'flex', flexDirection: 'column', flex: 1, minHeight: 120 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, alignItems: 'center' }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: isToday ? 'var(--accent)' : 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{d.name}</span>
                  <span style={{ color: 'var(--text-disabled)', fontSize: 11 }}>{d.date.getDate()}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1, overflowY: 'auto' }}>
                  {dayTasks.map(t => <TaskCard key={t.id} task={t} isDragging={dragId === t.id} onDragStart={e => { e.dataTransfer.effectAllowed = 'move'; setDragId(t.id) }} onDragEnd={() => setDragId(null)} onToggle={() => toggleDone(t)} onClick={() => { setEditingTask(t); setShowTaskModal(true) }} pColor={pColor} />)}
                  {dayTasks.length === 0 && <div style={{ color: 'var(--text-disabled)', fontSize: 12, textAlign: 'center', padding: 16 }}>Nenhuma tarefa.</div>}
                </div>
                <button onClick={() => { setEditingTask(null); setShowTaskModal(true) }} style={{ marginTop: 10, background: 'none', border: '1px dashed var(--border)', borderRadius: 6, color: 'var(--text-disabled)', fontSize: 12, padding: '6px', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>+</button>
              </div>
            </div>
          )
        })}
      </div>

      {showTaskModal && (
        <TaskFormModal task={editingTask} channels={channels} users={users} onClose={() => { setShowTaskModal(false); setEditingTask(null) }} onSave={handleSaveTask} onDelete={handleDeleteTask} />
      )}
      {goalModal && (
        <GoalModal goal={goalModal.id ? goalModal : null} channels={channels} users={users} onClose={() => setGoalModal(null)} onSave={handleSaveGoal} />
      )}
    </div>
  )
}

const navBtn = { background: 'var(--bg-surface)', border: '1px solid var(--border)', color: 'var(--text-primary)', borderRadius: 6, width: 30, height: 30, cursor: 'pointer', fontSize: 15, fontFamily: "'DM Sans', sans-serif" }

function TaskCard({ task, isDragging, onDragStart, onDragEnd, onToggle, onClick, pColor }) {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderLeft: `3px solid ${pColor(task.priority)}`, borderRadius: 8, padding: '8px 10px', cursor: 'pointer', opacity: isDragging ? 0.35 : 1, display: 'flex', alignItems: 'center', gap: 8 }}
    >
      <div onClick={onToggle} style={{ width: 15, height: 15, borderRadius: 4, border: task.done ? '1.5px solid var(--accent)' : '1.5px solid var(--border)', background: task.done ? 'var(--accent-soft)' : 'transparent', flexShrink: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {task.done && <span style={{ color: 'var(--accent)', fontSize: 10 }}>✓</span>}
      </div>
      <div onClick={onClick} style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, color: 'var(--text-primary)', textDecoration: task.done ? 'line-through' : 'none', opacity: task.done ? 0.6 : 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{task.title}</div>
        {task.task_type && task.task_type !== 'tarefa' && <div style={{ fontSize: 9, color: 'var(--text-disabled)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{task.task_type}</div>}
      </div>
      {task.assignee_initials && <Avatar initials={task.assignee_initials} size={18} />}
    </div>
  )
}
