import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export const IDEA_STATUSES = [
  { key: 'nova', label: 'Nova', color: '#00FF87' },
  { key: 'em_analise', label: 'Em análise', color: '#FFB800' },
  { key: 'aprovada', label: 'Aprovada', color: '#00FF87' },
  { key: 'descartada', label: 'Descartada', color: '#7A7A7A' },
  { key: 'transformada', label: 'Transformada', color: '#5B8DEF' },
]

export function useIdeas() {
  const [ideas, setIdeas] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchIdeas = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('ideas')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Erro ideias:', error)
        return
      }
      setIdeas(data || [])
    } catch (err) {
      console.error('Erro ideias:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchIdeas()
    const interval = setInterval(fetchIdeas, 5000)
    return () => clearInterval(interval)
  }, [fetchIdeas])

  async function createIdea(idea) {
    const { error } = await supabase.from('ideas').insert([idea])
    if (error) throw error
    await fetchIdeas()
  }

  async function updateIdea(id, updates) {
    const { error } = await supabase
      .from('ideas')
      .update({ ...updates, updated_at: new Date() })
      .eq('id', id)
    if (error) throw error
    await fetchIdeas()
  }

  async function deleteIdea(id) {
    const { error } = await supabase.from('ideas').delete().eq('id', id)
    if (error) throw error
    await fetchIdeas()
  }

  async function setIdeaStatus(id, status) {
    const { error } = await supabase
      .from('ideas')
      .update({ status, updated_at: new Date() })
      .eq('id', id)
    if (error) throw error
    await fetchIdeas()
  }

  async function transformIdea(idea) {
    if (idea.status === 'transformada') return null

    const { data: content, error } = await supabase
      .from('contents')
      .insert([{
        title: idea.title,
        channel_id: idea.channel_id || null,
        platform: idea.platform || 'YouTube',
        format: idea.format || 'Short',
        description: idea.description || '',
        idea: idea.description || '',
        refs: idea.ref_link || null,
        tags: idea.tags || null,
        stage: 'ideias',
      }])
      .select()
      .single()

    if (error) throw error

    await supabase
      .from('ideas')
      .update({ status: 'transformada', content_id: content.id, updated_at: new Date() })
      .eq('id', idea.id)

    await fetchIdeas()
    return content
  }

  return { ideas, loading, createIdea, updateIdea, deleteIdea, setIdeaStatus, transformIdea, refetch: fetchIdeas }
}
