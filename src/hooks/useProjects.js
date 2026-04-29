import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useProjects() {
  const [projects, setProjects] = useState([])
  const [selectedProject, setSelectedProject] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProjects()
    const interval = setInterval(fetchProjects, 5000)
    return () => clearInterval(interval)
  }, [])

  async function fetchProjects() {
    try {
      const { data } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: true })
      
      setProjects(data || [])
      // Se tivermos projetos e nenhum selecionado (ou o selecionado não existe mais), seleciona o primeiro
      if (data?.length > 0) {
        if (!selectedProject || !data.find(p => p.id === selectedProject.id)) {
          setSelectedProject(data[0])
        }
      }
    } catch (err) {
      console.error('Error fetching projects:', err)
    } finally {
      setLoading(false)
    }
  }

  async function createProject(project) {
    const { error } = await supabase.from('projects').insert([{ name: project.name, status: 'em andamento' }])
    if (error) throw error
    await fetchProjects()
  }

  async function deleteProject(id) {
    const { error } = await supabase.from('projects').delete().eq('id', id)
    if (error) throw error
    await fetchProjects()
  }

  return { projects, selectedProject, setSelectedProject, loading, createProject, deleteProject }
}
