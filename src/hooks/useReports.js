import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useReports() {
  const [data, setData] = useState({
    tasks: [], byPriority: {}, byMember: []
  })

  useEffect(() => { fetchReports() }, [])

  async function fetchReports() {
    const { data: tasks } = await supabase
      .from('tasks').select('*')
    
    if (!tasks) return

    const byPriority = {
      urgent: tasks.filter(t => 
        t.priority === 'urgent').length,
      medium: tasks.filter(t => 
        t.priority === 'medium').length,
      low: tasks.filter(t => 
        t.priority === 'low').length,
    }

    const memberMap = {}
    tasks.forEach(t => {
      if (!t.assignee) return
      if (!memberMap[t.assignee]) {
        memberMap[t.assignee] = {
          name: t.assignee,
          initials: t.assignee_initials || '?',
          created: 0, done: 0, overdue: 0
        }
      }
      memberMap[t.assignee].created++
      if (t.status === 'done') 
        memberMap[t.assignee].done++
      const today = new Date()
        .toISOString().split('T')[0]
      if (t.due_date && t.due_date < today && 
          t.status !== 'done')
        memberMap[t.assignee].overdue++
    })

    setData({
      tasks,
      byPriority,
      byMember: Object.values(memberMap)
    })
  }

  return { data, refetch: fetchReports }
}
