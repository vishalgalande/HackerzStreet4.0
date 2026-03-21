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
import InvestmentsPage from './features/feature-dashboard/InvestmentsPage'
import SavingsPage from './features/feature-dashboard/SavingsPage'
import AntiImpulsivity from './features/feature-dashboard/AntiImpulsivity'
import LoanApply from './features/feature-loans/LoanApply'
import LenderDashboard from './features/feature-loans/LenderDashboard'
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

function PageRenderer({ page }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div key={page} {...pageTransition}>
        {page === 'dashboard' && <Dashboard />}
        {page === 'loan-apply' && <LoanApply />}
        {page === 'lender-dashboard' && <LenderDashboard />}
        {page === 'credit-engine' && <CreditEngine />}
        {page === 'alerts' && <AlertsPage />}
        {page === 'investments' && <InvestmentsPage />}
        {page === 'savings' && <SavingsPage />}
        {page === 'anti-impulse' && <AntiImpulsivity />}
      </motion.div>
    </AnimatePresence>
  )
}

function AppContent() {
  const { authState, loading, signOut } = useAuth()
  const [view, setView] = useState('home') // home | auth | app
  const [activePage, setActivePage] = useState('dashboard')
  const [language, setLanguage] = useState('en')

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



  // Auth page
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
        <AuthPage />
      </div>
    )
  }

  // Authenticated flows
  if (authState === 'authenticated_no_profile') {
    return <ProfileSetup />
  }

  if (authState === 'authenticated' || view === 'app') {
    return (
      <div className="min-h-screen">
        <Navbar
          activePage={activePage}
          onNavigate={setActivePage}
          onSignOut={signOut || (() => setView('home'))}
        />
        <PageRenderer page={activePage} />
      </div>
    )
  }

  // Default: Landing page
  return (
    <HeroSection
      onSignUp={() => setView('auth')}
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
