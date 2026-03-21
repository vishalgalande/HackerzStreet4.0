/**
 * SavingsPage — Animated piggy bank, savings progress, and goal tracker
 */

import { useState, useRef, useEffect } from 'react'
import { motion, useInView } from 'framer-motion'

const savingsGoals = [
  { id: 1, name: 'Emergency Fund', target: 30000, current: 18500, icon: '🛡️', color: '#10B981' },
  { id: 2, name: 'Rent Buffer', target: 12000, current: 9600, icon: '🏠', color: '#d4a843' },
  { id: 3, name: 'Skill Course', target: 8000, current: 3200, icon: '📚', color: '#c4652a' },
  { id: 4, name: 'Bike Down Payment', target: 25000, current: 7500, icon: '🏍️', color: '#b87333' },
]

function AnimatedNumber({ target, duration = 1500, prefix = '' }) {
  const [value, setValue] = useState(0)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })

  useEffect(() => {
    if (!inView) return
    const start = Date.now()
    const timer = setInterval(() => {
      const elapsed = Date.now() - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(target * eased))
      if (progress >= 1) clearInterval(timer)
    }, 16)
    return () => clearInterval(timer)
  }, [inView, target, duration])

  return <span ref={ref}>{prefix}{value.toLocaleString()}</span>
}

function GoalCard({ goal, index }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-30px' })
  const percent = Math.round((goal.current / goal.target) * 100)

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="glass-card rounded-xl p-5"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{goal.icon}</span>
          <h4 className="font-semibold text-sm">{goal.name}</h4>
        </div>
        <span className="text-sm font-bold" style={{ color: goal.color }}>{percent}%</span>
      </div>

      {/* Progress bar */}
      <div className="h-2.5 rounded-full overflow-hidden" style={{ background: 'var(--color-bg-primary)' }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${goal.color}, ${goal.color}cc)` }}
          initial={{ width: 0 }}
          animate={inView ? { width: `${percent}%` } : { width: 0 }}
          transition={{ duration: 1.2, delay: index * 0.1 + 0.2, ease: [0.4, 0, 0.2, 1] }}
        />
      </div>

      <div className="flex justify-between mt-2">
        <span className="text-xs text-[var(--color-text-muted)]">
          ₹<AnimatedNumber target={goal.current} />
        </span>
        <span className="text-xs text-[var(--color-text-muted)]">₹{goal.target.toLocaleString()}</span>
      </div>
    </motion.div>
  )
}

/** SVG Piggy Bank (elegant, not cartoonish) */
function PiggyBank({ fillPercent }) {
  return (
    <motion.svg
      viewBox="0 0 200 160"
      className="w-full max-w-xs mx-auto"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* Glow filter */}
      <defs>
        <filter id="piggyGlow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <linearGradient id="piggyFill" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#c4652a" />
          <stop offset={`${fillPercent}%`} stopColor="#d4a843" />
          <stop offset={`${fillPercent}%`} stopColor="transparent" />
          <stop offset="100%" stopColor="transparent" />
        </linearGradient>
        <linearGradient id="piggyOutline" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#d4a843" />
          <stop offset="100%" stopColor="#c4652a" />
        </linearGradient>
      </defs>
      
      {/* Body */}
      <ellipse cx="100" cy="90" rx="65" ry="45" fill="url(#piggyFill)" opacity="0.3" />
      <ellipse cx="100" cy="90" rx="65" ry="45" fill="none" stroke="url(#piggyOutline)" strokeWidth="2" filter="url(#piggyGlow)" />
      
      {/* Head */}
      <ellipse cx="155" cy="75" rx="22" ry="20" fill="none" stroke="url(#piggyOutline)" strokeWidth="2" />
      
      {/* Snout */}
      <ellipse cx="172" cy="80" rx="8" ry="6" fill="none" stroke="#d4a843" strokeWidth="1.5" />
      <circle cx="170" cy="79" r="1.5" fill="#d4a843" />
      <circle cx="174" cy="79" r="1.5" fill="#d4a843" />
      
      {/* Eye */}
      <circle cx="152" cy="70" r="2.5" fill="#d4a843" />
      
      {/* Ear */}
      <path d="M 148 58 Q 145 48, 155 52" fill="none" stroke="#d4a843" strokeWidth="2" strokeLinecap="round" />
      
      {/* Coin slot */}
      <motion.rect
        x="90" y="42" width="20" height="3" rx="1.5"
        fill="#d4a843"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      
      {/* Legs */}
      <rect x="62" y="125" width="8" height="16" rx="4" fill="none" stroke="#c4652a" strokeWidth="2" />
      <rect x="82" y="125" width="8" height="16" rx="4" fill="none" stroke="#c4652a" strokeWidth="2" />
      <rect x="112" y="125" width="8" height="16" rx="4" fill="none" stroke="#c4652a" strokeWidth="2" />
      <rect x="132" y="125" width="8" height="16" rx="4" fill="none" stroke="#c4652a" strokeWidth="2" />
      
      {/* Tail */}
      <path d="M 38 80 Q 28 70, 30 85 Q 32 95, 38 90" fill="none" stroke="#d4a843" strokeWidth="2" strokeLinecap="round" />

      {/* Coin falling animation */}
      <motion.g
        animate={{ y: [0, 30], opacity: [1, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
      >
        <circle cx="100" cy="25" r="6" fill="none" stroke="#d4a843" strokeWidth="1.5" />
        <text x="100" y="28" textAnchor="middle" fill="#d4a843" fontSize="8" fontWeight="bold">₹</text>
      </motion.g>
    </motion.svg>
  )
}

export default function SavingsPage() {
  const totalSaved = savingsGoals.reduce((sum, g) => sum + g.current, 0)
  const totalTarget = savingsGoals.reduce((sum, g) => sum + g.target, 0)
  const overallPercent = Math.round((totalSaved / totalTarget) * 100)

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 md:px-8 max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <span className="inline-block px-4 py-1.5 rounded-full glass-warm text-xs font-medium text-[var(--color-gold)] mb-4">
          ◇ SAVINGS TRACKER
        </span>
        <h1 className="text-3xl md:text-4xl font-bold mb-3">
          Your <span className="text-gradient">Savings Journey</span>
        </h1>
        <p className="text-[var(--color-text-secondary)]">
          Building savings builds your credit score — every rupee counts.
        </p>
      </motion.div>

      {/* Piggy Bank + Total */}
      <div className="glass-card rounded-2xl p-8 mb-8">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <PiggyBank fillPercent={overallPercent} />
          <div className="text-center md:text-left">
            <p className="text-sm text-[var(--color-text-muted)] mb-1">Total Saved</p>
            <p className="text-4xl font-bold text-gradient mb-2">
              ₹<AnimatedNumber target={totalSaved} />
            </p>
            <p className="text-sm text-[var(--color-text-secondary)] mb-4">
              of ₹{totalTarget.toLocaleString()} goal ({overallPercent}%)
            </p>

            {/* Overall progress */}
            <div className="h-3 rounded-full overflow-hidden" style={{ background: 'var(--color-bg-primary)' }}>
              <motion.div
                className="h-full rounded-full"
                style={{ background: 'linear-gradient(90deg, var(--color-burnt-orange), var(--color-gold))' }}
                initial={{ width: 0 }}
                animate={{ width: `${overallPercent}%` }}
                transition={{ duration: 1.5, ease: [0.4, 0, 0.2, 1] }}
              />
            </div>

            <p className="text-xs text-[var(--color-text-muted)] mt-3">
              💡 Savings discipline is worth <span className="text-[var(--color-gold)] font-medium">25%</span> of your credit score
            </p>
          </div>
        </div>
      </div>

      {/* Goals grid */}
      <h2 className="text-xl font-bold mb-4">Savings <span className="text-gradient">Goals</span></h2>
      <div className="grid md:grid-cols-2 gap-4">
        {savingsGoals.map((goal, i) => (
          <GoalCard key={goal.id} goal={goal} index={i} />
        ))}
      </div>
    </div>
  )
}
