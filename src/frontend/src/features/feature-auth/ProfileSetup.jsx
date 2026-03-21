/**
 * Feature: Auth — ProfileSetup
 * First-time onboarding form for new users.
 * 
 * Supports:
 * - Flexible income periods (monthly / quarterly / half-yearly) for freelancers
 * - Multiple EMI/loan entries with default loan categories
 * - Progressive disclosure: EMI section reveals after income is entered
 */

import { useState } from 'react'
import { useAuth } from './AuthContext'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const LOAN_PRESETS = [
  { id: 'personal', label: '💳 Personal Loan', icon: '💳' },
  { id: 'education', label: '🎓 Education Loan', icon: '🎓' },
  { id: 'two_wheeler', label: '🛵 Two-Wheeler Loan', icon: '🛵' },
  { id: 'phone', label: '📱 Phone EMI', icon: '📱' },
  { id: 'appliance', label: '🏠 Appliance EMI', icon: '🏠' },
  { id: 'gold', label: '✨ Gold Loan', icon: '✨' },
  { id: 'microfinance', label: '🏦 Microfinance Loan', icon: '🏦' },
  { id: 'custom', label: '➕ Other / Custom', icon: '➕' },
]

export default function ProfileSetup() {
  const { user, getToken, setProfile, setAuthState } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    income_amount: '',
    income_period: 'monthly', // monthly | quarterly | half_yearly
    employment_type: 'none',
    rent_history: 'consistent',
    bill_payment: 'always_on_time',
    telecom_regularity: false,
  })

  const [loans, setLoans] = useState([])
  const [showLoanPicker, setShowLoanPicker] = useState(false)

  // Compute monthly income from any period
  function getMonthlyIncome() {
    const amount = parseFloat(formData.income_amount) || 0
    switch (formData.income_period) {
      case 'quarterly': return Math.round(amount / 3)
      case 'half_yearly': return Math.round(amount / 6)
      default: return amount
    }
  }

  // Total monthly EMI across all loans
  function getTotalEMI() {
    return loans.reduce((sum, loan) => sum + (parseFloat(loan.emi) || 0), 0)
  }

  function handleChange(field, value) {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  function addLoan(presetId) {
    const preset = LOAN_PRESETS.find(p => p.id === presetId)
    setLoans(prev => [...prev, {
      id: `${presetId}_${Date.now()}`,
      type: presetId,
      label: preset?.label || 'Custom Loan',
      icon: preset?.icon || '💰',
      name: presetId === 'custom' ? '' : preset?.label.split(' ').slice(1).join(' '),
      emi: '',
    }])
    setShowLoanPicker(false)
  }

  function updateLoan(loanId, field, value) {
    setLoans(prev => prev.map(l =>
      l.id === loanId ? { ...l, [field]: value } : l
    ))
  }

  function removeLoan(loanId) {
    setLoans(prev => prev.filter(l => l.id !== loanId))
  }

  const isFreelancer = ['freelance', 'gig', 'self_employed'].includes(formData.employment_type)
  const hasIncome = parseFloat(formData.income_amount) > 0
  const monthlyIncome = getMonthlyIncome()
  const totalEMI = getTotalEMI()
  const dtiRatio = monthlyIncome > 0 ? Math.round((totalEMI / monthlyIncome) * 100) : 0

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const profileData = {
      ...formData,
      monthly_income: monthlyIncome,
      income_amount: parseFloat(formData.income_amount) || 0,
      existing_debt: totalEMI,
      loans: loans.map(l => ({
        type: l.type,
        name: l.name,
        emi: parseFloat(l.emi) || 0,
      })),
    }

    try {
      const token = getToken()
      // Add email from auth user
      profileData.email = user?.email || ''
      profileData.full_name = user?.user_metadata?.full_name || user?.email || ''

      const response = await fetch(`${API}/api/profile`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      })

      if (response.ok) {
        setProfile(profileData)
        setAuthState('authenticated')
      } else {
        const data = await response.json()
        setError(data.detail || 'Failed to save profile')
      }
    } catch {
      setError('Could not connect to server. Profile saved locally.')
      setProfile(profileData)
      setAuthState('authenticated')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass rounded-2xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-2">Set Up Your Profile</h2>
        <p className="text-[var(--color-text-secondary)] mb-6">
          Tell us about your financial situation to get your credit score.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* ── Employment Type ── */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
              Employment Type
            </label>
            <select
              value={formData.employment_type}
              onChange={(e) => handleChange('employment_type', e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
            >
              <option value="salaried">Salaried</option>
              <option value="freelance">Freelance</option>
              <option value="gig">Gig Worker</option>
              <option value="self_employed">Self Employed</option>
              <option value="none">None / Student</option>
            </select>
          </div>

          {/* ── Income Section ── */}
          <div className="glass-light rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">💰</span>
              <label className="text-sm font-semibold text-[var(--color-text-primary)]">
                Income
              </label>
            </div>

            {/* Income Period — show for freelancers/gig/self-employed */}
            {isFreelancer && (
              <div>
                <label className="block text-xs text-[var(--color-text-muted)] mb-1">
                  Since your income varies, pick the period you track best
                </label>
                <div className="flex gap-2">
                  {[
                    { value: 'monthly', label: 'Monthly' },
                    { value: 'quarterly', label: 'Quarterly' },
                    { value: 'half_yearly', label: 'Half-Yearly' },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => handleChange('income_period', opt.value)}
                      className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                        formData.income_period === opt.value
                          ? 'gradient-primary text-white'
                          : 'bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)] hover:bg-white/10'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Income Amount */}
            <div>
              <label className="block text-xs text-[var(--color-text-muted)] mb-1">
                {isFreelancer
                  ? `Average ${formData.income_period === 'monthly' ? 'monthly' : formData.income_period === 'quarterly' ? 'quarterly' : 'half-yearly'} income (₹)`
                  : 'Monthly income (₹)'}
              </label>
              <input
                type="number"
                value={formData.income_amount}
                onChange={(e) => handleChange('income_amount', e.target.value)}
                required
                min="0"
                className="w-full px-4 py-3 rounded-lg bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
                placeholder={isFreelancer ? 'e.g., 60000' : 'e.g., 25000'}
              />
              {isFreelancer && formData.income_period !== 'monthly' && hasIncome && (
                <p className="text-xs text-[var(--color-primary-light)] mt-1">
                  ≈ ₹{monthlyIncome.toLocaleString()}/month
                </p>
              )}
            </div>
          </div>

          {/* ── EMI / Loans Section — revealed after income is entered ── */}
          {hasIncome && (
            <div className="glass-light rounded-xl p-4 space-y-3 fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">📋</span>
                  <label className="text-sm font-semibold text-[var(--color-text-primary)]">
                    EMIs & Loans
                  </label>
                </div>
                {totalEMI > 0 && (
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    dtiRatio <= 30 ? 'bg-green-400/10 text-green-400' :
                    dtiRatio <= 50 ? 'bg-yellow-400/10 text-yellow-400' :
                    'bg-red-400/10 text-red-400'
                  }`}>
                    {dtiRatio}% of income
                  </span>
                )}
              </div>

              {loans.length === 0 && (
                <p className="text-xs text-[var(--color-text-muted)]">
                  No active loans? Great — that helps your score! Add any if you have them.
                </p>
              )}

              {/* Loan entries */}
              <div className="space-y-2">
                {loans.map((loan) => (
                  <div key={loan.id} className="flex items-center gap-2 bg-[var(--color-bg-elevated)] rounded-lg p-3">
                    <span className="text-xl shrink-0">{loan.icon}</span>
                    <div className="flex-1 min-w-0">
                      {loan.type === 'custom' ? (
                        <input
                          type="text"
                          value={loan.name}
                          onChange={(e) => updateLoan(loan.id, 'name', e.target.value)}
                          placeholder="Loan name"
                          className="w-full text-sm bg-transparent text-[var(--color-text-primary)] focus:outline-none border-b border-[var(--color-border)] pb-1 mb-1"
                        />
                      ) : (
                        <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">
                          {loan.name}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <span className="text-xs text-[var(--color-text-muted)]">₹</span>
                      <input
                        type="number"
                        value={loan.emi}
                        onChange={(e) => updateLoan(loan.id, 'emi', e.target.value)}
                        placeholder="EMI"
                        min="0"
                        className="w-20 text-sm px-2 py-1.5 rounded bg-[var(--color-bg-primary)] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
                      />
                      <span className="text-xs text-[var(--color-text-muted)]">/mo</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeLoan(loan.id)}
                      className="text-[var(--color-text-muted)] hover:text-red-400 transition-colors ml-1"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              {/* Add loan button / picker */}
              {showLoanPicker ? (
                <div className="grid grid-cols-2 gap-2 fade-in">
                  {LOAN_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => addLoan(preset.id)}
                      className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-[var(--color-bg-elevated)] hover:bg-white/10 transition-colors text-left"
                    >
                      <span>{preset.icon}</span>
                      <span className="text-sm text-[var(--color-text-secondary)]">
                        {preset.label.split(' ').slice(1).join(' ')}
                      </span>
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setShowLoanPicker(false)}
                    className="col-span-2 text-xs text-[var(--color-text-muted)] hover:text-white py-1"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowLoanPicker(true)}
                  className="w-full py-2.5 rounded-lg border border-dashed border-[var(--color-border)] text-sm text-[var(--color-text-secondary)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary-light)] transition-colors"
                >
                  + Add a Loan / EMI
                </button>
              )}

              {/* Total EMI summary */}
              {totalEMI > 0 && (
                <div className="flex items-center justify-between pt-2 border-t border-[var(--color-border)]">
                  <span className="text-sm text-[var(--color-text-secondary)]">Total monthly EMI</span>
                  <span className="text-sm font-bold text-[var(--color-text-primary)]">
                    ₹{totalEMI.toLocaleString()}/mo
                  </span>
                </div>
              )}
            </div>
          )}

          {/* ── Rent History ── */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
              Rent Payment History
            </label>
            <select
              value={formData.rent_history}
              onChange={(e) => handleChange('rent_history', e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
            >
              <option value="consistent">Always on time</option>
              <option value="occasional_gap">Occasional gap</option>
              <option value="irregular">Irregular</option>
            </select>
          </div>

          {/* ── Bill Payment ── */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
              Bill Payment Behavior
            </label>
            <select
              value={formData.bill_payment}
              onChange={(e) => handleChange('bill_payment', e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
            >
              <option value="always_on_time">Always on time</option>
              <option value="sometimes_late">Sometimes late</option>
              <option value="often_late">Often late</option>
            </select>
          </div>

          {/* ── Telecom ── */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="telecom"
              checked={formData.telecom_regularity}
              onChange={(e) => handleChange('telecom_regularity', e.target.checked)}
              className="w-5 h-5 rounded accent-[var(--color-primary)]"
            />
            <label htmlFor="telecom" className="text-sm text-[var(--color-text-secondary)]">
              I regularly pay my mobile/telecom bills
            </label>
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg gradient-primary text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save & Continue →'}
          </button>
        </form>
      </div>
    </div>
  )
}
