import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { logActivity } from '../lib/logActivity'

export function useTasks(projectId = null) {
  const { currentUser } = useAuth()
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchTasks = useCallback(async () => {
    try {
      let query = supabase
        .from('tasks')
        .select('*')
        .order('position', { ascending: true })

      if (projectId) {
        query = query.eq('project_id', projectId)
      }

      const { data, error } = await query;

      if (error) {
        console.error('Erro tasks:', error)
        return
      }
      setTasks(data || [])
    } catch (err) {
      console.error('Erro tasks:', err)
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    fetchTasks()
    const interval = setInterval(fetchTasks, 3000)
    return () => clearInterval(interval)
  }, [fetchTasks])

  async function createTask(task) {
    const { data, error } = await supabase
      .from('tasks')
      .insert([{ ...task, project_id: projectId }])
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

  const today = new Date().toDateString()
  
  const activeTasks = tasks.filter(t => 
    t.status !== 'done' || 
    new Date(t.updated_at).toDateString() === today
  )

  const archivedTasks = tasks.filter(t => 
    t.status === 'done' && 
    new Date(t.updated_at).toDateString() !== today
  )

  return { tasks: activeTasks, archivedTasks, allTasks: tasks, loading, createTask, updateTask, deleteTask, moveTask }
}
