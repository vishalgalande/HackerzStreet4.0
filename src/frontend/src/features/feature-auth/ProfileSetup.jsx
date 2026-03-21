/**
 * Feature: Auth — ProfileSetup
 * First-time onboarding form for new users.
 * Collects: income, employment type, existing debt, rent history, bill payment, telecom.
 * 
 * TODO (Teammate 2):
 * - Add validation and error messages
 * - Add income range slider for irregular earners
 * - Save to Supabase via POST /api/profile
 */

import { useState } from 'react'
import { useAuth } from './AuthContext'

export default function ProfileSetup() {
  const { getToken, setProfile, setAuthState } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    monthly_income: '',
    employment_type: 'none',
    existing_debt: '0',
    rent_history: 'consistent',
    bill_payment: 'always_on_time',
    telecom_regularity: false,
  })

  function handleChange(field, value) {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const token = getToken()
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          monthly_income: parseFloat(formData.monthly_income) || 0,
          existing_debt: parseFloat(formData.existing_debt) || 0,
        }),
      })

      if (response.ok) {
        setProfile(formData)
        setAuthState('authenticated')
      } else {
        const data = await response.json()
        setError(data.detail || 'Failed to save profile')
      }
    } catch {
      setError('Could not connect to server. Profile saved locally.')
      // Fallback: save locally for demo
      setProfile(formData)
      setAuthState('authenticated')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass rounded-2xl p-8 w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-2">Set Up Your Profile</h2>
        <p className="text-[var(--color-text-secondary)] mb-6">
          Tell us about your financial situation to get your credit score.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Monthly Income */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
              Monthly Income (₹)
            </label>
            <input
              type="number"
              value={formData.monthly_income}
              onChange={(e) => handleChange('monthly_income', e.target.value)}
              required
              min="0"
              className="w-full px-4 py-3 rounded-lg bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
              placeholder="e.g., 25000"
            />
          </div>

          {/* Employment Type */}
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

          {/* Existing Debt */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
              Monthly EMI / Debt (₹)
            </label>
            <input
              type="number"
              value={formData.existing_debt}
              onChange={(e) => handleChange('existing_debt', e.target.value)}
              min="0"
              className="w-full px-4 py-3 rounded-lg bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
              placeholder="0"
            />
          </div>

          {/* Rent History */}
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

          {/* Bill Payment */}
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

          {/* Telecom Regularity */}
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
