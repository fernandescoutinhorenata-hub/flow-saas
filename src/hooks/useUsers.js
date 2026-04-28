import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUsers()
    
    const interval = setInterval(() => {
      fetchUsers()
    }, 3000)

    return () => clearInterval(interval)
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
    await fetchUsers()
  }

  return { users, loading, toggleUserActive }
}
