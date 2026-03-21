/**
 * InvestmentsPage — Smart investment cards with 3D hover and return projections
 */

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const investments = [
  {
    id: 'fd',
    name: 'Fixed Deposit',
    risk: 'Low',
    returnRange: '6.5% - 7.5%',
    minAmount: '₹5,000',
    duration: '1-5 years',
    description: 'Guaranteed returns with capital protection. Best for building credit history through disciplined saving.',
    icon: '🏦',
    color: '#10B981',
    projected: [5000, 5325, 5671, 6039, 6432],
  },
  {
    id: 'rd',
    name: 'Recurring Deposit',
    risk: 'Low',
    returnRange: '6.0% - 7.0%',
    minAmount: '₹500/mo',
    duration: '6mo - 5yr',
    description: 'Builds savings habit over time. Monthly deposits improve your Savings Discipline score factor.',
    icon: '📅',
    color: '#d4a843',
    projected: [500, 3150, 6420, 9815, 13340],
  },
  {
    id: 'mf',
    name: 'Debt Mutual Fund',
    risk: 'Low-Medium',
    returnRange: '7% - 9%',
    minAmount: '₹1,000',
    duration: '1-3 years',
    description: 'Higher returns than FD with moderate risk. SIP mode further builds financial discipline.',
    icon: '📊',
    color: '#c4652a',
    projected: [1000, 1080, 1166, 1260, 1360],
  },
  {
    id: 'gold',
    name: 'Digital Gold',
    risk: 'Medium',
    returnRange: '8% - 12%',
    minAmount: '₹100',
    duration: 'Flexible',
    description: 'Start with as little as ₹100. Gold serves as an inflation hedge and emergency reserve.',
    icon: '✦',
    color: '#b87333',
    projected: [100, 110, 121, 133, 146],
  },
  {
    id: 'ppf',
    name: 'PPF Account',
    risk: 'Very Low',
    returnRange: '7.1%',
    minAmount: '₹500/yr',
    duration: '15 years',
    description: 'Government-backed, tax-free returns. Long-term commitment signals strong financial planning.',
    icon: '🏛️',
    color: '#d4940a',
    projected: [500, 4320, 8640, 13500, 18900],
  },
]

const riskColors = {
  'Low': '#10B981',
  'Low-Medium': '#d4a843',
  'Medium': '#c4652a',
  'Very Low': '#10B981',
}

function InvestmentCard({ investment, index }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-50px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1, ease: [0.4, 0, 0.2, 1] }}
      className="glass-card rounded-2xl p-7 card-tilt"
    >
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-4">
          <span className="text-3xl">{investment.icon}</span>
          <div>
            <h3 className="font-semibold text-[17px]">{investment.name}</h3>
            <span className="text-[13px] px-2.5 py-1 rounded-full" style={{
              background: `${riskColors[investment.risk]}15`,
              color: riskColors[investment.risk],
            }}>
              {investment.risk} Risk
            </span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold" style={{ color: investment.color }}>{investment.returnRange}</p>
          <p className="text-[13px] text-[var(--color-text-muted)]">annual return</p>
        </div>
      </div>

      <p className="text-[15px] text-[var(--color-text-secondary)] mb-5 leading-relaxed">{investment.description}</p>

      {/* Return projection mini chart */}
      <div className="mb-5">
        <p className="text-[13px] text-[var(--color-text-muted)] mb-3">Projected Growth (5 years)</p>
        <div className="flex items-end gap-1.5 h-14">
          {investment.projected.map((val, i) => {
            const max = Math.max(...investment.projected)
            const height = (val / max) * 100
            return (
              <motion.div
                key={i}
                className="flex-1 rounded-t"
                style={{
                  background: `linear-gradient(to top, ${investment.color}40, ${investment.color})`,
                }}
                initial={{ height: 0 }}
                animate={inView ? { height: `${height}%` } : { height: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 + i * 0.1 + 0.3 }}
              />
            )
          })}
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-[12px] text-[var(--color-text-muted)]">Year 1</span>
          <span className="text-[12px] text-[var(--color-text-muted)]">Year 5</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4" style={{ borderTop: '1px solid var(--color-border)' }}>
        <div>
          <p className="text-[13px] text-[var(--color-text-muted)]">Min. Investment</p>
          <p className="text-[15px] font-medium">{investment.minAmount}</p>
        </div>
        <div>
          <p className="text-[13px] text-[var(--color-text-muted)]">Duration</p>
          <p className="text-[15px] font-medium">{investment.duration}</p>
        </div>
        <motion.button
          className="btn-primary text-[15px] py-2.5 px-5"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Explore
        </motion.button>
      </div>
    </motion.div>
  )
}

export default function InvestmentsPage() {
  return (
    <div className="page-container pb-16">
      {/* Header */}
      <motion.div
        className="text-center mb-14"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <span className="inline-block px-5 py-2 rounded-full glass-warm text-[13px] font-medium text-[var(--color-gold)] mb-5">
          △ SMART INVESTMENTS
        </span>
        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          Grow Your <span className="text-gradient">Wealth</span>
        </h1>
        <p className="text-[16px] text-[var(--color-text-secondary)] max-w-xl mx-auto leading-relaxed">
          Investment options curated for your risk profile. Building wealth also builds your credit score.
        </p>
      </motion.div>

      {/* Investment grid */}
      <div className="grid md:grid-cols-2 gap-8">
        {investments.map((inv, i) => (
          <InvestmentCard key={inv.id} investment={inv} index={i} />
        ))}
      </div>

      {/* Bottom insight */}
      <motion.div
        className="mt-14 glass-card rounded-2xl p-8 text-center"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <p className="text-[15px] text-[var(--color-text-secondary)] leading-relaxed">
          💡 <span className="text-[var(--color-gold)] font-medium">Pro tip:</span> Regular investments through SIP or RD mode improve your
          Savings Discipline factor — worth 25% of your credit score.
        </p>
      </motion.div>
    </div>
  )
}
