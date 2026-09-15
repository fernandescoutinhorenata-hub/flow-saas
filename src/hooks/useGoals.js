import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useGoals() {
  const [goals, setGoals] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchGoals = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .order('created_at', { ascending: true })

      if (error) {
        console.error('Erro metas:', error)
        return
      }
      setGoals(data || [])
    } catch (err) {
      console.error('Erro metas:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchGoals()
    const interval = setInterval(fetchGoals, 5000)
    return () => clearInterval(interval)
  }, [fetchGoals])

  async function createGoal(goal) {
    const { error } = await supabase.from('goals').insert([goal])
    if (error) throw error
    await fetchGoals()
  }

  async function updateGoal(id, updates) {
    const { error } = await supabase.from('goals').update(updates).eq('id', id)
    if (error) throw error
    await fetchGoals()
  }

  async function deleteGoal(id) {
    const { error } = await supabase.from('goals').delete().eq('id', id)
    if (error) throw error
    await fetchGoals()
  }

  return { goals, loading, createGoal, updateGoal, deleteGoal, refetch: fetchGoals }
}
