import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { PERMISSIONS } from '../data'

export function useAuth() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Timeout absoluto — após 4s sai do loading independente do que aconteça
    const timeout = setTimeout(() => setLoading(false), 4000)

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.email).finally(() => {
          clearTimeout(timeout)
          setLoading(false)
        })
      } else {
        clearTimeout(timeout)
        setLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
        if (session?.user) {
          fetchProfile(session.user.email)
        } else {
          setProfile(null)
        }
      }
    )

    return () => {
      clearTimeout(timeout)
      subscription.unsubscribe()
    }
  }, [])

  async function fetchProfile(email) {
    try {
      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single()

      setProfile(data || {
        email,
        name: email.split('@')[0],
        role: 'membro',
        initials: email.slice(0, 2).toUpperCase()
      })
    } catch {
      setProfile({
        email,
        name: email.split('@')[0],
        role: 'membro',
        initials: email.slice(0, 2).toUpperCase()
      })
    } finally {
      setLoading(false)
    }
  }

  async function signIn(email, password) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  async function inviteMember({ name, email, role }) {
    const initials = name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase()
    const { error: dbError } = await supabase.from('users').insert([{ name, email, role, initials, active: true }])
    if (dbError) throw dbError
    const { data, error: inviteError } = await supabase.functions.invoke('invite-user', { body: { email, name, role } })
    if (inviteError || data?.error) throw new Error(inviteError?.message || data?.error)
  }

  const hasPermission = (action) => {
    if (!profile) return false
    return (PERMISSIONS[profile?.role] || []).includes(action)
  }

  return { user, profile, currentUser: profile, loading, signIn, signOut, inviteMember, hasPermission }
}
