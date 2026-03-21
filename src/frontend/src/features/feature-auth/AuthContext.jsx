/**
 * Feature: Auth — AuthContext
 * React context for managing authentication state across the app.
 * 
 * States: loading | unauthenticated | authenticated_no_profile | authenticated
 */

import { createContext, useContext, useState, useEffect } from 'react'
import supabase from '../../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [authState, setAuthState] = useState('loading') // loading | unauthenticated | authenticated_no_profile | authenticated

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.access_token)
      } else {
        setAuthState('unauthenticated')
        setLoading(false)
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.access_token)
      } else {
        setProfile(null)
        setAuthState('unauthenticated')
      }
    })

    return () => subscription?.unsubscribe()
  }, [])

  async function fetchProfile(token) {
    try {
      const response = await fetch('/api/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        const data = await response.json()
        setProfile(data.profile)
        setAuthState('authenticated')
      } else if (response.status === 404) {
        setAuthState('authenticated_no_profile')
      } else {
        setAuthState('authenticated_no_profile')
      }
    } catch {
      // Backend might not be running yet — still authenticated
      setAuthState('authenticated_no_profile')
    } finally {
      setLoading(false)
    }
  }

  async function signUp(email, password) {
    const { data, error } = await supabase.auth.signUp({ email, password })
    return { data, error }
  }

  async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    return { data, error }
  }

  async function signOut() {
    await supabase.auth.signOut()
    setProfile(null)
    setAuthState('unauthenticated')
  }

  function getToken() {
    return session?.access_token
  }

  const value = {
    session,
    user,
    profile,
    loading,
    authState,
    signUp,
    signIn,
    signOut,
    getToken,
    setProfile,
    setAuthState,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext
