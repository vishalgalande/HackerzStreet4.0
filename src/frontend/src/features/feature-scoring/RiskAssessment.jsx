/**
 * Feature: Scoring — RiskAssessment
 * Lender-facing risk assessment panel with animated metrics.
 * Shows default probability, risk category, credit limit, interest rates,
 * repayment capacity, and risk signals.
 */

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const severityConfig = {
  high: { color: '#EF4444', icon: '🔴', label: 'High' },
  medium: { color: '#F59E0B', icon: '🟡', label: 'Medium' },
  positive: { color: '#10B981', icon: '🟢', label: 'Positive' },
}

function RiskMeter({ probability, color }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
  const angle = (probability / 100) * 180 // 0-180 degrees

  return (
    <div ref={ref} className="flex flex-col items-center">
      <svg width="180" height="100" viewBox="0 0 180 100">
        {/* Background arc */}
        <path
          d="M 10 90 A 80 80 0 0 1 170 90"
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="12"
          strokeLinecap="round"
        />
        {/* Filled arc */}
        <motion.path
          d="M 10 90 A 80 80 0 0 1 170 90"
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray="251"
          initial={{ strokeDashoffset: 251 }}
          animate={inView ? { strokeDashoffset: 251 - (probability / 100) * 251 } : {}}
          transition={{ duration: 1.5, ease: [0.4, 0, 0.2, 1] }}
          style={{ filter: `drop-shadow(0 0 8px ${color}40)` }}
        />
        {/* Center text */}
        <motion.text
          x="90" y="75"
          textAnchor="middle"
          fill="var(--color-text-primary)"
          fontSize="28"
          fontWeight="bold"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.8 }}
        >
          {probability}%
        </motion.text>
        <text
          x="90" y="92" textAnchor="middle"
          fill="var(--color-text-muted)" fontSize="10"
        >
          Default Probability
        </text>
      </svg>
    </div>
  )
}

export default function RiskAssessment({ riskData, language = 'en' }) {
  if (!riskData) return null

  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
  const { default_probability, risk_category, credit_limit, interest_rate, repayment_capacity, risk_signals } = riskData

  return (
    <motion.div
      ref={ref}
      className="glass-card rounded-xl p-6"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
    >
      <div className="flex items-center gap-2 mb-6">
        <span className="text-lg">🛡️</span>
        <h3 className="text-lg font-semibold">
          {language === 'hi' ? 'जोखिम मूल्यांकन' : 'Risk Assessment'}
        </h3>
        <span className="ml-auto text-xs px-2.5 py-1 rounded-full font-medium" style={{
          background: `${risk_category.color}20`,
          color: risk_category.color,
          border: `1px solid ${risk_category.color}40`,
        }}>
          {language === 'hi' ? risk_category.category_hi : risk_category.category}
        </span>
      </div>

      {/* Top row: Risk meter + Category description */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className="flex flex-col items-center">
          <RiskMeter probability={default_probability} color={risk_category.color} />
          <p className="text-xs text-[var(--color-text-muted)] text-center mt-2 max-w-[200px]">
            {language === 'hi' ? risk_category.description_hi : risk_category.description}
          </p>
        </div>

        {/* Key metrics */}
        <div className="space-y-4">
          {/* Credit Limit */}
          <motion.div
            className="rounded-lg p-3"
            style={{ background: 'rgba(26, 18, 9, 0.5)', border: '1px solid var(--color-border)' }}
            initial={{ opacity: 0, x: 20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.3 }}
          >
            <p className="text-xs text-[var(--color-text-muted)] mb-1">
              {language === 'hi' ? 'अनुशंसित ऋण सीमा' : 'Recommended Credit Limit'}
            </p>
            <p className="text-lg font-bold" style={{ color: '#d4a843' }}>
              {credit_limit.max > 0
                ? `₹${credit_limit.min.toLocaleString()} — ₹${credit_limit.max.toLocaleString()}`
                : 'Not eligible currently'}
            </p>
          </motion.div>

          {/* Interest Rate */}
          <motion.div
            className="rounded-lg p-3"
            style={{ background: 'rgba(26, 18, 9, 0.5)', border: '1px solid var(--color-border)' }}
            initial={{ opacity: 0, x: 20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.4 }}
          >
            <p className="text-xs text-[var(--color-text-muted)] mb-1">
              {language === 'hi' ? 'सुझाई गई ब्याज दर' : 'Suggested Interest Rate'}
            </p>
            <p className="text-lg font-bold">
              <span style={{ color: interest_rate.min_rate <= 16 ? '#10B981' : interest_rate.min_rate <= 22 ? '#F59E0B' : '#EF4444' }}>
                {interest_rate.min_rate}% — {interest_rate.max_rate}% APR
              </span>
              <span className="text-xs text-[var(--color-text-muted)] ml-2">({interest_rate.type})</span>
            </p>
          </motion.div>

          {/* Repayment Capacity */}
          <motion.div
            className="rounded-lg p-3"
            style={{ background: 'rgba(26, 18, 9, 0.5)', border: '1px solid var(--color-border)' }}
            initial={{ opacity: 0, x: 20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.5 }}
          >
            <p className="text-xs text-[var(--color-text-muted)] mb-1">
              {language === 'hi' ? 'EMI भुगतान क्षमता' : 'EMI Repayment Capacity'}
            </p>
            <div className="flex gap-4">
              <div>
                <p className="text-xs text-[var(--color-text-muted)]">Safe EMI</p>
                <p className="font-bold text-[#10B981]">₹{repayment_capacity.safe_emi.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-[var(--color-text-muted)]">Max EMI</p>
                <p className="font-bold text-[#F59E0B]">₹{repayment_capacity.max_emi.toLocaleString()}</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Risk Signals */}
      {risk_signals && risk_signals.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold mb-3 text-[var(--color-text-secondary)]">
            {language === 'hi' ? 'जोखिम संकेत' : 'Risk Signals'}
          </h4>
          <div className="space-y-2">
            {risk_signals.map((signal, i) => {
              const config = severityConfig[signal.severity] || severityConfig.medium
              return (
                <motion.div
                  key={i}
                  className="flex items-start gap-3 rounded-lg px-3 py-2.5 text-sm"
                  style={{ background: `${config.color}08`, border: `1px solid ${config.color}20` }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.6 + i * 0.08 }}
                >
                  <span className="text-xs mt-0.5">{config.icon}</span>
                  <div className="flex-1">
                    <p className="font-medium text-sm" style={{ color: config.color }}>
                      {language === 'hi' ? signal.signal_hi : signal.signal}
                    </p>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      {language === 'hi' ? signal.detail_hi : signal.detail}
                    </p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      )}

      {/* Model info */}
      <div className="mt-4 pt-3 border-t border-[var(--color-border)] flex items-center justify-between text-xs text-[var(--color-text-muted)]">
        <span>Model: Logistic Rule-Based v1.0</span>
        <span>Calibrated for Indian microfinance</span>
      </div>
    </motion.div>
  )
}
