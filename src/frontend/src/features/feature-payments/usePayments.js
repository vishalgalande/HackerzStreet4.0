import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../feature-auth/AuthContext'

const API = import.meta.env.VITE_API_URL || ''
const LS_KEY = 'finfix_payments'

function getDueDay(payment) {
  if (payment.type === 'loan' && payment.start_date) {
    return new Date(payment.start_date).getDate()
  }
  if (payment.due_date) {
    const d = parseInt(payment.due_date)
    return isNaN(d) ? 1 : d
  }
  return 1
}

function getNextDueDate(payment) {
  const day = getDueDay(payment)
  const now = new Date()
  let next = new Date(now.getFullYear(), now.getMonth(), day)
  if (next <= now) {
    next = new Date(now.getFullYear(), now.getMonth() + 1, day)
  }
  return next
}

function getMonthlyAmount(payment) {
  if (payment.type === 'loan') return payment.emi || 0
  if (payment.type === 'cc') return payment.min_payment || 0
  if (payment.type === 'bill') return payment.avg_amount || 0
  return 0
}

function getOutstanding(payment) {
  if (payment.type === 'loan') {
    const start = new Date(payment.start_date)
    const now = new Date()
    let completed = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth())
    if (now.getDate() < start.getDate()) completed--
    if (completed < 0) completed = 0
    const tenure = payment.tenure_months || 12
    if (completed > tenure) completed = tenure
    return (tenure - completed) * (payment.emi || 0)
  }
  if (payment.type === 'cc') return payment.current_balance || 0
  return 0
}

function getCategoryIcon(payment) {
  if (payment.type === 'loan') return payment.icon || '🏦'
  if (payment.type === 'cc') return '💳'
  if (payment.type === 'bill') {
    const cat = (payment.category || '').toLowerCase()
    if (cat === 'utility') return '⚡'
    if (cat === 'housing' || cat === 'rent') return '🏠'
    if (cat === 'subscription') return '📺'
    if (cat === 'insurance') return '🛡️'
    if (cat === 'telecom') return '📱'
    return '📄'
  }
  return '💰'
}

export default function usePayments() {
  const { getToken } = useAuth()
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchPayments = useCallback(async () => {
    const token = getToken()
    if (!token) {
      setPayments([])
      setLoading(false)
      return
    }
    try {
      const res = await fetch(`${API}/api/payments`, {
        headers: { 'Authorization': `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setPayments(data.payments || [])
      } else {
        setPayments([])
      }
    } catch {
      try {
        const stored = JSON.parse(localStorage.getItem(LS_KEY) || '[]')
        setPayments(stored)
      } catch { setPayments([]) }
    } finally {
      setLoading(false)
    }
  }, [getToken])

  useEffect(() => {
    fetchPayments()
  }, [fetchPayments])

  const addPayment = useCallback(async (data) => {
    const token = getToken()
    if (!token) return
    try {
      const res = await fetch(`${API}/api/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      })
      if (res.ok) {
        const result = await res.json()
        setPayments(prev => [result.payment, ...prev])
      }
    } catch {
      const newPayment = { ...data, id: `${data.type}_${Date.now()}`, created_at: new Date().toISOString() }
      setPayments(prev => {
        const updated = [newPayment, ...prev]
        localStorage.setItem(LS_KEY, JSON.stringify(updated))
        return updated
      })
    }
  }, [getToken])

  const removePayment = useCallback(async (id) => {
    const token = getToken()
    setPayments(prev => prev.filter(p => p.id !== id))
    try {
      await fetch(`${API}/api/payments/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      })
    } catch {}
  }, [getToken])

  const getUpcoming = useCallback((limit = 5) => {
    return [...payments]
      .map(p => ({
        ...p,
        nextDue: getNextDueDate(p),
        monthlyAmount: getMonthlyAmount(p),
        icon: getCategoryIcon(p),
      }))
      .sort((a, b) => a.nextDue - b.nextDue)
      .slice(0, limit)
  }, [payments])

  const stats = {
    totalMonthly: payments.reduce((s, p) => s + getMonthlyAmount(p), 0),
    totalOutstanding: payments.reduce((s, p) => s + getOutstanding(p), 0),
    nextDue: payments.length > 0
      ? [...payments].sort((a, b) => getNextDueDate(a) - getNextDueDate(b))[0]
      : null,
  }

  return { payments, loading, addPayment, removePayment, getUpcoming, stats, getNextDueDate, getMonthlyAmount, getOutstanding, getCategoryIcon, refetch: fetchPayments }
}
