import { motion } from 'framer-motion'
import { useState } from 'react'

export default function SmartSavingsWidget() {
  const [sliderVal, setSliderVal] = useState(20) // 20% default
  const income = 45000 // Mock user income profile
  const savedAmount = Math.round((sliderVal / 100) * income)
  
  // Fake Credit Score Impact calculation
  const scoreImpact = sliderVal < 10 ? -12 : sliderVal < 20 ? 0 : sliderVal < 30 ? 15 : 25

  return (
    <div className="bg-slate-900 border border-slate-700/50 rounded-2xl p-6 shadow-lg w-full">
      <div className="flex items-center justify-between mb-5">
        <h4 className="font-semibold text-[16px] text-slate-100 flex items-center gap-2">
          <span>◇</span> Your Ideal Savings Plan
        </h4>
        <span className="bg-emerald-500/20 text-emerald-400 text-[12px] uppercase tracking-wider px-2.5 py-1 rounded">Analysis</span>
      </div>

      <p className="text-[14px] text-slate-400 mb-5 leading-relaxed">
        Based on your income and regional averages, setting aside <strong className="text-white">25-30%</strong> provides the safest financial buffer against unexpected expenses.
      </p>

      {/* Interactive Savings Meter */}
      <div className="mb-6 bg-slate-800/50 p-5 rounded-xl border border-slate-700/50">
        <div className="flex justify-between items-end mb-3">
          <div>
            <p className="text-[12px] text-slate-500 uppercase tracking-wider">Monthly Goal</p>
            <p className="text-xl font-bold text-white tracking-tight">
              ₹{savedAmount.toLocaleString()} <span className="text-[13px] font-normal text-slate-500">({sliderVal}%)</span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-[12px] text-slate-500 uppercase tracking-wider">Score Impact</p>
            <p className={`text-[15px] font-bold ${scoreImpact > 0 ? 'text-emerald-400' : scoreImpact < 0 ? 'text-rose-400' : 'text-slate-300'}`}>
              {scoreImpact > 0 ? '+' : ''}{scoreImpact} pts
            </p>
          </div>
        </div>

        <div className="relative pt-2 pb-1">
          <input
            type="range"
            min="5"
            max="50"
            step="1"
            value={sliderVal}
            onChange={(e) => setSliderVal(parseInt(e.target.value))}
            className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            style={{
              background: `linear-gradient(to right, #10b981 0%, #10b981 ${(sliderVal-5)/(45)*100}%, #334155 ${(sliderVal-5)/(45)*100}%, #334155 100%)`
            }}
          />
        </div>
        <div className="flex justify-between mt-2 px-1">
          <span className="text-[12px] text-slate-500">5%</span>
          <span className="text-[12px] text-slate-500">25% (Ideal)</span>
          <span className="text-[12px] text-slate-500">50%</span>
        </div>
      </div>

      {/* AI Insight */}
      <div className="flex gap-3 bg-slate-800 p-4 rounded-xl border border-slate-700">
        <span className="text-lg leading-none shrink-0" style={{ filter: 'grayscale(0) drop-shadow(0 0 4px rgba(255,165,0,0.5))' }}>🔥</span>
        <p className="text-[14px] text-slate-300 leading-relaxed">
          {sliderVal >= 25 
            ? "Excellent! At this rate, your Savings Discipline factor will max out within 3 months, significantly pulling up your overall score."
            : sliderVal >= 15
            ? "You're on the right track, but pushing your rate above 25% unlocks the highest credit score brackets."
            : "Warning: Saving under 15% leaves you vulnerable to short-term debt, which negatively impacts your debt-to-income ratio."
          }
        </p>
      </div>
    </div>
  )
}
