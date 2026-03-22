/**
 * AlertsPage — Shows all emails/notifications received from FinFix
 * Fetches real email logs from Supabase via GET /api/alerts
 * Timeline layout with accordion expand
 */

import { useState, useEffect, useRef } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// Map email types to display config
const typeConfig = {
  score_alert: { icon: '📉', color: '#EF4444', label: 'Score Alert' },
  spending_spike: { icon: '💸', color: '#F59E0B', label: 'Spending Alert' },
  timer_complete: { icon: '⏰', color: '#14B8A6', label: 'Timer Complete' },
  payment_reminder: { icon: '🔔', color: '#FF8C00', label: 'Payment Reminder' },
  payment_due_today: { icon: '🔴', color: '#EF4444', label: 'Payment Due Today' },
  test: { icon: '🎉', color: '#6366F1', label: 'Test Email' },
  general: { icon: '📧', color: '#06B6D4', label: 'Notification' },
}

function formatDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  const now = new Date()
  const diffMs = now - d
  const diffMins = Math.floor(diffMs / 60000)
  const diffHrs = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHrs < 24) return `${diffHrs}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function AlertItem({ alert, index }) {
  const [expanded, setExpanded] = useState(false)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-30px' })

  const config = typeConfig[alert.type] || typeConfig.general

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -30 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.4, 0, 0.2, 1] }}
      className="relative pl-8"
    >
      {/* Timeline dot */}
      <motion.div
        className="absolute left-0 top-5 w-4 h-4 rounded-full border-2"
        style={{
          borderColor: config.color,
          background: expanded ? config.color : 'var(--color-bg-primary)',
        }}
        animate={expanded ? { scale: [1, 1.3, 1] } : {}}
        transition={{ duration: 0.3 }}
      />

      {/* Card */}
      <motion.button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left glass-card rounded-2xl p-6 cursor-pointer"
        style={{
          borderColor: expanded ? `${config.color}30` : undefined,
        }}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.995 }}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <span className="text-xl mt-0.5" style={{ color: config.color }}>{config.icon}</span>
            <div>
              <h4 className="font-semibold text-[16px]">{alert.subject}</h4>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[11px] uppercase tracking-wide px-2 py-0.5 rounded-full font-semibold"
                  style={{ background: `${config.color}15`, color: config.color }}>
                  {config.label}
                </span>
                <span className="text-[13px] text-[var(--color-text-muted)]">
                  → {alert.email}
                </span>
              </div>
            </div>
          </div>
          <div className="text-right shrink-0 ml-4">
            <p className="text-[13px] text-[var(--color-text-muted)]">{formatDate(alert.sent_at)}</p>
          </div>
        </div>

        {/* Expandable detail */}
        <AnimatePresence>
          {expanded && alert.preview && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="overflow-hidden"
            >
              <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--color-border)' }}>
                <p className="text-[15px] text-[var(--color-text-secondary)] leading-relaxed">
                  {alert.preview}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </motion.div>
  )
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API}/api/alerts`)
      .then(r => r.json())
      .then(data => {
        setAlerts(data.alerts || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div className="page-container pb-16" style={{ maxWidth: '800px' }}>
      {/* Header */}
      <motion.div
        className="text-center mb-14"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <span className="inline-block px-5 py-2 rounded-full glass-warm text-[13px] font-medium text-[var(--color-gold)] mb-5">
          🔔 NOTIFICATIONS
        </span>
        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          Your <span className="text-gradient">Alert History</span>
        </h1>
        <p className="text-[16px] text-[var(--color-text-secondary)] leading-relaxed">
          Every email notification we've sent you — score alerts, spending warnings, and timer completions.
        </p>
      </motion.div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div
          className="absolute left-[7px] top-5 bottom-5 w-px"
          style={{ background: 'linear-gradient(to bottom, var(--color-burnt-orange), var(--color-gold), transparent)' }}
        />

        {loading ? (
          <div className="glass-card rounded-2xl p-14 text-center mt-8 ml-8">
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <span className="text-4xl mb-4 block">⏳</span>
              <p className="text-[var(--color-text-secondary)]">Loading notifications...</p>
            </motion.div>
          </div>
        ) : alerts.length === 0 ? (
          <div className="glass-card rounded-2xl p-14 text-center mt-8 ml-8">
            <span className="text-5xl mb-6 block opacity-50">📫</span>
            <h3 className="text-2xl font-semibold mb-3">No notifications yet</h3>
            <p className="text-[var(--color-text-secondary)] text-[15px] max-w-sm mx-auto leading-relaxed">
              Your notification history is empty. We'll show emails here when score alerts, spending warnings, or timer notifications are sent.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {alerts.map((alert, i) => (
              <AlertItem key={alert.id || i} alert={alert} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
