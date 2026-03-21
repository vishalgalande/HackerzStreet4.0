/**
 * Feature: Dashboard — DailyEntryForm
 * Form to log daily expenses, savings, and bill payment status.
 * Saves locally and returns entry to parent for localStorage persistence.
 */

import { useState } from 'react'

export default function DailyEntryForm({ onSave, onCancel }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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

  function handleSubmit(e) {
    e.preventDefault()
    setError('')

    const food = parseFloat(formData.food) || 0
    const transport = parseFloat(formData.transport) || 0

    if (food === 0 && transport === 0) {
      setError('Please enter at least food or transport expenses')
      return
    }

    // Build entry object with a unique ID
    const entry = {
      id: `entry_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      date: formData.date,
      rent: parseFloat(formData.rent) || 0,
      food,
      transport,
      discretionary: parseFloat(formData.discretionary) || 0,
      savings: parseFloat(formData.savings) || 0,
      bill_paid_on_time: formData.bill_paid_on_time,
      notes: formData.notes || null,
      created_at: new Date().toISOString(),
    }

    // Return to parent — parent handles localStorage + backend sync
    onSave?.(entry)
  }

  return (
    <div className="glass rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Log Daily Entry</h3>
        <button
          onClick={onCancel}
          className="text-[var(--color-text-muted)] hover:text-white text-xl"
        >
          ✕
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Date</label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => handleChange('date', e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
          />
        </div>

        {/* Expenses grid */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">🍲 Food (₹)</label>
            <input
              type="number"
              value={formData.food}
              onChange={(e) => handleChange('food', e.target.value)}
              min="0"
              placeholder="0"
              className="w-full px-3 py-2.5 rounded-lg bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">🚗 Transport (₹)</label>
            <input
              type="number"
              value={formData.transport}
              onChange={(e) => handleChange('transport', e.target.value)}
              min="0"
              placeholder="0"
              className="w-full px-3 py-2.5 rounded-lg bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">🛍️ Discretionary (₹)</label>
            <input
              type="number"
              value={formData.discretionary}
              onChange={(e) => handleChange('discretionary', e.target.value)}
              min="0"
              placeholder="0"
              className="w-full px-3 py-2.5 rounded-lg bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">🏠 Rent (₹)</label>
            <input
              type="number"
              value={formData.rent}
              onChange={(e) => handleChange('rent', e.target.value)}
              min="0"
              placeholder="0"
              className="w-full px-3 py-2.5 rounded-lg bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
            />
          </div>
        </div>

        {/* Savings */}
        <div>
          <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">💰 Savings (₹)</label>
          <input
            type="number"
            value={formData.savings}
            onChange={(e) => handleChange('savings', e.target.value)}
            min="0"
            placeholder="0"
            className="w-full px-3 py-2.5 rounded-lg bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
          />
        </div>

        {/* Bill payment */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="bill"
            checked={formData.bill_paid_on_time}
            onChange={(e) => handleChange('bill_paid_on_time', e.target.checked)}
            className="w-5 h-5 rounded accent-[var(--color-primary)]"
          />
          <label htmlFor="bill" className="text-sm text-[var(--color-text-secondary)]">
            Paid a bill on time today
          </label>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Notes (optional)</label>
          <input
            type="text"
            value={formData.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            placeholder="e.g., Paid electricity bill"
            className="w-full px-3 py-2.5 rounded-lg bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
          />
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-3 rounded-lg gradient-primary text-white font-semibold hover:opacity-90 disabled:opacity-50"
          >
            Save Entry
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 rounded-lg glass text-[var(--color-text-secondary)] hover:bg-white/10"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
