/**
 * App.jsx — Main Application Shell
 * Routes between views based on auth state.
 * Includes page-based navigation for authenticated users.
 *
 * Auth States:
 *   loading → Spinner
 *   unauthenticated → HeroSection (landing page)
 *   authenticated_no_profile → ProfileSetup
 *   authenticated → Dashboard + Pages
 *
 * Demo mode: bypasses auth for persona quick-launch
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AuthProvider, useAuth } from './features/feature-auth/AuthContext'
import HeroSection from './features/feature-auth/HeroSection'
import AuthPage from './features/feature-auth/AuthPage'
import ProfileSetup from './features/feature-auth/ProfileSetup'
import Dashboard from './features/feature-dashboard/Dashboard'
import CreditEngine from './features/feature-scoring/CreditEngine'
import AlertsPage from './features/feature-dashboard/AlertsPage'
import SavingsPage from './features/feature-dashboard/SavingsPage'
import AntiImpulsivity from './features/feature-dashboard/AntiImpulsivity'
import ActivePayments from './features/feature-payments/ActivePayments'
import ChimcharAssistant from './features/feature-ai/ChimcharAssistant'
import ChimcharFloating from './features/feature-ai/ChimcharFloating'
import Navbar from './components/Navbar'
import ScoreGauge from './features/feature-scoring/ScoreGauge'
import FactorWaterfall from './features/feature-scoring/FactorWaterfall'
import Recommendations from './features/feature-scoring/Recommendations'
import WhatIfSimulator from './features/feature-scoring/WhatIfSimulator'
import { computeScore, getBand } from './features/feature-scoring/scorer'

const pageTransition = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
}

function PageRenderer({ page, onNavigate }) {
  return (
    <div style={{ paddingTop: 'var(--page-padding-top, 72px)' }}>
      <AnimatePresence mode="wait">
        <motion.div key={page} {...pageTransition}>
          {page === 'dashboard' && <Dashboard onNavigate={onNavigate} />}
          {page === 'lender-dashboard' && <ActivePayments />}
          {page === 'credit-engine' && <CreditEngine />}
          {page === 'alerts' && <AlertsPage />}
          {page === 'savings' && <SavingsPage />}
          {page === 'anti-impulse' && <AntiImpulsivity />}
          {page === 'chimchar' && <ChimcharAssistant />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}


function AppContent() {
  const { authState, loading, signOut } = useAuth()
  const [view, setView] = useState('home') // home | auth | app
  const [activePage, setActivePage] = useState('dashboard')
  const [language, setLanguage] = useState('en')
  const [authMode, setAuthMode] = useState('login') // login | signup

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center animated-gradient">
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="w-12 h-12 border-3 border-[var(--color-gold)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[var(--color-text-secondary)]">Loading...</p>
        </motion.div>
      </div>
    )
  }



  // Authenticated flows — must check BEFORE view === 'auth'
  // so that after login the user immediately sees the dashboard
  if (authState === 'authenticated_no_profile') {
    return <ProfileSetup />
  }

  if (authState === 'authenticated') {
    return (
      <div className="min-h-screen">
        <Navbar
          activePage={activePage}
          onNavigate={setActivePage}
          onSignOut={signOut || (() => setView('home'))}
        />
        <PageRenderer page={activePage} onNavigate={setActivePage} />
        <ChimcharFloating />
      </div>
    )
  }

  // Auth page (only shown when NOT authenticated)
  if (view === 'auth') {
    return (
      <div className="relative">
        <motion.button
          onClick={() => setView('home')}
          className="absolute top-4 left-4 text-[var(--color-gold)] hover:underline z-10 text-sm"
          whileHover={{ x: -3 }}
        >
          ← Back
        </motion.button>
        <AuthPage initialMode={authMode} />
      </div>
    )
  }

  // Default: Landing page
  return (
    <HeroSection
      onSignIn={() => { setAuthMode('login'); setView('auth') }}
      onSignUp={() => { setAuthMode('signup'); setView('auth') }}
    />
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
