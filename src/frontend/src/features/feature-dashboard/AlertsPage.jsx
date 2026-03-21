/**
 * AlertsPage — Timeline-based email/alerts layout
 * Scroll reveals past alerts with accordion expand animation
 */

import { useState, useRef } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'

const mockAlerts = []

function AlertItem({ alert, index }) {
  const [expanded, setExpanded] = useState(false)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-30px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -30 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1, ease: [0.4, 0, 0.2, 1] }}
      className="relative pl-8"
    >
      {/* Timeline dot */}
      <motion.div
        className="absolute left-0 top-5 w-4 h-4 rounded-full border-2"
        style={{
          borderColor: alert.color,
          background: expanded ? alert.color : 'var(--color-bg-primary)',
        }}
        animate={expanded ? { scale: [1, 1.3, 1] } : {}}
        transition={{ duration: 0.3 }}
      />

      {/* Card */}
      <motion.button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left glass-card rounded-2xl p-6 cursor-pointer"
        style={{
          borderColor: expanded ? `${alert.color}30` : undefined,
        }}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.995 }}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <span className="text-xl mt-0.5" style={{ color: alert.color }}>{alert.icon}</span>
            <div>
              <h4 className="font-semibold text-[16px]">{alert.title}</h4>
              <p className="text-[14px] text-[var(--color-text-secondary)] mt-1 leading-relaxed">{alert.summary}</p>
            </div>
          </div>
          <div className="text-right shrink-0 ml-4">
            <p className="text-[13px] text-[var(--color-text-muted)]">{alert.date}</p>
            <p className="text-[13px] text-[var(--color-text-muted)]">{alert.time}</p>
          </div>
        </div>

        {/* Expandable detail */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="overflow-hidden"
            >
              <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--color-border)' }}>
                <p className="text-[15px] text-[var(--color-text-secondary)] leading-relaxed">
                  {alert.detail}
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
          ◈ ALERTS & INSIGHTS
        </span>
        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          Your <span className="text-gradient">Financial Timeline</span>
        </h1>
        <p className="text-[16px] text-[var(--color-text-secondary)] leading-relaxed">
          Score changes, payment reminders, and personalized insights — all in one place.
        </p>
      </motion.div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div
          className="absolute left-[7px] top-5 bottom-5 w-px"
          style={{ background: 'linear-gradient(to bottom, var(--color-burnt-orange), var(--color-gold), transparent)' }}
        />

        {mockAlerts.length === 0 ? (
          <div className="glass-card rounded-2xl p-14 text-center mt-8 ml-8">
            <span className="text-5xl mb-6 block opacity-50">📫</span>
            <h3 className="text-2xl font-semibold mb-3">No alerts yet</h3>
            <p className="text-[var(--color-text-secondary)] text-[15px] max-w-sm mx-auto leading-relaxed">
              Your financial timeline is completely clear. We'll notify you here when there are important score changes or insights.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {mockAlerts.map((alert, i) => (
              <AlertItem key={alert.id} alert={alert} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
