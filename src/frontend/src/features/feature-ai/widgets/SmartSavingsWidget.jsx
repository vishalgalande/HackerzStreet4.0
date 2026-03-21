import { motion } from 'framer-motion'
import { useState } from 'react'

export default function SmartSavingsWidget() {
  const [sliderVal, setSliderVal] = useState(20)
  const income = 45000
  const savedAmount = Math.round((sliderVal / 100) * income)
  const scoreImpact = sliderVal < 10 ? -12 : sliderVal < 20 ? 0 : sliderVal < 30 ? 15 : 25

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl flex flex-col gap-5 h-full w-full">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-[16px] text-neutral-50 flex items-center gap-2">
          <span>◇</span> Your Ideal Savings Plan
        </h4>
        <span className="bg-neutral-800/50 text-neutral-400 text-[10px] uppercase tracking-widest px-2 py-1 rounded-full">Analysis</span>
      </div>

      <p className="text-[14px] text-neutral-400 leading-relaxed">
        Based on your income and regional averages, setting aside <strong className="text-neutral-50">25-30%</strong> provides the safest financial buffer against unexpected expenses.
      </p>

      {/* Interactive Savings Meter */}
      <div className="bg-neutral-950 p-5 rounded-xl border border-neutral-800">
        <div className="flex justify-between items-end mb-4">
          <div>
            <p className="text-[10px] text-neutral-500 uppercase tracking-widest mb-1">Monthly Goal</p>
            <p className="text-xl font-bold text-neutral-50 tracking-tight">
              ₹{savedAmount.toLocaleString()} <span className="text-[13px] font-normal text-neutral-500">({sliderVal}%)</span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-neutral-500 uppercase tracking-widest mb-1">Score Impact</p>
            <p className={`text-[15px] font-bold ${scoreImpact > 0 ? 'text-emerald-400' : scoreImpact < 0 ? 'text-rose-400' : 'text-neutral-300'}`}>
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
            className="w-full h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            style={{
              background: `linear-gradient(to right, #10b981 0%, #10b981 ${(sliderVal-5)/(45)*100}%, #262626 ${(sliderVal-5)/(45)*100}%, #262626 100%)`
            }}
          />
        </div>
        <div className="flex justify-between mt-3 px-1">
          <span className="text-[11px] text-neutral-500">5%</span>
          <span className="text-[11px] text-neutral-500">25% (Ideal)</span>
          <span className="text-[11px] text-neutral-500">50%</span>
        </div>
      </div>

      {/* AI Insight */}
      <div className="flex gap-3 bg-neutral-950 p-4 rounded-xl border border-neutral-800 mt-auto">
        <span className="text-lg leading-none shrink-0" style={{ filter: 'grayscale(0) drop-shadow(0 0 4px rgba(255,165,0,0.5))' }}>🔥</span>
        <p className="text-[14px] text-neutral-300 leading-relaxed">
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
