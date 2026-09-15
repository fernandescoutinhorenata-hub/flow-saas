import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useVideoMetrics() {
  const [metrics, setMetrics] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchMetrics = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('video_metrics')
        .select('*')
        .order('snapshot_date', { ascending: true })

      if (error) {
        console.error('Erro métricas:', error)
        return
      }
      setMetrics(data || [])
    } catch (err) {
      console.error('Erro métricas:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchMetrics()
    const interval = setInterval(fetchMetrics, 5000)
    return () => clearInterval(interval)
  }, [fetchMetrics])

  async function upsertMetric(metric) {
    const { error } = await supabase
      .from('video_metrics')
      .upsert(metric, { onConflict: 'video_id,snapshot_date' })

    if (error) throw error
    await fetchMetrics()
  }

  async function deleteMetric(id) {
    const { error } = await supabase.from('video_metrics').delete().eq('id', id)
    if (error) throw error
    await fetchMetrics()
  }

  return { metrics, loading, upsertMetric, deleteMetric }
}
