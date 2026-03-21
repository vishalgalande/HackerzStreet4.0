/**
 * Feature: Dashboard — Main Dashboard
 * Premium hero experience with animated score gauge, interactive controls,
 * animated cards, and dark autumn fintech aesthetic.
 * 
 * Integrated with backend pipeline:
 *   - Entries persist to localStorage + Supabase
 *   - Score computed via POST /api/compute-score
 *   - Real profile data from AuthContext
 */

import { useState, useEffect, useRef, useMemo } from 'react'
import { motion, useInView } from 'framer-motion'
import { useAuth } from '../feature-auth/AuthContext'
import DailyEntryForm from './DailyEntryForm'
import ScoreGauge from '../feature-scoring/ScoreGauge'
import FactorWaterfall from '../feature-scoring/FactorWaterfall'
import Recommendations from '../feature-scoring/Recommendations'
import WhatIfSimulator from '../feature-scoring/WhatIfSimulator'
import RiskAssessment from '../feature-scoring/RiskAssessment'
import { computeScore, getBand } from '../feature-scoring/scorer'

const ENTRIES_KEY = 'hackerzstreet_entries'

function loadEntries() {
  try { return JSON.parse(localStorage.getItem(ENTRIES_KEY) || '[]') }
  catch { return [] }
}
function saveEntries(entries) {
  localStorage.setItem(ENTRIES_KEY, JSON.stringify(entries))
}

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

function DonutChart({ data }) {
  const total = data.reduce((s, d) => s + d.value, 0)
  let cumAngle = 0
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })

  if (total === 0) {
    return (
      <div ref={ref} className="flex items-center justify-center h-32 text-[var(--color-text-muted)] text-sm">
        Log entries to see spending breakdown
      </div>
    )
  }

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

  if (!data || data.length < 2) {
    return (
      <div ref={ref} className="flex items-center justify-center h-24 text-[var(--color-text-muted)] text-sm">
        Compute score multiple times to see trend
      </div>
    )
  }

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
        <motion.path
          d={`${pathD} L 290 90 L 10 90 Z`}
          fill="url(#trendFill)"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 1, delay: 0.5 }}
        />
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
    </div>
  )
}

export default function Dashboard() {
  const { user, profile, getToken, signOut } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const [entries, setEntries] = useState(() => loadEntries())
  const [showEntryForm, setShowEntryForm] = useState(false)
  const [occupation, setOccupation] = useState(profile?.employment_type || 'freelance')
  const [timeline, setTimeline] = useState(profile?.income_period || 'monthly')
  const [language, setLanguage] = useState('en')
  const [backendScore, setBackendScore] = useState(null)
  const [computing, setComputing] = useState(false)
  const [scoreHistory, setScoreHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem('hackerzstreet_score_history') || '[]') }
    catch { return [] }
  })

  // Sync entries from backend on mount
  useEffect(() => {
    const token = getToken()
    if (!token) return
    fetch('/api/entries?days=30', {
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(r => r.ok ? r.json() : []).then(backendEntries => {
      const localEntries = loadEntries()
      const localIds = new Set(localEntries.map(e => e.id))
      const merged = [...localEntries, ...backendEntries.filter(e => !localIds.has(e.id))]
        .sort((a, b) => (b.date || '').localeCompare(a.date || ''))
      setEntries(merged)
      saveEntries(merged)
    }).catch(() => {})
  }, [])

  // Build profile data for client-side scoring (instant preview)
  const profileData = useMemo(() => ({
    monthly_income: profile?.monthly_income || 25000,
    monthly_expenses: entries.reduce((s, e) => s + (e.food || 0) + (e.transport || 0) + (e.rent || 0) + (e.discretionary || 0), 0) || 18000,
    rent: entries.reduce((s, e) => s + (e.rent || 0), 0) || 6000,
    food: entries.reduce((s, e) => s + (e.food || 0), 0) || 5000,
    transport: entries.reduce((s, e) => s + (e.transport || 0), 0) || 3000,
    discretionary: entries.reduce((s, e) => s + (e.discretionary || 0), 0) || 4000,
    savings_amount: entries.reduce((s, e) => s + (e.savings || 0), 0) || 4500,
    bill_payment: profile?.bill_payment || 'always_on_time',
    employment_type: occupation,
    existing_debt: profile?.existing_debt || 0,
    rent_history: profile?.rent_history || 'consistent',
    telecom_regularity: profile?.telecom_regularity || true,
  }), [occupation, profile, entries])

  const scoreResult = useMemo(() => {
    if (backendScore) return backendScore
    const { score, factors } = computeScore(profileData)
    const { band, color } = getBand(score)
    return { score, factors, band, color }
  }, [profileData, backendScore])

  // Factor contributions for waterfall chart
  const factorContributions = useMemo(() => {
    if (backendScore?.factors_list) return backendScore.factors_list
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
        label: factorLabels[key]?.en || key,
        label_hi: factorLabels[key]?.hi || key,
        points,
        is_positive: points >= 0,
        description: `Sub-score: ${Math.round(subScore)}/100`,
        description_hi: `उप-स्कोर: ${Math.round(subScore)}/100`,
      }
    }).sort((a, b) => Math.abs(b.points) - Math.abs(a.points))
  }, [scoreResult.factors, backendScore])

  // Spending breakdown from entries
  const spendingBreakdown = useMemo(() => {
    const totals = entries.reduce((acc, e) => ({
      rent: acc.rent + (e.rent || 0),
      food: acc.food + (e.food || 0),
      transport: acc.transport + (e.transport || 0),
      discretionary: acc.discretionary + (e.discretionary || 0),
    }), { rent: 0, food: 0, transport: 0, discretionary: 0 })
    return [
      { label: 'Rent', value: totals.rent, color: '#c4652a' },
      { label: 'Food', value: totals.food, color: '#d4940a' },
      { label: 'Transport', value: totals.transport, color: '#b87333' },
      { label: 'Discretionary', value: totals.discretionary, color: '#d4a843' },
    ]
  }, [entries])

  // Recommendations
  const recommendations = useMemo(() => {
    if (backendScore?.recommendations) return backendScore.recommendations
    return [
      { action: 'Pay all bills on time for 3 months', action_hi: '3 महीने तक सभी बिल समय पर भुगतान करें', impact_min: 15, impact_max: 25, effort: 'medium', timeframe: '90 days', explanation: 'Payment history is the strongest predictor of credit.', explanation_hi: 'भुगतान इतिहास क्रेडिट का सबसे मजबूत भविष्यवक्ता है।' },
      { action: 'Increase savings to 20% of income', action_hi: 'बचत को आय के 20% तक बढ़ाएं', impact_min: 10, impact_max: 18, effort: 'medium', timeframe: '3 months', explanation: 'Higher savings ratio signals financial resilience.', explanation_hi: 'उच्च बचत अनुपात वित्तीय लचीलापन दर्शाता है।' },
      { action: 'Reduce discretionary spending below 15%', action_hi: 'विवेकाधीन खर्च 15% से नीचे कम करें', impact_min: 8, impact_max: 14, effort: 'low', timeframe: '30 days', explanation: 'Lower discretionary ratio indicates financial maturity.', explanation_hi: 'कम विवेकाधीन अनुपात वित्तीय परिपक्वता दर्शाता है।' },
    ]
  }, [backendScore])

  function handleEntrySaved(newEntry) {
    setShowEntryForm(false)
    const updated = [newEntry, ...entries].sort((a, b) => (b.date || '').localeCompare(a.date || ''))
    setEntries(updated)
    saveEntries(updated)
    // Fire-and-forget to backend
    const token = getToken()
    fetch('/api/entries', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(newEntry),
    }).catch(() => {})
  }

  async function computeBackendScore() {
    setComputing(true)
    try {
      const token = getToken()
      const payload = {
        monthly_income: profile?.monthly_income || 0,
        income_amount: profile?.income_amount || profile?.monthly_income || 0,
        income_period: timeline,
        employment_type: occupation,
        existing_debt: profile?.existing_debt || 0,
        loans: profile?.loans || [],
        rent_history: profile?.rent_history || 'consistent',
        bill_payment: profile?.bill_payment || 'always_on_time',
        telecom_regularity: profile?.telecom_regularity || false,
        entries: entries.map(e => ({
          date: e.date, rent: e.rent || 0, food: e.food || 0,
          transport: e.transport || 0, discretionary: e.discretionary || 0,
          savings: e.savings || 0, bill_paid_on_time: e.bill_paid_on_time !== false,
        })),
      }
      const res = await fetch('/api/compute-score', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        const data = await res.json()
        setBackendScore({
          score: data.score,
          band: data.band,
          color: data.band_color,
          factors: data.factors.reduce((acc, f) => ({ ...acc, [f.factor]: 50 + (f.points / 600 * 100 / (({ payment_consistency: 0.30, savings_ratio: 0.25, income_stability: 0.20, spending_discipline: 0.15, debt_to_income: 0.10 })[f.factor] || 0.2)) }), {}),
          factors_list: data.factors,
          recommendations: data.recommendations,
          risk_assessment: data.risk_assessment,
          data_quality: data.data_quality,
          summary: data.summary,
          summary_hi: data.summary_hi,
        })
        // Save to history
        const newHistory = [...scoreHistory, data.score].slice(-12)
        setScoreHistory(newHistory)
        localStorage.setItem('hackerzstreet_score_history', JSON.stringify(newHistory))
      }
    } catch {
      // Fall back to client-side score (already computed)
    } finally {
      setComputing(false)
    }
  }

  // Cards data from real entries
  const billsOnTime = entries.length > 0
    ? Math.round(entries.filter(e => e.bill_paid_on_time).length / entries.length * 100) + '%'
    : 'No data'
  const totalDebt = profile?.existing_debt || 0

  return (
    <div className="page-container pb-16" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* TOP SECTION: Horizontal Card for Selectors & Actions */}
      <div className="glass-card rounded-2xl p-5 md:p-6 flex flex-col md:flex-row items-center justify-between gap-4 border border-slate-800/60 shadow-lg">
        <div className="flex items-center gap-5 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-[13px] font-semibold text-slate-400 uppercase tracking-wider">Profile:</span>
            <select value={occupation} onChange={(e) => setOccupation(e.target.value)} className="bg-slate-800/50 border border-slate-700 text-slate-200 text-[15px] rounded-lg px-4 py-2 focus:ring-1 focus:ring-teal-500 outline-none cursor-pointer hover:bg-slate-700 transition-colors">
              {occupations.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div className="w-px h-7 bg-slate-700 shrink-0 hidden md:block" />
          <div className="flex items-center gap-1.5 bg-slate-800/30 p-1.5 rounded-lg border border-slate-700/50 shrink-0">
            {timelines.map(t => (
              <button key={t.value} onClick={() => setTimeline(t.value)} className={`px-4 py-1.5 text-[13px] font-medium rounded-md transition-all ${timeline === t.value ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button onClick={() => setShowEntryForm(true)} className="bg-slate-800/80 hover:bg-slate-700 text-teal-400 border border-teal-500/20 px-5 py-2.5 rounded-xl text-[15px] font-medium transition-colors">
            + Log Today
          </button>
          <button onClick={computeBackendScore} disabled={computing} className="bg-teal-500 hover:bg-teal-400 text-slate-900 px-6 py-2.5 rounded-xl text-[15px] font-bold transition-all disabled:opacity-50 shadow-[0_0_15px_rgba(20,184,166,0.2)]">
            {computing ? 'Computing...' : 'Refresh Score'}
          </button>
        </div>
      </div>

      {/* ROW 1: 3 Cards (Bills, Score Gauge, Tips) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Bills & Loans */}
        <div className="lg:col-span-4 xl:col-span-3 glass-card rounded-2xl p-7 border border-slate-800/60 flex flex-col justify-between hover:border-slate-700 transition-colors shadow-lg">
          <div>
            <h3 className="text-[13px] font-semibold text-slate-400 uppercase tracking-wider mb-6 flex items-center gap-2">
              <span className="text-base">◎</span> Bills & Loans
            </h3>
            <div className="space-y-6">
              <div>
                <p className="text-[13px] text-slate-400 mb-1.5">On-time History</p>
                <p className="text-3xl font-bold text-emerald-400 tracking-tight">{billsOnTime}</p>
              </div>
              <div className="w-full h-px bg-slate-800/50" />
              <div>
                <p className="text-[13px] text-slate-400 mb-1.5">Active Debt Profile</p>
                <p className="text-2xl font-medium text-slate-200 tracking-tight">₹{totalDebt.toLocaleString()}</p>
              </div>
            </div>
          </div>
          <p className="text-[13px] text-slate-500 mt-8 leading-relaxed">Derived from {entries.length} registered entries.</p>
        </div>

        {/* Central Score Gauge */}
        <div className="lg:col-span-4 xl:col-span-6 glass-card rounded-2xl p-10 border border-slate-800/60 relative overflow-hidden flex flex-col items-center justify-center min-h-[380px] shadow-xl hover:shadow-[0_0_40px_rgba(20,184,166,0.05)] transition-shadow group">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full opacity-0 group-hover:opacity-10 blur-3xl transition-opacity duration-1000" style={{ background: scoreResult.color }} />
          
          <ScoreGauge
            score={scoreResult.score}
            band={scoreResult.band}
            bandColor={scoreResult.color}
            confidenceMargin={backendScore?.data_quality?.entry_count >= 14 ? 15 : 28}
            benchmarkPercentile={scoreResult.score >= 700 ? 78 : scoreResult.score >= 600 ? 52 : 28}
          />
          
          {backendScore?.data_quality && (
            <div className={`mt-8 text-[13px] px-4 py-1.5 rounded-full border tracking-wide uppercase ${
              backendScore.data_quality.entry_count >= 14
                ? 'bg-emerald-500/5 text-emerald-400 border-emerald-500/20'
                : backendScore.data_quality.entry_count > 0
                ? 'bg-amber-500/5 text-amber-400 border-amber-500/20'
                : 'bg-rose-500/5 text-rose-400 border-rose-500/20'
            }`}>
              {backendScore.data_quality.confidence_note}
            </div>
          )}
        </div>

        {/* Improve Score Tips */}
        <div className="lg:col-span-4 xl:col-span-3 glass-card rounded-2xl p-7 border border-slate-800/60 flex flex-col hover:border-slate-700 transition-colors shadow-lg">
          <h3 className="text-[13px] font-semibold text-slate-400 uppercase tracking-wider mb-6 flex items-center gap-2">
            <span className="text-base">⚡</span> Quick Improvements
          </h3>
          
          <div className="flex-1 space-y-4">
            {recommendations.slice(0, 3).map((rec, i) => (
              <div key={i} className="bg-slate-800/30 p-4 rounded-xl border border-slate-700/50 hover:bg-slate-800/60 transition-colors">
                <p className="text-[14px] font-medium text-slate-200 mb-3 leading-snug">{rec.action}</p>
                <div className="flex items-center justify-between">
                  <span className="text-[13px] text-slate-500 flex items-center gap-1.5">⏱ {rec.timeframe}</span>
                  <span className="text-[13px] font-bold text-teal-400 bg-teal-500/10 px-2.5 py-1 rounded">+{rec.impact_min}-{rec.impact_max} pts</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ROW 2: Upcoming Payments & Trend Graph */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 glass-card rounded-2xl p-7 md:p-8 border border-slate-800/60 shadow-lg">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-[14px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <span className="text-lg">📅</span> Upcoming Payments
            </h3>
            <button className="text-[13px] text-teal-400 hover:text-teal-300 transition-colors bg-teal-500/10 px-3 py-1.5 rounded-lg">View All</button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-[13px] text-slate-500 uppercase tracking-wider">
                  <th className="pb-4 font-medium">Biller / Institution</th>
                  <th className="pb-4 font-medium">Type</th>
                  <th className="pb-4 font-medium">Due Date</th>
                  <th className="pb-4 text-right font-medium">Amount</th>
                </tr>
              </thead>
              <tbody className="text-[15px]">
                <tr className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                  <td className="py-5 text-slate-200 font-medium flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-rose-400 text-lg">⚡</div>
                    Lumiere Energy
                  </td>
                  <td className="py-5 text-slate-400">Utility</td>
                  <td className="py-5 text-orange-400 font-medium">Tomorrow</td>
                  <td className="py-5 text-right text-slate-200 font-bold">₹1,450</td>
                </tr>
                <tr className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                  <td className="py-5 text-slate-200 font-medium flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-teal-400 text-lg">📱</div>
                    AirNet Telecom
                  </td>
                  <td className="py-5 text-slate-400">Internet</td>
                  <td className="py-5 text-slate-300 font-medium">Oct 14</td>
                  <td className="py-5 text-right text-slate-200 font-bold">₹999</td>
                </tr>
                <tr className="hover:bg-slate-800/20 transition-colors">
                  <td className="py-5 text-slate-200 font-medium flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-emerald-400 text-lg">🏦</div>
                    HDFC Auto Loan
                  </td>
                  <td className="py-5 text-slate-400">EMI</td>
                  <td className="py-5 text-slate-300 font-medium">Oct 20</td>
                  <td className="py-5 text-right text-slate-200 font-bold">₹12,500</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Trend Graph */}
        <div className="lg:col-span-5 glass-card rounded-2xl p-7 md:p-8 border border-slate-800/60 shadow-lg flex flex-col">
          <h3 className="text-[14px] font-semibold text-slate-400 uppercase tracking-wider mb-8 flex items-center gap-2">
            <span className="text-lg">📈</span> Trajectory Forecast
          </h3>
          <div className="flex-1 flex flex-col justify-center min-h-[220px]">
             <TrendChart data={scoreHistory} />
             <p className="text-[13px] text-center text-slate-500 mt-8">
               Historic variance logged across system resets.
             </p>
          </div>
        </div>
      </div>

      {/* ROW 3: Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <button className="glass-card bg-slate-800/40 hover:bg-slate-800/80 border border-slate-700/60 p-5 rounded-2xl flex items-center justify-center gap-5 transition-all hover:shadow-lg group">
          <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center text-xl group-hover:scale-110 group-hover:bg-rose-500/20 transition-all">💳</div>
          <span className="text-[15px] font-medium text-slate-200">Pay Outstanding Bills</span>
        </button>
        <button className="glass-card bg-slate-800/40 hover:bg-slate-800/80 border border-slate-700/60 p-5 rounded-2xl flex items-center justify-center gap-5 transition-all hover:shadow-lg group">
          <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center text-xl group-hover:scale-110 group-hover:bg-amber-500/20 transition-all">📉</div>
          <span className="text-[15px] font-medium text-slate-200">Reduce Active Debt</span>
        </button>
        <button className="glass-card bg-slate-800/40 hover:bg-slate-800/80 border border-slate-700/60 p-5 rounded-2xl flex items-center justify-center gap-5 transition-all hover:shadow-lg group">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-xl group-hover:scale-110 group-hover:bg-emerald-500/20 transition-all">💰</div>
          <span className="text-[15px] font-medium text-slate-200">Boost Savings Rate</span>
        </button>
      </div>

      {/* ===== DAILY ENTRY FORM MODAL ===== */}
      {showEntryForm && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-slate-950/60 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="w-full max-w-lg"
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: "spring", bounce: 0.3 }}
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
