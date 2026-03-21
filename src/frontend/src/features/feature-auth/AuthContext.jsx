/**
 * Feature: Auth — AuthContext
 * React context for managing authentication state across the app.
 * 
 * States: loading | unauthenticated | authenticated_no_profile | authenticated
 * 
 * Profile is persisted to localStorage so it survives page refreshes.
 */

import { createContext, useContext, useState, useEffect } from 'react'
import supabase from '../../lib/supabase'

const AuthContext = createContext(null)

const PROFILE_STORAGE_KEY = 'hackerzstreet_profile'

function loadStoredProfile() {
  try {
    const stored = localStorage.getItem(PROFILE_STORAGE_KEY)
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

function saveStoredProfile(profile) {
  if (profile) {
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile))
  } else {
    localStorage.removeItem(PROFILE_STORAGE_KEY)
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [user, setUser] = useState(null)
  const [profile, setProfileState] = useState(null)
  const [loading, setLoading] = useState(true)
  const [authState, setAuthState] = useState('loading')

  // Wrap setProfile to also persist to localStorage
  function setProfile(newProfile) {
    setProfileState(newProfile)
    saveStoredProfile(newProfile)
  }

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        restoreOrFetchProfile(session.access_token)
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
        restoreOrFetchProfile(session.access_token)
      } else {
        setProfile(null)
        setAuthState('unauthenticated')
      }
    })

    return () => subscription?.unsubscribe()
  }, [])

  async function restoreOrFetchProfile(token) {
    // First try localStorage (instant — survives refresh)
    const stored = loadStoredProfile()
    if (stored) {
      setProfileState(stored)
      setAuthState('authenticated')
      setLoading(false)

      // Background sync with backend (non-blocking)
      fetchProfileFromBackend(token).catch(() => {})
      return
    }

    // No stored profile — try backend
    await fetchProfileFromBackend(token)
  }

  async function fetchProfileFromBackend(token) {
    try {
      const response = await fetch('/api/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        const data = await response.json()
        setProfile(data.profile)
        setAuthState('authenticated')
      } else {
        // Backend returned 404 or error — only go to profile setup
        // if localStorage doesn't have a profile either
        const stored = loadStoredProfile()
        if (stored) {
          // localStorage has profile — keep using it, ignore backend 404
          setProfileState(stored)
          setAuthState('authenticated')
        } else {
          setAuthState('authenticated_no_profile')
        }
      }
    } catch {
      // Backend not running — check localStorage
      const stored = loadStoredProfile()
      if (stored) {
        setProfileState(stored)
        setAuthState('authenticated')
      } else {
        setAuthState('authenticated_no_profile')
      }
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
