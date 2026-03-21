/**
 * Feature: Dashboard — QuickStats
 * Animated stat cards with number counters and dark autumn styling.
 */

import { useRef, useEffect, useState } from 'react'
import { motion, useInView } from 'framer-motion'

function AnimatedValue({ value, prefix = '' }) {
  const [display, setDisplay] = useState(0)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
  const numericValue = parseInt(String(value).replace(/[^0-9]/g, '')) || 0

  useEffect(() => {
    if (!inView || !numericValue) return
    const duration = 1200
    const start = Date.now()
    const timer = setInterval(() => {
      const elapsed = Date.now() - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.round(numericValue * eased))
      if (progress >= 1) clearInterval(timer)
    }, 16)
    return () => clearInterval(timer)
  }, [inView, numericValue])

  if (!numericValue) return <span ref={ref}>{value}</span>
  return <span ref={ref}>{prefix}{display.toLocaleString()}</span>
}

export default function QuickStats({ entries, profile }) {
  const today = new Date().toISOString().split('T')[0]
  const todayEntry = entries.find(e => e.date === today)

  const totalSaved = entries.reduce((sum, e) => sum + (e.savings || 0), 0)
  const totalSpent = entries.reduce((sum, e) => sum + (e.food || 0) + (e.transport || 0) + (e.discretionary || 0) + (e.rent || 0), 0)
  const billsOnTime = entries.filter(e => e.bill_paid_on_time).length
  const billStreak = entries.length > 0 ? Math.round((billsOnTime / entries.length) * 100) : 0

  const savingsRate = profile?.monthly_income > 0
    ? Math.round((totalSaved / (profile.monthly_income || 1)) * 100)
    : 0

  const stats = [
    {
      label: "Today's Spend",
      value: todayEntry
        ? `₹${(todayEntry.food || 0) + (todayEntry.transport || 0) + (todayEntry.discretionary || 0)}`
        : 'No entry',
      icon: '◎',
      color: 'var(--color-fair)',
    },
    {
      label: 'Total Saved (30d)',
      value: `₹${totalSaved.toLocaleString()}`,
      icon: '◇',
      color: 'var(--color-excellent)',
    },
    {
      label: 'Savings Rate',
      value: `${savingsRate}%`,
      icon: '△',
      color: savingsRate >= 20 ? 'var(--color-excellent)' : 'var(--color-fair)',
    },
    {
      label: 'Bills On Time',
      value: `${billStreak}%`,
      icon: '⚡',
      color: billStreak >= 80 ? 'var(--color-excellent)' : 'var(--color-fair)',
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          className="glass-card rounded-xl p-4 card-tilt"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: i * 0.08 }}
        >
          <span className="text-lg" style={{ color: stat.color }}>{stat.icon}</span>
          <p className="text-xs text-[var(--color-text-muted)] mt-2">{stat.label}</p>
          <p className="text-xl font-bold mt-1" style={{ color: stat.color }}>
            {stat.value}
          </p>
        </motion.div>
      ))}
    </div>
  )
}
