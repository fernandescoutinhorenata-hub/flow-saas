import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUsers()
    const channel = supabase
      .channel('users')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'users' },
        () => fetchUsers()
      )
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [])

  async function fetchUsers() {
    const { data } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: true })
    setUsers(data || [])
    setLoading(false)
  }

  async function toggleUserActive(id, active) {
    await supabase
      .from('users')
      .update({ active })
      .eq('id', id)
    fetchUsers()
  }

  return { users, loading, toggleUserActive }
}
