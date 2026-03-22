/**
 * Feature: Auth — AuthContext
 * React context for managing authentication state across the app.
 * 
 * States: loading | unauthenticated | authenticated_no_profile | authenticated
 * 
 * Profile is persisted to localStorage (keyed per user) and synced to backend.
 */

import { createContext, useContext, useState, useEffect } from 'react'
import supabase from '../../lib/supabase'

const AuthContext = createContext(null)

const PROFILE_PREFIX = 'hackerzstreet_profile_'
const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function loadStoredProfile(userId) {
  if (!userId) return null
  try {
    const stored = localStorage.getItem(PROFILE_PREFIX + userId)
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

function saveStoredProfile(userId, profile) {
  if (!userId) return
  if (profile) {
    localStorage.setItem(PROFILE_PREFIX + userId, JSON.stringify(profile))
  }
  // NOTE: We intentionally do NOT remove on null — profile persists across sign-out
}

function getUserIdFromSession(session) {
  return session?.user?.id || null
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [user, setUser] = useState(null)
  const [profile, setProfileState] = useState(null)
  const [loading, setLoading] = useState(true)
  const [authState, setAuthState] = useState('loading')
  const [currentUserId, setCurrentUserId] = useState(null)

  // Wrap setProfile to also persist to localStorage
  function setProfile(newProfile) {
    setProfileState(newProfile)
    if (currentUserId && newProfile) {
      saveStoredProfile(currentUserId, newProfile)
    }
  }

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      const uid = getUserIdFromSession(session)
      setCurrentUserId(uid)
      if (session?.user) {
        restoreOrFetchProfile(session.access_token, session.user, uid)
      } else {
        setAuthState('unauthenticated')
        setLoading(false)
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      const uid = getUserIdFromSession(session)
      setCurrentUserId(uid)
      if (session?.user) {
        restoreOrFetchProfile(session.access_token, session.user, uid)
      } else {
        setProfileState(null)
        setAuthState('unauthenticated')
        setLoading(false)
      }
    })

    return () => subscription?.unsubscribe()
  }, [])

  async function restoreOrFetchProfile(token, authUser, uid) {
    // First try localStorage (instant — survives refresh AND sign-out)
    const stored = loadStoredProfile(uid)
    if (stored) {
      // Ensure email is always populated
      if (authUser?.email && !stored.email) stored.email = authUser.email
      setProfileState(stored)
      setAuthState('authenticated')
      setLoading(false)

      // Background sync with backend (non-blocking)
      fetchProfileFromBackend(token, authUser, uid).catch(() => {})
      return
    }

    // No stored profile — try backend
    await fetchProfileFromBackend(token, authUser, uid)
  }

  async function fetchProfileFromBackend(token, authUser, uid) {
    try {
      const response = await fetch(`${API}/api/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        const data = await response.json()
        const profileData = {
          ...data.profile,
          email: authUser?.email || data.profile?.email || '',
          full_name: data.profile?.full_name || authUser?.user_metadata?.full_name || '',
        }
        setProfileState(profileData)
        if (uid) saveStoredProfile(uid, profileData)
        setAuthState('authenticated')
      } else {
        // Backend returned 404 or error
        const stored = loadStoredProfile(uid)
        if (stored) {
          if (authUser?.email && !stored.email) stored.email = authUser.email
          setProfileState(stored)
          setAuthState('authenticated')
        } else {
          setAuthState('authenticated_no_profile')
        }
      }
    } catch {
      // Backend not running — check localStorage
      const stored = loadStoredProfile(uid)
      if (stored) {
        if (authUser?.email && !stored.email) stored.email = authUser.email
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

    if (error) {
      let message = error.message
      if (message.toLowerCase().includes('rate limit') || error.status === 429) {
        message = 'Too many sign-up attempts. Please wait a few minutes and try again.'
      }
      return { data, error: { ...error, message } }
    }

    if (data?.user?.identities?.length === 0) {
      return { data: null, error: { message: 'An account with this email already exists. Please sign in instead.' } }
    }

    return { data, error: null }
  }

  async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    return { data, error }
  }

  async function signOut() {
    await supabase.auth.signOut()
    // Don't clear localStorage — profile should persist for next login
    setProfileState(null)
    setCurrentUserId(null)
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
