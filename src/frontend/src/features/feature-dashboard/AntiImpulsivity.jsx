/**
 * AntiImpulsivity — Premium countdown timer
 * Only 12h and 24h options. Timer text constrained inside circle.
 */

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const PRESETS = [
  { label: '12 hours', seconds: 43200 },
  { label: '24 hours', seconds: 86400 },
]

function formatTime(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

export default function AntiImpulsivity() {
  const [duration, setDuration] = useState(43200) // 12h default
  const [remaining, setRemaining] = useState(43200)
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
  const circumference = 2 * Math.PI * 115

  return (
    <div
      className="page-container pb-16"
      style={{
        maxWidth: '700px',
        minHeight: '70vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '20px',
      }}
    >
      {/* Header */}
      <motion.div
        className="text-center"
        style={{ marginBottom: '12px' }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <span
          className="inline-block rounded-full glass-warm font-medium"
          style={{ padding: '8px 20px', fontSize: '13px', color: 'var(--color-gold)', marginBottom: '20px', display: 'inline-block' }}
        >
          ◷ MINDFUL SPENDING
        </span>
        <h1 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '12px' }}>
          Pause Before You <span className="text-gradient">Purchase</span>
        </h1>
        <p style={{ fontSize: '16px', color: 'var(--color-text-secondary)', maxWidth: '440px', margin: '0 auto', lineHeight: 1.6 }}>
          Set a waiting period before impulse purchases. Most urges fade within hours.
        </p>
      </motion.div>

      {/* Circular Timer */}
      <motion.div
        style={{
          position: 'relative',
          width: '260px',
          height: '260px',
        }}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        {/* Breathing ring */}
        <motion.div
          style={{
            position: 'absolute',
            inset: '-10px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, transparent 55%, rgba(20, 184, 166, 0.06) 100%)',
          }}
          animate={running ? {
            scale: [1, 1.06, 1],
            opacity: [0.5, 0.8, 0.5],
          } : {}}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />

        <svg width="260" height="260" viewBox="0 0 260 260">
          <defs>
            <linearGradient id="timerGradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#14b8a6" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
          </defs>
          {/* Background circle */}
          <circle
            cx="130" cy="130" r="115"
            fill="none"
            stroke="var(--color-bg-elevated)"
            strokeWidth="5"
          />
          {/* Progress arc */}
          <motion.circle
            cx="130" cy="130" r="115"
            fill="none"
            stroke="url(#timerGradient)"
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - progress)}
            transform="rotate(-90 130 130)"
            style={{
              filter: 'drop-shadow(0 0 8px rgba(20, 184, 166, 0.4))',
              transition: 'stroke-dashoffset 0.5s ease-out',
            }}
          />
        </svg>

        {/* Timer text — constrained inside circle */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          <span
            style={{
              fontSize: '40px',
              fontWeight: 600,
              textAlign: 'center',
              whiteSpace: 'nowrap',
              fontVariantNumeric: 'tabular-nums',
              letterSpacing: '2px',
              color: 'var(--color-text-primary)',
            }}
          >
            {formatTime(remaining)}
          </span>
          <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '8px' }}>
            {completed ? "Time's up!" : running ? 'Stay strong...' : 'Choose duration'}
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
            className="glass-card"
            style={{ borderRadius: '16px', padding: '24px', textAlign: 'center', maxWidth: '400px', width: '100%' }}
          >
            <p style={{ color: 'var(--color-teal)', fontWeight: 600, fontSize: '16px', marginBottom: '8px' }}>✦ Timer Complete</p>
            <p style={{ fontSize: '15px', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
              Do you still want to make this purchase? If the urge has passed, you just improved your spending discipline!
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preset buttons — ONLY 12h and 24h */}
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
        {PRESETS.map(preset => (
          <motion.button
            key={preset.seconds}
            onClick={() => selectPreset(preset.seconds)}
            style={{
              width: '140px',
              padding: '12px 0',
              borderRadius: '12px',
              fontSize: '15px',
              fontWeight: 600,
              cursor: running ? 'not-allowed' : 'pointer',
              opacity: running ? 0.5 : 1,
              transition: 'all 0.2s ease',
              background: duration === preset.seconds ? 'rgba(20, 184, 166, 0.12)' : 'transparent',
              border: `1px solid ${duration === preset.seconds ? 'var(--color-teal)' : 'var(--color-border)'}`,
              color: duration === preset.seconds ? '#14b8a6' : 'var(--color-text-secondary)',
            }}
            whileHover={!running ? { scale: 1.05 } : {}}
            whileTap={!running ? { scale: 0.95 } : {}}
          >
            {preset.label}
          </motion.button>
        ))}
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: '12px' }}>
        {!running ? (
          <motion.button
            onClick={startTimer}
            className="btn-primary"
            style={{ fontSize: '16px', padding: '14px 36px' }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {remaining < duration ? 'Resume' : 'Start Timer'}
          </motion.button>
        ) : (
          <motion.button
            onClick={pauseTimer}
            className="btn-secondary"
            style={{ fontSize: '16px', padding: '14px 36px' }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Pause
          </motion.button>
        )}
        {(running || remaining < duration) && (
          <motion.button
            onClick={resetTimer}
            className="btn-secondary"
            style={{ fontSize: '16px', padding: '14px 28px' }}
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
        style={{
          textAlign: 'center',
          fontSize: '14px',
          color: 'var(--color-text-muted)',
          maxWidth: '380px',
          lineHeight: 1.6,
          marginTop: '8px',
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        Delaying impulse purchases by 12–24 hours eliminates most unnecessary spending, directly improving your Spending Discipline score.
      </motion.p>
    </div>
  )
}
