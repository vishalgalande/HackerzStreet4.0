import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../feature-auth/AuthContext'
import usePayments from '../feature-payments/usePayments'

const LOAN_PRESETS = [
  { id: 'personal', label: 'Personal Loan', icon: '💳' },
  { id: 'education', label: 'Education Loan', icon: '🎓' },
  { id: 'two_wheeler', label: 'Two-Wheeler', icon: '🛵' },
  { id: 'phone', label: 'Phone EMI', icon: '📱' },
  { id: 'home', label: 'Home Loan', icon: '🏠' },
  { id: 'gold', label: 'Gold Loan', icon: '✨' },
  { id: 'car', label: 'Car Loan', icon: '🚗' },
  { id: 'custom', label: 'Custom', icon: '➕' },
]

const BILL_CATEGORIES = [
  { value: 'utility', label: 'Utility' },
  { value: 'housing', label: 'Housing / Rent' },
  { value: 'telecom', label: 'Telecom' },
  { value: 'subscription', label: 'Subscription' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'other', label: 'Other' },
]

const TABS = [
  { id: 'all', label: 'All' },
  { id: 'loan', label: 'Loans' },
  { id: 'cc', label: 'Credit Cards' },
  { id: 'bill', label: 'Bills & Subs' },
]

function fmtCurrency(n) {
  return `₹${Number(n || 0).toLocaleString('en-IN')}`
}

function fmtDate(d) {
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function ActivePayments() {
  const { profile } = useAuth()
  const { payments, addPayment, removePayment, stats, getNextDueDate, getMonthlyAmount, getOutstanding, getCategoryIcon } = usePayments()
  const [activeTab, setActiveTab] = useState('all')
  const [showForm, setShowForm] = useState(false)
  const [paymentType, setPaymentType] = useState(null)
  const [expandedId, setExpandedId] = useState(null)
  const [insight, setInsight] = useState('')
  const [insightLoading, setInsightLoading] = useState(false)

  const [loanForm, setLoanForm] = useState({
    preset: 'personal', name: '', amount: '', emi: '', interest_rate: '',
    tenure_months: '', start_date: new Date().toISOString().split('T')[0], bank_name: '',
  })
  const [ccForm, setCcForm] = useState({
    name: '', credit_limit: '', current_balance: '', min_payment: '', due_date: '', statement_date: '',
  })
  const [billForm, setBillForm] = useState({
    name: '', category: 'utility', avg_amount: '', due_date: '', auto_pay: false,
  })

  const filtered = activeTab === 'all' ? payments : payments.filter(p => p.type === activeTab)

  function handleAddLoan() {
    const preset = LOAN_PRESETS.find(p => p.id === loanForm.preset)
    addPayment({
      type: 'loan',
      name: loanForm.name || preset?.label || 'Unnamed Loan',
      icon: preset?.icon || '💰',
      amount: parseFloat(loanForm.amount) || 0,
      emi: parseFloat(loanForm.emi) || 0,
      interest_rate: parseFloat(loanForm.interest_rate) || 0,
      tenure_months: parseInt(loanForm.tenure_months) || 12,
      start_date: loanForm.start_date,
      bank_name: loanForm.bank_name || preset?.label || '',
    })
    setLoanForm({ preset: 'personal', name: '', amount: '', emi: '', interest_rate: '', tenure_months: '', start_date: new Date().toISOString().split('T')[0], bank_name: '' })
    closeForm()
  }

  function handleAddCC() {
    addPayment({
      type: 'cc',
      name: ccForm.name || 'Credit Card',
      icon: '💳',
      credit_limit: parseFloat(ccForm.credit_limit) || 0,
      current_balance: parseFloat(ccForm.current_balance) || 0,
      min_payment: parseFloat(ccForm.min_payment) || 0,
      due_date: ccForm.due_date,
      statement_date: ccForm.statement_date,
    })
    setCcForm({ name: '', credit_limit: '', current_balance: '', min_payment: '', due_date: '', statement_date: '' })
    closeForm()
  }

  function handleAddBill() {
    addPayment({
      type: 'bill',
      name: billForm.name || 'Recurring Bill',
      icon: '📄',
      category: billForm.category,
      avg_amount: parseFloat(billForm.avg_amount) || 0,
      due_date: billForm.due_date,
      auto_pay: billForm.auto_pay,
    })
    setBillForm({ name: '', category: 'utility', avg_amount: '', due_date: '', auto_pay: false })
    closeForm()
  }

  function closeForm() {
    setShowForm(false)
    setPaymentType(null)
  }

  const fetchInsights = useCallback(async () => {
    if (payments.length === 0) return
    setInsightLoading(true)
    try {
      const API = import.meta.env.VITE_API_URL || ''
      const res = await fetch(`${API}/api/loans/insights`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          loans: payments.filter(p => p.type === 'loan').map(l => ({
            name: l.name, amount: l.amount, emi: l.emi,
            interest_rate: l.interest_rate, tenure_months: l.tenure_months,
            completed_months: 0, status: 'active',
          })),
          monthly_income: profile?.monthly_income || profile?.income_amount || 0,
        }),
      })
      const data = await res.json()
      setInsight(data.insight || 'No insights available.')
    } catch {
      setInsight('Could not connect to AI service.')
    } finally {
      setInsightLoading(false)
    }
  }, [payments, profile])

  const inputStyle = {
    width: '100%', padding: '12px 14px', borderRadius: '12px',
    background: '#0a0a0a', border: '1px solid #262626',
    color: '#fafafa', fontSize: '14px', outline: 'none', boxSizing: 'border-box',
  }
  const labelStyle = { fontSize: '11px', color: '#737373', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1px' }

  const nextDuePayment = stats.nextDue
  const nextDueDate = nextDuePayment ? getNextDueDate(nextDuePayment) : null

  return (
    <main className="w-full min-h-screen bg-black text-neutral-50">
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px 80px', display: 'flex', flexDirection: 'column', gap: '28px' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 700, letterSpacing: '-0.5px' }}>Active Payments</h1>
            <p className="text-neutral-400" style={{ fontSize: '15px', marginTop: '4px' }}>Track loans, cards, and recurring bills in one place</p>
          </div>
          <motion.button
            onClick={() => { setShowForm(!showForm); if (showForm) setPaymentType(null) }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            style={{
              background: showForm ? 'transparent' : 'linear-gradient(135deg, #FF8C00, #FFC857)',
              color: showForm ? '#a3a3a3' : '#0a0a0a',
              padding: '10px 24px', borderRadius: '12px', fontWeight: 600, fontSize: '14px',
              border: showForm ? '1px solid #262626' : 'none', cursor: 'pointer',
            }}
          >
            {showForm ? 'Cancel' : '+ Add Payment'}
          </motion.button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
          {[
            { label: 'Monthly Outflow', value: fmtCurrency(stats.totalMonthly), icon: '📅' },
            { label: 'Outstanding Debt', value: fmtCurrency(stats.totalOutstanding), icon: '💰' },
            { label: 'Next Payment', value: nextDueDate ? fmtDate(nextDueDate) : 'None', icon: '⏰', sub: nextDuePayment?.name },
          ].map((stat, i) => (
            <div key={i} className="bg-neutral-900 border border-white/5 rounded-3xl" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <span style={{ fontSize: '16px' }}>{stat.icon}</span>
                <span className="text-neutral-400" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 600 }}>{stat.label}</span>
              </div>
              <p style={{ fontSize: '22px', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{stat.value}</p>
              {stat.sub && <p className="text-neutral-500" style={{ fontSize: '12px', marginTop: '4px' }}>{stat.sub}</p>}
            </div>
          ))}
        </div>

        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{ overflow: 'hidden' }}
            >
              <div className="bg-neutral-900 border border-white/5 rounded-3xl" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

                {!paymentType && (
                  <>
                    <h3 style={{ fontSize: '16px', fontWeight: 700 }}>What would you like to add?</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                      {[
                        { id: 'loan', label: 'Bank Loan / EMI', icon: '🏦', desc: 'Track EMIs, tenure & interest' },
                        { id: 'cc', label: 'Credit Card', icon: '💳', desc: 'Monitor limits, balance & dues' },
                        { id: 'bill', label: 'Recurring Bill', icon: '📄', desc: 'Rent, utilities, subscriptions' },
                      ].map(t => (
                        <motion.button
                          key={t.id}
                          onClick={() => setPaymentType(t.id)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          style={{
                            padding: '24px 16px', borderRadius: '16px', cursor: 'pointer',
                            background: '#0a0a0a', border: '1px solid #262626',
                            color: '#fafafa', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px',
                            textAlign: 'center',
                          }}
                        >
                          <span style={{ fontSize: '32px' }}>{t.icon}</span>
                          <span style={{ fontWeight: 600, fontSize: '14px' }}>{t.label}</span>
                          <span className="text-neutral-500" style={{ fontSize: '11px' }}>{t.desc}</span>
                        </motion.button>
                      ))}
                    </div>
                  </>
                )}

                {paymentType === 'loan' && (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button onClick={() => setPaymentType(null)} style={{ background: 'none', border: 'none', color: '#737373', cursor: 'pointer', fontSize: '14px' }}>← Back</button>
                      <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Add Loan / EMI</h3>
                    </div>
                    <div>
                      <label style={labelStyle}>Loan Type</label>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                        {LOAN_PRESETS.map(p => (
                          <button
                            key={p.id}
                            onClick={() => setLoanForm({ ...loanForm, preset: p.id, name: p.id === 'custom' ? '' : p.label })}
                            style={{
                              padding: '10px 8px', borderRadius: '10px', fontSize: '12px', fontWeight: 500,
                              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', justifyContent: 'center',
                              background: loanForm.preset === p.id ? 'rgba(255,140,0,0.12)' : '#0a0a0a',
                              border: `1px solid ${loanForm.preset === p.id ? 'rgba(255,140,0,0.5)' : '#262626'}`,
                              color: loanForm.preset === p.id ? '#FFC857' : '#a3a3a3',
                            }}
                          >
                            <span>{p.icon}</span> {p.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    {loanForm.preset === 'custom' && (
                      <div>
                        <label style={labelStyle}>Loan Name</label>
                        <input value={loanForm.name} onChange={e => setLoanForm({ ...loanForm, name: e.target.value })} placeholder="e.g. Business Loan" style={inputStyle} />
                      </div>
                    )}
                    <div>
                      <label style={labelStyle}>Bank / Lender Name</label>
                      <input value={loanForm.bank_name} onChange={e => setLoanForm({ ...loanForm, bank_name: e.target.value })} placeholder="e.g. HDFC Bank" style={inputStyle} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                      <div>
                        <label style={labelStyle}>Principal (₹)</label>
                        <input type="number" value={loanForm.amount} onChange={e => setLoanForm({ ...loanForm, amount: e.target.value })} placeholder="500000" style={inputStyle} />
                      </div>
                      <div>
                        <label style={labelStyle}>EMI (₹/mo)</label>
                        <input type="number" value={loanForm.emi} onChange={e => setLoanForm({ ...loanForm, emi: e.target.value })} placeholder="12000" style={inputStyle} />
                      </div>
                      <div>
                        <label style={labelStyle}>Interest (%)</label>
                        <input type="number" value={loanForm.interest_rate} onChange={e => setLoanForm({ ...loanForm, interest_rate: e.target.value })} placeholder="9.5" step="0.1" style={inputStyle} />
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                      <div>
                        <label style={labelStyle}>Tenure (months)</label>
                        <input type="number" value={loanForm.tenure_months} onChange={e => setLoanForm({ ...loanForm, tenure_months: e.target.value })} placeholder="36" style={inputStyle} />
                      </div>
                      <div>
                        <label style={labelStyle}>Start Date</label>
                        <input type="date" value={loanForm.start_date} onChange={e => setLoanForm({ ...loanForm, start_date: e.target.value })} style={{ ...inputStyle, colorScheme: 'dark' }} />
                      </div>
                    </div>
                    <motion.button
                      onClick={handleAddLoan}
                      disabled={!loanForm.amount || !loanForm.emi || !loanForm.tenure_months}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      style={{
                        width: '100%', padding: '14px', borderRadius: '12px', fontWeight: 600, fontSize: '15px',
                        background: 'linear-gradient(135deg, #FF8C00, #FFC857)', color: '#0a0a0a', border: 'none', cursor: 'pointer',
                        opacity: (!loanForm.amount || !loanForm.emi || !loanForm.tenure_months) ? 0.4 : 1,
                      }}
                    >
                      Add Loan
                    </motion.button>
                  </>
                )}

                {paymentType === 'cc' && (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button onClick={() => setPaymentType(null)} style={{ background: 'none', border: 'none', color: '#737373', cursor: 'pointer', fontSize: '14px' }}>← Back</button>
                      <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Add Credit Card</h3>
                    </div>
                    <div>
                      <label style={labelStyle}>Card Name</label>
                      <input value={ccForm.name} onChange={e => setCcForm({ ...ccForm, name: e.target.value })} placeholder="e.g. HDFC Millennia" style={inputStyle} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                      <div>
                        <label style={labelStyle}>Credit Limit (₹)</label>
                        <input type="number" value={ccForm.credit_limit} onChange={e => setCcForm({ ...ccForm, credit_limit: e.target.value })} placeholder="200000" style={inputStyle} />
                      </div>
                      <div>
                        <label style={labelStyle}>Current Balance (₹)</label>
                        <input type="number" value={ccForm.current_balance} onChange={e => setCcForm({ ...ccForm, current_balance: e.target.value })} placeholder="45000" style={inputStyle} />
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                      <div>
                        <label style={labelStyle}>Min. Payment (₹)</label>
                        <input type="number" value={ccForm.min_payment} onChange={e => setCcForm({ ...ccForm, min_payment: e.target.value })} placeholder="5000" style={inputStyle} />
                      </div>
                      <div>
                        <label style={labelStyle}>Due Date (day)</label>
                        <input type="number" value={ccForm.due_date} onChange={e => setCcForm({ ...ccForm, due_date: e.target.value })} placeholder="15" min="1" max="31" style={inputStyle} />
                      </div>
                      <div>
                        <label style={labelStyle}>Statement Date (day)</label>
                        <input type="number" value={ccForm.statement_date} onChange={e => setCcForm({ ...ccForm, statement_date: e.target.value })} placeholder="1" min="1" max="31" style={inputStyle} />
                      </div>
                    </div>
                    <motion.button
                      onClick={handleAddCC}
                      disabled={!ccForm.name || !ccForm.credit_limit}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      style={{
                        width: '100%', padding: '14px', borderRadius: '12px', fontWeight: 600, fontSize: '15px',
                        background: 'linear-gradient(135deg, #FF8C00, #FFC857)', color: '#0a0a0a', border: 'none', cursor: 'pointer',
                        opacity: (!ccForm.name || !ccForm.credit_limit) ? 0.4 : 1,
                      }}
                    >
                      Add Credit Card
                    </motion.button>
                  </>
                )}

                {paymentType === 'bill' && (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button onClick={() => setPaymentType(null)} style={{ background: 'none', border: 'none', color: '#737373', cursor: 'pointer', fontSize: '14px' }}>← Back</button>
                      <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Add Recurring Bill</h3>
                    </div>
                    <div>
                      <label style={labelStyle}>Biller / Service Name</label>
                      <input value={billForm.name} onChange={e => setBillForm({ ...billForm, name: e.target.value })} placeholder="e.g. Jio Fiber, Netflix" style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>Category</label>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                        {BILL_CATEGORIES.map(c => (
                          <button
                            key={c.value}
                            onClick={() => setBillForm({ ...billForm, category: c.value })}
                            style={{
                              padding: '10px', borderRadius: '10px', fontSize: '12px', fontWeight: 500,
                              cursor: 'pointer', textAlign: 'center',
                              background: billForm.category === c.value ? 'rgba(255,140,0,0.12)' : '#0a0a0a',
                              border: `1px solid ${billForm.category === c.value ? 'rgba(255,140,0,0.5)' : '#262626'}`,
                              color: billForm.category === c.value ? '#FFC857' : '#a3a3a3',
                            }}
                          >
                            {c.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                      <div>
                        <label style={labelStyle}>Avg. Amount (₹/mo)</label>
                        <input type="number" value={billForm.avg_amount} onChange={e => setBillForm({ ...billForm, avg_amount: e.target.value })} placeholder="1500" style={inputStyle} />
                      </div>
                      <div>
                        <label style={labelStyle}>Due Date (day of month)</label>
                        <input type="number" value={billForm.due_date} onChange={e => setBillForm({ ...billForm, due_date: e.target.value })} placeholder="5" min="1" max="31" style={inputStyle} />
                      </div>
                    </div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', padding: '12px 14px', borderRadius: '12px', background: '#0a0a0a', border: '1px solid #262626' }}>
                      <input
                        type="checkbox"
                        checked={billForm.auto_pay}
                        onChange={e => setBillForm({ ...billForm, auto_pay: e.target.checked })}
                        style={{ accentColor: '#FF8C00', width: '16px', height: '16px' }}
                      />
                      <span style={{ fontSize: '14px', color: '#d4d4d4' }}>Auto-pay enabled</span>
                    </label>
                    <motion.button
                      onClick={handleAddBill}
                      disabled={!billForm.name || !billForm.avg_amount}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      style={{
                        width: '100%', padding: '14px', borderRadius: '12px', fontWeight: 600, fontSize: '15px',
                        background: 'linear-gradient(135deg, #FF8C00, #FFC857)', color: '#0a0a0a', border: 'none', cursor: 'pointer',
                        opacity: (!billForm.name || !billForm.avg_amount) ? 0.4 : 1,
                      }}
                    >
                      Add Bill
                    </motion.button>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex gap-6 border-b border-white/5" style={{ paddingLeft: '4px' }}>
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={activeTab === tab.id
                ? 'text-white font-semibold border-b-2 border-[#FF8C00] pb-3 -mb-[1px]'
                : 'text-neutral-500 hover:text-neutral-300 pb-3 transition-colors'
              }
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', padding: '0' }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="bg-neutral-900 border border-white/5 rounded-3xl" style={{ padding: '48px', textAlign: 'center' }}>
            <p style={{ fontSize: '40px', marginBottom: '12px', opacity: 0.4 }}>
              {activeTab === 'loan' ? '🏦' : activeTab === 'cc' ? '💳' : activeTab === 'bill' ? '📄' : '💰'}
            </p>
            <p className="text-neutral-400" style={{ fontSize: '15px' }}>
              {activeTab === 'all' ? 'No payments added yet. Click "+ Add Payment" to get started.' : `No ${TABS.find(t => t.id === activeTab)?.label.toLowerCase()} added yet.`}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {filtered.map((payment, i) => {
              const icon = getCategoryIcon(payment)
              const monthly = getMonthlyAmount(payment)
              const outstanding = getOutstanding(payment)
              const nextDue = getNextDueDate(payment)
              const isExpanded = expandedId === payment.id

              let subtitle = ''
              if (payment.type === 'loan') {
                subtitle = `${fmtCurrency(payment.emi)}/mo · ${payment.interest_rate}% · ${payment.tenure_months}mo`
              } else if (payment.type === 'cc') {
                const util = payment.credit_limit > 0 ? Math.round(payment.current_balance / payment.credit_limit * 100) : 0
                subtitle = `${util}% utilized · Due: ${payment.due_date || '—'}th`
              } else if (payment.type === 'bill') {
                subtitle = `${payment.category} · Due: ${payment.due_date || '—'}th${payment.auto_pay ? ' · Auto-pay' : ''}`
              }

              return (
                <motion.div
                  key={payment.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="bg-neutral-900 border border-white/5 rounded-2xl"
                  style={{ padding: '20px', cursor: 'pointer' }}
                  onClick={() => setExpandedId(isExpanded ? null : payment.id)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: 0 }}>
                      <div className="bg-neutral-950 border border-neutral-800 rounded-full" style={{ width: '42px', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>
                        {icon}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ fontWeight: 600, fontSize: '15px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{payment.name}</p>
                        <p className="text-neutral-500" style={{ fontSize: '12px' }}>{subtitle}</p>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <p style={{ fontWeight: 700, fontSize: '16px', fontVariantNumeric: 'tabular-nums' }}>{fmtCurrency(monthly)}</p>
                      <p className="text-neutral-500" style={{ fontSize: '11px' }}>
                        {payment.type === 'loan' ? `/mo` : payment.type === 'cc' ? 'balance' : '/mo'}
                      </p>
                    </div>
                  </div>

                  {payment.type === 'cc' && payment.credit_limit > 0 && (
                    <div style={{ marginTop: '12px', height: '4px', borderRadius: '2px', background: '#171717', overflow: 'hidden' }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(Math.round(payment.current_balance / payment.credit_limit * 100), 100)}%` }}
                        transition={{ duration: 0.8 }}
                        style={{
                          height: '100%', borderRadius: '2px',
                          background: payment.current_balance / payment.credit_limit > 0.7 ? '#ef4444' : payment.current_balance / payment.credit_limit > 0.4 ? '#f59e0b' : '#10b981',
                        }}
                      />
                    </div>
                  )}

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden' }}>
                        <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #262626', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div className="text-neutral-400" style={{ fontSize: '13px' }}>
                            {payment.type === 'loan' && <span>Outstanding: {fmtCurrency(outstanding)} · Ends {fmtDate(new Date(new Date(payment.start_date).setMonth(new Date(payment.start_date).getMonth() + (payment.tenure_months || 0))))}</span>}
                            {payment.type === 'cc' && <span>Limit: {fmtCurrency(payment.credit_limit)} · Statement: {payment.statement_date || '—'}th</span>}
                            {payment.type === 'bill' && <span>Next due: {fmtDate(nextDue)}{payment.auto_pay ? ' · ✅ Auto-pay' : ' · ❌ Manual'}</span>}
                          </div>
                          <button
                            onClick={(e) => { e.stopPropagation(); removePayment(payment.id) }}
                            style={{
                              background: 'transparent', border: '1px solid rgba(239,68,68,0.3)',
                              color: '#ef4444', padding: '6px 16px', borderRadius: '8px',
                              fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                            }}
                          >
                            Remove
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            })}
          </div>
        )}

        {payments.filter(p => p.type === 'loan').length > 0 && (
          <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 className="text-neutral-500" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 600 }}>
                🤖 AI Insights
              </h2>
              <motion.button
                onClick={fetchInsights}
                disabled={insightLoading}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  background: 'rgba(255,140,0,0.1)', border: '1px solid rgba(255,140,0,0.3)',
                  color: '#FFC857', padding: '8px 18px', borderRadius: '10px',
                  fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                  opacity: insightLoading ? 0.5 : 1,
                }}
              >
                {insightLoading ? 'Analyzing...' : insight ? 'Refresh Insights' : 'Generate Insights'}
              </motion.button>
            </div>
            {(insight || insightLoading) && (
              <div className="bg-neutral-900 border border-white/5 rounded-2xl" style={{ padding: '20px' }}>
                {insightLoading ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '20px', height: '20px', border: '2px solid #262626', borderTopColor: '#FF8C00', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                    <p className="text-neutral-400" style={{ fontSize: '14px' }}>Analyzing your payment portfolio...</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '18px', lineHeight: 1, flexShrink: 0, marginTop: '2px' }}>✨</span>
                    <div className="text-neutral-300" style={{ fontSize: '14px', lineHeight: 1.7, whiteSpace: 'pre-line' }}>{insight}</div>
                  </div>
                )}
              </div>
            )}
          </section>
        )}

      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </main>
  )
}
