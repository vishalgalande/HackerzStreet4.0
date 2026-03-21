import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { useAuth } from '../feature-auth/AuthContext'

/* ── Data ─────────────────────────────────────────── */

const WEALTH_STRATEGIES = [
  { id: 'low', title: 'Low Risk', fund: 'HDFC Corporate Bond Fund', ret: '7.8% p.a.', horizon: '1-3 yrs', color: '#10b981', reason: 'Best for high stability with irregular income.' },
  { id: 'balanced', title: 'Balanced', fund: 'ICICI Prudential Balanced Advantage', ret: '10.5% p.a.', horizon: '3-5 yrs', color: '#f59e0b', reason: 'Beats inflation while protecting capital downside.' },
  { id: 'growth', title: 'High Growth', fund: 'Parag Parikh Flexi Cap', ret: '15.2% p.a.', horizon: '5+ yrs', color: '#ea580c', reason: 'Leverages payment consistency for aggressive growth.' },
]

const LIQUID_FUNDS = [
  { id: 1, name: 'Quantum Liquid Direct', type: 'Very Low Risk', color: '#10b981' },
  { id: 2, name: 'Parag Parikh Liquid', type: 'Very Low Risk', color: '#14b8a6' },
  { id: 3, name: 'Axis Liquid Fund', type: 'Very Low Risk', color: '#06b6d4' },
]

const TRAITS = [
  { label: 'Personality', value: 'Moderate Spender', icon: '👤', hl: 'text-neutral-50' },
  { label: 'Risk Tolerance', value: 'Strategic & Controlled', icon: '⚖️', hl: 'text-emerald-400' },
  { label: 'Improvement Area', value: 'Weekend Impulse Control', icon: '🎯', hl: 'text-amber-400' },
]

const ALERTS = [
  { icon: '🚨', title: 'High Credit Utilization', desc: 'Discretionary spending pushed utilization above 30%.', time: '2h ago', card: 'bg-rose-500/10 border-rose-500/20', tc: 'text-rose-400' },
  { icon: '⚠️', title: 'Impulse Spending Detected', desc: 'Unusual weekend activity. Score growth paused.', time: 'Yesterday', card: 'bg-amber-500/10 border-amber-500/20', tc: 'text-amber-400' },
  { icon: '✅', title: 'Consistent Saver', desc: '20% savings buffer maintained for 3 months.', time: 'Oct 12', card: 'bg-emerald-500/10 border-emerald-500/20', tc: 'text-emerald-400' },
]

/* ── Component ────────────────────────────────────── */

export default function ChimcharAssistant() {
  const { profile } = useAuth()

  // Savings
  const [sliderVal, setSliderVal] = useState(20)
  const income = 45000
  const savedAmount = Math.round((sliderVal / 100) * income)
  const scoreImpact = sliderVal < 10 ? -12 : sliderVal < 20 ? 0 : sliderVal < 30 ? 15 : 25

  // Wealth
  const [wealthTab, setWealthTab] = useState('balanced')

  // Parking (No simulation, just guidance)
  const expenseAmount = profile?.monthly_income ? profile.monthly_income * 0.3 : 45000

  const activeStrat = WEALTH_STRATEGIES.find(s => s.id === wealthTab) || WEALTH_STRATEGIES[1]

  return (
    <main className="w-full min-h-screen bg-black text-neutral-50">
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 24px 80px', display: 'flex', flexDirection: 'column', gap: '40px' }}>

        {/* ═══════════════════════════════════════════ */}
        {/* HERO                                       */}
        {/* ═══════════════════════════════════════════ */}
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', marginBottom: '8px' }}
        >
          <div style={{ position: 'relative', width: '80px', height: '80px' }}>
            <motion.div
              style={{ position: 'absolute', inset: '-12px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(234,88,12,0.15), transparent 70%)' }}
              animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.8, 0.4] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            />
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, #fb923c, #ef4444)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', boxShadow: '0 0 30px rgba(234,88,12,0.4)', border: '1px solid rgba(253,186,116,0.4)', position: 'relative' }}>
              🔥
            </div>
          </div>
          <h1 style={{ fontSize: '34px', fontWeight: 700, letterSpacing: '-0.5px' }}>
            Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">Chimchar</span>
          </h1>
          <p className="text-neutral-400" style={{ maxWidth: '600px', fontSize: '15px', lineHeight: 1.7 }}>
            Your AI financial guide. Personalized insights to optimize your credit score and grow wealth — one calm step at a time.
          </p>
        </motion.header>

        {/* ═══════════════════════════════════════════ */}
        {/* PRIMARY CARD: Smart Parking (USP)          */}
        {/* ═══════════════════════════════════════════ */}
        <section className="bg-neutral-900 border border-neutral-800 rounded-2xl" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="flex items-center justify-between">
            <h2 style={{ fontSize: '18px', fontWeight: 700 }} className="flex items-center gap-2">
              <span>💧</span> Safe Parking & Credit Health
            </h2>
            <span className="bg-neutral-800/50 text-neutral-400 text-[10px] uppercase tracking-widest px-2 py-1 rounded-full">Primary</span>
          </div>
          <p className="text-neutral-400" style={{ fontSize: '14px', lineHeight: 1.6 }}>
            Park upcoming expense funds (like EMI or rent) in Liquid Mutual Funds. This ensures you do not accidentally spend the money, drastically reducing credit risk and missed payments, which directly protects your credit score.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {LIQUID_FUNDS.map((fund, i) => (
              <div
                key={fund.id}
                className="transition-all hover:bg-neutral-800/20"
                style={{ padding: '14px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: i < LIQUID_FUNDS.length - 1 ? '1px solid rgba(38,38,38,0.5)' : 'none' }}
              >
                <div className="flex flex-col">
                  <span className="text-neutral-50" style={{ fontWeight: 500, fontSize: '15px' }}>{fund.name}</span>
                  <span className="text-neutral-500" style={{ fontSize: '13px' }}>Protects funds from impulse spending</span>
                </div>
                <span style={{ fontWeight: 700, fontSize: '15px', color: fund.color }}>{fund.type}</span>
              </div>
            ))}
          </div>
          
          <div className="bg-neutral-950 border border-neutral-800 rounded-xl mt-2" style={{ padding: '14px 16px', display: 'flex', gap: '10px', alignItems: 'start' }}>
            <span style={{ fontSize: '16px', lineHeight: 1, flexShrink: 0 }}>🛡️</span>
            <p className="text-neutral-300" style={{ fontSize: '13px', lineHeight: 1.6, margin: 0 }}>
              <span className="text-emerald-400 font-semibold">Credit Risk Tip:</span> Keep exactly 1 month of EMIs in a liquid fund. This guarantees you never miss a payment even if a salary is delayed, safely building your credit score.
            </p>
          </div>
        </section>

        {/* ═══════════════════════════════════════════ */}
        {/* SECONDARY CARDS (Stacked)                  */}
        {/* ═══════════════════════════════════════════ */}

        {/* Savings */}
        <section className="bg-neutral-900 border border-neutral-800 rounded-2xl" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="flex items-center justify-between">
            <h2 style={{ fontSize: '18px', fontWeight: 700 }} className="flex items-center gap-2">
              <span>🐷</span> Savings Plan
            </h2>
            <span className="bg-neutral-800/50 text-neutral-400 text-[10px] uppercase tracking-widest px-2 py-1 rounded-full">Analysis</span>
          </div>

          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <ul className="text-neutral-400" style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px' }}>
                <li>• Savings Target: <strong className="text-neutral-50">₹{savedAmount.toLocaleString()}</strong> <span className="text-neutral-500">({sliderVal}%)</span></li>
                <li>• Ideal Range: <strong className="text-neutral-50">25–30%</strong></li>
                <li>• Score Impact: <strong className={scoreImpact > 0 ? 'text-emerald-400' : scoreImpact < 0 ? 'text-rose-400' : 'text-neutral-300'}>{scoreImpact > 0 ? '+' : ''}{scoreImpact} pts</strong></li>
              </ul>
            </div>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <p className="text-neutral-500 mb-2" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px' }}>Adjust Rate</p>
              <input
                type="range" min="5" max="50" step="1" value={sliderVal}
                onChange={(e) => setSliderVal(parseInt(e.target.value))}
                className="w-full h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                style={{ background: `linear-gradient(to right, #10b981 0%, #10b981 ${(sliderVal-5)/45*100}%, #262626 ${(sliderVal-5)/45*100}%, #262626 100%)` }}
              />
              <div className="flex justify-between mt-2">
                <span className="text-neutral-500" style={{ fontSize: '11px' }}>5%</span>
                <span className="text-neutral-500" style={{ fontSize: '11px' }}>50%</span>
              </div>
            </div>
          </div>

          <div className="bg-neutral-950 border border-neutral-800 rounded-xl" style={{ padding: '14px 16px', display: 'flex', gap: '10px', alignItems: 'start' }}>
            <span style={{ fontSize: '16px', lineHeight: 1, flexShrink: 0, filter: 'drop-shadow(0 0 3px rgba(255,165,0,0.4))' }}>🔥</span>
            <p className="text-neutral-300" style={{ fontSize: '13px', lineHeight: 1.6, margin: 0 }}>
              {sliderVal >= 25
                ? "Savings Discipline factor will max out within 3 months at this rate."
                : sliderVal >= 15
                ? "Push above 25% to unlock higher credit score brackets."
                : "Under 15% leaves you vulnerable to short-term debt cycles."
              }
            </p>
          </div>
        </section>

        {/* Wealth */}
        <section className="bg-neutral-900 border border-neutral-800 rounded-2xl" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="flex items-center justify-between">
            <h2 style={{ fontSize: '18px', fontWeight: 700 }} className="flex items-center gap-2">
              <span>📈</span> Wealth Growth
            </h2>
            <span className="bg-neutral-800/50 text-neutral-400 text-[10px] uppercase tracking-widest px-2 py-1 rounded-full">Long-Term</span>
          </div>

          <div className="flex gap-1 bg-neutral-950 p-1 rounded-xl">
            {WEALTH_STRATEGIES.map(s => (
              <button
                key={s.id}
                onClick={() => setWealthTab(s.id)}
                className={`flex-1 py-2 text-[13px] font-medium rounded-lg transition-all ${wealthTab === s.id ? 'bg-neutral-800 text-white shadow-sm' : 'text-neutral-500 hover:text-neutral-300'}`}
              >
                {s.title}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={activeStrat.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p className="text-neutral-50" style={{ fontWeight: 600, fontSize: '15px' }}>{activeStrat.fund}</p>
                  <p className="text-neutral-500" style={{ fontSize: '13px' }}>Horizon: {activeStrat.horizon}</p>
                </div>
                <p style={{ fontWeight: 700, fontSize: '18px', color: activeStrat.color }}>{activeStrat.ret}</p>
              </div>
              <div className="bg-neutral-950 border border-neutral-800 rounded-xl" style={{ padding: '14px 16px' }}>
                <p className="text-neutral-300" style={{ fontSize: '13px', lineHeight: 1.6, margin: 0 }}>
                  <span className="text-orange-400/80">⚡ </span>{activeStrat.reason}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </section>

        {/* ═══════════════════════════════════════════ */}
        {/* SYSTEM PROFILE                             */}
        {/* ═══════════════════════════════════════════ */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h2 className="text-neutral-500" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 600, paddingLeft: '2px' }}>
            🧠 System Profile
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            {TRAITS.map((t, i) => (
              <div key={i} className="bg-neutral-900 border border-neutral-800 rounded-xl" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div className="bg-neutral-950 border border-neutral-800 rounded-full" style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 }}>
                    {t.icon}
                  </div>
                  <p className="text-neutral-500" style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1.5px' }}>{t.label}</p>
                </div>
                <p className={`${t.hl}`} style={{ fontSize: '16px', fontWeight: 600 }}>{t.value}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════════════════ */}
        {/* ACTIVE TRIGGERS                            */}
        {/* ═══════════════════════════════════════════ */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h2 className="text-neutral-500" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 600, paddingLeft: '2px' }}>
            ⚡ Active Triggers
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {ALERTS.map((a, i) => (
              <div key={i} className={`${a.card} border rounded-xl`} style={{ padding: '18px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0 }}>
                  <span style={{ fontSize: '20px', flexShrink: 0 }}>{a.icon}</span>
                  <div style={{ minWidth: 0 }}>
                    <p className={`${a.tc}`} style={{ fontWeight: 700, fontSize: '14px', marginBottom: '2px' }}>{a.title}</p>
                    <p className="text-neutral-300" style={{ fontSize: '13px', lineHeight: 1.5, margin: 0 }}>{a.desc}</p>
                  </div>
                </div>
                <span className="text-neutral-500" style={{ fontSize: '12px', flexShrink: 0 }}>{a.time}</span>
              </div>
            ))}
          </div>
        </section>

      </div>
    </main>
  )
}
