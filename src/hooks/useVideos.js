import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { logActivity } from '../lib/logActivity'

export const VIDEO_STAGES = [
  { id: 'ideia', label: 'IDEIA' },
  { id: 'pauta', label: 'PAUTA' },
  { id: 'roteiro', label: 'ROTEIRO' },
  { id: 'gravacao', label: 'GRAVAÇÃO' },
  { id: 'edicao', label: 'EDIÇÃO' },
  { id: 'revisao', label: 'REVISÃO' },
  { id: 'publicado', label: 'PUBLICADO' },
]

export function useVideos() {
  const { currentUser } = useAuth()
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchVideos = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Erro videos:', error)
        return
      }
      setVideos(data || [])
    } catch (err) {
      console.error('Erro videos:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchVideos()
    const interval = setInterval(fetchVideos, 3000)
    return () => clearInterval(interval)
  }, [fetchVideos])

  async function createVideo(video) {
    const { data, error } = await supabase
      .from('videos')
      .insert([video])
      .select()
      .single()

    if (!error) {
      logActivity({ userName: currentUser?.name, action: `criou o vídeo "${video.title}"` })
    }

    await fetchVideos()

    if (error) throw error
    return data
  }

  async function updateVideo(id, updates) {
    await supabase
      .from('videos')
      .update({ ...updates, updated_at: new Date() })
      .eq('id', id)
    await fetchVideos()
  }

  async function deleteVideo(id) {
    const { error } = await supabase.from('videos').delete().eq('id', id)
    await fetchVideos()
    if (error) throw error
  }

  async function moveVideo(id, status) {
    const { error } = await supabase
      .from('videos')
      .update({ status, updated_at: new Date() })
      .eq('id', id)
    await fetchVideos()
    if (error) throw error
  }

  return { videos, loading, createVideo, updateVideo, deleteVideo, moveVideo }
}
