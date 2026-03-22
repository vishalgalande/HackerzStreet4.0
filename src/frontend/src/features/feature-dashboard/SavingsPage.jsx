/**
 * SavingsPage — Track savings goals with add-goal form and progress tracking.
 * Supabase-backed via /api/savings endpoints.
 */

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../feature-auth/AuthContext'

const API = import.meta.env.VITE_API_URL || ''

const GOAL_PRESETS = [
  { id: 'emergency', label: 'Emergency Fund', icon: '🛡️' },
  { id: 'vacation', label: 'Vacation', icon: '✈️' },
  { id: 'gadget', label: 'New Gadget', icon: '📱' },
  { id: 'education', label: 'Education', icon: '🎓' },
  { id: 'vehicle', label: 'Vehicle', icon: '🚗' },
  { id: 'home', label: 'Home Down Payment', icon: '🏠' },
  { id: 'wedding', label: 'Wedding', icon: '💍' },
  { id: 'custom', label: 'Custom', icon: '➕' },
]

function fmtCurrency(n) {
  return `₹${Number(n || 0).toLocaleString('en-IN')}`
}

export default function SavingsPage() {
  const { profile, getToken } = useAuth()
  const [goals, setGoals] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [expandedGoal, setExpandedGoal] = useState(null)
  const [depositGoalId, setDepositGoalId] = useState(null)
  const [depositAmount, setDepositAmount] = useState('')

  const [form, setForm] = useState({
    type: 'emergency', name: '', target_amount: '', monthly_contribution: '',
    start_date: new Date().toISOString().split('T')[0],
  })

  useEffect(() => {
    async function fetchGoals() {
      const token = getToken()
      if (!token) { setLoading(false); return }
      try {
        const res = await fetch(`${API}/api/savings`, {
          headers: { 'Authorization': `Bearer ${token}` },
        })
        if (res.ok) {
          const data = await res.json()
          setGoals(data.goals || [])
        }
      } catch {}
      setLoading(false)
    }
    fetchGoals()
  }, [getToken])

  function resetForm() {
    setForm({
      type: 'emergency', name: '', target_amount: '', monthly_contribution: '',
      start_date: new Date().toISOString().split('T')[0],
    })
  }

  async function addGoal() {
    const preset = GOAL_PRESETS.find(p => p.id === form.type)
    const token = getToken()
    const goalData = {
      type: form.type,
      icon: preset?.icon || '🎯',
      name: form.name || preset?.label || 'Unnamed Goal',
      target_amount: parseFloat(form.target_amount) || 0,
      current_amount: 0,
      monthly_contribution: parseFloat(form.monthly_contribution) || 0,
      start_date: form.start_date,
      deposits: '[]',
    }
    try {
      const res = await fetch(`${API}/api/savings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(goalData),
      })
      if (res.ok) {
        const data = await res.json()
        setGoals(prev => [data.goal, ...prev])
      }
    } catch {}
    resetForm()
    setShowForm(false)
  }

  async function removeGoal(id) {
    const token = getToken()
    setGoals(prev => prev.filter(g => g.id !== id))
    try {
      await fetch(`${API}/api/savings/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      })
    } catch {}
  }

  async function addDeposit(goalId) {
    const amount = parseFloat(depositAmount)
    if (!amount || amount <= 0) return
    const token = getToken()
    const goal = goals.find(g => g.id === goalId)
    if (!goal) return
    const newAmount = (goal.current_amount || 0) + amount
    const newDeposits = [...(goal.deposits || []), { amount, date: new Date().toISOString().split('T')[0] }]
    setGoals(prev => prev.map(g => g.id !== goalId ? g : { ...g, current_amount: newAmount, deposits: newDeposits }))
    setDepositGoalId(null)
    setDepositAmount('')
    try {
      await fetch(`${API}/api/savings/${goalId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ current_amount: newAmount, deposits: JSON.stringify(newDeposits) }),
      })
    } catch {}
  }

  // Stats
  const totalSaved = goals.reduce((s, g) => s + (g.current_amount || 0), 0)
  const totalTarget = goals.reduce((s, g) => s + (g.target_amount || 0), 0)
  const monthlyTarget = goals.reduce((s, g) => s + (g.monthly_contribution || 0), 0)
  const avgProgress = goals.length > 0
    ? Math.round(goals.reduce((s, g) => s + (g.target_amount > 0 ? g.current_amount / g.target_amount * 100 : 0), 0) / goals.length)
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
            <h1 style={{ fontSize: '28px', fontWeight: 700, letterSpacing: '-0.5px' }}>Savings Goals</h1>
            <p className="text-neutral-400" style={{ fontSize: '15px', marginTop: '4px' }}>Track your savings, set goals, and build your credit score</p>
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
            {showForm ? 'Cancel' : '+ New Goal'}
          </motion.button>
        </div>

        {/* Stats */}
        {goals.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            {[
              { label: 'Total Saved', value: fmtCurrency(totalSaved), icon: '💰' },
              { label: 'Monthly Target', value: fmtCurrency(monthlyTarget), icon: '📅' },
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

        {/* Add Goal Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{ overflow: 'hidden' }}
            >
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Create New Goal</h3>

                {/* Goal type picker */}
                <div>
                  <label style={labelStyle}>Goal Type</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                    {GOAL_PRESETS.map(p => (
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
                    <label style={labelStyle}>Goal Name</label>
                    <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. New Laptop" style={inputStyle} />
                  </div>
                )}

                {/* Row: Target, Monthly Contribution */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                  <div>
                    <label style={labelStyle}>Target Amount (₹)</label>
                    <input type="number" value={form.target_amount} onChange={e => setForm({ ...form, target_amount: e.target.value })} placeholder="50000" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Monthly Contribution (₹)</label>
                    <input type="number" value={form.monthly_contribution} onChange={e => setForm({ ...form, monthly_contribution: e.target.value })} placeholder="5000" style={inputStyle} />
                  </div>
                </div>

                <motion.button
                  onClick={addGoal}
                  disabled={!form.target_amount}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    width: '100%', padding: '14px', borderRadius: '12px', fontWeight: 600, fontSize: '15px',
                    background: '#fafafa', color: '#0a0a0a', border: 'none', cursor: 'pointer',
                    opacity: !form.target_amount ? 0.4 : 1,
                  }}
                >
                  Create Goal
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Goal Cards */}
        {goals.length === 0 ? (
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl" style={{ padding: '48px', textAlign: 'center' }}>
            <p style={{ fontSize: '40px', marginBottom: '12px', opacity: 0.4 }}>🎯</p>
            <p className="text-neutral-400" style={{ fontSize: '15px' }}>No savings goals yet. Click "+ New Goal" to start building your savings.</p>
            <p className="text-neutral-600" style={{ fontSize: '13px', marginTop: '8px' }}>
              💡 Savings discipline is worth <span className="text-[#FFC857] font-medium">25%</span> of your credit score
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {goals.map((goal, i) => {
              const progress = goal.target_amount > 0 ? Math.round(goal.current_amount / goal.target_amount * 100) : 0
              const remaining = Math.max(0, goal.target_amount - goal.current_amount)
              const monthsToGo = goal.monthly_contribution > 0 ? Math.ceil(remaining / goal.monthly_contribution) : '∞'
              const isExpanded = expandedGoal === goal.id

              return (
                <motion.div
                  key={goal.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-neutral-900 border border-neutral-800 rounded-2xl"
                  style={{ padding: '20px', cursor: 'pointer' }}
                  onClick={() => setExpandedGoal(isExpanded ? null : goal.id)}
                >
                  {/* Main row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: 0 }}>
                      <div className="bg-neutral-950 border border-neutral-800 rounded-full" style={{ width: '42px', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>
                        {goal.icon}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ fontWeight: 600, fontSize: '15px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{goal.name}</p>
                        <p className="text-neutral-500" style={{ fontSize: '13px' }}>
                          {fmtCurrency(goal.monthly_contribution)}/mo · {monthsToGo === '∞' ? '—' : `${monthsToGo}mo to go`}
                        </p>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <p style={{ fontWeight: 700, fontSize: '16px', fontVariantNumeric: 'tabular-nums' }}>{fmtCurrency(goal.current_amount)}</p>
                      <p className={progress >= 75 ? 'text-[#FFC857]' : progress >= 40 ? 'text-[#FF8C00]' : 'text-neutral-400'} style={{ fontSize: '13px', fontWeight: 600 }}>
                        {progress}% of {fmtCurrency(goal.target_amount)}
                      </p>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div style={{ marginTop: '14px', height: '4px', borderRadius: '2px', background: '#171717', overflow: 'hidden' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(progress, 100)}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      style={{
                        height: '100%', borderRadius: '2px',
                        background: progress >= 75 ? '#FFC857' : progress >= 40 ? '#FF8C00' : '#525252',
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
                        <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #262626', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                          {[
                            { label: 'Target', value: fmtCurrency(goal.target_amount) },
                            { label: 'Saved', value: fmtCurrency(goal.current_amount) },
                            { label: 'Remaining', value: fmtCurrency(remaining) },
                          ].map((d, j) => (
                            <div key={j}>
                              <p className="text-neutral-500" style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '4px' }}>{d.label}</p>
                              <p style={{ fontSize: '15px', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{d.value}</p>
                            </div>
                          ))}
                        </div>

                        {/* Deposit section */}
                        <div style={{ marginTop: '14px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                          {depositGoalId === goal.id ? (
                            <>
                              <input
                                type="number"
                                value={depositAmount}
                                onChange={e => setDepositAmount(e.target.value)}
                                placeholder="Amount"
                                onClick={e => e.stopPropagation()}
                                style={{ ...inputStyle, flex: 1, padding: '8px 12px' }}
                              />
                              <button
                                onClick={(e) => { e.stopPropagation(); addDeposit(goal.id) }}
                                style={{
                                  background: '#fafafa', color: '#0a0a0a', padding: '8px 16px',
                                  borderRadius: '8px', fontSize: '13px', fontWeight: 600, border: 'none', cursor: 'pointer',
                                }}
                              >
                                Add
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); setDepositGoalId(null) }}
                                style={{
                                  background: 'transparent', border: '1px solid #262626', color: '#a3a3a3',
                                  padding: '8px 12px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer',
                                }}
                              >
                                ✕
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={(e) => { e.stopPropagation(); setDepositGoalId(goal.id) }}
                                style={{
                                  background: 'rgba(255,140,0,0.1)', border: '1px solid rgba(255,140,0,0.3)',
                                  color: '#FFC857', padding: '6px 16px', borderRadius: '8px',
                                  fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                                }}
                              >
                                + Add Deposit
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); removeGoal(goal.id) }}
                                style={{
                                  background: 'transparent', border: '1px solid rgba(239,68,68,0.3)',
                                  color: '#ef4444', padding: '6px 16px', borderRadius: '8px',
                                  fontSize: '12px', fontWeight: 600, cursor: 'pointer', marginLeft: 'auto',
                                }}
                              >
                                Remove
                              </button>
                            </>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            })}
          </div>
        )}

      </div>
    </main>
  )
}
