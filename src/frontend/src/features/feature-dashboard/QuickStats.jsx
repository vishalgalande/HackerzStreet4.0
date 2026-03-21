/**
 * Feature: Dashboard — QuickStats
 * Summary cards showing today's spending, savings rate, and payment streak.
 * 
 * TODO (Teammate 3):
 * - Add trend arrows (up/down vs last week)
 * - Add sparkline mini charts
 */

export default function QuickStats({ entries, profile }) {
  // Calculate stats from entries
  const today = new Date().toISOString().split('T')[0]
  const todayEntry = entries.find(e => e.date === today)

  const totalSaved = entries.reduce((sum, e) => sum + (e.savings || 0), 0)
  const totalSpent = entries.reduce((sum, e) => sum + (e.food || 0) + (e.transport || 0) + (e.discretionary || 0) + (e.rent || 0), 0)
  const billsOnTime = entries.filter(e => e.bill_paid_on_time).length
  const billStreak = entries.length > 0 ? Math.round((billsOnTime / entries.length) * 100) : 0

  const savingsRate = profile?.monthly_income > 0
    ? Math.round((totalSaved / (profile.monthly_income || 1)) * 100)
    : 0

  const stats = [
    {
      label: "Today's Spend",
      value: todayEntry
        ? `₹${(todayEntry.food || 0) + (todayEntry.transport || 0) + (todayEntry.discretionary || 0)}`
        : 'No entry',
      emoji: '💸',
      color: 'var(--color-fair)',
    },
    {
      label: 'Total Saved (30d)',
      value: `₹${totalSaved.toLocaleString()}`,
      emoji: '💰',
      color: 'var(--color-excellent)',
    },
    {
      label: 'Savings Rate',
      value: `${savingsRate}%`,
      emoji: '📊',
      color: savingsRate >= 20 ? 'var(--color-excellent)' : 'var(--color-fair)',
    },
    {
      label: 'Bills On Time',
      value: `${billStreak}%`,
      emoji: '✅',
      color: billStreak >= 80 ? 'var(--color-excellent)' : 'var(--color-fair)',
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div key={stat.label} className="glass rounded-xl p-4">
          <div className="text-2xl mb-2">{stat.emoji}</div>
          <p className="text-sm text-[var(--color-text-secondary)]">{stat.label}</p>
          <p className="text-xl font-bold mt-1" style={{ color: stat.color }}>
            {stat.value}
          </p>
        </div>
      ))}
    </div>
  )
}
