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
      transition={{ duration: 0.5, delay: index * 0.1, ease: [0.4, 0, 0.2, 1] }}
      className={`${!isLast ? 'border-b border-neutral-800/50 pb-6' : ''}`}
    >
      {/* Header: Title + Weight on same line */}
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h4 className="text-neutral-50 font-medium">{factor.label}</h4>
          <p className="text-neutral-400 text-sm mt-1">{factor.description}</p>
        </div>
        <span className="text-neutral-500 font-mono text-sm shrink-0 ml-4">
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

      {/* Impact score — muted system label */}
      <p className="text-[10px] text-neutral-500 uppercase tracking-widest mt-2">
        Impact Score {factor.impact}/100
      </p>
    </motion.div>
  )
}

export default function CreditEngine() {
  return (
    <main className="w-full min-h-screen bg-neutral-950 flex flex-col items-center">
      <div className="w-full max-w-7xl mx-auto px-6 py-10 flex flex-col gap-12">

        {/* ===== HERO ===== */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-neutral-900 border border-neutral-800 text-xs font-medium text-neutral-300 mb-4">
            ⚡ THE CREDIT ENGINE
          </span>
          <h1 className="text-3xl md:text-5xl font-bold text-neutral-50 mb-4">
            How Your Score Is <span className="text-emerald-400">Calculated</span>
          </h1>
          <p className="text-neutral-400 max-w-2xl mx-auto text-lg">
            No black boxes. Every factor is transparent, research-backed, and within your control.
          </p>
        </motion.div>

        {/* ===== STORY CARDS (3-up grid) ===== */}
        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6">
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
                className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl flex flex-col gap-3 text-center"
              >
                {/* Number bubble — subtle */}
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-neutral-800 border border-neutral-700 text-neutral-300 text-sm font-semibold mx-auto">
                  {i + 1}
                </div>
                <h3 className="font-semibold text-lg text-neutral-50">{step.title}</h3>
                <p className="text-sm text-neutral-400">{step.subtitle}</p>
                <p className="text-xs font-medium text-emerald-400">{step.highlight}</p>
              </motion.div>
            )
          })}
        </div>

        {/* ===== SCORING FACTORS ===== */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col gap-6"
        >
          <h2 className="text-2xl font-semibold text-neutral-50 tracking-tight text-center">
            Scoring Factors
          </h2>

          {/* Single premium container for all factors */}
          <div className="w-full bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl flex flex-col gap-6">
            {factors.map((factor, i) => (
              <FactorRow
                key={factor.id}
                factor={factor}
                index={i}
                isLast={i === factors.length - 1}
              />
            ))}
          </div>
        </motion.div>

        {/* ===== BOTTOM CTA ===== */}
        <motion.div
          className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8 shadow-xl text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h3 className="text-xl font-bold text-neutral-50 mb-2">Your score is always improvable</h3>
          <p className="text-neutral-400 mb-4 text-sm">
            Every factor above can be influenced by your daily financial behavior.
          </p>
          <span className="text-emerald-400 font-medium text-sm">
            Use the What-If Simulator on the Dashboard to see how changes affect your score →
          </span>
        </motion.div>

      </div>
    </main>
  )
}
