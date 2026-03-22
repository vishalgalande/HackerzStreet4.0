/**
 * Feature: Auth — AuthPage
 * Premium login & sign-up inspired by Proximity's glassmorphic card aesthetic.
 * Centered dark card with warm amber/orange accents matching the FinFix design system.
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from './AuthContext'

export default function AuthPage({ initialMode = 'login' }) {
  const { signIn, signUp } = useAuth()
  const [isLogin, setIsLogin] = useState(initialMode === 'login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [signupSuccess, setSignupSuccess] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error: authError } = isLogin
      ? await signIn(email, password)
      : await signUp(email, password)

    if (authError) {
      setError(authError.message)
    } else if (!isLogin) {
      // Signup succeeded — show verification message
      setSignupSuccess(true)
    }

    setLoading(false)
  }

  function fillDemo() {
    setEmail('abc@gmail.com')
    setPassword('123456')
  }

  const cardStyle = {
    background: 'rgba(18, 18, 18, 0.85)',
    backdropFilter: 'blur(40px)',
    WebkitBackdropFilter: 'blur(40px)',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    borderRadius: '24px',
    padding: '48px 40px',
    width: '100%',
    maxWidth: '440px',
  }

  const inputStyle = {
    width: '100%',
    padding: '14px 16px',
    borderRadius: '12px',
    background: 'rgba(28, 28, 28, 0.8)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    color: '#EDEDED',
    fontSize: '15px',
    outline: 'none',
    transition: 'border-color 0.2s ease',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
  }

  const inputFocusStyle = {
    borderColor: '#FF8C00',
    boxShadow: '0 0 0 1px rgba(255, 140, 0, 0.3)',
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        background: 'radial-gradient(ellipse at 50% 0%, rgba(255, 140, 0, 0.06) 0%, #0B0B0B 70%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Ambient glow */}
      <div style={{
        position: 'absolute', top: '-200px', left: '50%', transform: 'translateX(-50%)',
        width: '600px', height: '400px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255, 140, 0, 0.08) 0%, transparent 70%)',
        filter: 'blur(80px)', pointerEvents: 'none',
      }} />

      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
      >
        <img src="/logo.png" alt="FinFix" style={{ height: '36px', width: 'auto' }} />
        <span style={{ fontSize: '20px', fontWeight: 700, color: '#EDEDED', letterSpacing: '-0.02em' }}>FinFix</span>
      </motion.div>

      {/* Auth Card */}
      <motion.div
        key={signupSuccess ? 'success' : isLogin ? 'login' : 'signup'}
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        style={cardStyle}
      >
        {signupSuccess ? (
          /* ── Email Verification Notice ── */
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📧</div>
            <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#EDEDED', marginBottom: '12px' }}>
              Verify Your Email
            </h2>
            <p style={{ color: '#999', fontSize: '15px', lineHeight: '1.6', marginBottom: '8px' }}>
              We've sent a verification link to
            </p>
            <p style={{ color: '#FFC857', fontSize: '15px', fontWeight: 600, marginBottom: '20px' }}>
              {email}
            </p>
            <p style={{ color: '#888', fontSize: '14px', lineHeight: '1.6', marginBottom: '28px' }}>
              Please check your inbox (and spam folder) and click the link to verify your account.
              You must verify your email before you can log in.
            </p>
            <button
              onClick={() => { setSignupSuccess(false); setIsLogin(true); setError(''); setPassword('') }}
              style={{
                width: '100%', padding: '14px', borderRadius: '12px', border: 'none',
                background: 'linear-gradient(135deg, #FF8C00, #FFC857)',
                color: '#0B0B0B', fontSize: '15px', fontWeight: 700, cursor: 'pointer',
              }}
            >
              Go to Sign In →
            </button>
          </div>
        ) : (
        <>
        {/* Heading */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#EDEDED', marginBottom: '8px' }}>
            {isLogin ? 'Welcome ' : 'Create '}
            <span style={{
              borderBottom: '3px solid #FF8C00',
              paddingBottom: '2px',
            }}>
              {isLogin ? 'Back' : 'Account'}
            </span>
          </h1>
          <p style={{ fontSize: '15px', color: '#666', margin: 0 }}>
            {isLogin ? 'Sign in to continue' : 'Join FinFix to take control of your finances'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Email */}
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#EDEDED', marginBottom: '8px' }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              style={inputStyle}
              onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
              onBlur={(e) => { e.target.style.borderColor = 'rgba(255, 255, 255, 0.08)'; e.target.style.boxShadow = 'none' }}
            />
          </div>

          {/* Password */}
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#EDEDED', marginBottom: '8px' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                placeholder="Enter your password"
                style={{ ...inputStyle, paddingRight: '48px' }}
                onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
                onBlur={(e) => { e.target.style.borderColor = 'rgba(255, 255, 255, 0.08)'; e.target.style.boxShadow = 'none' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', padding: '4px',
                  color: '#666', fontSize: '18px', lineHeight: 1,
                }}
                tabIndex={-1}
              >
                {showPassword ? '◡' : '◉'}
              </button>
            </div>
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={{
                  color: '#ef4444', fontSize: '14px', margin: 0,
                  padding: '10px 14px', borderRadius: '10px',
                  background: 'rgba(239, 68, 68, 0.08)',
                  border: '1px solid rgba(239, 68, 68, 0.15)',
                }}
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          {/* Submit */}
          <motion.button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '16px 0',
              borderRadius: '14px',
              border: 'none',
              fontSize: '16px',
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
              background: 'linear-gradient(135deg, #FF8C00, #FFC857)',
              color: '#0B0B0B',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 20px rgba(255, 140, 0, 0.3)',
              fontFamily: 'inherit',
            }}
            whileHover={!loading ? { scale: 1.01, boxShadow: '0 6px 28px rgba(255, 140, 0, 0.4)' } : {}}
            whileTap={!loading ? { scale: 0.99 } : {}}
          >
            {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
          </motion.button>
        </form>

        {/* Demo Credentials (Login only) */}
        {isLogin && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            style={{
              marginTop: '20px',
              borderRadius: '14px',
              border: '1px dashed rgba(255, 200, 87, 0.25)',
              background: 'rgba(255, 140, 0, 0.04)',
              padding: '16px',
              textAlign: 'center',
            }}
          >
            <p style={{ fontSize: '13px', fontWeight: 600, color: '#FFC857', marginBottom: '8px' }}>
              🏆 Hackathon Demo Credentials
            </p>
            <div
              onClick={fillDemo}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '12px',
                background: 'rgba(28, 28, 28, 0.6)',
                padding: '8px 16px', borderRadius: '8px',
                cursor: 'pointer', transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 140, 0, 0.08)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(28, 28, 28, 0.6)'}
            >
              <span style={{ fontSize: '14px', color: '#A1A1A1' }}>
                User: <strong style={{ color: '#EDEDED' }}>abc@gmail.com</strong> | Pass: <strong style={{ color: '#EDEDED' }}>123456</strong>
              </span>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#FF8C00', letterSpacing: '0.05em' }}>
                TAP TO FILL
              </span>
            </div>
          </motion.div>
        )}

        {/* Toggle */}
        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <span style={{ fontSize: '14px', color: '#666' }}>
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
          </span>
          <button
            onClick={() => { setIsLogin(!isLogin); setError('') }}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: '14px', fontWeight: 600, color: '#FF8C00',
              textDecoration: 'underline', textUnderlineOffset: '3px',
              fontFamily: 'inherit',
            }}
          >
            {isLogin ? 'Create one' : 'Sign in'}
          </button>
        </div>
        </>
        )}
      </motion.div>

      {/* Footer hint */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        style={{
          marginTop: '24px', fontSize: '13px', color: '#444',
          textAlign: 'center',
        }}
      >
        Your financial data stays private. Always.
      </motion.p>
    </div>
  )
}
