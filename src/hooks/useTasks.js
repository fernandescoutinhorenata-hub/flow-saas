import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useTasks() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTasks()
    const interval = setInterval(fetchTasks, 3000)
    return () => clearInterval(interval)
  }, [])

  const fetchTasks = async () => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('position', { ascending: true })

    if (error) {
      console.error('Erro:', JSON.stringify(error))
      return
    }
    setTasks(data || [])
    setLoading(false)
  }

  async function createTask(task) {
    const { data, error } = await supabase
      .from('tasks')
      .insert([task])
      .select()
      .single()

    await fetchTasks()

    if (error) throw error
    return data
  }

  async function updateTask(id, updates) {
    await supabase
      .from('tasks')
      .update({ ...updates, updated_at: new Date() })
      .eq('id', id)
    await fetchTasks()
  }

  async function deleteTask(id) {
    await supabase.from('tasks').delete().eq('id', id)
    await fetchTasks()
  }

  async function moveTask(id, status) {
    await supabase
      .from('tasks')
      .update({ status, updated_at: new Date() })
      .eq('id', id)
    await fetchTasks()
  }

  return { tasks, loading, createTask, updateTask, deleteTask, moveTask }
}
