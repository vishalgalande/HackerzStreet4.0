/**
 * AntiImpulsivity — Calm countdown timer with focused design
 * Minimal, mindful UX with breathing animation
 */

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const PRESETS = [
  { label: '5 min', seconds: 300 },
  { label: '15 min', seconds: 900 },
  { label: '30 min', seconds: 1800 },
  { label: '1 hour', seconds: 3600 },
  { label: '24 hours', seconds: 86400 },
]

function formatTime(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

function TimerDigit({ value }) {
  return (
    <AnimatePresence mode="popLayout">
      <motion.span
        key={value}
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className="inline-block"
      >
        {value}
      </motion.span>
    </AnimatePresence>
  )
}

export default function AntiImpulsivity() {
  const [duration, setDuration] = useState(1800) // 30 min default
  const [remaining, setRemaining] = useState(1800)
  const [running, setRunning] = useState(false)
  const [completed, setCompleted] = useState(false)
  const timerRef = useRef(null)

  useEffect(() => {
    if (running && remaining > 0) {
      timerRef.current = setInterval(() => {
        setRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current)
            setRunning(false)
            setCompleted(true)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(timerRef.current)
  }, [running, remaining])

  function startTimer() {
    setCompleted(false)
    setRunning(true)
  }

  function pauseTimer() {
    setRunning(false)
  }

  function resetTimer() {
    setRunning(false)
    setCompleted(false)
    setRemaining(duration)
  }

  function selectPreset(seconds) {
    if (running) return
    setDuration(seconds)
    setRemaining(seconds)
    setCompleted(false)
  }

  const progress = 1 - (remaining / duration)
  const circumference = 2 * Math.PI * 120

  const display = formatTime(remaining)
  const chars = display.split('')

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 md:px-8 flex flex-col items-center justify-center max-w-2xl mx-auto">
      {/* Header */}
      <motion.div
        className="text-center mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <span className="inline-block px-4 py-1.5 rounded-full glass-warm text-xs font-medium text-[var(--color-gold)] mb-4">
          ◷ MINDFUL SPENDING
        </span>
        <h1 className="text-3xl md:text-4xl font-bold mb-3">
          Pause Before You <span className="text-gradient">Purchase</span>
        </h1>
        <p className="text-[var(--color-text-secondary)] max-w-md mx-auto">
          Set a waiting period before impulse purchases. Most urges fade after 30 minutes.
        </p>
      </motion.div>

      {/* Circular Timer */}
      <motion.div
        className="relative mb-10"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        {/* Breathing ring */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: 'radial-gradient(circle, transparent 60%, rgba(196, 101, 42, 0.05) 100%)',
          }}
          animate={running ? {
            scale: [1, 1.08, 1],
            opacity: [0.5, 0.8, 0.5],
          } : {}}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />

        <svg width="280" height="280" viewBox="0 0 280 280">
          {/* Background circle */}
          <circle
            cx="140" cy="140" r="120"
            fill="none"
            stroke="var(--color-bg-elevated)"
            strokeWidth="6"
          />
          {/* Progress arc */}
          <motion.circle
            cx="140" cy="140" r="120"
            fill="none"
            stroke="url(#timerGradient)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - progress)}
            transform="rotate(-90 140 140)"
            style={{
              filter: 'drop-shadow(0 0 8px rgba(196, 101, 42, 0.4))',
              transition: 'stroke-dashoffset 0.5s ease-out',
            }}
          />
          {/* Gradient def */}
          <defs>
            <linearGradient id="timerGradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#c4652a" />
              <stop offset="100%" stopColor="#d4a843" />
            </linearGradient>
          </defs>
        </svg>

        {/* Timer display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-5xl md:text-6xl font-bold tracking-wider" style={{ fontVariantNumeric: 'tabular-nums' }}>
            {chars.map((ch, i) => (
              <TimerDigit key={`${i}-${ch}`} value={ch} />
            ))}
          </div>
          <p className="text-xs text-[var(--color-text-muted)] mt-2">
            {completed ? 'Time\'s up! You can decide now.' : running ? 'Stay strong...' : 'Set your waiting period'}
          </p>
        </div>
      </motion.div>

      {/* Completion message */}
      <AnimatePresence>
        {completed && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="glass-card rounded-xl p-4 mb-6 text-center"
          >
            <p className="text-[var(--color-gold)] font-semibold mb-1">✦ Timer Complete</p>
            <p className="text-sm text-[var(--color-text-secondary)]">
              Do you still want to make this purchase? If the urge has passed, you just improved your spending discipline!
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preset buttons */}
      <div className="flex flex-wrap gap-2 justify-center mb-6">
        {PRESETS.map(preset => (
          <motion.button
            key={preset.seconds}
            onClick={() => selectPreset(preset.seconds)}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={{
              background: duration === preset.seconds ? 'rgba(196, 101, 42, 0.15)' : 'transparent',
              border: `1px solid ${duration === preset.seconds ? 'var(--color-burnt-orange)' : 'var(--color-border)'}`,
              color: duration === preset.seconds ? 'var(--color-gold)' : 'var(--color-text-secondary)',
              opacity: running ? 0.5 : 1,
            }}
            whileHover={!running ? { scale: 1.05 } : {}}
            whileTap={!running ? { scale: 0.95 } : {}}
          >
            {preset.label}
          </motion.button>
        ))}
      </div>

      {/* Controls */}
      <div className="flex gap-3">
        {!running ? (
          <motion.button
            onClick={startTimer}
            className="btn-primary text-lg px-8 py-3"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {remaining < duration ? 'Resume' : 'Start Timer'}
          </motion.button>
        ) : (
          <motion.button
            onClick={pauseTimer}
            className="btn-secondary text-lg px-8 py-3"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Pause
          </motion.button>
        )}
        {(running || remaining < duration) && (
          <motion.button
            onClick={resetTimer}
            className="btn-secondary text-lg px-6 py-3"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Reset
          </motion.button>
        )}
      </div>

      {/* Insight */}
      <motion.p
        className="text-center text-xs text-[var(--color-text-muted)] mt-8 max-w-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        Research shows that a 30-minute delay eliminates 65% of impulse purchases,
        directly improving your Spending Discipline score factor.
      </motion.p>
    </div>
  )
}
