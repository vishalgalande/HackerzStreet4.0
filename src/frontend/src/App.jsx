/**
 * App.jsx — Main Application Shell
 * Routes between views based on auth state.
 * 
 * Auth States:
 *   loading → Spinner
 *   unauthenticated → HeroSection (landing page)
 *   authenticated_no_profile → ProfileSetup
 *   authenticated → Dashboard
 * 
 * Demo mode: bypasses auth for persona quick-launch
 */

import { useState } from 'react'
import { AuthProvider, useAuth } from './features/feature-auth/AuthContext'
import HeroSection from './features/feature-auth/HeroSection'
import AuthPage from './features/feature-auth/AuthPage'
import ProfileSetup from './features/feature-auth/ProfileSetup'
import ConsentScreen from './features/feature-auth/ConsentScreen'
import Dashboard from './features/feature-dashboard/Dashboard'
import ScoreGauge from './features/feature-scoring/ScoreGauge'
import FactorWaterfall from './features/feature-scoring/FactorWaterfall'
import Recommendations from './features/feature-scoring/Recommendations'
import WhatIfSimulator from './features/feature-scoring/WhatIfSimulator'
import { computeScore, getBand } from './features/feature-scoring/scorer'

function AppContent() {
  const { authState, loading } = useAuth()
  const [view, setView] = useState('home') // home | auth | consent | demo
  const [demoResult, setDemoResult] = useState(null)
  const [language, setLanguage] = useState('en')

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[var(--color-text-secondary)]">Loading...</p>
        </div>
      </div>
    )
  }

  // Demo mode — show score results for a persona
  if (view === 'demo' && demoResult) {
    return (
      <div className="min-h-screen p-4 md:p-8 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => { setView('home'); setDemoResult(null) }}
            className="text-[var(--color-primary-light)] hover:underline"
          >
            ← Back to Home
          </button>
          <button
            onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
            className="px-3 py-1.5 rounded-lg glass text-sm"
          >
            {language === 'en' ? 'हिंदी' : 'English'}
          </button>
        </div>

        <div className="text-center mb-8 fade-in">
          <span className="text-4xl">{demoResult.persona.emoji}</span>
          <h2 className="text-xl font-bold mt-2">{demoResult.persona.name}</h2>
          <p className="text-[var(--color-text-secondary)]">{demoResult.persona.title}</p>
        </div>

        <div className="space-y-6 fade-in-stagger">
          <div className="glass rounded-xl p-6 flex justify-center">
            <ScoreGauge
              score={demoResult.score}
              band={demoResult.band}
              bandColor={demoResult.color}
              confidenceMargin={28}
              benchmarkPercentile={demoResult.percentile}
            />
          </div>

          <FactorWaterfall factors={demoResult.factors} language={language} />
          <Recommendations recommendations={demoResult.recommendations} language={language} />
          <WhatIfSimulator originalInput={demoResult.input} originalScore={demoResult.score} />
        </div>
      </div>
    )
  }

  // Auth page
  if (view === 'auth') {
    return (
      <div>
        <button
          onClick={() => setView('home')}
          className="absolute top-4 left-4 text-[var(--color-primary-light)] hover:underline z-10"
        >
          ← Back
        </button>
        <AuthPage />
      </div>
    )
  }

  // Authenticated flows
  if (authState === 'authenticated_no_profile') {
    return <ProfileSetup />
  }

  if (authState === 'authenticated') {
    return <Dashboard />
  }

  // Default: Landing page
  return (
    <HeroSection
      onSignUp={() => setView('auth')}
      onTryDemo={(personaId) => handleDemoLoad(personaId)}
    />
  )

  async function handleDemoLoad(personaId) {
    // Load persona and compute score client-side
    const personas = {
      ravi: {
        name: 'Ravi Kumar', title: 'Delivery Partner', emoji: '🛵',
        data: {
          monthly_income: 22000, monthly_expenses: 18000,
          rent: 6000, food: 5000, transport: 4000, discretionary: 3000,
          savings_amount: 2000, bill_payment: 'sometimes_late',
          employment_type: 'gig', existing_debt: 0,
          rent_history: 'consistent', telecom_regularity: true,
        }
      },
      priya: {
        name: 'Priya Sharma', title: 'College Student', emoji: '📚',
        data: {
          monthly_income: 8000, monthly_expenses: 6000,
          rent: 0, food: 3000, transport: 1500, discretionary: 1500,
          savings_amount: 1800, bill_payment: 'always_on_time',
          employment_type: 'freelance', existing_debt: 0,
          rent_history: 'consistent', telecom_regularity: true,
        }
      },
      mohan: {
        name: 'Mohan Patel', title: 'Kirana Shop Owner', emoji: '🏪',
        data: {
          monthly_income: 35000, monthly_expenses: 22000,
          rent: 5000, food: 6000, transport: 2000, discretionary: 4000,
          savings_amount: 7000, bill_payment: 'always_on_time',
          employment_type: 'self_employed', existing_debt: 3000,
          rent_history: 'consistent', telecom_regularity: true,
        }
      },
    }

    const persona = personas[personaId] || personas.ravi
    const { score, factors } = computeScore(persona.data)
    const { band, color } = getBand(score)

    // Generate mock factor contributions for demo
    const neutralScore = 50
    const weights = {
      payment_consistency: 0.30, savings_ratio: 0.25,
      income_stability: 0.20, spending_discipline: 0.15, debt_to_income: 0.10,
    }
    const factorLabels = {
      payment_consistency: { en: 'Payment Consistency', hi: 'भुगतान नियमितता' },
      savings_ratio: { en: 'Savings Discipline', hi: 'बचत अनुशासन' },
      income_stability: { en: 'Income Stability', hi: 'आय स्थिरता' },
      spending_discipline: { en: 'Spending Discipline', hi: 'खर्च अनुशासन' },
      debt_to_income: { en: 'Debt-to-Income Ratio', hi: 'ऋण-से-आय अनुपात' },
    }

    const factorContributions = Object.entries(factors).map(([key, subScore]) => {
      const points = Math.round(((subScore - neutralScore) / 100) * weights[key] * 600 * 10) / 10
      return {
        factor: key,
        label: factorLabels[key].en,
        label_hi: factorLabels[key].hi,
        points,
        is_positive: points >= 0,
        description: `Sub-score: ${Math.round(subScore)}/100`,
        description_hi: `उप-स्कोर: ${Math.round(subScore)}/100`,
      }
    }).sort((a, b) => Math.abs(b.points) - Math.abs(a.points))

    // Mock recommendations
    const mockRecs = [
      { action: 'Pay all bills on time for 3 months', action_hi: '3 महीने तक सभी बिल समय पर भुगतान करें', impact_min: 15, impact_max: 25, effort: 'medium', timeframe: '90 days', explanation: 'Payment history is the strongest predictor of credit.', explanation_hi: 'भुगतान इतिहास क्रेडिट का सबसे मजबूत भविष्यवक्ता है।' },
      { action: 'Increase savings to 20% of income', action_hi: 'बचत को आय के 20% तक बढ़ाएं', impact_min: 10, impact_max: 18, effort: 'medium', timeframe: '3 months', explanation: 'Higher savings ratio signals financial resilience.', explanation_hi: 'उच्च बचत अनुपात वित्तीय लचीलापन दर्शाता है।' },
      { action: 'Set up auto-pay for telecom bills', action_hi: 'टेलीकॉम बिलों के लिए ऑटो-पे सेट करें', impact_min: 3, impact_max: 8, effort: 'low', timeframe: '30 days', explanation: 'Easy win — adds a positive signal to your profile.', explanation_hi: 'आसान जीत — आपकी प्रोफ़ाइल में सकारात्मक संकेत जोड़ता है।' },
    ]

    setDemoResult({
      persona: { name: persona.name, title: persona.title, emoji: persona.emoji },
      input: persona.data,
      score,
      band,
      color,
      percentile: score >= 700 ? 78 : score >= 600 ? 52 : score >= 500 ? 28 : 10,
      factors: factorContributions,
      recommendations: mockRecs,
    })
    setView('demo')
  }
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
