import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useProjects(currentUser) {
  const [projects, setProjects] = useState([])
  const [selectedProject, setSelectedProject] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!currentUser) {
      setLoading(false)
      return
    }
    fetchProjects()
    const interval = setInterval(fetchProjects, 5000)
    return () => clearInterval(interval)
  }, [currentUser])

  async function fetchProjects() {
    try {
      const isDono = currentUser?.role === 'dono'
      const isGestor = currentUser?.role === 'gestor'

      // Buscamos os projetos e os membros vinculados
      let query = supabase.from('projects').select(`*, project_members(user_id)`)

      const { data, error } = await query.order('created_at', { ascending: true })
      
      if (error) {
        console.error('Error fetching projects:', error)
        return
      }

      let filtered = data || []

      // admin e membro só veem projetos que foram designados
      if (!isDono && !isGestor) {
        filtered = filtered.filter(p =>
          p.project_members?.some(m => m.user_id === currentUser?.id)
        )
      }

      setProjects(filtered)
      
      // Se tivermos projetos e nenhum selecionado (ou o selecionado não existe mais no filtro), seleciona o primeiro
      if (filtered.length > 0) {
        if (!selectedProject || !filtered.find(p => p.id === selectedProject.id)) {
          setSelectedProject(filtered[0])
        }
      } else {
        setSelectedProject(null)
      }
    } catch (err) {
      console.error('Error in fetchProjects:', err)
    } finally {
      setLoading(false)
    }
  }

  async function createProject({ name, fase = 'planejamento' }) {
    const { error } = await supabase.from('projects').insert([{ 
      name, 
      fase, 
      status: 'em andamento' 
    }])
    if (error) throw error
    await fetchProjects()
  }

  async function updateProject(id, updates) {
    const { error } = await supabase.from('projects').update(updates).eq('id', id)
    if (error) throw error
    await fetchProjects()
  }

  async function deleteProject(id) {
    const { error } = await supabase.from('projects').delete().eq('id', id)
    if (error) throw error
    if (selectedProject?.id === id) {
      setSelectedProject(null)
    }
    await fetchProjects()
  }

  async function addMember(projectId, userId) {
    const { error } = await supabase.from('project_members').insert([{ 
      project_id: projectId, 
      user_id: userId 
    }])
    if (error) throw error
    await fetchProjects()
  }

  async function removeMember(projectId, userId) {
    const { error } = await supabase
      .from('project_members')
      .delete()
      .eq('project_id', projectId)
      .eq('user_id', userId)
    if (error) throw error
    await fetchProjects()
  }

  return { 
    projects, 
    selectedProject, 
    setSelectedProject, 
    loading, 
    createProject, 
    updateProject, 
    deleteProject, 
    addMember, 
    removeMember 
  }
}
