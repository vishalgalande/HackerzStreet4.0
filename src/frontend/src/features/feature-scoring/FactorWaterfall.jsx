/**
 * Feature: Scoring — FactorWaterfall
 * Custom animated horizontal bars with dark autumn palette
 * Replaced Chart.js with native SVG for draw-in effects
 */

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

export default function FactorWaterfall({ factors, language = 'en' }) {
  if (!factors || factors.length === 0) return null

  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-30px' })
  const sortedFactors = [...factors].sort((a, b) => b.points - a.points)
  const maxAbs = Math.max(...sortedFactors.map(f => Math.abs(f.points)), 1)

  return (
    <motion.div
      ref={ref}
      className="glass-card rounded-xl p-6"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
    >
      <h3 className="text-lg font-semibold mb-6">
        {language === 'hi' ? 'स्कोर कारक विश्लेषण' : 'Score Factor Breakdown'}
      </h3>

      <div className="space-y-4">
        {sortedFactors.map((factor, i) => {
          const barWidth = (Math.abs(factor.points) / maxAbs) * 100
          const barColor = factor.is_positive ? '#10B981' : '#b83a2a'
          const bgColor = factor.is_positive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(184, 58, 42, 0.1)'

          return (
            <motion.div
              key={factor.factor}
              initial={{ opacity: 0, x: -20 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.4, delay: i * 0.08 }}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-medium">
                  {language === 'hi' ? factor.label_hi : factor.label}
                </span>
                <span className="text-sm font-bold" style={{ color: barColor }}>
                  {factor.is_positive ? '+' : ''}{factor.points} pts
                </span>
              </div>

              <div className="h-3 rounded-full overflow-hidden" style={{ background: 'var(--color-bg-primary)' }}>
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    background: `linear-gradient(90deg, ${barColor}cc, ${barColor})`,
                    boxShadow: `0 0 8px ${barColor}40`,
                  }}
                  initial={{ width: 0 }}
                  animate={inView ? { width: `${barWidth}%` } : { width: 0 }}
                  transition={{ duration: 0.8, delay: i * 0.1 + 0.2, ease: [0.4, 0, 0.2, 1] }}
                />
              </div>

              <p className="text-xs text-[var(--color-text-muted)] mt-1">
                {language === 'hi' ? factor.description_hi : factor.description}
              </p>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}
