import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { PERMISSIONS } from '../data'

export function useAuth() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.email)
      else setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
        if (session?.user) fetchProfile(session.user.email)
        else {
          setProfile(null)
          setLoading(false)
        }
      }
    )
    return () => subscription.unsubscribe()
  }, [])

  async function fetchProfile(email) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single()
      
      if (data) setProfile(data)
    } catch (err) {
      console.error("Erro ao buscar perfil:", err)
    } finally {
      setLoading(false)
    }
  }

  async function signIn(email, password) {
    const { error } = await supabase.auth.signInWithPassword({
      email, password
    })
    if (error) throw error
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  async function inviteMember({ name, email, role }) {
    const initials = name
      .split(' ')
      .map(p => p[0])
      .join('')
      .slice(0, 2)
      .toUpperCase()

    // 1. Cadastra na tabela users
    const { error: dbError } = await supabase
      .from('users')
      .insert([{ 
        name, email, role, 
        initials, active: true 
      }])
    
    if (dbError) throw dbError

    // 2. Envia convite via Edge Function
    const { data, error: inviteError } = await supabase
      .functions.invoke('invite-user', {
        body: { email, name, role }
      })

    if (inviteError || (data && data.error)) {
      throw new Error(inviteError?.message || data?.error || "Erro ao enviar convite")
    }
  }

  const hasPermission = (action) => {
    if (!profile) return false
    const userPermissions = PERMISSIONS[profile.role] || []
    return userPermissions.includes(action)
  }

  return { 
    user, 
    profile, 
    currentUser: profile, // Alias para compatibilidade
    loading, 
    signIn, 
    signOut, 
    inviteMember,
    hasPermission 
  }
}
