/**
 * LenderDashboard — Read-only view of ongoing loans from Supabase.
 * Shows loan portfolio stats + individual loan cards.
 * No approve/reject — purely analytical.
 */

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../feature-auth/AuthContext'

const statusConfig = {
  active: { label: 'Active', color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20', dot: 'bg-emerald-400' },
  overdue: { label: 'Overdue', color: 'text-rose-400', bg: 'bg-rose-400/10', border: 'border-rose-400/20', dot: 'bg-rose-400' },
  completed: { label: 'Completed', color: 'text-neutral-400', bg: 'bg-neutral-400/10', border: 'border-neutral-400/20', dot: 'bg-neutral-400' },
  defaulted: { label: 'Defaulted', color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20', dot: 'bg-red-500' },
}

export default function LenderDashboard() {
  const { getToken } = useAuth()
  const [loans, setLoans] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all, active, overdue, completed

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)
    const token = getToken()
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {}

    try {
      const [loansRes, statsRes] = await Promise.all([
        fetch('/api/loans', { headers }),
        fetch('/api/loans/stats', { headers }),
      ])

      if (loansRes.ok) {
        const data = await loansRes.json()
        setLoans(data.loans || [])
      }
      if (statsRes.ok) {
        const data = await statsRes.json()
        setStats(data)
      }
    } catch (err) {
      console.error('Failed to fetch loans:', err)
    } finally {
      setLoading(false)
    }
  }

  const filteredLoans = filter === 'all'
    ? loans
    : loans.filter(l => l.status === filter)

  const formatCurrency = (amt) => `₹${Number(amt || 0).toLocaleString('en-IN')}`
  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'

  return (
    <main className="w-full min-h-screen bg-neutral-950 flex flex-col items-center">
      <div className="w-full max-w-7xl mx-auto px-6 py-10 flex flex-col gap-8">

        {/* Header */}
        <div>
          <h1 className="text-3xl font-semibold text-neutral-50 tracking-tight">Active Loans</h1>
          <p className="text-neutral-400 mt-1">Portfolio overview — all ongoing loan disbursements</p>
        </div>

        {/* Stats Cards */}
        {stats && stats.total_loans > 0 && (
          <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Disbursed', value: formatCurrency(stats.total_disbursed), icon: '💰' },
              { label: 'Active Loans', value: stats.active, icon: '✅', accent: 'text-emerald-400' },
              { label: 'Overdue', value: stats.overdue, icon: '⚠️', accent: 'text-rose-400' },
              { label: 'Monthly EMI', value: formatCurrency(stats.monthly_emi_collection), icon: '📅' },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-xl"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{stat.icon}</span>
                  <span className="text-xs text-neutral-500 uppercase tracking-widest">{stat.label}</span>
                </div>
                <p className={`text-2xl font-bold tabular-nums ${stat.accent || 'text-neutral-50'}`}>
                  {stat.value}
                </p>
              </motion.div>
            ))}
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex gap-1 p-1 rounded-xl bg-neutral-900 border border-neutral-800 w-fit">
          {[
            { id: 'all', label: 'All' },
            { id: 'active', label: 'Active' },
            { id: 'overdue', label: 'Overdue' },
            { id: 'completed', label: 'Completed' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === tab.id
                  ? 'bg-neutral-800 text-white shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Loans List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-neutral-700 border-t-emerald-400 rounded-full animate-spin" />
          </div>
        ) : filteredLoans.length === 0 ? (
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-12 text-center">
            <p className="text-4xl mb-3 opacity-50">🏦</p>
            <p className="text-neutral-400">
              {loans.length === 0 ? 'No loans found in the database' : `No ${filter} loans`}
            </p>
          </div>
        ) : (
          <div className="w-full bg-neutral-900 border border-neutral-800 rounded-2xl shadow-xl overflow-hidden">
            {/* Table Header */}
            <div className="hidden md:grid grid-cols-7 gap-4 px-6 py-3 border-b border-neutral-800 text-[10px] text-neutral-500 uppercase tracking-widest">
              <span>Borrower</span>
              <span>Purpose</span>
              <span className="text-right">Amount</span>
              <span className="text-right">EMI</span>
              <span className="text-center">Rate</span>
              <span className="text-center">Status</span>
              <span className="text-right">Next Due</span>
            </div>

            {/* Rows */}
            {filteredLoans.map((loan, i) => {
              const sc = statusConfig[loan.status] || statusConfig.active
              return (
                <motion.div
                  key={loan.id || i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  className={`grid grid-cols-1 md:grid-cols-7 gap-2 md:gap-4 px-6 py-4 items-center ${
                    i < filteredLoans.length - 1 ? 'border-b border-neutral-800/50' : ''
                  } hover:bg-neutral-800/30 transition-colors`}
                >
                  {/* Borrower */}
                  <div>
                    <p className="text-neutral-50 font-medium text-sm">{loan.borrower_name}</p>
                    <p className="text-neutral-500 text-xs">{loan.borrower_email || '—'}</p>
                  </div>

                  {/* Purpose */}
                  <div className="text-neutral-400 text-sm truncate" title={loan.purpose}>
                    {loan.purpose || '—'}
                  </div>

                  {/* Amount */}
                  <div className="text-right">
                    <p className="text-neutral-50 font-medium tabular-nums text-sm">{formatCurrency(loan.amount)}</p>
                    <p className="text-neutral-500 text-xs">{loan.tenure_months}mo tenure</p>
                  </div>

                  {/* EMI */}
                  <p className="text-right text-neutral-300 tabular-nums text-sm">
                    {formatCurrency(loan.emi)}/mo
                  </p>

                  {/* Interest Rate */}
                  <p className="text-center text-neutral-400 font-mono text-sm">
                    {loan.interest_rate}%
                  </p>

                  {/* Status */}
                  <div className="flex justify-center">
                    <span className={`inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full border ${sc.color} ${sc.bg} ${sc.border}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                      {sc.label}
                    </span>
                  </div>

                  {/* Next Due */}
                  <p className={`text-right text-sm tabular-nums ${
                    loan.status === 'overdue' ? 'text-rose-400 font-medium' : 'text-neutral-400'
                  }`}>
                    {formatDate(loan.next_due_date)}
                  </p>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
