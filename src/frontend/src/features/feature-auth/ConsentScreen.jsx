/**
 * Feature: Auth — ConsentScreen
 * DPDP Act 2023 consent dialog with explicit opt-in.
 * 
 * TODO (Teammate 2):
 * - Add full consent text
 * - Add link to privacy policy
 * - Track consent timestamp
 */

import { useState } from 'react'

export default function ConsentScreen({ onAccept, onDecline }) {
  const [accepted, setAccepted] = useState(false)

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass rounded-2xl p-8 w-full max-w-lg">
        <div className="text-3xl mb-4">🔒</div>
        <h2 className="text-xl font-bold mb-4">Data Processing Consent</h2>
        <p className="text-sm text-[var(--color-text-secondary)] mb-4">
          As per the Digital Personal Data Protection Act (DPDP) 2023, we need your explicit 
          consent before processing your financial data.
        </p>

        <div className="glass-light rounded-lg p-4 mb-4 text-sm text-[var(--color-text-secondary)] space-y-2">
          <p><strong>What we collect:</strong> Income, expenses, savings, and payment behavior data that you voluntarily provide.</p>
          <p><strong>How we use it:</strong> To compute your alternative credit score and provide improvement recommendations.</p>
          <p><strong>Storage:</strong> Your data is stored securely in Supabase (PostgreSQL) and is only accessible by you.</p>
          <p><strong>Your rights:</strong> You can view, export, or delete all your data at any time.</p>
        </div>

        <div className="flex items-start gap-3 mb-6">
          <input
            type="checkbox"
            id="consent"
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
            className="w-5 h-5 mt-0.5 rounded accent-[var(--color-primary)]"
          />
          <label htmlFor="consent" className="text-sm text-[var(--color-text-primary)]">
            I consent to the processing of my financial data as described above, in accordance 
            with the DPDP Act 2023. I understand I can withdraw consent at any time.
          </label>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onAccept}
            disabled={!accepted}
            className="flex-1 py-3 rounded-lg gradient-primary text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
          >
            I Agree — Continue
          </button>
          <button
            onClick={onDecline}
            className="px-6 py-3 rounded-lg glass text-[var(--color-text-secondary)] font-medium hover:bg-white/10 transition-colors"
          >
            Decline
          </button>
        </div>
      </div>
    </div>
  )
}
