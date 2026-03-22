/**
 * Feature: Auth — HeroSection (Landing Page)
 * Carbon & Glass design system with strict grid constraints,
 * ghost cards, rebuilt timeline, and staggered fade-in animations.
 * 
 * Navbar: 3-part flex layout (logo | tabs | CTAs)
 * Navigation: State-driven tab switching with AnimatePresence fade
 */

import { useRef, useEffect, useState } from 'react'
import { motion, useInView, useScroll, useTransform, AnimatePresence } from 'framer-motion'

/* ═══════════════════════════════════════
   REUSABLE: FadeIn Wrapper
   ═══════════════════════════════════════ */
function FadeIn({ children, delay = 0, className = '' }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/* ═══════════════════════════════════════
   REUSABLE: Section Badge (Pill)
   ═══════════════════════════════════════ */
function SectionBadge({ label }) {
  return (
    <span className="px-4 py-1.5 rounded-full border border-[#FF8C00]/20 bg-[#FF8C00]/10 text-[#FFC857] text-[10px] uppercase tracking-widest font-bold mb-4 inline-block">
      {label}
    </span>
  )
}

/* ═══════════════════════════════════════
   REUSABLE: Animated Counter
   ═══════════════════════════════════════ */
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

/* ═══════════════════════════════════════
   DATA
   ═══════════════════════════════════════ */
const stats = [
  { value: 190, suffix: 'M+', label: 'Credit-Invisible Indians', icon: '◎' },
  { value: 5, suffix: '', label: 'Behavioral Factors', icon: '⚡' },
  { value: 300, suffix: '–900', label: 'Score Range', icon: '△' },
  { value: 500, suffix: 'ms', label: 'What-If Speed', prefix: '<', icon: '◇' },
]

const scoringFactors = [
  { title: 'Payment Consistency', description: 'Do you pay bills on time? Regular, predictable payments show reliability and build trust with lenders.', icon: '📅', weight: '25%' },
  { title: 'Savings Discipline', description: 'What percentage of income do you save? Even small, consistent savings signal financial maturity.', icon: '🏦', weight: '20%' },
  { title: 'Spending Behavior', description: 'How controlled is your spending? We track impulse patterns, category balance, and month-over-month trends.', icon: '📊', weight: '25%' },
  { title: 'Income Stability', description: 'Consistent earnings — even if modest — indicate lower risk. Freelancers and gig workers are fully supported.', icon: '💼', weight: '15%' },
  { title: 'Debt-to-Income Ratio', description: 'How much of your income goes toward existing obligations? Lower ratios mean more financial headroom.', icon: '⚖️', weight: '15%' },
]

const steps = [
  { step: '01', title: 'Sign Up & Log Expenses', description: 'Create an account and start tracking your daily income, spending, and bills. No bank linking required — just enter your data.' },
  { step: '02', title: 'We Analyze Your Behavior', description: 'Our 5-factor engine evaluates payment consistency, savings ratio, spending discipline, income stability, and debt load.' },
  { step: '03', title: 'Get Your Score & Insights', description: 'Receive a 300–900 credit score with full explainability. Every factor is broken down with actionable recommendations.' },
]

const whyCards = [
  { title: 'No Bank History Needed', description: 'Designed for thin-file and credit-invisible users. Your financial behavior IS your credit history.', icon: '🛡️' },
  { title: 'Fully Transparent', description: 'Every factor is explained in plain language. No black boxes, no hidden algorithms. You see exactly what drives your score.', icon: '◎' },
  { title: 'What-If Simulator', description: 'Adjust spending, savings, and bills to see real-time score changes before you act. Plan your financial future.', icon: '△' },
  { title: 'AI-Powered Insights', description: 'Chimchar AI gives you personalized recommendations ranked by impact. Know exactly what to improve first.', icon: '🔥' },
]

const tabMeta = [
  { id: 'scoring', label: 'Scoring Engine' },
  { id: 'how', label: 'How It Works' },
  { id: 'why', label: 'Why FinFix' },
]

/* ═══════════════════════════════════════
   TAB CONTENT COMPONENTS
   ═══════════════════════════════════════ */

function ScoringEngineSection() {
  return (
    <section className="w-full flex justify-center py-20 px-6 bg-neutral-950">
      <div className="w-full max-w-6xl flex flex-col items-center gap-12">
        <FadeIn className="text-center">
          <SectionBadge label="◎ The Scoring Engine" />
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white text-center">
            Credit is <span className="text-[#FFC857]">Earned</span>, Not Given.
          </h2>
          <p className="text-neutral-400 text-base mt-4 max-w-xl mx-auto leading-relaxed">
            Our 5-factor behavioral engine evaluates how you manage money — not whether a bank has given you a loan.
          </p>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
          {scoringFactors.map((factor, i) => (
            <FadeIn key={i} delay={i * 0.1} className={i >= 3 ? 'md:col-span-1 lg:col-span-1' : ''}>
              <div className="w-full bg-white/[0.02] border border-white/[0.05] rounded-2xl p-8 hover:bg-white/[0.04] transition-all duration-300 flex flex-col gap-4 h-full">
                <div className="w-11 h-11 rounded-xl bg-[#FF8C00]/10 border border-[#FF8C00]/20 flex items-center justify-center text-lg">
                  {factor.icon}
                </div>
                <p className="text-[#FFC857] text-xs font-bold tracking-widest uppercase">
                  Weight: {factor.weight}
                </p>
                <h3 className="text-lg font-bold text-white">{factor.title}</h3>
                <p className="text-neutral-400 text-sm leading-relaxed">{factor.description}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}

function HowItWorksSection() {
  return (
    <section className="w-full flex justify-center py-20 px-6 bg-neutral-950">
      <div className="w-full max-w-6xl flex flex-col items-center gap-12">
        <FadeIn className="text-center">
          <SectionBadge label="⚡ How It Works" />
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white text-center">
            Three Steps to Your <span className="text-[#FFC857]">Score</span>
          </h2>
          <p className="text-neutral-400 text-base mt-4 max-w-lg mx-auto leading-relaxed">
            From sign-up to actionable insights — in minutes, not months.
          </p>
        </FadeIn>

        <div className="flex flex-col gap-8 w-full max-w-4xl">
          {steps.map((s, i) => (
            <FadeIn key={i} delay={i * 0.15}>
              <div className="flex flex-col md:flex-row gap-6 items-start w-full bg-white/[0.02] border border-white/[0.05] rounded-2xl p-8 hover:bg-white/[0.04] transition-all duration-300">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-[#FF8C00]/10 border border-[#FF8C00]/20 text-[#FFC857] flex items-center justify-center font-bold text-lg">
                  {s.step}
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="text-lg font-bold text-white">{s.title}</h3>
                  <p className="text-neutral-400 text-sm leading-relaxed">{s.description}</p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}

function WhyFinFixSection() {
  return (
    <section className="w-full flex justify-center py-20 px-6 bg-neutral-950">
      <div className="w-full max-w-6xl flex flex-col items-center gap-12">
        <FadeIn className="text-center">
          <SectionBadge label="△ Why FinFix" />
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white text-center">
            A Smarter, Fairer Way to <span className="text-[#FFC857]">Prove</span> Creditworthiness
          </h2>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 w-full">
          {whyCards.map((card, i) => (
            <FadeIn key={i} delay={i * 0.1}>
              <div className="w-full bg-white/[0.02] border border-white/[0.05] rounded-2xl p-8 hover:bg-white/[0.04] transition-all duration-300 flex flex-col gap-4 h-full">
                <div className="w-11 h-11 rounded-xl bg-[#FF8C00]/10 border border-[#FF8C00]/20 flex items-center justify-center text-lg">
                  {card.icon}
                </div>
                <h3 className="text-lg font-bold text-white">{card.title}</h3>
                <p className="text-neutral-400 text-sm leading-relaxed">{card.description}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════ */
export default function HeroSection({ onSignUp }) {
  const containerRef = useRef(null)
  const tabContentRef = useRef(null)
  const [activeTab, setActiveTab] = useState('scoring')

  function handleTabClick(tabId) {
    setActiveTab(tabId)
    // Auto-scroll to the tab content so user sees the switched section
    setTimeout(() => {
      tabContentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 50)
  }

  const { scrollYProgress } = useScroll({ target: containerRef, offset: ['start start', 'end start'] })
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -100])
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -50])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])

  return (
    <div ref={containerRef} className="relative bg-neutral-950">

      {/* ── LANDING NAVBAR ── */}
      <nav className="w-full border-b border-neutral-800/50 bg-black/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="w-full px-10 h-16 flex items-center justify-between">

          {/* Logo */}
          <div
            className="flex items-center gap-2.5 cursor-pointer"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <img src="/logo.png" alt="FinFix" className="h-7 w-auto" />
            <span className="text-[17px] font-bold text-white tracking-tight">FinFix</span>
          </div>

          {/* CTAs */}
          <div className="flex items-center gap-4">
            <button
              onClick={onSignUp}
              className="text-sm font-medium text-white bg-transparent border-none cursor-pointer"
              style={{ fontFamily: 'inherit' }}
            >
              Sign In
            </button>
            <motion.button
              onClick={onSignUp}
              className="px-5 py-2 rounded-xl border border-[#FF8C00] bg-[#FF8C00]/10 text-[#FF8C00] text-sm font-semibold cursor-pointer"
              style={{ fontFamily: 'inherit' }}
              whileHover={{ background: 'rgba(255, 140, 0, 0.2)' }}
              whileTap={{ scale: 0.97 }}
            >
              Get Started
            </motion.button>
          </div>

        </div>
      </nav>

      {/* ══════════════════════════════════════
         SECTION 1 — HERO (Always Visible)
         ══════════════════════════════════════ */}
      <section className="min-h-screen relative flex flex-col items-center justify-center px-6 text-center overflow-hidden">
        <motion.div style={{ y: y1 }} className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[15%] left-[5%] w-[350px] h-[350px] rounded-full bg-[#FF8C00]/[0.06] blur-[100px]" />
          <div className="absolute bottom-[10%] right-[5%] w-[400px] h-[400px] rounded-full bg-[#FFC857]/[0.04] blur-[120px]" />
        </motion.div>

        <motion.div style={{ y: y2, opacity }} className="relative z-10 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <SectionBadge label="🇮🇳 Built for 190M+ Credit-Invisible Indians" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight tracking-tight text-white"
          >
            Your Financial Behavior
            <br />
            Is Your <span className="text-[#FFC857]">Credit Score</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-lg md:text-xl text-neutral-400 mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            No bank loans? No credit cards? No problem. We analyze how you spend, save, and pay bills
            to generate a fair, transparent credit score.
          </motion.p>

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
            <button
              onClick={() => handleTabClick('how')}
              className="text-lg text-neutral-400 hover:text-white bg-transparent border-none cursor-pointer transition-colors px-8 py-4"
              style={{ fontFamily: 'inherit' }}
            >
              See how it works ↓
            </button>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 rounded-full border-2 border-neutral-700 flex items-start justify-center p-1">
            <motion.div
              className="w-1.5 h-3 rounded-full bg-[#FF8C00]"
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </section>

      {/* ── Stats Bar (Always Visible) ── */}
      <section className="w-full flex justify-center py-14 px-6 bg-black">
        <div className="w-full max-w-6xl grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <FadeIn key={i} delay={i * 0.1} className="text-center">
              <span className="text-sm text-[#FF8C00]">{stat.icon}</span>
              <p className="text-3xl md:text-4xl font-bold mt-1 text-gradient">
                <AnimatedCounter target={stat.value} suffix={stat.suffix} prefix={stat.prefix} />
              </p>
              <p className="text-xs text-neutral-500 mt-1">{stat.label}</p>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════
         TAB CONTENT — Fade Switch
         ══════════════════════════════════════ */}
      <div ref={tabContentRef} style={{ scrollMarginTop: '80px' }} />
      <AnimatePresence mode="wait">
        {activeTab === 'scoring' && (
          <motion.div
            key="scoring"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <ScoringEngineSection />
          </motion.div>
        )}
        {activeTab === 'how' && (
          <motion.div
            key="how"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <HowItWorksSection />
          </motion.div>
        )}
        {activeTab === 'why' && (
          <motion.div
            key="why"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <WhyFinFixSection />
          </motion.div>
        )}
      </AnimatePresence>


    </div>
  )
}
