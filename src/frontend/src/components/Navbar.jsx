/**
 * Navbar — Premium glassmorphism navigation bar
 * Fixed top with warm gold accents and animated active indicator
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: '◎' },
  { id: 'credit-engine', label: 'Credit Engine', icon: '⚡' },
  { id: 'alerts', label: 'Alerts', icon: '◈' },
  { id: 'investments', label: 'Investments', icon: '△' },
  { id: 'savings', label: 'Savings', icon: '◇' },
  { id: 'anti-impulse', label: 'Focus Timer', icon: '◷' },
]

export default function Navbar({ activePage, onNavigate, onSignOut }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50" style={{
      background: 'rgba(13, 10, 7, 0.85)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      borderBottom: '1px solid rgba(212, 168, 67, 0.08)',
    }}>
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => onNavigate('dashboard')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center text-white font-bold text-sm">
              CR
            </div>
            <span className="font-semibold text-lg hidden sm:block">
              <span className="text-gradient">CreditRise</span>
            </span>
          </motion.div>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <motion.button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className="relative px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{
                  color: activePage === item.id ? 'var(--color-gold)' : 'var(--color-text-secondary)',
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
              >
                <span className="flex items-center gap-1.5">
                  <span className="text-xs">{item.icon}</span>
                  {item.label}
                </span>
                {activePage === item.id && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full"
                    style={{ background: 'linear-gradient(90deg, var(--color-burnt-orange), var(--color-gold))' }}
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
              </motion.button>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {onSignOut && (
              <motion.button
                onClick={onSignOut}
                className="hidden md:block px-3 py-1.5 rounded-lg text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition-colors"
                style={{ border: '1px solid var(--color-border)' }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
              >
                Sign Out
              </motion.button>
            )}

            {/* Mobile menu toggle */}
            <motion.button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden w-10 h-10 flex items-center justify-center rounded-lg"
              style={{ border: '1px solid var(--color-border)' }}
              whileTap={{ scale: 0.9 }}
            >
              <div className="flex flex-col gap-1.5">
                <motion.span
                  animate={mobileOpen ? { rotate: 45, y: 5 } : { rotate: 0, y: 0 }}
                  className="block w-5 h-0.5 rounded-full"
                  style={{ background: 'var(--color-text-secondary)' }}
                />
                <motion.span
                  animate={mobileOpen ? { opacity: 0 } : { opacity: 1 }}
                  className="block w-5 h-0.5 rounded-full"
                  style={{ background: 'var(--color-text-secondary)' }}
                />
                <motion.span
                  animate={mobileOpen ? { rotate: -45, y: -5 } : { rotate: 0, y: 0 }}
                  className="block w-5 h-0.5 rounded-full"
                  style={{ background: 'var(--color-text-secondary)' }}
                />
              </div>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="lg:hidden overflow-hidden"
            style={{
              background: 'rgba(13, 10, 7, 0.95)',
              borderTop: '1px solid rgba(212, 168, 67, 0.08)',
            }}
          >
            <div className="px-4 py-3 space-y-1">
              {navItems.map((item, i) => (
                <motion.button
                  key={item.id}
                  onClick={() => { onNavigate(item.id); setMobileOpen(false) }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors text-left"
                  style={{
                    color: activePage === item.id ? 'var(--color-gold)' : 'var(--color-text-secondary)',
                    background: activePage === item.id ? 'rgba(196, 101, 42, 0.1)' : 'transparent',
                  }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <span>{item.icon}</span>
                  {item.label}
                </motion.button>
              ))}
              {onSignOut && (
                <button
                  onClick={() => { onSignOut(); setMobileOpen(false) }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-[var(--color-text-muted)] text-left"
                >
                  ↗ Sign Out
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
