import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useChannels() {
  const [channels, setChannels] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchChannels = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('channels')
        .select('*')
        .order('created_at', { ascending: true })

      if (error) {
        console.error('Erro canais:', error)
        return
      }
      setChannels(data || [])
    } catch (err) {
      console.error('Erro canais:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchChannels()
    const interval = setInterval(fetchChannels, 3000)
    return () => clearInterval(interval)
  }, [fetchChannels])

  async function createChannel(name) {
    const { data, error } = await supabase
      .from('channels')
      .insert([{ name }])
      .select()
      .single()

    if (error) throw error
    await fetchChannels()
    return data
  }

  async function updateChannel(id, updates) {
    const { error } = await supabase.from('channels').update(updates).eq('id', id)
    if (error) throw error
    await fetchChannels()
  }

  async function deleteChannel(id) {
    const { error } = await supabase.from('channels').delete().eq('id', id)
    if (error) throw error
    await fetchChannels()
  }

  return { channels, loading, createChannel, updateChannel, deleteChannel }
}
