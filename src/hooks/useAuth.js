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

      if (data) {
        setProfile(data)
      } else {
        // Se não tiver na tabela users, limpamos a sessão para garantir segurança
        await signOut()
        setProfile(null)
      }
    } catch {
      setProfile(null)
    } finally {
      setLoading(false)
    }
  }

  async function signIn(email) {
    // 1. Verifica se email está na tabela users
    const { data: userExists, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .maybeSingle()

    if (!userExists || checkError) {
      throw new Error('Acesso não autorizado. Entre em contato com o administrador.')
    }

    // 2. Envia magic link
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true, // Deve ser true para o Auth criar a entrada, mas o app só deixa logar se tiver na tabela users
        emailRedirectTo: 'https://flow-saas-beta.vercel.app'
      }
    })

    if (error) throw error
  }

  async function signOut() {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
  }

  async function inviteMember({ name, email, role }) {
    const initials = name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase()
    
    // Insere apenas na tabela users (acesso permitido)
    const { error } = await supabase.from('users').insert([{
      name, email, role, initials, active: true
    }])
    
    if (error) throw error
  }

  const hasPermission = (action) => {
    if (!profile) return false
    return (PERMISSIONS[profile?.role] || []).includes(action)
  }

  return { user, profile, currentUser: profile, loading, signIn, signOut, inviteMember, hasPermission }
}
