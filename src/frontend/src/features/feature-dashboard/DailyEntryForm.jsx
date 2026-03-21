/**
 * Feature: Dashboard — DailyEntryForm
 * Premium modal form with animated focus states, smart validation,
 * and dark autumn styling.
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../feature-auth/AuthContext'

export default function DailyEntryForm({ onSave, onCancel }) {
  const { getToken } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    rent: '0',
    food: '',
    transport: '',
    discretionary: '0',
    savings: '',
    bill_paid_on_time: true,
    notes: '',
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
      const response = await fetch('/api/entries', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          rent: parseFloat(formData.rent) || 0,
          food: parseFloat(formData.food) || 0,
          transport: parseFloat(formData.transport) || 0,
          discretionary: parseFloat(formData.discretionary) || 0,
          savings: parseFloat(formData.savings) || 0,
          notes: formData.notes || null,
        }),
      })

      if (response.ok) {
        setSuccess(true)
        setTimeout(() => onSave?.(), 500)
      } else {
        const data = await response.json()
        setError(data.detail || 'Failed to save entry')
      }
    } catch {
      setError('Could not connect to server')
    } finally {
      setLoading(false)
    }
  }

  const inputFields = [
    { field: 'food', label: '🍲 Food', icon: '🍲' },
    { field: 'transport', label: '🚗 Transport', icon: '🚗' },
    { field: 'discretionary', label: '🛍️ Discretionary', icon: '🛍️' },
    { field: 'rent', label: '🏠 Rent', icon: '🏠' },
  ]

  return (
    <motion.div
      className="glass-card rounded-2xl p-6"
      initial={{ scale: 0.95 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <span className="text-[var(--color-gold)]">◎</span>
          Log Daily Entry
        </h3>
        <motion.button
          onClick={onCancel}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--color-text-muted)] hover:text-white transition-colors"
          style={{ border: '1px solid var(--color-border)' }}
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
        >
          ✕
        </motion.button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Date */}
        <div>
          <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1.5">Date</label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => handleChange('date', e.target.value)}
            className="input-field text-sm"
          />
        </div>

        {/* Expenses grid */}
        <div className="grid grid-cols-2 gap-3">
          {inputFields.map(({ field, label }) => (
            <div key={field}>
              <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1.5">
                {label} (₹)
              </label>
              <input
                type="number"
                value={formData[field]}
                onChange={(e) => handleChange(field, e.target.value)}
                min="0"
                placeholder="0"
                className="input-field text-sm"
              />
            </div>
          ))}
        </div>

        {/* Savings */}
        <div>
          <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1.5">
            💰 Savings (₹)
          </label>
          <input
            type="number"
            value={formData.savings}
            onChange={(e) => handleChange('savings', e.target.value)}
            min="0"
            placeholder="0"
            className="input-field text-sm"
          />
        </div>

        {/* Bill payment */}
        <label className="flex items-center gap-3 cursor-pointer group">
          <div className="relative">
            <input
              type="checkbox"
              checked={formData.bill_paid_on_time}
              onChange={(e) => handleChange('bill_paid_on_time', e.target.checked)}
              className="sr-only"
            />
            <div
              className="w-10 h-6 rounded-full transition-all"
              style={{
                background: formData.bill_paid_on_time
                  ? 'linear-gradient(135deg, var(--color-burnt-orange), var(--color-gold))'
                  : 'var(--color-bg-elevated)',
                border: `1px solid ${formData.bill_paid_on_time ? 'transparent' : 'var(--color-border)'}`,
              }}
            >
              <motion.div
                className="w-4 h-4 rounded-full bg-white mt-0.5"
                animate={{ x: formData.bill_paid_on_time ? 20 : 4 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            </div>
          </div>
          <span className="text-sm text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)] transition-colors">
            Paid a bill on time today
          </span>
        </label>

        {/* Notes */}
        <div>
          <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1.5">
            Notes (optional)
          </label>
          <input
            type="text"
            value={formData.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            placeholder="e.g., Paid electricity bill"
            className="input-field text-sm"
          />
        </div>

        {/* Error / Success */}
        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-sm"
              style={{ color: '#b83a2a' }}
            >
              {error}
            </motion.p>
          )}
          {success && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-[#10B981]"
            >
              ✓ Entry saved successfully!
            </motion.p>
          )}
        </AnimatePresence>

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          <motion.button
            type="submit"
            disabled={loading}
            className="flex-1 btn-primary py-3 disabled:opacity-50"
            whileHover={!loading ? { scale: 1.02 } : {}}
            whileTap={!loading ? { scale: 0.98 } : {}}
          >
            {loading ? 'Saving...' : 'Save Entry'}
          </motion.button>
          <motion.button
            type="button"
            onClick={onCancel}
            className="btn-secondary px-6 py-3"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Cancel
          </motion.button>
        </div>
      </form>
    </motion.div>
  )
}
