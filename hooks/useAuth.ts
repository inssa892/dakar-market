'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase, Profile } from '@/lib/supabase'
import { User } from '@supabase/auth-helpers-nextjs'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Charger profil
  const loadProfile = useCallback(async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      if (error) throw error
      setProfile(profile)
    } catch (error) {
      console.error('Error loading profile:', error)
      setProfile(null)
    }
  }, [])

  // Initialisation session + écoute auth
  useEffect(() => {
    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        setUser(session?.user ?? null)
        if (session?.user) await loadProfile(session.user.id)
      } catch (err) {
        console.error('Error getting session:', err)
      } finally {
        setLoading(false)
      }
    }

    getSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUser(session?.user ?? null)
        if (session?.user) {
          await loadProfile(session.user.id)
        } else {
          setProfile(null)
          router.replace('/login') // redirection si déconnecté
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [loadProfile, router])

  // Rafraîchir profil
  const refreshProfile = useCallback(async () => {
    if (user) await loadProfile(user.id)
  }, [user, loadProfile])

  // Inscription
  const signUp = async (
    email: string,
    password: string,
    displayName: string,
    role: 'client' | 'merchant' = 'client'
  ) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: { display_name: displayName, role },
        },
      })
      if (error) throw error
      toast.success(
        data.session
          ? 'Compte créé avec succès!'
          : 'Compte créé! Vérifiez votre email pour confirmer.'
      )
      return { data, error: null }
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la création du compte')
      return { data: null, error }
    }
  }

  // Connexion
  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      toast.success('Welcome back!')
      return { data, error: null }
    } catch (error: any) {
      toast.error(error.message)
      return { data: null, error }
    }
  }

  // Déconnexion
  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      setProfile(null)
      toast.success('Déconnecté avec succès!')
      router.replace('/login')
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  return { user, profile, loading, refreshProfile, signUp, signIn, signOut }
}
