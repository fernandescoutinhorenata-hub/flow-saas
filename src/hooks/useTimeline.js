import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useTimeline() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchEvents() }, [])

  async function fetchEvents() {
    const { data } = await supabase
      .from('activity_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)
    
    setEvents(data || [])
    setLoading(false)
  }

  return { events, loading, refetch: fetchEvents }
}
