import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../feature-auth/AuthContext'
import usePayments from '../feature-payments/usePayments'

const API = import.meta.env.VITE_API_URL || ''

const LIQUID_FUNDS = [
  { id: 1, name: 'Quantum Liquid Direct', returnRate: '6.8%', color: '#10b981', risk: 'Very Low Risk' },
  { id: 2, name: 'Parag Parikh Liquid', returnRate: '7.1%', color: '#14b8a6', risk: 'Very Low Risk' },
  { id: 3, name: 'Axis Liquid Fund', returnRate: '6.9%', color: '#06b6d4', risk: 'Very Low Risk' },
]

const WEALTH_STRATEGIES = [
  { id: 'balanced', title: 'Balanced', fund: 'ICICI Prudential BAF', ret: '10.5% p.a.', horizon: '3-5 yrs', color: '#f59e0b', risk: 'Medium Risk', reason: 'Dynamic allocation protects downside while capturing equity upside.' },
  { id: 'equity', title: 'Equity', fund: 'Parag Parikh Flexi Cap', ret: '15.2% p.a.', horizon: '5+ yrs', color: '#ef4444', risk: 'High Risk', reason: 'Long-term wealth creation through diversified equity exposure.' },
]

const TRAITS = [
  { label: 'Personality', value: 'Moderate Spender', icon: '👤', hl: 'text-neutral-50' },
  { label: 'Risk Tolerance', value: 'Strategic & Controlled', icon: '⚖️', hl: 'text-emerald-400' },
  { label: 'Improvement Area', value: 'Weekend Impulse Control', icon: '🎯', hl: 'text-amber-400' },
]

function parseInsights(rawText) {
  const lines = rawText.split('\n').filter(l => l.trim())
  return lines.map((line, i) => {
    const cleaned = line.trim()
    if (cleaned.startsWith('[POSITIVE]')) {
      return { id: i, type: 'positive', text: cleaned.replace('[POSITIVE]', '').trim() }
    } else if (cleaned.startsWith('[WARNING]')) {
      return { id: i, type: 'warning', text: cleaned.replace('[WARNING]', '').trim() }
    } else if (cleaned.startsWith('[ACTION]')) {
      return { id: i, type: 'action', text: cleaned.replace('[ACTION]', '').trim() }
    }
    if (cleaned.match(/risk|warn|high|overdue|attention|spike|concern|danger/i)) {
      return { id: i, type: 'warning', text: cleaned.replace(/^[•\-\*]\s*/, '') }
    }
    if (cleaned.match(/consider|should|try|recommend|set up|reduce|switch|prepay|action/i)) {
      return { id: i, type: 'action', text: cleaned.replace(/^[•\-\*]\s*/, '') }
    }
    return { id: i, type: 'positive', text: cleaned.replace(/^[•\-\*]\s*/, '') }
  }).filter(item => item.text.length > 5)
}

const insightStyles = {
  positive: { border: '#10b981', bg: 'rgba(16,185,129,0.06)', icon: '✓', iconColor: '#34d399' },
  warning: { border: '#ef4444', bg: 'rgba(239,68,68,0.06)', icon: '⚠', iconColor: '#f87171' },
  action: { border: '#FF8C00', bg: 'rgba(255,140,0,0.06)', icon: '→', iconColor: '#FF8C00' },
}

export default function ChimcharAssistant() {
  const { profile } = useAuth()
  const { payments, loading: paymentsLoading, stats } = usePayments()

  const CACHE_KEY = `finfix_ai_insights_${profile?.email || 'guest'}`

  const [insights, setInsights] = useState(() => {
    try {
      const cached = localStorage.getItem(CACHE_KEY)
      if (cached) {
        const { insights: savedInsights } = JSON.parse(cached)
        return savedInsights || []
      }
    } catch {}
    return []
  })
  const [insightsLoading, setInsightsLoading] = useState(false)
  const [insightsError, setInsightsError] = useState('')
  const [lastAnalyzed, setLastAnalyzed] = useState(() => {
    try {
      const cached = localStorage.getItem(CACHE_KEY)
      if (cached) return JSON.parse(cached).timestamp || null
    } catch {}
    return null
  })
  const [wealthTab, setWealthTab] = useState('balanced')

  const income = profile?.monthly_income || profile?.income_amount || 50000
  const totalOutflow = stats.totalMonthly || 0
  const remaining = income - totalOutflow
  const remainingPct = income > 0 ? Math.round((remaining / income) * 100) : 100
  const outflowPct = income > 0 ? Math.min(Math.round((totalOutflow / income) * 100), 100) : 0

  let cashflowStatus = 'on_track'
  let cashflowColor = '#10b981'
  let cashflowLabel = 'On Track'
  let cashflowDesc = `You have ₹${remaining.toLocaleString('en-IN')} remaining after all obligations (${remainingPct}% of income).`
  if (remainingPct < 5) {
    cashflowStatus = 'freeze'
    cashflowColor = '#ef4444'
    cashflowLabel = 'Spending Freeze'
    cashflowDesc = `Only ₹${remaining.toLocaleString('en-IN')} left (${remainingPct}%). Consider freezing non-essential spending immediately.`
  } else if (remainingPct < 20) {
    cashflowStatus = 'tight'
    cashflowColor = '#f59e0b'
    cashflowLabel = 'Tight Month'
    cashflowDesc = `₹${remaining.toLocaleString('en-IN')} remaining (${remainingPct}%). Monitor discretionary spending closely.`
  }

  const fetchInsights = useCallback(async () => {
    if (payments.length === 0) return
    setInsightsLoading(true)
    setInsightsError('')
    try {
      const res = await fetch(`${API}/api/loans/insights`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          loans: payments.filter(p => p.type === 'loan').map(l => ({
            name: l.name, amount: l.amount, emi: l.emi,
            interest_rate: l.interest_rate, tenure_months: l.tenure_months,
            completed_months: 0, status: 'active',
          })),
          credit_cards: payments.filter(p => p.type === 'cc').map(c => ({
            name: c.name, credit_limit: c.credit_limit, current_balance: c.current_balance,
            min_payment: c.min_payment, due_date: String(c.due_date || ''),
          })),
          bills: payments.filter(p => p.type === 'bill').map(b => ({
            name: b.name, category: b.category, avg_amount: b.avg_amount, auto_pay: b.auto_pay || false,
          })),
          monthly_income: income,
        }),
      })
      const data = await res.json()
      const parsed = parseInsights(data.insight || '')
      const result = parsed.length > 0 ? parsed : [{ id: 0, type: 'positive', text: data.insight || 'No insights available.' }]
      const now = new Date().toISOString()
      setInsights(result)
      setLastAnalyzed(now)
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify({ insights: result, timestamp: now }))
      } catch {}
    } catch {
      setInsightsError('Could not connect to AI. Check your connection.')
    } finally {
      setInsightsLoading(false)
    }
  }, [payments, income, CACHE_KEY])


  const activeStrat = WEALTH_STRATEGIES.find(s => s.id === wealthTab) || WEALTH_STRATEGIES[0]

  return (
    <main className="w-full min-h-screen bg-black text-neutral-50">
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 24px 80px', display: 'flex', flexDirection: 'column', gap: '40px' }}>

        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', marginBottom: '8px' }}
        >
          <div style={{ position: 'relative', width: '80px', height: '80px' }}>
            <motion.div
              style={{ position: 'absolute', inset: '-12px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(234,88,12,0.15), transparent 70%)' }}
              animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.8, 0.4] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            />
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, #fb923c, #ef4444)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', boxShadow: '0 0 30px rgba(234,88,12,0.4)', border: '1px solid rgba(253,186,116,0.4)', position: 'relative' }}>
              🔥
            </div>
          </div>
          <h1 style={{ fontSize: '34px', fontWeight: 700, letterSpacing: '-0.5px' }}>
            Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">Chimchar</span>
          </h1>
          <p className="text-neutral-400" style={{ maxWidth: '600px', fontSize: '15px', lineHeight: 1.7 }}>
            Your AI financial command center. Real-time insights, smart fund parking, and predictive cashflow — all powered by Gemini.
          </p>
        </motion.header>

        {/* ══ SECTION A: AI Triage Insight Cards ══ */}
        <section className="bg-neutral-900 border border-neutral-800 rounded-2xl" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <div className="flex items-center gap-3">
              <span style={{ fontSize: '18px' }}>🧠</span>
              <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>AI Portfolio Analysis</h2>
              {lastAnalyzed && !insightsLoading && (
                <span className="text-neutral-500" style={{ fontSize: '11px' }}>
                  · {new Date(lastAnalyzed).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} {new Date(lastAnalyzed).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </div>
            <motion.button
              onClick={fetchInsights}
              disabled={insightsLoading || paymentsLoading || payments.length === 0}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              style={{
                background: 'rgba(255,140,0,0.1)', border: '1px solid rgba(255,140,0,0.3)',
                color: '#FFC857', padding: '8px 18px', borderRadius: '10px',
                fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                opacity: insightsLoading || paymentsLoading || payments.length === 0 ? 0.4 : 1,
              }}
            >
              {insightsLoading ? 'Analyzing...' : insights.length > 0 ? 'Refresh' : 'Analyze'}
            </motion.button>
          </div>

          {paymentsLoading ? (
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[1,2,3].map(i => (
                <motion.div key={i} animate={{ opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                  style={{ height: '56px', borderRadius: '12px', background: '#171717' }} />
              ))}
              <p className="text-neutral-600" style={{ textAlign: 'center', fontSize: '12px', marginTop: '4px' }}>Loading your payments…</p>
            </div>
          ) : payments.length === 0 ? (
            <div style={{ padding: '40px 24px', textAlign: 'center' }}>
              <p style={{ fontSize: '32px', marginBottom: '12px', opacity: 0.3 }}>🤖</p>
              <p className="text-neutral-500" style={{ fontSize: '14px' }}>Add payments in Active Payments to unlock AI insights</p>
            </div>
          ) : insightsLoading ? (
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[1,2,3,4].map(i => (
                <motion.div key={i} animate={{ opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                  style={{ height: '56px', borderRadius: '12px', background: '#171717' }} />
              ))}
            </div>
          ) : insightsError ? (
            <div style={{ padding: '24px' }}>
              <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(239,68,68,0.06)', borderLeft: '4px solid #ef4444', display: 'flex', gap: '12px', alignItems: 'center' }}>
                <span style={{ color: '#f87171', fontSize: '16px', flexShrink: 0 }}>⚠</span>
                <p className="text-neutral-400" style={{ fontSize: '14px', margin: 0 }}>{insightsError}</p>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {insights.map((item, i) => {
                const style = insightStyles[item.type] || insightStyles.positive
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    style={{
                      padding: '16px 20px', display: 'flex', gap: '14px', alignItems: 'flex-start',
                      borderLeft: `4px solid ${style.border}`, background: style.bg,
                      borderBottom: i < insights.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none',
                    }}
                  >
                    <span style={{ color: style.iconColor, fontSize: '15px', fontWeight: 700, flexShrink: 0, marginTop: '1px', width: '18px', textAlign: 'center' }}>{style.icon}</span>
                    <p style={{ fontSize: '14px', lineHeight: 1.6, margin: 0, color: '#d4d4d4' }}>{item.text}</p>
                  </motion.div>
                )
              })}
            </div>
          )}
        </section>

        {/* ══ SECTION C: Predictive Cashflow ══ */}
        <section className="bg-neutral-900 border border-neutral-800 rounded-2xl" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="flex items-center justify-between">
            <h2 style={{ fontSize: '18px', fontWeight: 700 }} className="flex items-center gap-2">
              <span>📊</span> Predictive Cashflow
            </h2>
            <span style={{ fontSize: '13px', fontWeight: 700, padding: '4px 12px', borderRadius: '20px', background: `${cashflowColor}15`, color: cashflowColor }}>{cashflowLabel}</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            <div className="bg-black border border-neutral-800 rounded-xl" style={{ padding: '16px' }}>
              <p className="text-neutral-500" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Income</p>
              <p className="text-neutral-50" style={{ fontSize: '18px', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>₹{income.toLocaleString('en-IN')}</p>
            </div>
            <div className="bg-black border border-neutral-800 rounded-xl" style={{ padding: '16px' }}>
              <p className="text-neutral-500" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Total Outflow</p>
              <p style={{ fontSize: '18px', fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: '#f59e0b' }}>₹{totalOutflow.toLocaleString('en-IN')}</p>
            </div>
            <div className="bg-black border border-neutral-800 rounded-xl" style={{ padding: '16px' }}>
              <p className="text-neutral-500" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Remaining</p>
              <p style={{ fontSize: '18px', fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: cashflowColor }}>₹{remaining.toLocaleString('en-IN')}</p>
            </div>
          </div>

          <div style={{ position: 'relative', height: '24px', borderRadius: '12px', background: '#171717', overflow: 'hidden' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${outflowPct}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              style={{ height: '100%', borderRadius: '12px', background: cashflowStatus === 'freeze' ? 'linear-gradient(90deg, #ef4444, #dc2626)' : cashflowStatus === 'tight' ? 'linear-gradient(90deg, #f59e0b, #d97706)' : 'linear-gradient(90deg, #10b981, #059669)' }}
            />
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'white', textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>{outflowPct}% committed</span>
            </div>
          </div>

          <div className="bg-black border border-neutral-800 rounded-xl" style={{ padding: '14px 16px', display: 'flex', gap: '10px', alignItems: 'start' }}>
            <span style={{ fontSize: '16px', lineHeight: 1, flexShrink: 0 }}>{cashflowStatus === 'freeze' ? '🚨' : cashflowStatus === 'tight' ? '⚠️' : '✅'}</span>
            <p className="text-neutral-300" style={{ fontSize: '13px', lineHeight: 1.6, margin: 0 }}>{cashflowDesc}</p>
          </div>
        </section>

        {/* ══ SECTION B: Smart Cash Parking ══ */}
        <section className="bg-neutral-900 border border-neutral-800 rounded-2xl" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="flex items-center justify-between">
            <h2 style={{ fontSize: '18px', fontWeight: 700 }} className="flex items-center gap-2">
              <span>💧</span> Smart Cash Parking
            </h2>
            <span className="bg-neutral-800/50 text-neutral-400 text-[10px] uppercase tracking-widest px-2 py-1 rounded-full">AI Recommended</span>
          </div>
          <p className="text-neutral-400" style={{ fontSize: '14px', lineHeight: 1.6 }}>
            Based on your active payments, park <strong className="text-[#FF8C00]">₹{totalOutflow.toLocaleString('en-IN')}</strong> in a Liquid Fund. Earn safe returns while your bills auto-debit. Your money works for you instead of sitting idle.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            {LIQUID_FUNDS.map(fund => (
              <div key={fund.id} className="bg-black border border-neutral-800 rounded-2xl" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <p className="text-neutral-100" style={{ fontWeight: 500, fontSize: '14px' }}>{fund.name}</p>
                <span style={{ background: `${fund.color}15`, color: fund.color, fontSize: '11px', padding: '4px 10px', borderRadius: '20px', width: 'fit-content', fontWeight: 600 }}>{fund.risk}</span>
                <p style={{ color: '#FF8C00', fontFamily: 'monospace', fontSize: '18px', fontWeight: 700, marginTop: '8px' }}>{fund.returnRate}</p>
                <p className="text-neutral-500" style={{ fontSize: '11px' }}>Instant redemption available</p>
              </div>
            ))}
          </div>

          <div className="bg-black border border-neutral-800 rounded-xl" style={{ padding: '14px 16px', display: 'flex', gap: '10px', alignItems: 'start' }}>
            <span style={{ fontSize: '16px', lineHeight: 1, flexShrink: 0 }}>🛡️</span>
            <p className="text-neutral-300" style={{ fontSize: '13px', lineHeight: 1.6, margin: 0 }}>
              <span className="text-emerald-400 font-semibold">Credit Risk Tip:</span> Keep exactly 1 month of EMIs in a liquid fund. This guarantees you never miss a payment even if salary is delayed, safely building your credit score.
            </p>
          </div>
        </section>

        {/* ══ SECTION D: Wealth Growth ══ */}
        <section className="bg-neutral-900 border border-neutral-800 rounded-2xl" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="flex items-center justify-between">
            <h2 style={{ fontSize: '18px', fontWeight: 700 }} className="flex items-center gap-2">
              <span>📈</span> Wealth Generation
            </h2>
            <span className="bg-neutral-800/50 text-neutral-400 text-[10px] uppercase tracking-widest px-2 py-1 rounded-full">Long-Term</span>
          </div>

          <div className="flex gap-1 bg-black p-1 rounded-xl">
            {WEALTH_STRATEGIES.map(s => (
              <button
                key={s.id}
                onClick={() => setWealthTab(s.id)}
                className={`flex-1 py-2 text-[13px] font-medium rounded-lg transition-all ${wealthTab === s.id ? 'bg-neutral-800 text-white shadow-sm' : 'text-neutral-500 hover:text-neutral-300'}`}
                style={{ background: wealthTab === s.id ? '#262626' : 'transparent', border: 'none', cursor: 'pointer' }}
              >
                {s.title} ({s.id === 'balanced' ? 'Medium' : 'High'} Risk)
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={activeStrat.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p className="text-neutral-50" style={{ fontWeight: 600, fontSize: '15px' }}>{activeStrat.fund}</p>
                  <p className="text-neutral-500" style={{ fontSize: '13px' }}>Horizon: {activeStrat.horizon}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontWeight: 700, fontSize: '18px', color: activeStrat.color }}>{activeStrat.ret}</p>
                  <span style={{ background: `${activeStrat.color}15`, color: activeStrat.color, fontSize: '10px', padding: '3px 8px', borderRadius: '12px', fontWeight: 600 }}>{activeStrat.risk}</span>
                </div>
              </div>
              {activeStrat.id === 'equity' && (
                <div style={{ padding: '10px 14px', borderRadius: '10px', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span style={{ color: '#f87171', fontSize: '13px' }}>⚠</span>
                  <p className="text-neutral-400" style={{ fontSize: '12px', margin: 0 }}>High volatility — only invest money you won't need for 5+ years.</p>
                </div>
              )}
              <div className="bg-black border border-neutral-800 rounded-xl" style={{ padding: '14px 16px' }}>
                <p className="text-neutral-300" style={{ fontSize: '13px', lineHeight: 1.6, margin: 0 }}>
                  <span className="text-orange-400/80">⚡ </span>{activeStrat.reason}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </section>

        {/* ══ SECTION E: System Profile ══ */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h2 className="text-neutral-500" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 600, paddingLeft: '2px' }}>
            🧠 System Profile
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            {TRAITS.map((t, i) => (
              <div key={i} className="bg-neutral-900 border border-neutral-800 rounded-xl" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div className="bg-black border border-neutral-800 rounded-full" style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 }}>
                    {t.icon}
                  </div>
                  <p className="text-neutral-500" style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1.5px' }}>{t.label}</p>
                </div>
                <p className={`${t.hl}`} style={{ fontSize: '16px', fontWeight: 600 }}>{t.value}</p>
              </div>
            ))}
          </div>
        </section>

      </div>
    </main>
  )
}
