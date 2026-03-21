/**
 * Feature: AI Chat — CreditMitra Floating Chat Bubble
 * Gemini-powered financial advisor that has context about the user's
 * profile and credit score. Floating bubble in bottom-right corner.
 */

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
      const res = await fetch('/api/chat', {
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

  // Quick suggestions
  const suggestions = language === 'hi'
    ? ['मेरा स्कोर कैसे सुधारूं?', 'बचत कैसे बढ़ाएं?', 'EMI क्या है?']
    : ['How to improve my score?', 'Explain my score factors', 'What is a good savings ratio?']

  return (
    <>
      {/* Floating bubble */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg z-50 flex items-center justify-center"
        style={{
          background: 'linear-gradient(135deg, var(--color-burnt-orange), var(--color-amber))',
          boxShadow: '0 4px 20px rgba(196, 101, 42, 0.4)',
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        animate={isOpen ? { rotate: 0 } : { rotate: 0 }}
      >
        <span className="text-2xl">{isOpen ? '✕' : '💬'}</span>
      </motion.button>

      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed bottom-24 right-6 w-96 max-w-[calc(100vw-2rem)] z-50 rounded-2xl overflow-hidden"
            style={{
              background: 'var(--color-bg-secondary)',
              border: '1px solid var(--color-border)',
              boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
            }}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25 }}
          >
            {/* Header */}
            <div className="px-4 py-3 flex items-center gap-3"
              style={{ background: 'linear-gradient(135deg, rgba(196,101,42,0.2), rgba(212,168,67,0.1))' }}>
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-lg"
                style={{ background: 'linear-gradient(135deg, var(--color-burnt-orange), var(--color-amber))' }}>
                🤖
              </div>
              <div>
                <p className="font-semibold text-sm">CreditMitra</p>
                <p className="text-xs text-[var(--color-text-muted)]">AI Financial Advisor</p>
              </div>
              <div className="ml-auto flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-xs text-green-400">Online</span>
              </div>
            </div>

            {/* Messages */}
            <div className="h-80 overflow-y-auto px-4 py-3 space-y-3"
              style={{ scrollbarWidth: 'thin' }}>
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'rounded-br-md'
                        : 'rounded-bl-md'
                    }`}
                    style={{
                      background: msg.role === 'user'
                        ? 'linear-gradient(135deg, var(--color-burnt-orange), var(--color-amber))'
                        : 'rgba(255,255,255,0.06)',
                      color: msg.role === 'user' ? 'white' : 'var(--color-text-primary)',
                      border: msg.role === 'user' ? 'none' : '1px solid var(--color-border)',
                    }}
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
                  <div className="rounded-2xl rounded-bl-md px-4 py-3 text-sm"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--color-border)' }}>
                    <div className="flex gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-[var(--color-gold)] animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 rounded-full bg-[var(--color-gold)] animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 rounded-full bg-[var(--color-gold)] animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestions */}
            {messages.length <= 2 && (
              <div className="px-4 pb-2 flex flex-wrap gap-1.5">
                {suggestions.map((sug, i) => (
                  <button
                    key={i}
                    onClick={() => { setInput(sug); sendMessage({ preventDefault: () => {} }) }}
                    className="text-xs px-2.5 py-1.5 rounded-full transition-colors"
                    style={{
                      background: 'rgba(196,101,42,0.1)',
                      border: '1px solid rgba(196,101,42,0.3)',
                      color: 'var(--color-gold)',
                    }}
                  >
                    {sug}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <form onSubmit={sendMessage} className="px-3 pb-3">
              <div className="flex gap-2 items-center rounded-xl px-3 py-2"
                style={{ background: 'var(--color-bg-primary)', border: '1px solid var(--color-border)' }}>
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={language === 'hi' ? 'कोई सवाल पूछें...' : 'Ask a question...'}
                  disabled={loading}
                  className="flex-1 bg-transparent text-sm outline-none text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)]"
                />
                <motion.button
                  type="submit"
                  disabled={!input.trim() || loading}
                  className="w-8 h-8 rounded-lg flex items-center justify-center disabled:opacity-30"
                  style={{ background: 'linear-gradient(135deg, var(--color-burnt-orange), var(--color-amber))' }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <span className="text-white text-sm">↑</span>
                </motion.button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
