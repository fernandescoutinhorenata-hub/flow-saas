import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { logActivity } from '../lib/logActivity'

export function useTasks() {
  const { currentUser } = useAuth()
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

    if (!error) {
      logActivity({ userName: currentUser?.name, action: `criou a tarefa "${task.title}"` })
    }

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
    const task = tasks.find(t => t.id === id)
    const taskTitle = task?.title || 'tarefa'
    
    const { error } = await supabase.from('tasks').delete().eq('id', id)
    
    if (!error) {
      logActivity({ userName: currentUser?.name, action: `excluiu a tarefa "${taskTitle}"` })
    }
    
    await fetchTasks()
  }

  async function moveTask(id, status) {
    const task = tasks.find(t => t.id === id)
    const taskTitle = task?.title || 'tarefa'

    const { error } = await supabase
      .from('tasks')
      .update({ status, updated_at: new Date() })
      .eq('id', id)
    
    if (!error) {
      logActivity({ userName: currentUser?.name, action: `moveu "${taskTitle}" para ${status}`, newStatus: status })
    }
    
    await fetchTasks()
  }

  return { tasks, loading, createTask, updateTask, deleteTask, moveTask }
}
