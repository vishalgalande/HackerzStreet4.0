import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../feature-auth/AuthContext'
import usePayments from '../feature-payments/usePayments'

const API = import.meta.env.VITE_API_URL || ''

export default function ChimcharFloating() {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('chat')
  const [messages, setMessages] = useState([
    { id: '1', role: 'assistant', text: "Hey! I'm Chimchar 🔥, your financial guide. Ask me anything about credit scores, savings, or investments!" }
  ])
  const [inputVal, setInputVal] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)
  const { profile } = useAuth()
  const { payments, stats } = usePayments()

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping, activeTab, isOpen])

  const handleSend = async (e) => {
    e.preventDefault()
    if (!inputVal.trim() || isTyping) return

    const userMsg = inputVal.trim()
    setMessages(p => [...p, { id: Date.now().toString(), role: 'user', text: userMsg }])
    setInputVal('')
    setIsTyping(true)

    const loans = payments.filter(p => p.type === 'loan')
    const ccs = payments.filter(p => p.type === 'cc')
    const bills = payments.filter(p => p.type === 'bill')

    const enrichedProfile = {
      ...(profile || {}),
      monthly_income: profile?.monthly_income || profile?.income_amount || 0,
      existing_debt: stats.totalMonthly || 0,
      loans: loans.map(l => `${l.name}: ₹${l.amount} at ${l.interest_rate}%, EMI ₹${l.emi}/mo`),
      credit_cards: ccs.map(c => `${c.name}: Limit ₹${c.credit_limit}, Balance ₹${c.current_balance}, ${c.credit_limit > 0 ? Math.round(c.current_balance / c.credit_limit * 100) : 0}% utilization`),
      recurring_bills: bills.map(b => `${b.name} (${b.category}): ₹${b.avg_amount}/mo${b.auto_pay ? ', auto-pay on' : ''}`),
      total_monthly_outflow: stats.totalMonthly || 0,
      total_outstanding_debt: stats.totalOutstanding || 0,
      payment_count: payments.length,
    }

    try {
      const history = messages.slice(-10).map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.text }))
      const res = await fetch(`${API}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg,
          history,
          profile: enrichedProfile,
          language: 'en',
        }),
      })
      const data = await res.json()
      setMessages(p => [...p, { id: (Date.now()+1).toString(), role: 'assistant', text: data.reply || "I couldn't process that. Try again!" }])
    } catch {
      setMessages(p => [...p, { id: (Date.now()+1).toString(), role: 'assistant', text: "Connection error. Please check your network and try again." }])
    } finally {
      setIsTyping(false)
    }
  }

  return (
    <>
      <motion.button
        className="fixed w-14 h-14 rounded-full bg-neutral-900 border border-white/10 flex items-center justify-center shadow-2xl z-[100] group"
        style={{ bottom: '24px', right: '24px' }}
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <span className="relative text-2xl group-hover:scale-110 transition-transform">🔥</span>
        {!isOpen && <div className="absolute top-0 right-0 w-3.5 h-3.5 bg-rose-500 border-2 border-neutral-900 rounded-full" />}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', bounce: 0.3, duration: 0.5 }}
            className="fixed w-[400px] h-[540px] bg-neutral-950 border border-white/5 rounded-2xl shadow-2xl flex flex-col overflow-hidden z-[100]"
            style={{ bottom: '96px', right: '24px' }}
          >
            <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between bg-neutral-950">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-neutral-800 border border-white/10 flex items-center justify-center text-sm">
                  🔥
                </div>
                <div>
                  <h3 className="text-[15px] font-bold text-white">Chimchar AI</h3>
                  <p className="text-xs text-neutral-500 font-medium uppercase tracking-widest">Your Financial Guide</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-neutral-800 text-neutral-500 transition-colors bg-transparent border-none cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex px-4 pt-3 gap-6 border-b border-white/5">
              {['chat', 'suggestions', 'insights'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-2 text-[13px] font-medium capitalize tracking-wide transition-colors bg-transparent border-none cursor-pointer ${activeTab === tab ? 'text-white font-semibold border-b border-white' : 'text-neutral-500 hover:text-neutral-300'}`}
                  style={{ fontFamily: 'inherit' }}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-4 scrollbar-hide bg-neutral-950">
              {activeTab === 'chat' && (
                <div className="space-y-4">
                  {messages.map(msg => (
                    <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] text-sm leading-relaxed ${msg.role === 'user' ? 'bg-neutral-800 text-white rounded-2xl rounded-br-md p-3' : 'bg-neutral-900 text-neutral-300 rounded-2xl rounded-bl-md p-4'}`}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-neutral-900 rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-1.5">
                        <motion.div className="w-1.5 h-1.5 rounded-full bg-neutral-600" animate={{ y: [0,-2,0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} />
                        <motion.div className="w-1.5 h-1.5 rounded-full bg-neutral-600" animate={{ y: [0,-2,0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} />
                        <motion.div className="w-1.5 h-1.5 rounded-full bg-neutral-600" animate={{ y: [0,-2,0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} />
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}

              {activeTab === 'suggestions' && (
                <div className="space-y-3">
                  <div className="p-4 bg-white/[0.02] rounded-xl border border-white/[0.06]">
                    <p className="text-[11px] text-neutral-500 uppercase tracking-widest mb-1.5">Top Pick</p>
                    <p className="text-[14px] text-neutral-200 font-medium mb-3">Park ₹45k in Liquid Funds</p>
                    <button className="text-[13px] bg-white/[0.03] text-neutral-300 px-3 py-2 rounded-lg border border-white/[0.06] w-full hover:bg-white/[0.06] transition-colors cursor-pointer" style={{ fontFamily: 'inherit' }}>Execute strategy</button>
                  </div>
                  <div className="p-4 bg-white/[0.02] rounded-xl border border-white/[0.06]">
                    <p className="text-[11px] text-neutral-500 uppercase tracking-widest mb-1.5">Credit Task</p>
                    <p className="text-[14px] text-neutral-200 font-medium mb-3">Connect Utility Bill</p>
                    <button className="text-[13px] bg-white/[0.03] text-neutral-300 px-3 py-2 rounded-lg border border-white/[0.06] w-full hover:bg-white/[0.06] transition-colors cursor-pointer" style={{ fontFamily: 'inherit' }}>Boost Score</button>
                  </div>
                </div>
              )}

              {activeTab === 'insights' && (
                <div className="space-y-4">
                  <div>
                    <p className="text-[13px] text-neutral-500">Spending Behavior</p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <div className="h-2 flex-1 bg-neutral-800 rounded-full overflow-hidden">
                        <div className="h-full w-[60%] bg-emerald-400" />
                      </div>
                      <span className="text-[13px] text-neutral-300">Safe</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-[13px] text-neutral-500">Impulse Risk</p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <div className="h-2 flex-1 bg-neutral-800 rounded-full overflow-hidden">
                        <div className="h-full w-[30%] bg-neutral-400" />
                      </div>
                      <span className="text-[13px] text-neutral-300">Low</span>
                    </div>
                  </div>
                  <div className="bg-white/[0.02] border border-white/[0.06] p-4 rounded-xl mt-4">
                    <p className="text-[14px] text-neutral-400 leading-relaxed">
                      "You've shown excellent restraint this weekend. Maintaining this for 2 more weeks will positively impact your behavioral score tier."
                    </p>
                  </div>
                </div>
              )}
            </div>

            {activeTab === 'chat' && (
              <form onSubmit={handleSend} className="border-t border-white/5 bg-neutral-950 p-4">
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={inputVal}
                    onChange={e => setInputVal(e.target.value)}
                    placeholder="Ask Chimchar..."
                    className="flex-1 bg-black border border-white/5 rounded-full px-4 py-2 text-white text-sm placeholder:text-neutral-600 outline-none focus:border-neutral-700 transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={!inputVal.trim() || isTyping}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-600 hover:text-white transition-colors disabled:opacity-30 bg-transparent border-none cursor-pointer"
                  >
                    ↑
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
