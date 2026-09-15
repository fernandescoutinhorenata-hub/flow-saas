import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export const CONTENT_STAGES = [
  { id: 'ideias', label: 'Ideias' },
  { id: 'pesquisa', label: 'Pesquisa' },
  { id: 'roteiro', label: 'Roteiro' },
  { id: 'narracao', label: 'Narração' },
  { id: 'imagens', label: 'Imagens e materiais' },
  { id: 'edicao', label: 'Edição' },
  { id: 'revisao', label: 'Revisão' },
  { id: 'agendado', label: 'Agendado' },
  { id: 'publicado', label: 'Publicado' },
]

export const PLATFORMS = ['YouTube', 'YouTube Shorts', 'TikTok', 'Instagram Reels', 'Facebook', 'Kwai', 'Outra']
export const FORMATS = ['Short', 'Vídeo longo', 'Carrossel', 'Post', 'Story', 'React', 'Notícia', 'Curiosidade', 'Review', 'Outro']

export const DEFAULT_CHECKLIST = [
  'Pesquisa concluída',
  'Roteiro concluído',
  'Narração concluída',
  'Imagens separadas',
  'Edição concluída',
  'Revisão concluída',
  'Título definido',
  'Legenda definida',
  'Thumbnail concluída',
  'Publicação agendada',
  'Conteúdo publicado',
]

export function useContents() {
  const [contents, setContents] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchContents = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('contents')
        .select('*')
        .order('position', { ascending: true })

      if (error) {
        console.error('Erro conteúdos:', error)
        return
      }
      setContents(data || [])
    } catch (err) {
      console.error('Erro conteúdos:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchContents()
    const interval = setInterval(fetchContents, 5000)
    return () => clearInterval(interval)
  }, [fetchContents])

  async function createContent(content) {
    const { data, error } = await supabase
      .from('contents')
      .insert([content])
      .select()
      .single()

    if (error) throw error
    await fetchContents()
    return data
  }

  async function updateContent(id, updates) {
    const { error } = await supabase
      .from('contents')
      .update({ ...updates, updated_at: new Date() })
      .eq('id', id)
    if (error) throw error
    await fetchContents()
  }

  async function deleteContent(id) {
    const { error } = await supabase.from('contents').delete().eq('id', id)
    if (error) throw error
    await fetchContents()
  }

  async function moveContent(id, stage) {
    const { error } = await supabase
      .from('contents')
      .update({ stage, updated_at: new Date() })
      .eq('id', id)
    if (error) throw error

    if (stage === 'publicado') {
      await supabase.from('contents').update({ published_at: new Date() }).eq('id', id)
    }

    await supabase.from('content_stage_history').insert([{ content_id: id, stage }])

    await fetchContents()
  }

  return { contents, loading, createContent, updateContent, deleteContent, moveContent, refetch: fetchContents }
}
