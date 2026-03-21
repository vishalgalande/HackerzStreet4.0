/**
 * Feature: Scoring — WhatIfSimulator
 * Interactive sliders with real-time score morphing, gradient fills,
 * score trajectory preview, and dark autumn styling.
 */

import { useState, useMemo, useEffect, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { computeScore, getBand } from './scorer'
import ScoreGauge from './ScoreGauge'

function AnimatedDelta({ delta }) {
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    const duration = 400
    const start = display
    const end = delta
    const startTime = Date.now()
    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 2)
      setDisplay(Math.round(start + (end - start) * eased))
      if (progress >= 1) clearInterval(timer)
    }, 16)
    return () => clearInterval(timer)
  }, [delta])

  return (
    <motion.div
      className={`mt-4 px-5 py-2.5 rounded-full text-lg font-bold ${
        display > 0 ? 'text-[#10B981]' :
        display < 0 ? 'text-[#b83a2a]' :
        'text-[var(--color-text-muted)]'
      }`}
      style={{
        background: display > 0 ? 'rgba(16, 185, 129, 0.1)' :
                     display < 0 ? 'rgba(184, 58, 42, 0.1)' :
                     'rgba(107, 93, 79, 0.1)',
        border: `1px solid ${display > 0 ? 'rgba(16, 185, 129, 0.2)' : display < 0 ? 'rgba(184, 58, 42, 0.2)' : 'var(--color-border)'}`,
      }}
      animate={{ scale: [1, 1.05, 1] }}
      transition={{ duration: 0.3 }}
      key={delta}
    >
      {display > 0 ? '↑' : display < 0 ? '↓' : '→'} {display > 0 ? '+' : ''}{display} pts
    </motion.div>
  )
}

export default function WhatIfSimulator({ originalInput, originalScore }) {
  const [modified, setModified] = useState({ ...originalInput })
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })

  const result = useMemo(() => {
    const { score, factors } = computeScore(modified)
    const { band, color } = getBand(score)
    return { score, band, color, factors }
  }, [modified])

  const delta = result.score - originalScore

  function handleSlider(field, value) {
    setModified(prev => ({ ...prev, [field]: value }))
  }

  return (
    <motion.div
      ref={ref}
      className="glass-card rounded-xl p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg text-teal-400">△</span>
        <h3 className="text-lg font-semibold">What-If Simulator</h3>
      </div>
      <p className="text-sm text-[var(--color-text-secondary)] mb-6">
        Adjust the sliders to see how changes would affect your score in real-time.
      </p>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Sliders */}
        <div className="space-y-5">
          <SliderInput
            label="Monthly Savings (₹)"
            value={modified.savings_amount}
            min={0}
            max={modified.monthly_income || 50000}
            step={500}
            onChange={(v) => handleSlider('savings_amount', v)}
          />
          <SliderInput
            label="Discretionary Spending (₹)"
            value={modified.discretionary}
            min={0}
            max={modified.monthly_income || 50000}
            step={500}
            onChange={(v) => handleSlider('discretionary', v)}
          />
          <SliderInput
            label="Existing Debt / EMI (₹)"
            value={modified.existing_debt}
            min={0}
            max={modified.monthly_income || 50000}
            step={500}
            onChange={(v) => handleSlider('existing_debt', v)}
          />
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
              Bill Payment Behavior
            </label>
            <select
              value={modified.bill_payment}
              onChange={(e) => handleSlider('bill_payment', e.target.value)}
              className="input-field text-sm"
            >
              <option value="always_on_time">Always on time</option>
              <option value="sometimes_late">Sometimes late</option>
              <option value="often_late">Often late</option>
            </select>
          </div>
        </div>

        {/* Score preview */}
        <div className="flex flex-col items-center justify-center">
          <ScoreGauge
            score={result.score}
            band={result.band}
            bandColor={result.color}
            size="small"
          />
          <AnimatedDelta delta={delta} />

          {/* Trajectory preview */}
          <div className="mt-6 w-full">
            <p className="text-xs text-[var(--color-text-muted)] mb-2 text-center">Score Trajectory</p>
            <div className="flex items-end justify-center gap-3">
              {[
                { label: 'Now', score: originalScore },
                { label: '3mo', score: Math.min(900, originalScore + Math.round(delta * 0.6)) },
                { label: '6mo', score: Math.min(900, originalScore + delta) },
              ].map((point, i) => (
                <div key={i} className="text-center">
                  <motion.div
                    className="mx-auto rounded-lg w-14"
                    style={{
                      background: `linear-gradient(to top, rgba(20,184,166,0.2), #14b8a6)`, // Teal gradient
                      height: `${Math.max(20, ((point.score - 300) / 600) * 60)}px`,
                    }}
                    initial={{ height: 0 }}
                    animate={inView ? { height: `${Math.max(20, ((point.score - 300) / 600) * 60)}px` } : {}}
                    transition={{ duration: 0.8, delay: i * 0.15 }}
                  />
                  <p className="text-xs font-medium mt-1 text-slate-900 dark:text-white">{point.score}</p>
                  <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider">{point.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function SliderInput({ label, value, min, max, step, onChange }) {
  const percent = ((value - min) / (max - min)) * 100

  return (
    <div>
      <div className="flex justify-between text-sm mb-1.5">
        <span className="text-[var(--color-text-secondary)]">{label}</span>
        <motion.span
          className="font-medium text-[var(--color-text-primary)]"
          key={value}
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          ₹{value?.toLocaleString()}
        </motion.span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1 rounded-lg appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(to right, #14b8a6 0%, #14b8a6 ${percent}%, var(--color-bg-elevated) ${percent}%)`,
        }}
      />
    </div>
  )
}
