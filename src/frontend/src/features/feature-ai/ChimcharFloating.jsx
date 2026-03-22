import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../feature-auth/AuthContext'
import usePayments from '../feature-payments/usePayments'

const API = import.meta.env.VITE_API_URL || ''

function renderMarkdown(text) {
  if (!text) return text
  const lines = text.split('\n')
  const elements = []
  let listItems = []

  function flushList() {
    if (listItems.length > 0) {
      elements.push(<ul key={`ul-${elements.length}`} style={{ margin: '6px 0', paddingLeft: '18px', listStyleType: 'disc' }}>{listItems}</ul>)
      listItems = []
    }
  }

  function formatInline(str, keyPrefix) {
    const parts = []
    const regex = /\*\*(.+?)\*\*/g
    let lastIndex = 0
    let match
    let idx = 0
    while ((match = regex.exec(str)) !== null) {
      if (match.index > lastIndex) parts.push(str.slice(lastIndex, match.index))
      parts.push(<strong key={`${keyPrefix}-b${idx++}`} style={{ color: '#e5e5e5', fontWeight: 600 }}>{match[1]}</strong>)
      lastIndex = regex.lastIndex
    }
    if (lastIndex < str.length) parts.push(str.slice(lastIndex))
    return parts.length > 0 ? parts : str
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmed = line.trim()
    if (!trimmed) {
      flushList()
      continue
    }
    const bulletMatch = trimmed.match(/^[\*\-•]\s+(.*)/)
    if (bulletMatch) {
      listItems.push(<li key={`li-${i}`} style={{ marginBottom: '4px' }}>{formatInline(bulletMatch[1], `li-${i}`)}</li>)
    } else {
      flushList()
      elements.push(<p key={`p-${i}`} style={{ margin: '4px 0', lineHeight: 1.6 }}>{formatInline(trimmed, `p-${i}`)}</p>)
    }
  }
  flushList()
  return elements
}

export default function ChimcharFloating() {
  const [isOpen, setIsOpen] = useState(false)
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
  }, [messages, isTyping, isOpen])

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
            className="fixed bg-neutral-950 border border-white/5 rounded-2xl shadow-2xl flex flex-col overflow-hidden z-[100]"
            style={{ bottom: '96px', right: '24px', width: '380px', height: '520px', maxWidth: 'calc(100vw - 48px)', maxHeight: 'calc(100vh - 120px)' }}
          >
            <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between bg-neutral-950 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-neutral-800 border border-white/10 flex items-center justify-center text-sm shrink-0">
                  🔥
                </div>
                <div style={{ minWidth: 0 }}>
                  <h3 className="text-[14px] font-bold text-white" style={{ margin: 0 }}>Chimchar AI</h3>
                  <p className="text-[10px] text-neutral-500 font-medium uppercase tracking-widest" style={{ margin: 0 }}>Your Financial Guide</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-neutral-800 text-neutral-500 transition-colors bg-transparent border-none cursor-pointer shrink-0"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 bg-neutral-950" style={{ minHeight: 0 }}>
              <div className="flex flex-col gap-3">
                {messages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`text-[13px] leading-relaxed ${msg.role === 'user' ? 'bg-neutral-800 text-white rounded-2xl rounded-br-md' : 'bg-neutral-900 text-neutral-300 rounded-2xl rounded-bl-md'}`}
                      style={{ maxWidth: '85%', padding: '10px 14px', wordBreak: 'break-word', overflow: 'hidden' }}
                    >
                      {msg.role === 'assistant' ? renderMarkdown(msg.text) : msg.text}
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
            </div>

            <form onSubmit={handleSend} className="border-t border-white/5 bg-neutral-950 p-3 shrink-0">
              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  value={inputVal}
                  onChange={e => setInputVal(e.target.value)}
                  placeholder="Ask Chimchar..."
                  className="flex-1 bg-black border border-white/5 rounded-full px-4 py-2 text-white text-sm placeholder:text-neutral-600 outline-none focus:border-neutral-700 transition-colors"
                  style={{ minWidth: 0 }}
                />
                <button
                  type="submit"
                  disabled={!inputVal.trim() || isTyping}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-600 hover:text-white transition-colors disabled:opacity-30 bg-transparent border-none cursor-pointer shrink-0"
                >
                  ↑
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
