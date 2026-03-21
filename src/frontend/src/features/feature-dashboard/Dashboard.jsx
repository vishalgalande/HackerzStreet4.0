/**
 * Feature: Dashboard — Main Dashboard
 * Full aggregation pipeline:
 *   Log entries → persist to localStorage + backend
 *   → Compute Score (calls /api/compute-score with profile + entries)
 *   → Display score results inline
 */

import { useState, useEffect } from 'react'
import { useAuth } from '../feature-auth/AuthContext'
import DailyEntryForm from './DailyEntryForm'
import QuickStats from './QuickStats'
import ScoreGauge from '../feature-scoring/ScoreGauge'
import FactorWaterfall from '../feature-scoring/FactorWaterfall'
import Recommendations from '../feature-scoring/Recommendations'

const ENTRIES_KEY = 'hackerzstreet_entries'

function loadEntries() {
  try {
    return JSON.parse(localStorage.getItem(ENTRIES_KEY) || '[]')
  } catch { return [] }
}

function saveEntries(entries) {
  localStorage.setItem(ENTRIES_KEY, JSON.stringify(entries))
}

export default function Dashboard() {
  const { user, profile, getToken, signOut } = useAuth()
  const [entries, setEntries] = useState(() => loadEntries())
  const [showEntryForm, setShowEntryForm] = useState(false)
  const [scoreResult, setScoreResult] = useState(null)
  const [computing, setComputing] = useState(false)
  const [language, setLanguage] = useState('en')

  // Sync entries from backend on mount (merge with localStorage)
  useEffect(() => {
    syncEntries()
  }, [])

  async function syncEntries() {
    try {
      const token = getToken()
      const res = await fetch('/api/entries?days=30', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        const backendEntries = await res.json()
        // Merge: use localStorage entries + any backend-only entries
        const localEntries = loadEntries()
        const localIds = new Set(localEntries.map(e => e.id))
        const merged = [
          ...localEntries,
          ...backendEntries.filter(e => !localIds.has(e.id))
        ].sort((a, b) => b.date.localeCompare(a.date))
        setEntries(merged)
        saveEntries(merged)
      }
    } catch {
      // Backend not running — use localStorage entries
    }
  }

  function handleEntrySaved(newEntry) {
    setShowEntryForm(false)
    const updated = [newEntry, ...entries].sort((a, b) => b.date.localeCompare(a.date))
    setEntries(updated)
    saveEntries(updated)
    // Also push to backend (fire-and-forget)
    const token = getToken()
    fetch('/api/entries', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(newEntry),
    }).catch(() => {})
  }

  function handleDeleteEntry(entryId) {
    const updated = entries.filter(e => e.id !== entryId)
    setEntries(updated)
    saveEntries(updated)
    const token = getToken()
    fetch(`/api/entries/${entryId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    }).catch(() => {})
  }

  async function computeScore() {
    setComputing(true)
    try {
      const token = getToken()
      const payload = {
        // Profile data
        monthly_income: profile?.monthly_income || 0,
        income_amount: profile?.income_amount || profile?.monthly_income || 0,
        income_period: profile?.income_period || 'monthly',
        employment_type: profile?.employment_type || 'none',
        existing_debt: profile?.existing_debt || 0,
        loans: profile?.loans || [],
        rent_history: profile?.rent_history || 'consistent',
        bill_payment: profile?.bill_payment || 'always_on_time',
        telecom_regularity: profile?.telecom_regularity || false,
        // Daily entries
        entries: entries.map(e => ({
          date: e.date,
          rent: e.rent || 0,
          food: e.food || 0,
          transport: e.transport || 0,
          discretionary: e.discretionary || 0,
          savings: e.savings || 0,
          bill_paid_on_time: e.bill_paid_on_time !== false,
        })),
      }

      const res = await fetch('/api/compute-score', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        const data = await res.json()
        setScoreResult(data)
      } else {
        const err = await res.json().catch(() => ({}))
        alert(err.detail || 'Failed to compute score')
      }
    } catch {
      alert('Could not connect to backend. Make sure start-backend.bat is running.')
    } finally {
      setComputing(false)
    }
  }

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-[var(--color-text-secondary)]">{user?.email}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowEntryForm(true)}
            className="px-4 py-2 rounded-lg gradient-primary text-white font-medium hover:opacity-90"
          >
            + Log Today
          </button>
          <button
            onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
            className="px-4 py-2 rounded-lg glass text-[var(--color-text-secondary)] hover:bg-white/10"
          >
            {language === 'en' ? 'हिंदी' : 'EN'}
          </button>
          <button
            onClick={signOut}
            className="px-4 py-2 rounded-lg glass text-[var(--color-text-secondary)] hover:bg-white/10"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <QuickStats entries={entries} profile={profile} />

      {/* ── Compute Score Section ── */}
      <div className="mt-8">
        <div className="glass rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold">Your Credit Score</h2>
              <p className="text-sm text-[var(--color-text-muted)]">
                {entries.length === 0
                  ? 'Log some daily entries first, then compute your score'
                  : `Based on ${entries.length} entries + your profile`}
              </p>
            </div>
            <button
              onClick={computeScore}
              disabled={computing}
              className="px-6 py-2.5 rounded-lg gradient-primary text-white font-semibold hover:opacity-90 disabled:opacity-50"
            >
              {computing ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Computing...
                </span>
              ) : scoreResult ? '↻ Recompute' : '⚡ Compute Score'}
            </button>
          </div>

          {/* Score Result */}
          {scoreResult && (
            <div className="space-y-6 fade-in">
              {/* Score Gauge */}
              <div className="flex justify-center py-4">
                <ScoreGauge
                  score={scoreResult.score}
                  band={scoreResult.band}
                  bandColor={scoreResult.band_color}
                  confidenceMargin={scoreResult.confidence_margin}
                  benchmarkPercentile={scoreResult.benchmark_percentile}
                />
              </div>

              {/* Data Quality */}
              <div className={`text-center text-sm px-4 py-2 rounded-lg ${
                scoreResult.data_quality.entry_count >= 14
                  ? 'bg-green-400/10 text-green-400'
                  : scoreResult.data_quality.entry_count > 0
                  ? 'bg-yellow-400/10 text-yellow-400'
                  : 'bg-red-400/10 text-red-400'
              }`}>
                {scoreResult.data_quality.confidence_note}
              </div>

              {/* Summary */}
              <div className="glass-light rounded-xl p-4">
                <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                  {language === 'hi' ? scoreResult.summary_hi : scoreResult.summary}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Factor Breakdown + Recommendations ── */}
      {scoreResult && (
        <div className="mt-6 space-y-6 fade-in-stagger">
          <FactorWaterfall factors={scoreResult.factors} language={language} />
          <Recommendations recommendations={scoreResult.recommendations} language={language} />
        </div>
      )}

      {/* ── Daily Entry Form Modal ── */}
      {showEntryForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-lg">
            <DailyEntryForm
              onSave={handleEntrySaved}
              onCancel={() => setShowEntryForm(false)}
            />
          </div>
        </div>
      )}

      {/* ── Recent Entries ── */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Recent Entries</h2>
          <span className="text-sm text-[var(--color-text-muted)]">{entries.length} entries</span>
        </div>
        {entries.length === 0 ? (
          <div className="glass rounded-xl p-8 text-center">
            <p className="text-3xl mb-3">📝</p>
            <p className="text-[var(--color-text-secondary)]">
              No entries yet. Start logging your daily expenses to build your credit profile.
            </p>
            <button
              onClick={() => setShowEntryForm(true)}
              className="mt-4 px-6 py-2 rounded-lg gradient-primary text-white font-medium"
            >
              Log Your First Entry
            </button>
          </div>
        ) : (
          <div className="space-y-3 fade-in-stagger">
            {entries.slice(0, 10).map((entry) => (
              <div key={entry.id} className="glass rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">{entry.date}</p>
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    🍲 ₹{entry.food || 0} · 🚗 ₹{entry.transport || 0} · 💰 ₹{entry.savings || 0}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      ₹{(entry.food || 0) + (entry.transport || 0) + (entry.discretionary || 0) + (entry.rent || 0)}
                    </p>
                    {entry.bill_paid_on_time && (
                      <span className="text-xs text-green-400">✓ Bill on time</span>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteEntry(entry.id)}
                    className="text-[var(--color-text-muted)] hover:text-red-400 text-sm"
                    title="Delete entry"
                  >
                    🗑
                  </button>
                </div>
              </div>
            ))}
            {entries.length > 10 && (
              <p className="text-center text-sm text-[var(--color-text-muted)]">
                + {entries.length - 10} more entries
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
