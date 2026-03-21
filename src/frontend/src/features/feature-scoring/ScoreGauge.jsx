/**
 * Feature: Scoring — ScoreGauge
 * Premium animated arc with gradient glow, number morphing, and dark autumn colors.
 */

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

const SCORE_MIN = 300
const SCORE_MAX = 900

export default function ScoreGauge({ score, band, bandColor, confidenceMargin, benchmarkPercentile, size = 'large' }) {
  const [displayScore, setDisplayScore] = useState(SCORE_MIN)

  // Animate score count-up with easing
  useEffect(() => {
    if (!score) return
    const duration = 1800
    const start = SCORE_MIN
    const end = score
    const startTime = Date.now()

    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplayScore(Math.round(start + (end - start) * eased))
      if (progress >= 1) clearInterval(timer)
    }, 16)

    return () => clearInterval(timer)
  }, [score])

  const progress = (score - SCORE_MIN) / (SCORE_MAX - SCORE_MIN)
  const circumference = 2 * Math.PI * 90
  const halfCircumference = circumference / 2
  const strokeDashoffset = halfCircumference * (1 - progress)

  const isLarge = size === 'large'
  const gaugeColor = bandColor || '#d4a843'

  return (
    <div className="flex flex-col items-center">
      {/* SVG Gauge */}
      <div className={`relative ${isLarge ? 'w-80 h-48' : 'w-60 h-36'}`}>
        <svg viewBox="0 0 200 115" className="w-full h-full">
          <defs>
            {/* Glow filter */}
            <filter id="scoreGlow">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            {/* Arc gradient - Luminous Teal to Cyan */}
            <linearGradient id="arcGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#14b8a6" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
          </defs>

          {/* Background arc - delicate 2px line */}
          <path
            d="M 10 100 A 90 90 0 0 1 190 100"
            fill="none"
            stroke="var(--color-bg-elevated)"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Score arc with glow - 4px line */}
          <motion.path
            d="M 10 100 A 90 90 0 0 1 190 100"
            fill="none"
            stroke="url(#arcGradient)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={halfCircumference}
            initial={{ strokeDashoffset: halfCircumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.8, ease: [0.4, 0, 0.2, 1] }}
            filter="url(#scoreGlow)"
          />

          {/* Tick marks */}
          {[0, 0.25, 0.5, 0.75, 1].map((t, i) => {
            const angle = Math.PI * (1 - t)
            const innerR = 76
            const outerR = 82
            const x1 = 100 + innerR * Math.cos(angle)
            const y1 = 100 - innerR * Math.sin(angle)
            const x2 = 100 + outerR * Math.cos(angle)
            const y2 = 100 - outerR * Math.sin(angle)
            return (
              <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
                stroke="var(--color-text-muted)" strokeWidth="1" opacity="0.3" />
            )
          })}
        </svg>

        {/* Score number overlay - Massive, stark, neutral */}
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-3">
          <motion.span
            className={`font-bold tracking-tight text-[var(--color-text-primary)] ${isLarge ? 'text-7xl' : 'text-5xl'}`}
            key={displayScore}
          >
            {displayScore}
          </motion.span>
        </div>
      </div>

      {/* Band label */}
      <motion.div
        className="mt-5 px-5 py-1.5 rounded-full text-[14px] font-semibold tracking-wide"
        style={{
          backgroundColor: `${gaugeColor}15`,
          color: gaugeColor,
          border: `1px solid ${gaugeColor}25`,
        }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.4, delay: 1.5, type: 'spring' }}
      >
        {band}
      </motion.div>

      {/* Confidence + Benchmark - System Labels */}
      <div className="flex gap-8 mt-6 system-label">
        {confidenceMargin && (
          <span>Confidence: ±{confidenceMargin} pts</span>
        )}
        {benchmarkPercentile && (
          <span>Top {100 - benchmarkPercentile}% in your range</span>
        )}
      </div>
    </div>
  )
}
