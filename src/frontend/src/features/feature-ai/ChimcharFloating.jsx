import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../feature-auth/AuthContext'

export default function ChimcharFloating() {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('chat') // chat | suggestions | insights
  const [messages, setMessages] = useState([
    { id: '1', role: 'assistant', text: "Hey! I'm Chimchar 🔥, your financial guide. How can I help you today?" }
  ])
  const [inputVal, setInputVal] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping, activeTab, isOpen])

  const handleSend = (e) => {
    e.preventDefault()
    if (!inputVal.trim()) return
    
    setMessages(p => [...p, { id: Date.now().toString(), role: 'user', text: inputVal }])
    setInputVal('')
    setIsTyping(true)
    
    setTimeout(() => {
      setIsTyping(false)
      setMessages(p => [...p, { id: (Date.now()+1).toString(), role: 'assistant', text: "I'm analyzing your profile to provide the best strategy. In the meantime, check out my Suggestions tab for quick wins!" }])
    }, 1200)
  }

  return (
    <>
      {/* Floating Button */}
      <motion.button
        className="fixed w-14 h-14 rounded-full bg-slate-900 border border-orange-500/30 flex items-center justify-center shadow-[0_0_20px_rgba(234,88,12,0.3)] z-[100] group"
        style={{ bottom: '24px', right: '24px' }}
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <motion.div
          className="absolute inset-0 rounded-full bg-orange-500/20 blur-md"
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <span className="relative text-2xl group-hover:scale-110 transition-transform">🔥</span>
        
        {/* Unread dot */}
        {!isOpen && <div className="absolute top-0 right-0 w-3.5 h-3.5 bg-rose-500 border-2 border-slate-900 rounded-full" />}
      </motion.button>

      {/* Floating Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', bounce: 0.3, duration: 0.5 }}
            className="fixed w-[400px] h-[540px] bg-slate-900/95 backdrop-blur-xl border border-orange-500/20 rounded-2xl shadow-2xl flex flex-col overflow-hidden z-[100]"
            style={{ bottom: '96px', right: '24px' }}
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-orange-500/10 flex items-center justify-between bg-slate-800/50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-sm shadow-[0_0_10px_rgba(234,88,12,0.4)]">
                  🔥
                </div>
                <div>
                  <h3 className="text-[15px] font-bold text-slate-100">Chimchar AI</h3>
                  <p className="text-[12px] text-orange-400">Your Financial Guide</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-700/50 text-slate-400 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Tabs */}
            <div className="flex px-2 pt-2 gap-1 border-b border-slate-800">
              {['chat', 'suggestions', 'insights'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 pb-2.5 text-[13px] font-medium capitalize tracking-wide transition-colors relative ${activeTab === tab ? 'text-orange-400' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  {tab}
                  {activeTab === tab && (
                    <motion.div layoutId="chimcharTab" className="absolute bottom-0 left-2 right-2 h-[2px] bg-orange-500 rounded-t-full" />
                  )}
                </button>
              ))}
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
              {activeTab === 'chat' && (
                <div className="space-y-4">
                  {messages.map(msg => (
                    <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-[15px] leading-relaxed ${msg.role === 'user' ? 'bg-slate-700 text-white rounded-tr-sm' : 'bg-slate-800/80 border border-orange-500/20 text-slate-200 rounded-tl-sm'}`}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-slate-800/80 border border-orange-500/20 px-3 py-2.5 rounded-2xl rounded-tl-sm flex items-center gap-1 w-12 h-9">
                        <motion.div className="w-1.5 h-1.5 rounded-full bg-orange-400" animate={{ y: [0,-2,0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} />
                        <motion.div className="w-1.5 h-1.5 rounded-full bg-orange-400" animate={{ y: [0,-2,0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} />
                        <motion.div className="w-1.5 h-1.5 rounded-full bg-orange-400" animate={{ y: [0,-2,0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} />
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}

              {activeTab === 'suggestions' && (
                <div className="space-y-3">
                  <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700">
                    <p className="text-[12px] text-teal-400 uppercase tracking-widest mb-1.5">Top Pick</p>
                    <p className="text-[15px] text-slate-200 font-medium mb-3">Park ₹45k in Liquid Funds</p>
                    <button className="text-[13px] bg-teal-500/10 text-teal-400 px-3 py-2 rounded-lg border border-teal-500/30 w-full hover:bg-teal-500/20 transition">Execute strategy</button>
                  </div>
                  <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700">
                    <p className="text-[12px] text-orange-400 uppercase tracking-widest mb-1.5">Credit Task</p>
                    <p className="text-[15px] text-slate-200 font-medium mb-3">Connect Utility Bill</p>
                    <button className="text-[13px] bg-orange-500/10 text-orange-400 px-3 py-2 rounded-lg border border-orange-500/30 w-full hover:bg-orange-500/20 transition">Boost Score</button>
                  </div>
                </div>
              )}

              {activeTab === 'insights' && (
                <div className="space-y-4">
                  <div>
                    <p className="text-[13px] text-slate-500">Spending Behavior</p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <div className="h-2 flex-1 bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full w-[60%] bg-emerald-400" />
                      </div>
                      <span className="text-[13px] text-slate-300">Safe</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-[13px] text-slate-500">Impulse Risk</p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <div className="h-2 flex-1 bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full w-[30%] bg-orange-400" />
                      </div>
                      <span className="text-[13px] text-slate-300">Low</span>
                    </div>
                  </div>
                  <div className="bg-orange-500/5 border border-orange-500/20 p-4 rounded-lg mt-4">
                    <p className="text-[14px] text-slate-300 leading-relaxed">
                      "You've shown excellent restraint this weekend. Maintaining this for 2 more weeks will positively impact your behavioral score tier."
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Input Footer (Only on Chat tab) */}
            {activeTab === 'chat' && (
              <form onSubmit={handleSend} className="p-3 border-t border-slate-800 bg-slate-900">
                <div className="relative">
                  <input
                    type="text"
                    value={inputVal}
                    onChange={e => setInputVal(e.target.value)}
                    placeholder="Ask Chimchar..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-4 pr-10 py-3 text-[15px] text-white placeholder-slate-500 focus:outline-none focus:border-orange-500/50"
                  />
                  <button
                    type="submit"
                    disabled={!inputVal.trim() || isTyping}
                    className="absolute right-1.5 top-1.5 bottom-1.5 w-7 flex items-center justify-center bg-orange-500/20 text-orange-400 rounded-lg disabled:opacity-30 transition-colors hover:bg-orange-500 hover:text-white"
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
