/**
 * Feature: Scoring — FactorWaterfall
 * Premium slim horizontal bars with fintech aesthetic.
 * Teal for positive, rose for negative. Glass card container.
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
      className="w-full bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl flex flex-col gap-4"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
    >
      <h3 className="text-lg font-semibold text-white tracking-tight">
        {language === 'hi' ? 'स्कोर कारक विश्लेषण' : 'Score Factor Breakdown'}
      </h3>

      <div className="space-y-5">
        {sortedFactors.map((factor, i) => {
          const barWidth = (Math.abs(factor.points) / maxAbs) * 100
          const isPositive = factor.is_positive

          return (
            <motion.div
              key={factor.factor}
              initial={{ opacity: 0, x: -10 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              {/* Factor name + points on same line */}
              <div className="flex justify-between items-center w-full mb-1.5">
                <span className="text-sm font-medium text-white">
                  {language === 'hi' ? factor.label_hi : factor.label}
                </span>
                <span className={`text-sm font-bold tabular-nums ${isPositive ? 'text-teal-400' : 'text-rose-400'}`}>
                  {isPositive ? '+' : ''}{factor.points} pts
                </span>
              </div>

              {/* Slim progress bar */}
              <div className="h-1.5 rounded-full overflow-hidden bg-slate-800">
                <motion.div
                  className={`h-full rounded-full ${isPositive ? 'bg-teal-400' : 'bg-rose-500'}`}
                  initial={{ width: 0 }}
                  animate={inView ? { width: `${barWidth}%` } : { width: 0 }}
                  transition={{ duration: 0.8, delay: i * 0.1 + 0.2, ease: [0.4, 0, 0.2, 1] }}
                />
              </div>

              {/* Sub-score — muted */}
              <p className="text-xs text-slate-500 mt-1">
                {language === 'hi' ? factor.description_hi : factor.description}
              </p>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}
