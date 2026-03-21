/**
 * CreditEngine — Story-driven UI showing how credit score is calculated
 * Animated factor bars that fill dynamically
 */

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const factors = [
  {
    id: 'payment',
    label: 'Payment Consistency',
    weight: 30,
    impact: 85,
    icon: '◎',
    description: 'Most predictive of default risk. Tracks rent, bills, and telecom payments.',
    color: '#10B981',
  },
  {
    id: 'savings',
    label: 'Savings Discipline',
    weight: 25,
    impact: 70,
    icon: '◇',
    description: 'Buffer against income shocks. Especially critical for informal workers.',
    color: '#d4a843',
  },
  {
    id: 'income',
    label: 'Income Stability',
    weight: 20,
    impact: 60,
    icon: '△',
    description: 'Variance matters more than amount. Irregular income treated differently.',
    color: '#c4652a',
  },
  {
    id: 'spending',
    label: 'Spending Discipline',
    weight: 15,
    impact: 75,
    icon: '◈',
    description: 'Discretionary vs essential spend ratio signals financial maturity.',
    color: '#b87333',
  },
  {
    id: 'debt',
    label: 'Debt-to-Income Ratio',
    weight: 10,
    impact: 90,
    icon: '◿',
    description: 'Existing obligations constrain capacity for new credit.',
    color: '#d4940a',
  },
]

const storySteps = [
  {
    title: 'We don\'t look at credit cards.',
    subtitle: 'Traditional credit bureaus need formal loan history. We don\'t.',
    highlight: 'Behavior is the best predictor of trustworthiness.',
  },
  {
    title: 'We analyze your daily habits.',
    subtitle: 'How you spend, save, and pay bills tells us everything.',
    highlight: '190M+ Indians are credit-invisible. We see them.',
  },
  {
    title: 'We give you the power.',
    subtitle: 'Every factor is transparent, explainable, and improvable.',
    highlight: 'Your score, your control.',
  },
]

function FactorBar({ factor, index }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-50px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -30 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.12, ease: [0.4, 0, 0.2, 1] }}
      className="glass-card rounded-xl p-5"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-xl" style={{ color: factor.color }}>{factor.icon}</span>
          <div>
            <h4 className="font-semibold text-sm">{factor.label}</h4>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{factor.description}</p>
          </div>
        </div>
        <span className="text-sm font-bold px-2 py-0.5 rounded-full" style={{
          background: `${factor.color}15`,
          color: factor.color,
        }}>
          {factor.weight}%
        </span>
      </div>

      {/* Animated bar */}
      <div className="h-2.5 rounded-full overflow-hidden" style={{ background: 'var(--color-bg-primary)' }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${factor.color}, ${factor.color}aa)` }}
          initial={{ width: 0 }}
          animate={inView ? { width: `${factor.impact}%` } : { width: 0 }}
          transition={{ duration: 1.2, delay: index * 0.12 + 0.3, ease: [0.4, 0, 0.2, 1] }}
        />
      </div>
      <div className="flex justify-between mt-1.5">
        <span className="text-xs text-[var(--color-text-muted)]">Impact Score</span>
        <motion.span
          className="text-xs font-medium"
          style={{ color: factor.color }}
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: index * 0.12 + 1 }}
        >
          {factor.impact}/100
        </motion.span>
      </div>
    </motion.div>
  )
}

export default function CreditEngine() {
  return (
    <div className="min-h-screen pt-24 pb-16 px-4 md:px-8 max-w-5xl mx-auto">
      {/* Hero */}
      <motion.div
        className="text-center mb-16"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <span className="inline-block px-4 py-1.5 rounded-full glass-warm text-xs font-medium text-[var(--color-gold)] mb-4">
          ⚡ THE CREDIT ENGINE
        </span>
        <h1 className="text-3xl md:text-5xl font-bold mb-4">
          How Your Score Is <span className="text-gradient">Calculated</span>
        </h1>
        <p className="text-[var(--color-text-secondary)] max-w-2xl mx-auto text-lg">
          No black boxes. Every factor is transparent, research-backed, and within your control.
        </p>
      </motion.div>

      {/* Story Steps */}
      <div className="grid md:grid-cols-3 gap-6 mb-16">
        {storySteps.map((step, i) => {
          const ref = useRef(null)
          const inView = useInView(ref, { once: true, margin: '-30px' })
          return (
            <motion.div
              key={i}
              ref={ref}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              className="glass-card rounded-xl p-6 text-center"
            >
              <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-white font-bold text-sm mx-auto mb-4">
                {i + 1}
              </div>
              <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
              <p className="text-sm text-[var(--color-text-secondary)] mb-3">{step.subtitle}</p>
              <p className="text-xs font-medium text-[var(--color-gold)]">{step.highlight}</p>
            </motion.div>
          )
        })}
      </div>

      {/* Factor Bars */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="text-2xl font-bold mb-6 text-center">
          Scoring <span className="text-gradient">Factors</span>
        </h2>
        <div className="space-y-4">
          {factors.map((factor, i) => (
            <FactorBar key={factor.id} factor={factor} index={i} />
          ))}
        </div>
      </motion.div>

      {/* Bottom CTA */}
      <motion.div
        className="mt-16 text-center glass-card rounded-2xl p-8"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <h3 className="text-xl font-bold mb-2">Your score is always improvable</h3>
        <p className="text-[var(--color-text-secondary)] mb-4 text-sm">
          Every factor above can be influenced by your daily financial behavior.
        </p>
        <span className="text-[var(--color-gold)] font-medium text-sm">
          Use the What-If Simulator on the Dashboard to see how changes affect your score →
        </span>
      </motion.div>
    </div>
  )
}
