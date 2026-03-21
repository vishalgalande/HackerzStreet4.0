/**
 * AlertsPage — Timeline-based email/alerts layout
 * Scroll reveals past alerts with accordion expand animation
 */

import { useState, useRef } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'

const mockAlerts = [
  {
    id: 1,
    type: 'score_change',
    date: '2026-03-21',
    time: '09:15 AM',
    title: 'Credit Score Updated',
    summary: 'Your score increased by +18 points',
    detail: 'Your consistent bill payments over the last 30 days have contributed to a significant score improvement. Payment consistency factor increased from 72 to 85.',
    icon: '↑',
    color: '#10B981',
  },
  {
    id: 2,
    type: 'tip',
    date: '2026-03-19',
    time: '02:30 PM',
    title: 'Savings Goal Milestone',
    summary: 'You\'ve reached 15% savings rate this month!',
    detail: 'Great progress! You\'re now in the "Good" savings discipline bracket. Reaching 20% would add an estimated +12 more points to your score.',
    icon: '◇',
    color: '#d4a843',
  },
  {
    id: 3,
    type: 'warning',
    date: '2026-03-17',
    time: '11:00 AM',
    title: 'Spending Alert',
    summary: 'Discretionary spending rose by 25% this week',
    detail: 'Your discretionary spending reached ₹4,500 this week compared to ₹3,600 last week. High discretionary spending relative to income impacts your Spending Discipline factor.',
    icon: '⚠',
    color: '#c4652a',
  },
  {
    id: 4,
    type: 'reminder',
    date: '2026-03-15',
    time: '08:00 AM',
    title: 'Bill Payment Reminder',
    summary: 'Electricity bill due in 2 days',
    detail: 'Your electricity bill of ₹1,200 is due on March 17. Paying on time strengthens your Payment Consistency score — the #1 weighted factor at 30%.',
    icon: '◎',
    color: '#d4940a',
  },
  {
    id: 5,
    type: 'achievement',
    date: '2026-03-12',
    time: '06:00 PM',
    title: 'Achievement Unlocked!',
    summary: '7-day consecutive logging streak',
    detail: 'You\'ve logged your finances for 7 days straight! Consistent data entry helps us build a more accurate and confident credit profile for you.',
    icon: '★',
    color: '#b87333',
  },
  {
    id: 6,
    type: 'score_change',
    date: '2026-03-08',
    time: '09:00 AM',
    title: 'Monthly Score Report',
    summary: 'February score: 542 (Fair)',
    detail: 'Your February score was 542, placing you in the Fair band. Top improvement area: increase savings rate from 10% to 15% for an estimated +15 point boost.',
    icon: '◈',
    color: '#d4a843',
  },
]

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
        className="w-full text-left glass-card rounded-xl p-4 cursor-pointer"
        style={{
          borderColor: expanded ? `${alert.color}30` : undefined,
        }}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.995 }}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <span className="text-lg mt-0.5" style={{ color: alert.color }}>{alert.icon}</span>
            <div>
              <h4 className="font-semibold text-sm">{alert.title}</h4>
              <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">{alert.summary}</p>
            </div>
          </div>
          <div className="text-right shrink-0 ml-4">
            <p className="text-xs text-[var(--color-text-muted)]">{alert.date}</p>
            <p className="text-xs text-[var(--color-text-muted)]">{alert.time}</p>
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
              <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--color-border)' }}>
                <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
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
    <div className="min-h-screen pt-24 pb-16 px-4 md:px-8 max-w-3xl mx-auto">
      {/* Header */}
      <motion.div
        className="text-center mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <span className="inline-block px-4 py-1.5 rounded-full glass-warm text-xs font-medium text-[var(--color-gold)] mb-4">
          ◈ ALERTS & INSIGHTS
        </span>
        <h1 className="text-3xl md:text-4xl font-bold mb-3">
          Your <span className="text-gradient">Financial Timeline</span>
        </h1>
        <p className="text-[var(--color-text-secondary)]">
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

        <div className="space-y-4">
          {mockAlerts.map((alert, i) => (
            <AlertItem key={alert.id} alert={alert} index={i} />
          ))}
        </div>
      </div>
    </div>
  )
}
