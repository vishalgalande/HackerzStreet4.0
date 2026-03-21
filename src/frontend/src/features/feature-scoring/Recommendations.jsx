/**
 * Feature: Scoring — Recommendations
 * Animated recommendation cards with hover glow and dark autumn styling.
 */

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

export default function Recommendations({ recommendations, language = 'en' }) {
  if (!recommendations || recommendations.length === 0) return null

  const ref = useRef(null)
  const inView = useInView(ref, { once: true })

  const effortConfig = {
    low: { color: '#10B981', label: 'Easy', icon: '◇' },
    medium: { color: '#d4940a', label: 'Medium', icon: '◎' },
    high: { color: '#b83a2a', label: 'Hard', icon: '△' },
  }

  return (
    <motion.div
      ref={ref}
      className="glass-card rounded-xl p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center gap-2 mb-5">
        <span className="text-lg text-[var(--color-gold)]">⚡</span>
        <h3 className="text-lg font-semibold">
          {language === 'hi' ? 'सुधार की सिफारिशें' : 'Improvement Recommendations'}
        </h3>
      </div>

      <div className="space-y-3">
        {recommendations.map((rec, i) => {
          const effort = effortConfig[rec.effort] || effortConfig.medium
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -15 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="rounded-lg p-4 transition-all cursor-default"
              style={{
                background: 'rgba(26, 18, 9, 0.5)',
                border: '1px solid var(--color-border)',
              }}
              whileHover={{
                borderColor: 'rgba(196, 101, 42, 0.25)',
                boxShadow: '0 4px 20px rgba(196, 101, 42, 0.1)',
              }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm" style={{ color: effort.color }}>{effort.icon}</span>
                    <p className="font-medium text-sm">
                      {language === 'hi' ? rec.action_hi : rec.action}
                    </p>
                  </div>
                  <p className="text-xs text-[var(--color-text-muted)] ml-6">
                    {language === 'hi' ? rec.explanation_hi : rec.explanation}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-[#10B981]">
                    +{rec.impact_min}-{rec.impact_max} pts
                  </p>
                  <div className="flex items-center gap-2 mt-1 justify-end">
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{
                      background: `${effort.color}15`,
                      color: effort.color,
                    }}>
                      {effort.label}
                    </span>
                    <span className="text-xs text-[var(--color-text-muted)]">
                      {rec.timeframe}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}
