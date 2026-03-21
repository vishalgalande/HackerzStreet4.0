/**
 * Navbar — Premium glassmorphism navigation bar
 * Fixed top, h-[72px], proper spacing, hover backgrounds
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: '◎' },
  { id: 'chimchar', label: 'Chimchar AI', icon: '🔥' },
  { id: 'credit-engine', label: 'Credit Engine', icon: '⚡' },
  { id: 'lender-dashboard', label: 'Active Loans', icon: '🏦' },
  { id: 'alerts', label: 'Alerts', icon: '◈' },
  { id: 'savings', label: 'Savings', icon: '◇' },
  { id: 'anti-impulse', label: 'Anti Impulse', icon: '◷' },
]

export default function Navbar({ activePage, onNavigate, onSignOut }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50" style={{
      background: 'rgba(10, 10, 10, 0.92)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
      height: '72px',
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 32px', height: '100%' }}>
        <div className="flex items-center justify-between" style={{ height: '100%' }}>
          {/* Logo */}
          <motion.div
            className="flex items-center cursor-pointer"
            style={{ gap: '10px' }}
            onClick={() => onNavigate('dashboard')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <img src="/logo.png" alt="FinFix Logo" className="nav-logo" />
            <span className="text-[17px] font-bold text-white tracking-tight">FinFix</span>
          </motion.div>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center" style={{ gap: '8px' }}>
            {navItems.map((item) => {
              const isActive = activePage === item.id

              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className="relative transition-all duration-200"
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    fontSize: '15px',
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? '#ffffff' : '#94a3b8',
                    background: isActive ? 'rgba(255, 140, 0, 0.10)' : 'transparent',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.background = 'transparent'
                  }}
                >
                  <span className="flex items-center gap-2">
                    <span style={{ fontSize: '13px' }}>{item.icon}</span>
                    {item.label}
                  </span>
                  {isActive && (
                    <motion.div
                      layoutId="navActive"
                      className="absolute bottom-0 left-3 right-3 h-[2px] rounded-t-full"
                      style={{ background: 'linear-gradient(90deg, #FF8C00, #FFC857)' }}
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                    />
                  )}
                </button>
              )
            })}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-4">
            {onSignOut && (
              <motion.button
                onClick={onSignOut}
                className="hidden md:block rounded-lg text-[14px] text-slate-500 hover:text-slate-300 transition-colors"
                style={{
                  padding: '8px 16px',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '8px',
                }}
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
              style={{ border: '1px solid rgba(255,255,255,0.08)' }}
              whileTap={{ scale: 0.9 }}
            >
              <div className="flex flex-col gap-1.5">
                <motion.span
                  animate={mobileOpen ? { rotate: 45, y: 5 } : { rotate: 0, y: 0 }}
                  className="block w-5 h-0.5 rounded-full bg-slate-400"
                />
                <motion.span
                  animate={mobileOpen ? { opacity: 0 } : { opacity: 1 }}
                  className="block w-5 h-0.5 rounded-full bg-slate-400"
                />
                <motion.span
                  animate={mobileOpen ? { rotate: -45, y: -5 } : { rotate: 0, y: 0 }}
                  className="block w-5 h-0.5 rounded-full bg-slate-400"
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
              background: 'rgba(2, 6, 23, 0.98)',
              borderTop: '1px solid rgba(255, 255, 255, 0.06)',
            }}
          >
            <div className="px-6 py-4 space-y-1">
              {navItems.map((item, i) => (
                <motion.button
                  key={item.id}
                  onClick={() => { onNavigate(item.id); setMobileOpen(false) }}
                  className="w-full flex items-center gap-3 rounded-lg text-[15px] font-medium transition-colors text-left"
                  style={{
                    padding: '12px 16px',
                    color: activePage === item.id ? '#FF8C00' : '#94a3b8',
                    background: activePage === item.id ? 'rgba(255, 140, 0, 0.08)' : 'transparent',
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
                  className="w-full flex items-center gap-3 rounded-lg text-[15px] font-medium text-slate-500 text-left"
                  style={{ padding: '12px 16px' }}
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
