/**
 * Feature: Scoring — ScoreGauge
 * Animated arc visualization showing credit score on 300-900 scale.
 * 
 * TODO (Teammate 1):
 * - Add score count-up animation
 * - Add pulsing glow effect on the score
 * - Add confidence interval display
 */

import { useEffect, useRef, useState } from 'react'

const SCORE_MIN = 300
const SCORE_MAX = 900

export default function ScoreGauge({ score, band, bandColor, confidenceMargin, benchmarkPercentile }) {
  const [displayScore, setDisplayScore] = useState(SCORE_MIN)

  // Animate score count-up
  useEffect(() => {
    if (!score) return
    const duration = 1500
    const start = SCORE_MIN
    const end = score
    const startTime = Date.now()

    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplayScore(Math.round(start + (end - start) * eased))
      if (progress >= 1) clearInterval(timer)
    }, 16)

    return () => clearInterval(timer)
  }, [score])

  // Calculate arc progress (0 to 1)
  const progress = (score - SCORE_MIN) / (SCORE_MAX - SCORE_MIN)
  const circumference = 2 * Math.PI * 90 // radius = 90
  const halfCircumference = circumference / 2
  const strokeDashoffset = halfCircumference * (1 - progress)

  return (
    <div className="flex flex-col items-center">
      {/* SVG Gauge */}
      <div className="relative w-64 h-36">
        <svg viewBox="0 0 200 110" className="w-full h-full">
          {/* Background arc */}
          <path
            d="M 10 100 A 90 90 0 0 1 190 100"
            fill="none"
            stroke="var(--color-bg-elevated)"
            strokeWidth="12"
            strokeLinecap="round"
          />
          {/* Score arc */}
          <path
            d="M 10 100 A 90 90 0 0 1 190 100"
            fill="none"
            stroke={bandColor || '#6366F1'}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={halfCircumference}
            strokeDashoffset={strokeDashoffset}
            style={{
              transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)',
              filter: `drop-shadow(0 0 8px ${bandColor}66)`,
            }}
          />
        </svg>

        {/* Score number overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-2">
          <span className="text-5xl font-bold" style={{ color: bandColor }}>
            {displayScore}
          </span>
        </div>
      </div>

      {/* Band label */}
      <div
        className="mt-3 px-4 py-1.5 rounded-full text-sm font-semibold"
        style={{ backgroundColor: `${bandColor}20`, color: bandColor }}
      >
        {band}
      </div>

      {/* Confidence + Benchmark */}
      <div className="flex gap-6 mt-4 text-sm text-[var(--color-text-secondary)]">
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
