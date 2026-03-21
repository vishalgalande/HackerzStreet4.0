/**
 * Feature: Dashboard — Main Dashboard
 * Premium hero experience with animated score gauge, interactive controls,
 * animated cards, and dark autumn fintech aesthetic.
 */

import { useState, useEffect, useRef, useMemo } from 'react'
import { motion, useInView } from 'framer-motion'
import { useAuth } from '../feature-auth/AuthContext'
import DailyEntryForm from './DailyEntryForm'
import ScoreGauge from '../feature-scoring/ScoreGauge'
import FactorWaterfall from '../feature-scoring/FactorWaterfall'
import Recommendations from '../feature-scoring/Recommendations'
import WhatIfSimulator from '../feature-scoring/WhatIfSimulator'
import { computeScore, getBand } from '../feature-scoring/scorer'

const occupations = [
  { value: 'salaried', label: 'Salaried Employee' },
  { value: 'freelance', label: 'Freelancer' },
  { value: 'gig', label: 'Gig Worker' },
  { value: 'self_employed', label: 'Self Employed' },
  { value: 'student', label: 'Student' },
]

const timelines = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'semi_annual', label: 'Semi-Annual' },
]

function AnimatedNumber({ target, prefix = '' }) {
  const [value, setValue] = useState(0)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })

  useEffect(() => {
    if (!inView) return
    const duration = 1500
    const start = Date.now()
    const timer = setInterval(() => {
      const elapsed = Date.now() - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(target * eased))
      if (progress >= 1) clearInterval(timer)
    }, 16)
    return () => clearInterval(timer)
  }, [inView, target])

  return <span ref={ref}>{prefix}{value.toLocaleString()}</span>
}

// Mock data for demonstration
const mockProfile = {
  monthly_income: 25000,
  monthly_expenses: 18000,
  rent: 6000,
  food: 5000,
  transport: 3000,
  discretionary: 4000,
  savings_amount: 4500,
  bill_payment: 'always_on_time',
  employment_type: 'freelance',
  existing_debt: 2000,
  rent_history: 'consistent',
  telecom_regularity: true,
}

const mockRecommendations = [
  { action: 'Pay all bills on time for 3 months', action_hi: '3 महीने तक सभी बिल समय पर भुगतान करें', impact_min: 15, impact_max: 25, effort: 'medium', timeframe: '90 days', explanation: 'Payment history is the strongest predictor of credit.', explanation_hi: 'भुगतान इतिहास क्रेडिट का सबसे मजबूत भविष्यवक्ता है।' },
  { action: 'Increase savings to 20% of income', action_hi: 'बचत को आय के 20% तक बढ़ाएं', impact_min: 10, impact_max: 18, effort: 'medium', timeframe: '3 months', explanation: 'Higher savings ratio signals financial resilience.', explanation_hi: 'उच्च बचत अनुपात वित्तीय लचीलापन दर्शाता है।' },
  { action: 'Reduce discretionary spending below 15%', action_hi: 'विवेकाधीन खर्च 15% से नीचे कम करें', impact_min: 8, impact_max: 14, effort: 'low', timeframe: '30 days', explanation: 'Lower discretionary ratio indicates financial maturity.', explanation_hi: 'कम विवेकाधीन अनुपात वित्तीय परिपक्वता दर्शाता है।' },
]

const trendData = [520, 528, 535, 542, 548, 560, 572, 580, 588, 595, 602, 612]
const spendingBreakdown = [
  { label: 'Rent', value: 6000, color: '#c4652a' },
  { label: 'Food', value: 5000, color: '#d4940a' },
  { label: 'Transport', value: 3000, color: '#b87333' },
  { label: 'Discretionary', value: 4000, color: '#d4a843' },
]

function DonutChart({ data }) {
  const total = data.reduce((s, d) => s + d.value, 0)
  let cumAngle = 0
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })

  return (
    <div ref={ref} className="flex items-center gap-6">
      <svg width="120" height="120" viewBox="0 0 120 120">
        {data.map((item, i) => {
          const angle = (item.value / total) * 360
          const startAngle = cumAngle
          cumAngle += angle
          const startRad = (startAngle - 90) * Math.PI / 180
          const endRad = (startAngle + angle - 90) * Math.PI / 180
          const largeArc = angle > 180 ? 1 : 0
          const r = 45
          const path = `M ${60 + r * Math.cos(startRad)} ${60 + r * Math.sin(startRad)} A ${r} ${r} 0 ${largeArc} 1 ${60 + r * Math.cos(endRad)} ${60 + r * Math.sin(endRad)}`

          return (
            <motion.path
              key={i}
              d={path}
              fill="none"
              stroke={item.color}
              strokeWidth="16"
              strokeLinecap="butt"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={inView ? { pathLength: 1, opacity: 1 } : {}}
              transition={{ duration: 1, delay: i * 0.2, ease: [0.4, 0, 0.2, 1] }}
            />
          )
        })}
      </svg>
      <div className="space-y-2">
        {data.map((item, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: item.color }} />
            <span className="text-[var(--color-text-secondary)]">{item.label}</span>
            <span className="font-medium">₹{item.value.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function TrendChart({ data }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const points = data.map((v, i) => ({
    x: (i / (data.length - 1)) * 280 + 10,
    y: 80 - ((v - min) / range) * 60 + 10,
  }))
  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  const pathLength = 1000

  return (
    <div ref={ref}>
      <svg viewBox="0 0 300 100" className="w-full h-24">
        <defs>
          <linearGradient id="trendGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#c4652a" />
            <stop offset="100%" stopColor="#d4a843" />
          </linearGradient>
          <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#d4a843" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#d4a843" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Area fill */}
        <motion.path
          d={`${pathD} L 290 90 L 10 90 Z`}
          fill="url(#trendFill)"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 1, delay: 0.5 }}
        />
        {/* Line */}
        <motion.path
          d={pathD}
          fill="none"
          stroke="url(#trendGradient)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray={pathLength}
          initial={{ strokeDashoffset: pathLength }}
          animate={inView ? { strokeDashoffset: 0 } : {}}
          transition={{ duration: 1.5, ease: [0.4, 0, 0.2, 1] }}
          style={{ filter: 'drop-shadow(0 0 6px rgba(212, 168, 67, 0.3))' }}
        />
        {/* Dots */}
        {points.map((p, i) => (
          <motion.circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="3"
            fill="var(--color-bg-primary)"
            stroke="#d4a843"
            strokeWidth="1.5"
            initial={{ scale: 0 }}
            animate={inView ? { scale: 1 } : {}}
            transition={{ duration: 0.3, delay: 0.5 + i * 0.05 }}
          />
        ))}
      </svg>
      <div className="flex justify-between text-[10px] text-[var(--color-text-muted)] mt-1 px-2">
        <span>Jan</span><span>Mar</span><span>Jun</span><span>Sep</span><span>Dec</span>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { user, profile, getToken, signOut } = useAuth()
  const [entries, setEntries] = useState([])
  const [showEntryForm, setShowEntryForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [occupation, setOccupation] = useState('freelance')
  const [timeline, setTimeline] = useState('monthly')
  const [language, setLanguage] = useState('en')

  // Compute score based on mock profile + occupation
  const profileData = useMemo(() => ({
    ...mockProfile,
    employment_type: occupation,
  }), [occupation])

  const scoreResult = useMemo(() => {
    const { score, factors } = computeScore(profileData)
    const { band, color } = getBand(score)
    return { score, factors, band, color }
  }, [profileData])

  // Factor contributions for waterfall chart
  const factorContributions = useMemo(() => {
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
    return Object.entries(scoreResult.factors).map(([key, subScore]) => {
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
  }, [scoreResult.factors])

  useEffect(() => {
    fetchEntries()
  }, [])

  async function fetchEntries() {
    try {
      const token = getToken()
      const res = await fetch('/api/entries?days=30', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setEntries(data)
      }
    } catch {
      // Backend not running — use empty state
    } finally {
      setLoading(false)
    }
  }

  function handleEntrySaved() {
    setShowEntryForm(false)
    fetchEntries()
  }

  return (
    <div className="min-h-screen pt-20 pb-16 px-4 md:px-8 max-w-6xl mx-auto">
      {/* ===== HERO: Score Gauge ===== */}
      <motion.div
        className="glass-card rounded-2xl p-8 mb-8 relative overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full opacity-10"
          style={{ background: `radial-gradient(circle, ${scoreResult.color}, transparent 70%)` }} />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">Your Credit Score</h1>
              <p className="text-sm text-[var(--color-text-secondary)]">{user?.email || 'Dashboard'}</p>
            </div>
            <div className="flex gap-2">
              <motion.button
                onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
                className="px-3 py-1.5 rounded-lg text-xs font-medium"
                style={{ border: '1px solid var(--color-border)' }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {language === 'en' ? 'हिंदी' : 'English'}
              </motion.button>
              <motion.button
                onClick={() => setShowEntryForm(true)}
                className="btn-primary text-sm py-2 px-4"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                + Log Today
              </motion.button>
            </div>
          </div>

          {/* Score gauge center */}
          <div className="flex justify-center mb-8">
            <ScoreGauge
              score={scoreResult.score}
              band={scoreResult.band}
              bandColor={scoreResult.color}
              confidenceMargin={28}
              benchmarkPercentile={scoreResult.score >= 700 ? 78 : scoreResult.score >= 600 ? 52 : 28}
            />
          </div>

          {/* Controls: Occupation + Timeline */}
          <div className="grid sm:grid-cols-2 gap-4 max-w-lg mx-auto">
            <div>
              <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1.5">Occupation</label>
              <motion.select
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
                className="input-field text-sm"
                whileFocus={{ scale: 1.01 }}
              >
                {occupations.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </motion.select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1.5">Income Timeline</label>
              <div className="flex gap-1 p-1 rounded-lg" style={{ background: 'var(--color-bg-primary)' }}>
                {timelines.map(t => (
                  <motion.button
                    key={t.value}
                    onClick={() => setTimeline(t.value)}
                    className="flex-1 py-2 rounded-md text-xs font-medium transition-all"
                    style={{
                      background: timeline === t.value ? 'linear-gradient(135deg, var(--color-burnt-orange), var(--color-amber))' : 'transparent',
                      color: timeline === t.value ? 'white' : 'var(--color-text-muted)',
                    }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {t.label}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ===== KEY CARDS ===== */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {[
          {
            title: 'Bills & Loans',
            icon: '◎',
            color: '#10B981',
            stats: [
              { label: 'On-time payments', value: '92%' },
              { label: 'Active loans', value: '₹2,000/mo' },
              { label: 'Payment streak', value: '14 days' },
            ],
          },
          {
            title: 'Credit Score',
            icon: '△',
            color: '#d4a843',
            stats: [
              { label: 'Current', value: scoreResult.score.toString() },
              { label: 'Band', value: scoreResult.band },
              { label: '30d change', value: '+18' },
            ],
          },
          {
            title: 'Improve Score',
            icon: '⚡',
            color: '#c4652a',
            stats: [
              { label: 'Top action', value: 'Pay bills' },
              { label: 'Potential gain', value: '+15-25 pts' },
              { label: 'Effort', value: 'Medium' },
            ],
          },
        ].map((card, i) => {
          const ref = useRef(null)
          const inView = useInView(ref, { once: true, margin: '-30px' })
          return (
            <motion.div
              key={i}
              ref={ref}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="glass-card rounded-xl p-5 card-tilt"
            >
              <div className="flex items-center gap-2 mb-4">
                <span className="text-lg" style={{ color: card.color }}>{card.icon}</span>
                <h3 className="font-semibold">{card.title}</h3>
              </div>
              <div className="space-y-2.5">
                {card.stats.map((stat, j) => (
                  <div key={j} className="flex justify-between text-sm">
                    <span className="text-[var(--color-text-muted)]">{stat.label}</span>
                    <span className="font-medium" style={{ color: card.color }}>{stat.value}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* ===== CHARTS ===== */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <motion.div
          className="glass-card rounded-xl p-5"
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <h3 className="font-semibold mb-4">Score Trend</h3>
          <TrendChart data={trendData} />
        </motion.div>

        <motion.div
          className="glass-card rounded-xl p-5"
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <h3 className="font-semibold mb-4">Spending Breakdown</h3>
          <DonutChart data={spendingBreakdown} />
        </motion.div>
      </div>

      {/* ===== FACTOR BREAKDOWN & RECOMMENDATIONS ===== */}
      <div className="space-y-6 mb-8">
        <FactorWaterfall factors={factorContributions} language={language} />
        <Recommendations recommendations={mockRecommendations} language={language} />
      </div>

      {/* ===== WHAT-IF SIMULATOR ===== */}
      <WhatIfSimulator originalInput={profileData} originalScore={scoreResult.score} />

      {/* ===== DAILY ENTRY FORM MODAL ===== */}
      {showEntryForm && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ background: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(8px)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="w-full max-w-lg"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <DailyEntryForm
              onSave={handleEntrySaved}
              onCancel={() => setShowEntryForm(false)}
            />
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
