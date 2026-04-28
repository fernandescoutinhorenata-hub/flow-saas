import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useProjects() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProjects()
    const interval = setInterval(fetchProjects, 5000)
    return () => clearInterval(interval)
  }, [])

  async function fetchProjects() {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Erro ao buscar projetos:', error)
      setLoading(false)
      return
    }
    setProjects(data || [])
    setLoading(false)
  }

  async function deleteProject(id) {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id)
    if (error) {
      console.error('Erro ao excluir projeto:', error)
      throw error
    }
    await fetchProjects()
  }

  async function createProject(project) {
    const { data, error } = await supabase
      .from('projects')
      .insert([{
        name: project.name,
        status: 'em andamento'
      }])
      .select()
      .single()

    if (error) {
      console.error('Erro ao criar projeto:', error)
      return
    }
    await fetchProjects()
    return data
  }

  return { projects, loading, deleteProject, createProject, refetch: fetchProjects }
}
