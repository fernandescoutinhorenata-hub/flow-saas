import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useTasks() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTasks()
    
    const channel = supabase
      .channel('tasks')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'tasks' },
        () => fetchTasks()
      )
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [])

  async function fetchTasks() {
    const { data } = await supabase
      .from('tasks')
      .select('*')
      .order('position')
    if (data) setTasks(data)
    setLoading(false)
  }

  async function createTask(task) {
    const { data } = await supabase
      .from('tasks')
      .insert([task])
      .select()
      .single()
    return data
  }

  async function updateTask(id, updates) {
    await supabase
      .from('tasks')
      .update({ ...updates, updated_at: new Date() })
      .eq('id', id)
  }

  async function deleteTask(id) {
    await supabase.from('tasks').delete().eq('id', id)
  }

  async function moveTask(id, status) {
    await supabase
      .from('tasks')
      .update({ status, updated_at: new Date() })
      .eq('id', id)
  }

  return { tasks, loading, createTask, 
           updateTask, deleteTask, moveTask }
}
