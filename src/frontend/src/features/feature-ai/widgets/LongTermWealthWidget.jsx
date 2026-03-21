import { motion } from 'framer-motion'
import { useState } from 'react'

const WEALTH_STRATEGIES = [
  {
    id: 'low',
    title: 'Low Risk',
    fund: 'HDFC Corporate Bond Fund',
    return: '7.8% p.a.',
    horizon: '1-3 years',
    color: '#10b981', // Emerald
    reason: 'Matches your need for high stability since you have slightly irregular income.',
  },
  {
    id: 'balanced',
    title: 'Balanced',
    fund: 'ICICI Prudential Balanced Advantage',
    return: '10.5% p.a.',
    horizon: '3-5 years',
    color: '#f59e0b', // Amber
    reason: 'Perfect mid-ground to beat inflation while protecting capital downside.',
  },
  {
    id: 'growth',
    title: 'High Growth',
    fund: 'Parag Parikh Flexi Cap',
    return: '15.2% p.a.',
    horizon: '5+ years',
    color: '#ea580c', // Orange
    reason: 'Leverages your strong payment consistency to build aggressive long-term wealth.',
  },
]

export default function LongTermWealthWidget() {
  const [activeTab, setActiveTab] = useState('balanced')

  return (
    <div className="bg-slate-900 border border-slate-700/50 rounded-2xl p-6 shadow-lg w-full">
      <div className="flex items-center justify-between mb-5">
        <h4 className="font-semibold text-[16px] text-slate-100">Grow Your Wealth Over Time</h4>
        <span className="bg-orange-500/20 text-orange-400 text-[12px] uppercase tracking-wider px-2.5 py-1 rounded">Long-Term</span>
      </div>

      <div className="flex gap-2 mb-5 bg-slate-800/80 p-1.5 rounded-lg">
        {WEALTH_STRATEGIES.map(strat => (
          <button
            key={strat.id}
            onClick={() => setActiveTab(strat.id)}
            className={`flex-1 py-2 text-[13px] font-medium rounded-md transition-all ${activeTab === strat.id ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
          >
            {strat.title}
          </button>
        ))}
      </div>

      <div className="relative min-h-[140px]">
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
                <p className="font-medium text-slate-200 text-[15px] leading-tight max-w-[200px]">{strat.fund}</p>
                <p className="text-[13px] text-slate-500 mt-1.5">Horizon: {strat.horizon}</p>
              </div>
              <div className="text-right">
                <p className="text-[15px] font-bold" style={{ color: strat.color }}>{strat.return}</p>
                <p className="text-[13px] text-slate-500">Exp. Return</p>
              </div>
            </div>

            <div className="bg-orange-500/5 border border-orange-500/20 p-4 rounded-xl mb-4">
              <p className="text-[12px] text-orange-400/80 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <span>⚡</span> AI Analysis
              </p>
              <p className="text-[14px] text-slate-300 leading-relaxed">
                {strat.reason}
              </p>
            </div>

            <div className="text-center">
              <p className="text-[13px] text-slate-400">
                Consistent monthly investments (SIP) strongly index your <strong className="text-emerald-400 font-medium">Income Stability</strong> score.
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
