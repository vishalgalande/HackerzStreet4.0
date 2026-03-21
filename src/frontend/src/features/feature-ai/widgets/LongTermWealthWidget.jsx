import { motion } from 'framer-motion'
import { useState } from 'react'

const WEALTH_STRATEGIES = [
  {
    id: 'low',
    title: 'Low Risk',
    fund: 'HDFC Corporate Bond Fund',
    return: '7.8% p.a.',
    horizon: '1-3 years',
    color: '#10b981',
    reason: 'Matches your need for high stability since you have slightly irregular income.',
  },
  {
    id: 'balanced',
    title: 'Balanced',
    fund: 'ICICI Prudential Balanced Advantage',
    return: '10.5% p.a.',
    horizon: '3-5 years',
    color: '#f59e0b',
    reason: 'Perfect mid-ground to beat inflation while protecting capital downside.',
  },
  {
    id: 'growth',
    title: 'High Growth',
    fund: 'Parag Parikh Flexi Cap',
    return: '15.2% p.a.',
    horizon: '5+ years',
    color: '#ea580c',
    reason: 'Leverages your strong payment consistency to build aggressive long-term wealth.',
  },
]

export default function LongTermWealthWidget() {
  const [activeTab, setActiveTab] = useState('balanced')

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl flex flex-col h-full">
      <div className="flex items-center justify-between mb-5">
        <h4 className="font-semibold text-[16px] text-neutral-50">Grow Your Wealth Over Time</h4>
        <span className="bg-neutral-800/50 text-neutral-400 text-[10px] uppercase tracking-widest px-2 py-1 rounded-full">Long-Term</span>
      </div>

      <div className="flex gap-1 mb-5 bg-neutral-950 p-1 rounded-xl">
        {WEALTH_STRATEGIES.map(strat => (
          <button
            key={strat.id}
            onClick={() => setActiveTab(strat.id)}
            className={`flex-1 py-2 text-[13px] font-medium rounded-lg transition-all ${activeTab === strat.id ? 'bg-neutral-800 text-white shadow-sm' : 'text-neutral-500 hover:text-neutral-300'}`}
          >
            {strat.title}
          </button>
        ))}
      </div>

      <div className="relative min-h-[140px] flex-1">
        {WEALTH_STRATEGIES.map(strat => activeTab === strat.id && (
          <motion.div
            key={strat.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="font-medium text-neutral-50 text-[15px] leading-tight max-w-[200px]">{strat.fund}</p>
                <p className="text-[13px] text-neutral-500 mt-1.5">Horizon: {strat.horizon}</p>
              </div>
              <div className="text-right">
                <p className="text-[15px] font-bold" style={{ color: strat.color }}>{strat.return}</p>
                <p className="text-[13px] text-neutral-500">Exp. Return</p>
              </div>
            </div>

            <div className="bg-orange-500/5 border border-orange-500/20 p-4 rounded-xl mb-4">
              <p className="text-[10px] text-orange-400/80 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                <span>⚡</span> AI Analysis
              </p>
              <p className="text-[14px] text-neutral-300 leading-relaxed">
                {strat.reason}
              </p>
            </div>

            <div className="text-center">
              <p className="text-[13px] text-neutral-400">
                Consistent monthly investments (SIP) strongly index your <strong className="text-emerald-400 font-medium">Income Stability</strong> score.
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
