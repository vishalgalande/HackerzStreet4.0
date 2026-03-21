/**
 * Feature: Dashboard — Main Dashboard
 * Primary view after login. Shows score summary, recent entries, and trends.
 * 
 * TODO (Teammate 3):
 * - Add score trend chart
 * - Add spending breakdown visualization
 * - Add "Compute Score" button that calls /api/score
 * - Polish layout and animations
 */

import { useState, useEffect } from 'react'
import { useAuth } from '../feature-auth/AuthContext'
import DailyEntryForm from './DailyEntryForm'
import QuickStats from './QuickStats'

export default function Dashboard() {
  const { user, profile, getToken, signOut } = useAuth()
  const [entries, setEntries] = useState([])
  const [showEntryForm, setShowEntryForm] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEntries()
  }, [])

  async function fetchEntries() {
    try {
      const token = getToken()
      const res = await fetch('/api/entries?days=30', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setEntries(data)
      }
    } catch {
      // Backend not running — use empty state
    } finally {
      setLoading(false)
    }
  }

  function handleEntrySaved() {
    setShowEntryForm(false)
    fetchEntries()
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
            onClick={signOut}
            className="px-4 py-2 rounded-lg glass text-[var(--color-text-secondary)] hover:bg-white/10"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <QuickStats entries={entries} profile={profile} />

      {/* Daily Entry Form Modal */}
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

      {/* Recent Entries */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-4">Recent Entries</h2>
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
            {entries.slice(0, 7).map((entry) => (
              <div key={entry.id} className="glass rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">{entry.date}</p>
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    Food: ₹{entry.food} · Transport: ₹{entry.transport} · Saved: ₹{entry.savings}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">
                    Total: ₹{entry.food + entry.transport + entry.discretionary + entry.rent}
                  </p>
                  {entry.bill_paid_on_time && (
                    <span className="text-xs text-green-400">✓ Bill on time</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
