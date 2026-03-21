/**
 * Feature: Auth — HeroSection
 * Premium landing page with scroll-triggered storytelling, animated counters, 
 * parallax background, and dark autumn fintech aesthetic.
 */

import { useRef, useEffect, useState } from 'react'
import { motion, useInView, useScroll, useTransform } from 'framer-motion'

function AnimatedCounter({ target, suffix = '', prefix = '' }) {
  const [value, setValue] = useState(0)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })

  useEffect(() => {
    if (!inView) return
    const duration = 2000
    const start = Date.now()
    const timer = setInterval(() => {
      const elapsed = Date.now() - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(target * eased))
      if (progress >= 1) clearInterval(timer)
    }, 16)
    return () => clearInterval(timer)
  }, [inView, target])

  return <span ref={ref}>{prefix}{value.toLocaleString()}{suffix}</span>
}

const stats = [
  { value: 190, suffix: 'M+', label: 'Credit-Invisible Indians', icon: '◎' },
  { value: 5, suffix: '', label: 'Behavioral Factors', icon: '⚡' },
  { value: 300, suffix: '-900', label: 'Score Range', icon: '△' },
  { value: 500, suffix: 'ms', label: 'What-If Speed', prefix: '<', icon: '◇' },
]

const features = [
  {
    title: 'No Bank History Needed',
    description: 'We score you on behavior — how you spend, save, and pay bills. No loans or credit cards required.',
    icon: '🛡️',
  },
  {
    title: 'Fully Transparent',
    description: 'Every factor is explained in plain language. No black boxes, no hidden algorithms.',
    icon: '◎',
  },
  {
    title: 'Actionable Insights',
    description: 'Get ranked recommendations with estimated score impact. Know exactly what to improve.',
    icon: '⚡',
  },
  {
    title: 'What-If Simulator',
    description: 'Adjust spending, savings, and bills to see real-time score changes before you act.',
    icon: '△',
  },
]

export default function HeroSection({ onSignUp, onTryDemo }) {
  const [activeTab, setActiveTab] = useState('home')
  const containerRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ['start start', 'end start'] })
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -100])
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -50])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])

  return (
    <div ref={containerRef} className="relative min-h-screen">
      {/* Landing Page Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-[var(--color-border)] px-4 md:px-8 py-4 flex justify-between items-center">
        <div 
          className="font-bold text-xl cursor-pointer"
          onClick={() => setActiveTab('home')}
        >
          <span className="text-gradient">FinFix</span>
        </div>
        <div className="flex gap-6 items-center">
          <button 
            className={`text-sm font-medium transition-colors ${activeTab === 'home' ? 'text-[var(--color-gold)]' : 'text-[var(--color-text-secondary)] hover:text-white'}`}
            onClick={() => setActiveTab('home')}
          >
            Home
          </button>
          <button 
            className={`text-sm font-medium transition-colors ${activeTab === 'features' ? 'text-[var(--color-gold)]' : 'text-[var(--color-text-secondary)] hover:text-white'}`}
            onClick={() => setActiveTab('features')}
          >
            Features
          </button>
        </div>
      </nav>

      {activeTab === 'home' && (
        <>
          {/* ===== HERO SECTION ===== */}
      <section className="min-h-screen relative flex flex-col items-center justify-center px-4 text-center animated-gradient overflow-hidden">
        {/* Parallax ambient orbs */}
        <motion.div style={{ y: y1 }} className="absolute inset-0 pointer-events-none">
          <div className="ambient-orb ambient-orb-orange absolute top-20 left-10 w-80 h-80" />
          <div className="ambient-orb ambient-orb-gold absolute bottom-20 right-10 w-96 h-96" />
          <div className="ambient-orb ambient-orb-copper absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 opacity-20" />
        </motion.div>

        <motion.div style={{ y: y2, opacity }} className="relative z-10 max-w-4xl mx-auto">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="inline-block px-5 py-2 rounded-full glass-warm text-sm font-medium text-[var(--color-gold)] mb-8"
          >
            🇮🇳 Built for 190M+ Credit-Invisible Indians
          </motion.div>

          {/* Main heading */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight tracking-tight"
          >
            Your Financial Behavior
            <br />
            <span className="text-gradient">Is Your Credit Score</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-lg md:text-xl text-[var(--color-text-secondary)] mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            No bank loans? No credit cards? No problem. We analyze how you spend, save, and pay bills
            to generate a fair, transparent credit score.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
          >
            <motion.button
              onClick={onSignUp}
              className="btn-primary text-lg px-10 py-4"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              Get Your Score →
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 rounded-full border-2 border-[var(--color-text-muted)] flex items-start justify-center p-1">
            <motion.div
              className="w-1.5 h-3 rounded-full bg-[var(--color-gold)]"
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </section>

      {/* ===== STATS BAR ===== */}
      <section className="py-16 px-4" style={{ background: 'var(--color-bg-secondary)' }}>
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, i) => {
            const ref = useRef(null)
            const inView = useInView(ref, { once: true })
            return (
              <motion.div
                key={i}
                ref={ref}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="text-center"
              >
                <span className="text-sm text-[var(--color-gold)]">{stat.icon}</span>
                <p className="text-3xl md:text-4xl font-bold text-gradient mt-1">
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} prefix={stat.prefix} />
                </p>
                <p className="text-sm text-[var(--color-text-muted)] mt-1">{stat.label}</p>
              </motion.div>
            )
          })}
        </div>
      </section>
      </>
      )}



      {activeTab === 'features' && (
      <>
      {/* ===== FEATURES ===== */}
      <section className="py-24 px-4 min-h-screen" style={{ background: 'var(--color-bg-secondary)' }}>
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-3">
              Why <span className="text-gradient">FinFix</span>?
            </h2>
            <p className="text-[var(--color-text-secondary)]">
              A smarter, fairer way to prove creditworthiness.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="glass-card rounded-xl p-6 flex gap-4"
              >
                <span className="text-2xl shrink-0 mt-1" style={{ color: 'var(--color-gold)' }}>{feature.icon}</span>
                <div>
                  <h3 className="font-semibold text-lg mb-1">{feature.title}</h3>
                  <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      </>
      )}


    </div>
  )
}
