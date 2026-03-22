import { useRef, useEffect, useState } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'

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

function SectionBadge({ label }) {
  return (
    <span className="px-4 py-1.5 rounded-full border border-[#FF8C00]/20 bg-[#FF8C00]/10 text-[#FFC857] text-[10px] uppercase tracking-widest font-bold mb-4 inline-block">
      {label}
    </span>
  )
}

const stats = [
  { value: 190, suffix: 'M+', label: 'Credit-Invisible Indians', icon: '◎' },
  { value: 5, suffix: '', label: 'Behavioral Factors', icon: '⚡' },
  { value: 300, suffix: '–900', label: 'Score Range', icon: '△' },
  { value: 500, suffix: 'ms', label: 'What-If Speed', prefix: '<', icon: '◇' },
]

const scoringFactors = [
  { title: 'Payment Consistency', description: 'Regular, predictable payments show reliability and build trust with lenders.', icon: '📅', weight: '25%' },
  { title: 'Savings Discipline', description: 'Even small, consistent savings signal financial maturity.', icon: '🏦', weight: '20%' },
  { title: 'Spending Behavior', description: 'We track impulse patterns, category balance, and month-over-month trends.', icon: '📊', weight: '25%' },
  { title: 'Income Stability', description: 'Consistent earnings indicate lower risk. Freelancers fully supported.', icon: '💼', weight: '15%' },
  { title: 'Debt-to-Income Ratio', description: 'Lower ratios mean more financial headroom.', icon: '⚖️', weight: '15%' },
]

const steps = [
  { step: '01', title: 'Sign Up & Log Expenses', description: 'Create an account and start tracking your daily income, spending, and bills.' },
  { step: '02', title: 'We Analyze Your Behavior', description: 'Our 5-factor engine evaluates payment consistency, savings, spending, income, and debt.' },
  { step: '03', title: 'Get Your Score & Insights', description: 'Receive a 300–900 credit score with full explainability and actionable recommendations.' },
]

const whyCards = [
  { title: 'No Bank History Needed', description: 'Designed for thin-file and credit-invisible users. Your behavior IS your credit history.', icon: '🛡️' },
  { title: 'Fully Transparent', description: 'Every factor explained in plain language. No black boxes, no hidden algorithms.', icon: '◎' },
  { title: 'What-If Simulator', description: 'Adjust spending, savings, and bills to see real-time score changes before you act.', icon: '△' },
  { title: 'AI-Powered Insights', description: 'Chimchar AI gives you personalized recommendations ranked by impact.', icon: '🔥' },
]

const tabs = [
  { id: 'scoring', label: 'Scoring Engine' },
  { id: 'how-it-works', label: 'How It Works' },
  { id: 'why-finfix', label: 'Why FinFix' },
]

const pageTransition = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3, ease: 'easeOut' },
}

function HomePage({ onSignUp }) {
  return (
    <div className="h-full flex flex-col items-center justify-center px-6 text-center relative">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[15%] left-[5%] w-[350px] h-[350px] rounded-full bg-[#FF8C00]/[0.06] blur-[100px]" />
        <div className="absolute bottom-[10%] right-[5%] w-[400px] h-[400px] rounded-full bg-[#FFC857]/[0.04] blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto">
        <SectionBadge label="🇮🇳 Built for 190M+ Credit-Invisible Indians" />

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight tracking-tight text-white">
          Your Financial Behavior
          <br />
          Is Your <span className="text-[#FFC857]">Credit Score</span>
        </h1>

        <p className="text-lg md:text-xl text-neutral-400 mb-10 max-w-2xl mx-auto leading-relaxed">
          No bank loans? No credit cards? No problem. We analyze how you spend, save, and pay bills
          to generate a fair, transparent credit score.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <motion.button
            onClick={onSignUp}
            className="btn-primary text-lg px-10 py-4"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            Get Your Score →
          </motion.button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
          {stats.map((stat, i) => (
            <div key={i} className="text-center">
              <span className="text-sm text-[#FF8C00]">{stat.icon}</span>
              <p className="text-2xl md:text-3xl font-bold mt-1 text-gradient">
                <AnimatedCounter target={stat.value} suffix={stat.suffix} prefix={stat.prefix} />
              </p>
              <p className="text-xs text-neutral-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function ScoringPage() {
  return (
    <div className="h-full flex flex-col items-center justify-center px-6 overflow-auto">
      <div className="w-full max-w-6xl flex flex-col items-center gap-8">
        <div className="text-center">
          <SectionBadge label="◎ The Scoring Engine" />
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white">
            Credit is <span className="text-[#FFC857]">Earned</span>, Not Given.
          </h2>
          <p className="text-neutral-400 text-base mt-3 max-w-xl mx-auto leading-relaxed">
            Our 5-factor behavioral engine evaluates how you manage money — not whether a bank has given you a loan.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 w-full">
          {scoringFactors.map((factor, i) => (
            <div key={i} className="w-full bg-white/[0.02] border border-white/[0.05] rounded-2xl p-6 hover:bg-white/[0.04] transition-all duration-300 flex flex-col gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#FF8C00]/10 border border-[#FF8C00]/20 flex items-center justify-center text-lg">
                {factor.icon}
              </div>
              <p className="text-[#FFC857] text-[10px] font-bold tracking-widest uppercase">
                Weight: {factor.weight}
              </p>
              <h3 className="text-sm font-bold text-white">{factor.title}</h3>
              <p className="text-neutral-400 text-xs leading-relaxed">{factor.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function HowItWorksPage() {
  return (
    <div className="h-full flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-4xl flex flex-col items-center gap-8">
        <div className="text-center">
          <SectionBadge label="⚡ How It Works" />
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white">
            Three Steps to Your <span className="text-[#FFC857]">Score</span>
          </h2>
          <p className="text-neutral-400 text-base mt-3 max-w-lg mx-auto leading-relaxed">
            From sign-up to actionable insights — in minutes, not months.
          </p>
        </div>
        <div className="flex flex-col gap-5 w-full">
          {steps.map((s, i) => (
            <div key={i} className="flex flex-col md:flex-row gap-5 items-start w-full bg-white/[0.02] border border-white/[0.05] rounded-2xl p-6 hover:bg-white/[0.04] transition-all duration-300">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-[#FF8C00]/10 border border-[#FF8C00]/20 text-[#FFC857] flex items-center justify-center font-bold text-lg">
                {s.step}
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="text-lg font-bold text-white">{s.title}</h3>
                <p className="text-neutral-400 text-sm leading-relaxed">{s.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function WhyFinFixPage() {
  return (
    <div className="h-full flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-5xl flex flex-col items-center gap-8">
        <div className="text-center">
          <SectionBadge label="△ Why FinFix" />
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white">
            A Smarter, Fairer Way to <span className="text-[#FFC857]">Prove</span> Creditworthiness
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full">
          {whyCards.map((card, i) => (
            <div key={i} className="w-full bg-white/[0.02] border border-white/[0.05] rounded-2xl p-7 hover:bg-white/[0.04] transition-all duration-300 flex flex-col gap-3">
              <div className="w-11 h-11 rounded-xl bg-[#FF8C00]/10 border border-[#FF8C00]/20 flex items-center justify-center text-lg">
                {card.icon}
              </div>
              <h3 className="text-lg font-bold text-white">{card.title}</h3>
              <p className="text-neutral-400 text-sm leading-relaxed">{card.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const pages = {
  'home': HomePage,
  'scoring': ScoringPage,
  'how-it-works': HowItWorksPage,
  'why-finfix': WhyFinFixPage,
}

export default function HeroSection({ onSignIn, onSignUp }) {
  const [activeTab, setActiveTab] = useState('home')

  const ActivePage = pages[activeTab]

  return (
    <div className="h-screen w-full overflow-hidden flex flex-col bg-neutral-950">
      <nav className="w-full border-b border-neutral-800/50 bg-black/80 backdrop-blur-xl flex-shrink-0 z-50">
        <div className="w-full h-16 flex items-center justify-between" style={{ paddingLeft: '80px', paddingRight: '80px' }}>
          <div
            className="flex items-center gap-2.5 cursor-pointer"
            onClick={() => setActiveTab('home')}
          >
            <img src="/logo.png" alt="FinFix" className="h-9 w-auto" />
            <span className="text-[17px] font-bold text-white tracking-tight">FinFix</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`text-sm bg-transparent border-none cursor-pointer transition-colors ${
                  activeTab === tab.id
                    ? 'text-[#FFC857] font-semibold'
                    : 'text-neutral-500 hover:text-neutral-300'
                }`}
                style={{ fontFamily: 'inherit' }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={onSignIn}
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

      <div className="flex-1 relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            className="absolute inset-0"
            {...pageTransition}
          >
            <ActivePage onSignUp={onSignUp} />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
