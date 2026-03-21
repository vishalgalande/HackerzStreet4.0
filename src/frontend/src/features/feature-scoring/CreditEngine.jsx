/**
 * CreditEngine — Story-driven UI showing how credit score is calculated
 * Carbon dark mode with neutral-only palette. Premium slim bars.
 */

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const factors = [
  {
    id: 'payment',
    label: 'Payment Consistency',
    weight: 30,
    impact: 85,
    description: 'Most predictive of default risk. Tracks rent, bills, and telecom payments.',
    barColor: 'bg-emerald-500',
    textColor: 'text-emerald-400',
  },
  {
    id: 'savings',
    label: 'Savings Discipline',
    weight: 25,
    impact: 70,
    description: 'Buffer against income shocks. Especially critical for informal workers.',
    barColor: 'bg-amber-500',
    textColor: 'text-amber-400',
  },
  {
    id: 'income',
    label: 'Income Stability',
    weight: 20,
    impact: 60,
    description: 'Variance matters more than amount. Irregular income treated differently.',
    barColor: 'bg-orange-500',
    textColor: 'text-orange-400',
  },
  {
    id: 'spending',
    label: 'Spending Discipline',
    weight: 15,
    impact: 75,
    description: 'Discretionary vs essential spend ratio signals financial maturity.',
    barColor: 'bg-amber-500',
    textColor: 'text-amber-400',
  },
  {
    id: 'debt',
    label: 'Debt-to-Income Ratio',
    weight: 10,
    impact: 90,
    description: 'Existing obligations constrain capacity for new credit.',
    barColor: 'bg-rose-500',
    textColor: 'text-rose-400',
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

function FactorRow({ factor, index, isLast }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-50px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -20 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.12, ease: [0.4, 0, 0.2, 1] }}
      className="glass-card rounded-2xl p-6"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          <span className="text-2xl" style={{ color: factor.color }}>{factor.icon}</span>
          <div>
            <h4 className="font-semibold text-[16px]">{factor.label}</h4>
            <p className="text-[14px] text-[var(--color-text-muted)] mt-1 leading-relaxed">{factor.description}</p>
          </div>
        </div>
        <span className="text-[14px] font-bold px-3 py-1 rounded-full" style={{
          background: `${factor.color}15`,
          color: factor.color,
        }}>
          {factor.weight}%
        </span>
      </div>

      {/* Slim progress bar */}
      <div className="h-1.5 rounded-full overflow-hidden bg-neutral-800 mt-4">
        <motion.div
          className={`h-full rounded-full ${factor.barColor}`}
          initial={{ width: 0 }}
          animate={inView ? { width: `${factor.impact}%` } : { width: 0 }}
          transition={{ duration: 1, delay: index * 0.1 + 0.3, ease: [0.4, 0, 0.2, 1] }}
        />
      </div>
      <div className="flex justify-between mt-2">
        <span className="text-[13px] text-[var(--color-text-muted)]">Impact Score</span>
        <motion.span
          className="text-[13px] font-medium"
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
    <div className="page-container pb-16">
      {/* Hero */}
      <motion.div
        className="text-center mb-16"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <span className="inline-block px-5 py-2 rounded-full glass-warm text-[13px] font-medium text-[var(--color-gold)] mb-5">
          ⚡ THE CREDIT ENGINE
        </span>
        <h1 className="text-3xl md:text-5xl font-bold mb-5">
          How Your Score Is <span className="text-gradient">Calculated</span>
        </h1>
        <p className="text-[var(--color-text-secondary)] max-w-2xl mx-auto text-lg leading-relaxed">
          No black boxes. Every factor is transparent, research-backed, and within your control.
        </p>
      </motion.div>

      {/* Story Steps */}
      <div className="grid md:grid-cols-3 gap-8 mb-16">
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
              className="glass-card rounded-2xl p-7 text-center"
            >
              <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center text-white font-bold text-[15px] mx-auto mb-5">
                {i + 1}
              </div>
              <h3 className="font-semibold text-xl mb-3">{step.title}</h3>
              <p className="text-[15px] text-[var(--color-text-secondary)] mb-4 leading-relaxed">{step.subtitle}</p>
              <p className="text-[14px] font-medium text-[var(--color-gold)]">{step.highlight}</p>
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
        <h2 className="text-2xl font-bold mb-8 text-center">
          Scoring <span className="text-gradient">Factors</span>
        </h2>
        <div className="space-y-6">
          {factors.map((factor, i) => (
            <FactorBar key={factor.id} factor={factor} index={i} />
          ))}
        </div>

      {/* Bottom CTA */}
      <motion.div
        className="mt-16 text-center glass-card rounded-2xl p-10"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <h3 className="text-2xl font-bold mb-3">Your score is always improvable</h3>
        <p className="text-[var(--color-text-secondary)] mb-5 text-[15px] leading-relaxed">
          Every factor above can be influenced by your daily financial behavior.
        </p>
        <span className="text-[var(--color-gold)] font-medium text-[15px]">
          Use the What-If Simulator on the Dashboard to see how changes affect your score →
        </span>
      </motion.div>
    </div>
  )
}
