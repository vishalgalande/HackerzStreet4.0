import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../feature-auth/AuthContext'

export default function ChatBubble({ scoreResult, language = 'en' }) {
  const { profile, getToken } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: language === 'hi'
        ? 'नमस्ते! 🙏 मैं CreditMitra हूँ — आपका AI वित्तीय सलाहकार। अपने क्रेडिट स्कोर, बचत, या किसी भी वित्तीय सवाल के बारे में पूछें!'
        : 'Hi! 👋 I\'m CreditMitra — your AI financial advisor. Ask me about your credit score, savings tips, or any finance question!'
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('chat')
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (isOpen) inputRef.current?.focus()
  }, [isOpen])

  async function sendMessage(e) {
    e?.preventDefault()
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setLoading(true)

    try {
      const token = getToken()
      const API = import.meta.env.VITE_API_URL || ''
      const res = await fetch(`${API}/api/chat`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          history: messages.slice(-10).map(m => ({ role: m.role, content: m.content })),
          profile: profile || null,
          score_result: scoreResult || null,
          language,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setMessages(prev => [...prev, { role: 'assistant', content: data.reply }])
      } else {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: 'Sorry, I couldn\'t process that right now. Please try again. 🙏'
        }])
      }
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Could not connect to the AI service. Make sure the backend is running.'
      }])
    } finally {
      setLoading(false)
    }
  }

  const suggestions = language === 'hi'
    ? ['मेरा स्कोर कैसे सुधारूं?', 'बचत कैसे बढ़ाएं?', 'EMI क्या है?']
    : ['How to improve my score?', 'Explain my score factors', 'What is a good savings ratio?']

  const tabItems = [
    { id: 'chat', label: 'Chat' },
    { id: 'suggestions', label: 'Suggestions' },
    { id: 'insights', label: 'Insights' },
  ]

  return (
    <>
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-2xl z-50 flex items-center justify-center bg-neutral-800 border border-white/10"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <span className="text-2xl">{isOpen ? '✕' : '💬'}</span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed bottom-24 right-6 w-96 max-w-[calc(100vw-2rem)] z-50 rounded-2xl overflow-hidden bg-neutral-950 border border-white/5 shadow-2xl"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25 }}
          >
            <div className="px-4 py-3 flex items-center gap-3 border-b border-white/5 bg-neutral-950">
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-lg bg-neutral-800 border border-white/10">
                🤖
              </div>
              <div>
                <p className="font-semibold text-sm text-white">CreditMitra</p>
                <p className="text-xs text-neutral-500 font-medium uppercase tracking-widest">Your Financial Guide</p>
              </div>
              <div className="ml-auto flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-xs text-neutral-500">Online</span>
              </div>
            </div>

            <div className="flex items-center gap-6 px-4 pt-3 border-b border-white/5">
              {tabItems.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`pb-2 text-xs font-medium transition-colors bg-transparent border-none cursor-pointer ${
                    activeTab === tab.id
                      ? 'text-white font-semibold border-b border-white'
                      : 'text-neutral-500 hover:text-neutral-300'
                  }`}
                  style={{ fontFamily: 'inherit' }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTab === 'chat' && (
              <>
                <div className="h-80 overflow-y-auto px-4 py-3 space-y-3 bg-neutral-950" style={{ scrollbarWidth: 'thin' }}>
                  {messages.map((msg, i) => (
                    <motion.div
                      key={i}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl text-sm leading-relaxed ${
                          msg.role === 'user'
                            ? 'bg-neutral-800 text-white p-3 rounded-br-md'
                            : 'bg-neutral-900 text-neutral-300 p-4 rounded-bl-md'
                        }`}
                      >
                        {msg.content.split('\n').map((line, j) => (
                          <span key={j}>
                            {line}
                            {j < msg.content.split('\n').length - 1 && <br />}
                          </span>
                        ))}
                      </div>
                    </motion.div>
                  ))}

                  {loading && (
                    <div className="flex justify-start">
                      <div className="bg-neutral-900 rounded-2xl rounded-bl-md px-4 py-3 text-sm">
                        <div className="flex gap-1.5">
                          <div className="w-2 h-2 rounded-full bg-neutral-600 animate-bounce" style={{ animationDelay: '0ms' }} />
                          <div className="w-2 h-2 rounded-full bg-neutral-600 animate-bounce" style={{ animationDelay: '150ms' }} />
                          <div className="w-2 h-2 rounded-full bg-neutral-600 animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {messages.length <= 2 && (
                  <div className="px-4 pb-2 flex flex-wrap gap-1.5">
                    {suggestions.map((sug, i) => (
                      <button
                        key={i}
                        onClick={() => { setInput(sug); sendMessage({ preventDefault: () => {} }) }}
                        className="text-xs px-2.5 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.06] text-neutral-400 hover:text-neutral-200 hover:bg-white/[0.06] transition-colors cursor-pointer"
                        style={{ fontFamily: 'inherit' }}
                      >
                        {sug}
                      </button>
                    ))}
                  </div>
                )}

                <form onSubmit={sendMessage} className="border-t border-white/5 bg-neutral-950 p-4">
                  <div className="flex gap-2 items-center">
                    <input
                      ref={inputRef}
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder={language === 'hi' ? 'कोई सवाल पूछें...' : 'Ask a question...'}
                      disabled={loading}
                      className="flex-1 bg-black border border-white/5 rounded-full px-4 py-2 text-white text-sm placeholder:text-neutral-600 outline-none focus:border-neutral-700 transition-colors"
                    />
                    <button
                      type="submit"
                      disabled={!input.trim() || loading}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-600 hover:text-white transition-colors disabled:opacity-30 bg-transparent border-none cursor-pointer"
                    >
                      <span className="text-sm">↑</span>
                    </button>
                  </div>
                </form>
              </>
            )}

            {activeTab === 'suggestions' && (
              <div className="h-80 overflow-y-auto px-4 py-4 space-y-2 bg-neutral-950">
                {suggestions.map((sug, i) => (
                  <button
                    key={i}
                    onClick={() => { setActiveTab('chat'); setInput(sug); sendMessage({ preventDefault: () => {} }) }}
                    className="w-full text-left text-sm px-4 py-3 rounded-xl bg-neutral-900 text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors cursor-pointer border-none"
                    style={{ fontFamily: 'inherit' }}
                  >
                    {sug}
                  </button>
                ))}
              </div>
            )}

            {activeTab === 'insights' && (
              <div className="h-80 overflow-y-auto px-4 py-4 bg-neutral-950">
                <p className="text-sm text-neutral-500 text-center mt-16">
                  {scoreResult
                    ? `Your score is ${scoreResult.score} (${scoreResult.band}). Ask CreditMitra for personalized tips.`
                    : 'Compute your score first to unlock AI insights.'}
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
