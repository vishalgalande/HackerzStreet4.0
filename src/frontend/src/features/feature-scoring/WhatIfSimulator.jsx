/**
 * Feature: Scoring — WhatIfSimulator
 * Interactive sliders for real-time score simulation (<500ms).
 * Uses client-side scoring logic — no API calls needed.
 * 
 * TODO (Teammate 1):
 * - Add score trajectory chart (current → 3mo → 6mo)
 * - Add timeline estimates for each change
 * - Animate delta display
 */

import { useState, useMemo } from 'react'
import { computeScore, getBand } from './scorer'
import ScoreGauge from './ScoreGauge'

export default function WhatIfSimulator({ originalInput, originalScore }) {
  const [modified, setModified] = useState({ ...originalInput })

  // Client-side scoring — instant recalculation
  const result = useMemo(() => {
    const { score, factors } = computeScore(modified)
    const { band, color } = getBand(score)
    return { score, band, color, factors }
  }, [modified])

  const delta = result.score - originalScore

  function handleSlider(field, value) {
    setModified(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="glass rounded-xl p-6">
      <h3 className="text-lg font-semibold mb-2">What-If Simulator</h3>
      <p className="text-sm text-[var(--color-text-secondary)] mb-6">
        Adjust the sliders to see how changes would affect your score.
      </p>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Sliders */}
        <div className="space-y-6">
          <SliderInput
            label="Monthly Savings (₹)"
            value={modified.savings_amount}
            min={0}
            max={modified.monthly_income || 50000}
            step={500}
            onChange={(v) => handleSlider('savings_amount', v)}
          />

          <SliderInput
            label="Discretionary Spending (₹)"
            value={modified.discretionary}
            min={0}
            max={modified.monthly_income || 50000}
            step={500}
            onChange={(v) => handleSlider('discretionary', v)}
          />

          <SliderInput
            label="Existing Debt / EMI (₹)"
            value={modified.existing_debt}
            min={0}
            max={modified.monthly_income || 50000}
            step={500}
            onChange={(v) => handleSlider('existing_debt', v)}
          />

          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
              Bill Payment Behavior
            </label>
            <select
              value={modified.bill_payment}
              onChange={(e) => handleSlider('bill_payment', e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-[var(--color-text-primary)]"
            >
              <option value="always_on_time">Always on time</option>
              <option value="sometimes_late">Sometimes late</option>
              <option value="often_late">Often late</option>
            </select>
          </div>
        </div>

        {/* Score preview */}
        <div className="flex flex-col items-center justify-center">
          <ScoreGauge
            score={result.score}
            band={result.band}
            bandColor={result.color}
          />

          {/* Delta indicator */}
          <div className={`mt-4 px-4 py-2 rounded-full text-lg font-bold ${
            delta > 0 ? 'text-green-400 bg-green-400/10' :
            delta < 0 ? 'text-red-400 bg-red-400/10' :
            'text-gray-400 bg-gray-400/10'
          }`}>
            {delta > 0 ? '↑' : delta < 0 ? '↓' : '→'} {delta > 0 ? '+' : ''}{delta} pts
          </div>
        </div>
      </div>
    </div>
  )
}

function SliderInput({ label, value, min, max, step, onChange }) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-[var(--color-text-secondary)]">{label}</span>
        <span className="font-medium">₹{value?.toLocaleString()}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-[var(--color-primary)]"
        style={{ background: `linear-gradient(to right, var(--color-primary) ${((value - min) / (max - min)) * 100}%, var(--color-bg-elevated) 0%)` }}
      />
    </div>
  )
}
