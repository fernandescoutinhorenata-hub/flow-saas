import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { PERMISSIONS } from '../data'

function readStoredUser() {
  try {
    const saved = localStorage.getItem('flow_user')
    return saved ? JSON.parse(saved) : null
  } catch {
    localStorage.removeItem('flow_user')
    return null
  }
}

export function useAuth() {
  const [user, setUser] = useState(readStoredUser)
  const [profile, setProfile] = useState(readStoredUser)
  const [loading, setLoading] = useState(() => localStorage.getItem('flow_user') != null)

  useEffect(() => {
    const localUser = readStoredUser()
    if (!localUser) return

    // Buscar dados frescos do banco incluindo avatar_url
    supabase
      .from('users')
      .select('*')
      .eq('email', localUser.email)
      .single()
      .then(({ data }) => {
        if (data) {
          localStorage.setItem('flow_user', JSON.stringify(data))
          setProfile({ ...data })
          setUser({ ...data })
        }
      })
      .finally(() => setLoading(false))
  }, [])

  async function signIn(email) {
    setLoading(true)
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .eq('active', true)
      .single()

    if (error || !data) {
      setLoading(false)
      throw new Error('Acesso não autorizado. Entre em contato com o administrador.')
    }

    // Salva no localStorage para persistir sessão
    localStorage.setItem('flow_user', JSON.stringify(data))
    setProfile(data)
    setUser(data)
    setLoading(false)
    return data
  }

  async function signOut() {
    localStorage.removeItem('flow_user')
    setProfile(null)
    setUser(null)
  }

  async function inviteMember({ name, email, role }) {
    const initials = name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase()

    // Insere apenas na tabela users (acesso permitido)
    const { error } = await supabase.from('users').insert([{
      name, email, role, initials, active: true
    }])

    if (error) throw error
  }

  async function refreshUser() {
    const saved = localStorage.getItem('flow_user')
    if (!saved) return

    const localUser = JSON.parse(saved)

    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('email', localUser.email)
      .single()

    if (data) {
      localStorage.setItem('flow_user', JSON.stringify(data))
      setProfile({ ...data })
      setUser({ ...data })
    }
  }

  function setCurrentUser(nextUser) {
    setProfile(nextUser)
    setUser(nextUser)
  }

  function hasPermission(perm) {
    if (!profile) return false;
    return PERMISSIONS[profile.role]?.includes(perm) || false;
  }

  return { user, profile, currentUser: profile, loading, signIn, signOut, inviteMember, hasPermission, refreshUser, setProfile, setUser, setCurrentUser }
}
