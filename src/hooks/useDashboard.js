import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useDashboard() {
  const [stats, setStats] = useState({
    total: 0, doing: 0, done: 0, overdue: 0,
    byMember: [], overdueTasks: [], projects: []
  })

  useEffect(() => { fetchStats() }, [])

  async function fetchStats() {
    const today = new Date().toISOString().split('T')[0]
    
    const { data: tasks } = await supabase
      .from('tasks').select('*')
    
    const { data: projects } = await supabase
      .from('projects').select('*')

    if (!tasks) return

    const total = tasks.length
    const doing = tasks.filter(t => 
      t.status === 'doing').length
    const done = tasks.filter(t => 
      t.status === 'done').length
    const overdueTasks = tasks.filter(t => 
      t.due_date && t.due_date < today && 
      t.status !== 'done')
    const overdue = overdueTasks.length

    // Agrupa por membro
    const memberMap = {}
    tasks.forEach(t => {
      if (!t.assignee) return
      if (!memberMap[t.assignee]) {
        memberMap[t.assignee] = { 
          name: t.assignee,
          initials: t.assignee_initials || '?',
          total: 0, overdue: 0 
        }
      }
      memberMap[t.assignee].total++
      if (t.due_date && t.due_date < today && 
          t.status !== 'done') {
        memberMap[t.assignee].overdue++
      }
    })

    setStats({
      total, doing, done, overdue,
      byMember: Object.values(memberMap),
      overdueTasks,
      projects: projects || []
    })
  }

  return { stats, refetch: fetchStats }
}
