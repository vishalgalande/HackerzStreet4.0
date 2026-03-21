import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const LIQUID_FUNDS = [
  { id: 1, name: 'Quantum Liquid Direct', return: '6.8%', liquidity: 'High', risk: 'Low', color: '#10b981' },
  { id: 2, name: 'Parag Parikh Liquid', return: '7.1%', liquidity: 'High', risk: 'Low', color: '#14b8a6' },
  { id: 3, name: 'Axis Liquid Fund', return: '6.9%', liquidity: 'High', risk: 'Low', color: '#06b6d4' },
]

export default function LiquidFundWidget() {
  const [selectedFund, setSelectedFund] = useState(null)
  const [isSimulating, setIsSimulating] = useState(false)
  const [simComplete, setSimComplete] = useState(false)

  const expenseAmount = 45000
  const daysParked = 25
  const estimatedReturn = 210

  const handleSimulate = (fundId) => {
    setSelectedFund(fundId)
    setIsSimulating(true)
    setTimeout(() => {
      setIsSimulating(false)
      setSimComplete(true)
    }, 1500)
  }

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl flex flex-col h-full">
      <div className="flex items-center justify-between mb-5">
        <h4 className="font-semibold text-[16px] text-neutral-50">Monthly Smart Parking</h4>
        <span className="bg-neutral-800/50 text-neutral-400 text-[10px] uppercase tracking-widest px-2 py-1 rounded-full">Liquid</span>
      </div>
      
      {!simComplete ? (
        <>
          <p className="text-[14px] text-neutral-400 mb-5 leading-relaxed">
            Park your monthly expense budget (₹{expenseAmount.toLocaleString()}) in a liquid fund for {daysParked} days before your bills are due.
          </p>
          <div className="space-y-0 mb-5 flex-1">
            {LIQUID_FUNDS.map((fund, i) => (
              <div 
                key={fund.id}
                onClick={() => setSelectedFund(fund.id)}
                className={`p-3.5 cursor-pointer transition-all flex items-center justify-between
                  ${i < LIQUID_FUNDS.length - 1 ? 'border-b border-neutral-800/50' : ''}
                  ${selectedFund === fund.id ? 'bg-neutral-800/40' : 'hover:bg-neutral-800/20'}
                `}
              >
                <div>
                  <p className="text-[15px] font-medium text-neutral-50">{fund.name}</p>
                  <p className="text-[13px] text-neutral-500">Liquidity: {fund.liquidity} • Risk: {fund.risk}</p>
                </div>
                <div className="text-right">
                  <p className="text-[15px] font-bold" style={{ color: fund.color }}>{fund.return}</p>
                  <p className="text-[11px] text-neutral-500">p.a.</p>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => handleSimulate(selectedFund || LIQUID_FUNDS[0].id)}
            disabled={isSimulating}
            className="w-full mt-auto bg-white text-black font-semibold rounded-xl py-3 hover:bg-neutral-200 transition-colors disabled:opacity-50 text-[15px] flex justify-center items-center"
          >
            {isSimulating ? (
              <motion.div className="w-4 h-4 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin" />
            ) : (
              `Invest ₹${expenseAmount.toLocaleString()} Base Expenses`
            )}
          </button>
        </>
      ) : (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-4 flex-1 flex flex-col justify-center"
        >
          <div className="w-14 h-14 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl text-emerald-400">✓</span>
          </div>
          <h4 className="text-[16px] font-bold text-emerald-400 mb-2">Simulation Complete</h4>
          <p className="text-[14px] text-neutral-300 mb-5 leading-relaxed">
            By parking <span className="text-neutral-50 font-medium">₹{expenseAmount.toLocaleString()}</span> in liquid funds, you earned <span className="text-emerald-400 font-bold px-1 bg-emerald-500/10 rounded">₹{estimatedReturn}</span> entirely risk-free before paying your bills.
          </p>
          <div className="bg-neutral-950 p-4 rounded-xl text-left mb-5 border border-neutral-800">
            <p className="text-[10px] text-neutral-500 uppercase tracking-widest mb-1.5">Credit Score Impact</p>
            <p className="text-[14px] text-neutral-300 leading-relaxed">
              Timely bill payments from automated liquid redemptions boost your <span className="text-orange-400 font-medium">Payment Consistency</span> score directly.
            </p>
          </div>
          <button 
            onClick={() => {setSimComplete(false); setSelectedFund(null);}}
            className="text-[13px] text-neutral-400 hover:text-neutral-50 underline transition-colors"
          >
            Run another simulation
          </button>
        </motion.div>
      )}
    </div>
  )
}
