import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchUsers = useCallback(async () => {
    try {
      const { data } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: true })
      setUsers(data || [])
    } catch (err) {
      console.error('Erro usuários:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUsers()

    const interval = setInterval(fetchUsers, 3000)

    return () => clearInterval(interval)
  }, [fetchUsers])

  async function toggleUserActive(id, active) {
    await supabase
      .from('users')
      .update({ active })
      .eq('id', id)
    await fetchUsers()
  }

  async function deleteUser(id) {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id)
    if (error) throw error
    await fetchUsers()
  }

  return { users, loading, toggleUserActive, deleteUser }
}
