/**
 * AntiImpulsivity — Multi-timer "Anti Impulse" countdown system
 * Backend-persisted + localStorage for offline survival.
 * Each timer tracks an item description and price.
 * Sends email notification when each timer completes.
 */

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../feature-auth/AuthContext'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'
const LS_KEY = 'finfix_anti_impulse_timers'

const PRESETS = [
  { label: '12 hours', seconds: 43200 },
  { label: '24 hours', seconds: 86400 },
]

function formatTime(totalSeconds) {
  if (totalSeconds <= 0) return '00:00:00'
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

function saveTimersToLS(timers) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(timers))
  } catch (e) { /* ignore */ }
}

function loadTimersFromLS() {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch (e) {
    return []
  }
}

export default function AntiImpulsivity() {
  const { profile } = useAuth()

  // All active timers: [{id, endsAt(epoch ms), duration, item, price, status}]
  const [timers, setTimers] = useState([])
  const [loading, setLoading] = useState(true)
  const tickRef = useRef(null)

  // Form state
  const [duration, setDuration] = useState(43200)
  const [itemDesc, setItemDesc] = useState('')
  const [itemPrice, setItemPrice] = useState('')
  const [showForm, setShowForm] = useState(false)

  // Load timers on mount: merge backend + localStorage
  useEffect(() => {
    async function load() {
      const lsTimers = loadTimersFromLS()
      let merged = [...lsTimers]

      try {
        const res = await fetch(`${API}/api/timers/active`)
        const data = await res.json()
        if (data.timers && Array.isArray(data.timers)) {
          for (const bt of data.timers) {
            // Skip if already in local
            if (merged.some(t => t.id === bt.id)) continue
            merged.push({
              id: bt.id,
              endsAt: new Date(bt.ends_at).getTime(),
              duration: bt.duration_seconds,
              item: bt.item_description || '',
              price: bt.item_price || 0,
              status: 'active',
            })
          }
        }
      } catch (e) {
        console.warn('Could not fetch backend timers:', e)
      }

      // Remove completed ones (ended before now)
      const now = Date.now()
      merged = merged.map(t => {
        if (t.status === 'active' && t.endsAt <= now) {
          return { ...t, status: 'completed' }
        }
        return t
      })

      setTimers(merged)
      saveTimersToLS(merged)
      setLoading(false)
    }
    load()
  }, [])

  // Tick every second for countdown
  useEffect(() => {
    tickRef.current = setInterval(() => {
      setTimers(prev => {
        const now = Date.now()
        let changed = false
        const updated = prev.map(t => {
          if (t.status === 'active' && t.endsAt <= now) {
            changed = true
            return { ...t, status: 'completed' }
          }
          return t
        })
        if (changed) saveTimersToLS(updated)
        return changed ? updated : prev
      })
    }, 1000)
    return () => clearInterval(tickRef.current)
  }, [])

  // Force re-render every second for countdown display
  const [, setTick] = useState(0)
  useEffect(() => {
    const iv = setInterval(() => setTick(t => t + 1), 1000)
    return () => clearInterval(iv)
  }, [])

  async function startTimer() {
    const price = parseFloat(itemPrice) || 0
    const now = Date.now()
    const endsAt = now + duration * 1000

    const newTimer = {
      id: `local_${now}`,
      endsAt,
      duration,
      item: itemDesc.trim(),
      price,
      status: 'active',
    }

    // Immediately add to state
    setTimers(prev => {
      const updated = [...prev, newTimer]
      saveTimersToLS(updated)
      return updated
    })

    // Reset form
    setItemDesc('')
    setItemPrice('')
    setShowForm(false)

    // Send to backend
    try {
      const res = await fetch(`${API}/api/timer/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          duration_seconds: duration,
          email: profile?.email || '',
          name: profile?.full_name || profile?.email || '',
          item_description: newTimer.item,
          item_price: price,
        }),
      })
      const data = await res.json()
      if (data.timer?.id) {
        // Replace local ID with backend ID
        setTimers(prev => {
          const updated = prev.map(t =>
            t.id === newTimer.id ? { ...t, id: data.timer.id } : t
          )
          saveTimersToLS(updated)
          return updated
        })
      }
    } catch (e) {
      console.error('Failed to start timer on backend:', e)
    }
  }

  async function cancelTimer(id) {
    setTimers(prev => {
      const updated = prev.filter(t => t.id !== id)
      saveTimersToLS(updated)
      return updated
    })

    try {
      await fetch(`${API}/api/timer/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ timer_id: id }),
      })
    } catch (e) {
      console.error('Failed to cancel timer:', e)
    }
  }

  function dismissCompleted(id) {
    setTimers(prev => {
      const updated = prev.filter(t => t.id !== id)
      saveTimersToLS(updated)
      return updated
    })
  }

  const activeTimers = timers.filter(t => t.status === 'active')
  const completedTimers = timers.filter(t => t.status === 'completed')
  const now = Date.now()

  if (loading) {
    return (
      <div className="page-container pb-16" style={{
        maxWidth: '700px', minHeight: '70vh',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.5, repeat: Infinity }}>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '16px' }}>Loading timers...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div
      className="page-container pb-16"
      style={{
        maxWidth: '700px',
        minHeight: '70vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '24px',
      }}
    >
      {/* Header */}
      <motion.div
        className="text-center"
        style={{ marginBottom: '4px' }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <span
          className="inline-block rounded-full glass-warm font-medium"
          style={{ padding: '8px 20px', fontSize: '13px', color: 'var(--color-gold)', marginBottom: '20px', display: 'inline-block' }}
        >
          ◷ ANTI IMPULSE
        </span>
        <h1 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '12px' }}>
          Pause Before You <span className="text-gradient">Purchase</span>
        </h1>
        <p style={{ fontSize: '16px', color: 'var(--color-text-secondary)', maxWidth: '480px', margin: '0 auto', lineHeight: 1.6 }}>
          Set a waiting period before impulse buys. Add what you're tempted by — we'll email you when time's up.
        </p>
      </motion.div>

      {/* Completed Timers */}
      <AnimatePresence>
        {completedTimers.map(t => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="glass-card"
            style={{
              borderRadius: '16px', padding: '20px 24px', width: '100%',
              border: '1px solid rgba(20, 184, 166, 0.3)',
              background: 'rgba(20, 184, 166, 0.06)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ color: 'var(--color-teal)', fontWeight: 700, fontSize: '15px', margin: '0 0 4px 0' }}>
                  ✦ Timer Complete!
                </p>
                {t.item && (
                  <p style={{ color: 'var(--color-text-primary)', fontSize: '15px', fontWeight: 600, margin: '0 0 2px 0' }}>
                    {t.item}
                  </p>
                )}
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px', margin: 0, lineHeight: 1.5 }}>
                  {t.price > 0
                    ? `You resisted spending ₹${t.price.toLocaleString()}! Check your email 📧`
                    : "The urge has passed! Check your email 📧"
                  }
                </p>
              </div>
              <motion.button
                onClick={() => dismissCompleted(t.id)}
                style={{
                  background: 'rgba(20, 184, 166, 0.15)',
                  border: '1px solid var(--color-teal)',
                  color: 'var(--color-teal)',
                  padding: '8px 16px',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Dismiss
              </motion.button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Active Timers */}
      <AnimatePresence>
        {activeTimers.map(t => {
          const remaining = Math.max(0, Math.floor((t.endsAt - now) / 1000))
          const progress = 1 - (remaining / t.duration)
          const circumference = 2 * Math.PI * 70

          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card"
              style={{
                borderRadius: '20px', padding: '28px', width: '100%',
                display: 'flex', alignItems: 'center', gap: '24px',
              }}
            >
              {/* Circular Progress */}
              <div style={{ position: 'relative', width: '160px', height: '160px', flexShrink: 0 }}>
                {/* Breathing ring */}
                <motion.div
                  style={{
                    position: 'absolute', inset: '-6px', borderRadius: '50%',
                    background: 'radial-gradient(circle, transparent 55%, rgba(20, 184, 166, 0.06) 100%)',
                  }}
                  animate={{ scale: [1, 1.04, 1], opacity: [0.5, 0.8, 0.5] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                />
                <svg width="160" height="160" viewBox="0 0 160 160">
                  <defs>
                    <linearGradient id={`tg_${t.id}`} x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#14b8a6" />
                      <stop offset="100%" stopColor="#06b6d4" />
                    </linearGradient>
                  </defs>
                  <circle cx="80" cy="80" r="70" fill="none" stroke="var(--color-bg-elevated)" strokeWidth="4" />
                  <motion.circle
                    cx="80" cy="80" r="70" fill="none"
                    stroke={`url(#tg_${t.id})`}
                    strokeWidth="4" strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference * (1 - progress)}
                    transform="rotate(-90 80 80)"
                    style={{ filter: 'drop-shadow(0 0 6px rgba(20, 184, 166, 0.4))', transition: 'stroke-dashoffset 0.5s ease-out' }}
                  />
                </svg>
                <div style={{
                  position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{
                    fontSize: '24px', fontWeight: 600, fontVariantNumeric: 'tabular-nums',
                    letterSpacing: '1px', color: 'var(--color-text-primary)',
                  }}>
                    {formatTime(remaining)}
                  </span>
                  <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                    Stay strong...
                  </p>
                </div>
              </div>

              {/* Timer Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                {t.item ? (
                  <p style={{
                    fontSize: '18px', fontWeight: 700, color: 'var(--color-text-primary)',
                    margin: '0 0 4px 0', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>
                    🛍️ {t.item}
                  </p>
                ) : (
                  <p style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-text-secondary)', margin: '0 0 4px 0' }}>
                    Impulse Purchase
                  </p>
                )}
                {t.price > 0 && (
                  <p style={{ fontSize: '22px', fontWeight: 800, color: 'var(--color-teal)', margin: '0 0 8px 0' }}>
                    ₹{t.price.toLocaleString()}
                  </p>
                )}
                <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', margin: '0 0 12px 0', lineHeight: 1.5 }}>
                  {remaining > 3600
                    ? `${Math.floor(remaining / 3600)}h ${Math.floor((remaining % 3600) / 60)}m left — resist the urge!`
                    : remaining > 60
                    ? `${Math.floor(remaining / 60)}m left — almost there!`
                    : `${remaining}s left — you've got this!`
                  }
                </p>
                <motion.button
                  onClick={() => cancelTimer(t.id)}
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#EF4444',
                    padding: '8px 20px',
                    borderRadius: '10px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                  whileHover={{ scale: 1.05, borderColor: 'rgba(239, 68, 68, 0.6)' }}
                  whileTap={{ scale: 0.95 }}
                >
                  Cancel Timer
                </motion.button>
              </div>
            </motion.div>
          )
        })}
      </AnimatePresence>

      {/* Add New Timer */}
      {!showForm ? (
        <motion.button
          onClick={() => setShowForm(true)}
          className="btn-primary"
          style={{
            fontSize: '16px', padding: '14px 36px',
            display: 'flex', alignItems: 'center', gap: '8px',
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span style={{ fontSize: '20px' }}>+</span> New Anti-Impulse Timer
        </motion.button>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card"
          style={{ borderRadius: '20px', padding: '28px', width: '100%' }}
        >
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px', color: 'var(--color-text-primary)' }}>
            🛑 What are you tempted to buy?
          </h3>

          {/* Item description */}
          <div style={{ marginBottom: '14px' }}>
            <label style={{ fontSize: '13px', color: 'var(--color-text-muted)', display: 'block', marginBottom: '6px' }}>
              Item Description
            </label>
            <input
              type="text"
              placeholder="e.g. Nike Air Max 90, PS5 Controller..."
              value={itemDesc}
              onChange={e => setItemDesc(e.target.value)}
              style={{
                width: '100%', padding: '12px 16px', borderRadius: '12px',
                background: 'var(--color-bg-elevated)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-primary)',
                fontSize: '15px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Price */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '13px', color: 'var(--color-text-muted)', display: 'block', marginBottom: '6px' }}>
              Price (₹)
            </label>
            <input
              type="number"
              placeholder="e.g. 12999"
              value={itemPrice}
              onChange={e => setItemPrice(e.target.value)}
              style={{
                width: '100%', padding: '12px 16px', borderRadius: '12px',
                background: 'var(--color-bg-elevated)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-primary)',
                fontSize: '15px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Duration presets */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '13px', color: 'var(--color-text-muted)', display: 'block', marginBottom: '8px' }}>
              Waiting Period
            </label>
            <div style={{ display: 'flex', gap: '10px' }}>
              {PRESETS.map(preset => (
                <motion.button
                  key={preset.seconds}
                  onClick={() => setDuration(preset.seconds)}
                  style={{
                    flex: 1, padding: '12px 0', borderRadius: '12px',
                    fontSize: '15px', fontWeight: 600, cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    background: duration === preset.seconds ? 'rgba(20, 184, 166, 0.12)' : 'transparent',
                    border: `1px solid ${duration === preset.seconds ? 'var(--color-teal)' : 'var(--color-border)'}`,
                    color: duration === preset.seconds ? '#14b8a6' : 'var(--color-text-secondary)',
                  }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  {preset.label}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <motion.button
              onClick={startTimer}
              className="btn-primary"
              style={{ flex: 1, fontSize: '15px', padding: '14px 0' }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              Start Timer
            </motion.button>
            <motion.button
              onClick={() => { setShowForm(false); setItemDesc(''); setItemPrice('') }}
              className="btn-secondary"
              style={{ padding: '14px 24px', fontSize: '15px' }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              Cancel
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Total savings */}
      {completedTimers.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            textAlign: 'center', padding: '16px 24px',
            borderRadius: '16px',
            background: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.15)',
            width: '100%',
          }}
        >
          <p style={{ color: '#10B981', fontWeight: 700, fontSize: '15px', margin: '0 0 2px 0' }}>
            💰 Potential savings from resisted impulses
          </p>
          <p style={{ color: '#10B981', fontWeight: 800, fontSize: '28px', margin: 0 }}>
            ₹{completedTimers.reduce((sum, t) => sum + (t.price || 0), 0).toLocaleString()}
          </p>
        </motion.div>
      )}

      {/* Insight */}
      <motion.p
        style={{
          textAlign: 'center', fontSize: '14px', color: 'var(--color-text-muted)',
          maxWidth: '420px', lineHeight: 1.6, marginTop: '4px',
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        Delaying impulse purchases by 12–24 hours eliminates most unnecessary spending.
        You'll receive an email when each timer ends — even if you close this tab.
      </motion.p>
    </div>
  )
}
