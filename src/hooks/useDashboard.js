import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useDashboard() {
  const [stats, setStats] = useState({
    total: 0, doing: 0, done: 0, overdue: 0,
    byMember: [], overdueTasks: []
  })
  const [tasks, setTasks] = useState([])
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchStats() }, [])

  async function fetchStats() {
    try {
      const today = new Date().toISOString().split('T')[0]

      const { data: tasksData } = await supabase.from('tasks').select('*')
      const { data: projectsData } = await supabase.from('projects').select('*')

      const allTasks = tasksData || []
      const total = allTasks.length
      const doing = allTasks.filter(t => t.status === 'doing').length
      const done = allTasks.filter(t => t.status === 'done').length
      const overdueTasks = allTasks.filter(t => t.due_date && t.due_date < today && t.status !== 'done')
      const overdue = overdueTasks.length

      const memberMap = {}
      allTasks.forEach(t => {
        if (!t.assignee) return
        if (!memberMap[t.assignee]) {
          memberMap[t.assignee] = { name: t.assignee, initials: t.assignee_initials || '?', total: 0, overdue: 0 }
        }
        memberMap[t.assignee].total++
        if (t.due_date && t.due_date < today && t.status !== 'done') {
          memberMap[t.assignee].overdue++
        }
      })

      setStats({ total, doing, done, overdue, byMember: Object.values(memberMap), overdueTasks })
      setTasks(allTasks)
      setProjects(projectsData || [])
    } catch (err) {
      console.error('Erro dashboard:', err)
    } finally {
      setLoading(false)
    }
  }

  return { stats, tasks, projects, loading, refetch: fetchStats }
}
