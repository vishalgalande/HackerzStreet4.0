/**
 * LenderDashboard — Active Loans with add-loan, tenure tracking, and AI Insights (Gemini).
 * Carbon dark theme, seamless with the rest of the site.
 */

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../feature-auth/AuthContext'

const LS_KEY = 'finfix_user_loans'

const LOAN_PRESETS = [
  { id: 'personal', label: 'Personal Loan', icon: '💳' },
  { id: 'education', label: 'Education Loan', icon: '🎓' },
  { id: 'two_wheeler', label: 'Two-Wheeler', icon: '🛵' },
  { id: 'phone', label: 'Phone EMI', icon: '📱' },
  { id: 'home', label: 'Home Loan', icon: '🏠' },
  { id: 'gold', label: 'Gold Loan', icon: '✨' },
  { id: 'car', label: 'Car Loan', icon: '🚗' },
  { id: 'custom', label: 'Custom', icon: '➕' },
]

function loadLoans() {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]') } catch { return [] }
}
function saveLoans(loans) {
  localStorage.setItem(LS_KEY, JSON.stringify(loans))
}

function calcEndDate(startDate, tenureMonths) {
  const d = new Date(startDate)
  d.setMonth(d.getMonth() + tenureMonths)
  return d
}

function fmtDate(d) {
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function fmtCurrency(n) {
  return `₹${Number(n || 0).toLocaleString('en-IN')}`
}

export default function LenderDashboard() {
  const { profile } = useAuth()
  const [loans, setLoans] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [insight, setInsight] = useState('')
  const [insightLoading, setInsightLoading] = useState(false)
  const [expandedLoan, setExpandedLoan] = useState(null)

  // Form state
  const [form, setForm] = useState({
    type: 'personal', name: '', amount: '', emi: '', interest_rate: '',
    tenure_months: '', completed_months: '', start_date: new Date().toISOString().split('T')[0],
  })

  useEffect(() => {
    setLoans(loadLoans())
  }, [])

  function resetForm() {
    setForm({ type: 'personal', name: '', amount: '', emi: '', interest_rate: '', tenure_months: '', completed_months: '', start_date: new Date().toISOString().split('T')[0] })
  }

  function addLoan() {
    const preset = LOAN_PRESETS.find(p => p.id === form.type)
    
    // Calculate completed months from start date
    const start = new Date(form.start_date)
    const now = new Date()
    let completed = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth())
    if (now.getDate() < start.getDate()) completed--
    if (completed < 0) completed = 0
    const tenure = parseInt(form.tenure_months) || 12
    if (completed > tenure) completed = tenure

    const newLoan = {
      id: `loan_${Date.now()}`,
      type: form.type,
      icon: preset?.icon || '💰',
      name: form.name || preset?.label || 'Unnamed Loan',
      amount: parseFloat(form.amount) || 0,
      emi: parseFloat(form.emi) || 0,
      interest_rate: parseFloat(form.interest_rate) || 0,
      tenure_months: tenure,
      completed_months: completed,
      start_date: form.start_date,
      status: 'active',
    }
    const updated = [...loans, newLoan]
    setLoans(updated)
    saveLoans(updated)
    resetForm()
    setShowForm(false)
  }

  function removeLoan(id) {
    const updated = loans.filter(l => l.id !== id)
    setLoans(updated)
    saveLoans(updated)
  }

  const fetchInsights = useCallback(async () => {
    if (loans.length === 0) return
    setInsightLoading(true)
    try {
      const API = import.meta.env.VITE_API_URL || ''
      const res = await fetch(`${API}/api/loans/insights`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          loans: loans.map(l => ({
            name: l.name, amount: l.amount, emi: l.emi,
            interest_rate: l.interest_rate, tenure_months: l.tenure_months,
            completed_months: l.completed_months, status: l.status,
          })),
          monthly_income: profile?.monthly_income || profile?.income_amount || 0,
        }),
      })
      const data = await res.json()
      setInsight(data.insight || 'No insights available.')
    } catch (e) {
      setInsight('Could not connect to AI service. Check if backend is running.')
    } finally {
      setInsightLoading(false)
    }
  }, [loans, profile])

  // Stats
  const totalEMI = loans.reduce((s, l) => s + (l.emi || 0), 0)
  const totalOutstanding = loans.reduce((s, l) => {
    const remaining = l.tenure_months - l.completed_months
    return s + (l.emi * remaining)
  }, 0)
  const avgProgress = loans.length > 0
    ? Math.round(loans.reduce((s, l) => s + (l.tenure_months > 0 ? l.completed_months / l.tenure_months * 100 : 0), 0) / loans.length)
    : 0

  const inputStyle = {
    width: '100%', padding: '12px 14px', borderRadius: '12px',
    background: '#0a0a0a', border: '1px solid #262626',
    color: '#fafafa', fontSize: '14px', outline: 'none',
    boxSizing: 'border-box',
  }
  const labelStyle = { fontSize: '12px', color: '#737373', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1px' }

  return (
    <main className="w-full min-h-screen bg-black text-neutral-50">
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 24px 80px', display: 'flex', flexDirection: 'column', gap: '32px' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 700, letterSpacing: '-0.5px' }}>Active Loans</h1>
            <p className="text-neutral-400" style={{ fontSize: '15px', marginTop: '4px' }}>Track your loans, tenure, and get AI-powered insights</p>
          </div>
          <motion.button
            onClick={() => setShowForm(!showForm)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            style={{
              background: showForm ? 'transparent' : '#fafafa', color: showForm ? '#a3a3a3' : '#0a0a0a',
              padding: '10px 24px', borderRadius: '12px', fontWeight: 600, fontSize: '14px',
              border: showForm ? '1px solid #262626' : 'none', cursor: 'pointer',
            }}
          >
            {showForm ? 'Cancel' : '+ Add Loan'}
          </motion.button>
        </div>

        {/* Stats */}
        {loans.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            {[
              { label: 'Monthly EMI', value: fmtCurrency(totalEMI), icon: '📅' },
              { label: 'Est. Outstanding', value: fmtCurrency(totalOutstanding), icon: '💰' },
              { label: 'Avg Progress', value: `${avgProgress}%`, icon: '📊' },
            ].map((stat, i) => (
              <div key={i} className="bg-neutral-900 border border-neutral-800 rounded-xl" style={{ padding: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                  <span style={{ fontSize: '14px' }}>{stat.icon}</span>
                  <span className="text-neutral-500" style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1.5px' }}>{stat.label}</span>
                </div>
                <p style={{ fontSize: '20px', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{stat.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Add Loan Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{ overflow: 'hidden' }}
            >
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Add New Loan</h3>

                {/* Loan type picker */}
                <div>
                  <label style={labelStyle}>Loan Type</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                    {LOAN_PRESETS.map(p => (
                      <button
                        key={p.id}
                        onClick={() => setForm({ ...form, type: p.id, name: p.id === 'custom' ? '' : p.label })}
                        style={{
                          padding: '10px 8px', borderRadius: '10px', fontSize: '13px', fontWeight: 500,
                          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center',
                          background: form.type === p.id ? 'rgba(255,140,0,0.12)' : '#0a0a0a',
                          border: `1px solid ${form.type === p.id ? 'rgba(255,140,0,0.5)' : '#262626'}`,
                          color: form.type === p.id ? '#FFC857' : '#a3a3a3',
                        }}
                      >
                        <span>{p.icon}</span> {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {form.type === 'custom' && (
                  <div>
                    <label style={labelStyle}>Loan Name</label>
                    <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Business Loan" style={inputStyle} />
                  </div>
                )}

                {/* Row: Amount, EMI, Interest */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                  <div>
                    <label style={labelStyle}>Amount (₹)</label>
                    <input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} placeholder="500000" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>EMI (₹/mo)</label>
                    <input type="number" value={form.emi} onChange={e => setForm({ ...form, emi: e.target.value })} placeholder="12000" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Interest (%)</label>
                    <input type="number" value={form.interest_rate} onChange={e => setForm({ ...form, interest_rate: e.target.value })} placeholder="9.5" step="0.1" style={inputStyle} />
                  </div>
                </div>

                {/* Row: Tenure and Start Date */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                  <div>
                    <label style={labelStyle}>Tenure (months)</label>
                    <input type="number" value={form.tenure_months} onChange={e => setForm({ ...form, tenure_months: e.target.value })} placeholder="36" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Start Date</label>
                    <input type="date" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} style={{ ...inputStyle, colorScheme: 'dark' }} />
                  </div>
                </div>

                <motion.button
                  onClick={addLoan}
                  disabled={!form.amount || !form.emi || !form.tenure_months}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    width: '100%', padding: '14px', borderRadius: '12px', fontWeight: 600, fontSize: '15px',
                    background: '#fafafa', color: '#0a0a0a', border: 'none', cursor: 'pointer',
                    opacity: (!form.amount || !form.emi || !form.tenure_months) ? 0.4 : 1,
                  }}
                >
                  Add Loan
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loan Cards */}
        {loans.length === 0 ? (
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl" style={{ padding: '48px', textAlign: 'center' }}>
            <p style={{ fontSize: '40px', marginBottom: '12px', opacity: 0.4 }}>🏦</p>
            <p className="text-neutral-400" style={{ fontSize: '15px' }}>No loans added yet. Click "+ Add Loan" to track your first loan.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {loans.map((loan, i) => {
              const remaining = loan.tenure_months - loan.completed_months
              const progress = loan.tenure_months > 0 ? Math.round(loan.completed_months / loan.tenure_months * 100) : 0
              const endDate = calcEndDate(loan.start_date, loan.tenure_months)
              const isExpanded = expandedLoan === loan.id

              return (
                <motion.div
                  key={loan.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-neutral-900 border border-neutral-800 rounded-2xl"
                  style={{ padding: '20px', cursor: 'pointer' }}
                  onClick={() => setExpandedLoan(isExpanded ? null : loan.id)}
                >
                  {/* Main row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: 0 }}>
                      <div className="bg-neutral-950 border border-neutral-800 rounded-full" style={{ width: '42px', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>
                        {loan.icon}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ fontWeight: 600, fontSize: '15px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{loan.name}</p>
                        <p className="text-neutral-500" style={{ fontSize: '13px' }}>
                          {fmtCurrency(loan.emi)}/mo · {loan.interest_rate}% · Ends {fmtDate(endDate)}
                        </p>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <p style={{ fontWeight: 700, fontSize: '16px', fontVariantNumeric: 'tabular-nums' }}>{fmtCurrency(loan.amount)}</p>
                      <p className={progress >= 75 ? 'text-emerald-400' : progress >= 40 ? 'text-amber-400' : 'text-neutral-400'} style={{ fontSize: '13px', fontWeight: 600 }}>
                        {progress}% done
                      </p>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div style={{ marginTop: '14px', height: '4px', borderRadius: '2px', background: '#171717', overflow: 'hidden' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      style={{
                        height: '100%', borderRadius: '2px',
                        background: progress >= 75 ? '#10b981' : progress >= 40 ? '#f59e0b' : '#525252',
                      }}
                    />
                  </div>

                  {/* Expanded details */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        style={{ overflow: 'hidden' }}
                      >
                        <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #262626', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                          {[
                            { label: 'Tenure', value: `${loan.tenure_months} months` },
                            { label: 'Paid', value: `${loan.completed_months} months` },
                            { label: 'Remaining', value: `${remaining} months` },
                            { label: 'End Date', value: fmtDate(endDate) },
                          ].map((d, j) => (
                            <div key={j}>
                              <p className="text-neutral-500" style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '4px' }}>{d.label}</p>
                              <p style={{ fontSize: '15px', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{d.value}</p>
                            </div>
                          ))}
                        </div>
                        <div style={{ marginTop: '14px', display: 'flex', justifyContent: 'flex-end' }}>
                          <button
                            onClick={(e) => { e.stopPropagation(); removeLoan(loan.id) }}
                            style={{
                              background: 'transparent', border: '1px solid rgba(239,68,68,0.3)',
                              color: '#ef4444', padding: '6px 16px', borderRadius: '8px',
                              fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                            }}
                          >
                            Remove
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            })}
          </div>
        )}

        {/* AI Insights */}
        {loans.length > 0 && (
          <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 className="text-neutral-500" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 600 }}>
                🤖 AI Insights
              </h2>
              <motion.button
                onClick={fetchInsights}
                disabled={insightLoading}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  background: 'rgba(255,140,0,0.1)', border: '1px solid rgba(255,140,0,0.3)',
                  color: '#FFC857', padding: '8px 18px', borderRadius: '10px',
                  fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                  opacity: insightLoading ? 0.5 : 1,
                }}
              >
                {insightLoading ? 'Analyzing...' : insight ? 'Refresh Insights' : 'Generate Insights'}
              </motion.button>
            </div>

            {(insight || insightLoading) && (
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl" style={{ padding: '20px' }}>
                {insightLoading ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 0' }}>
                    <div style={{ width: '20px', height: '20px', border: '2px solid #262626', borderTopColor: '#FF8C00', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                    <p className="text-neutral-400" style={{ fontSize: '14px' }}>Analyzing your loan portfolio with Gemini AI...</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '18px', lineHeight: 1, flexShrink: 0, marginTop: '2px' }}>✨</span>
                    <div className="text-neutral-300" style={{ fontSize: '14px', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
                      {insight}
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>
        )}

      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </main>
  )
}
