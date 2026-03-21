/**
 * Feature: Scoring — Client-side Scorer
 * Mirrors the backend scoring engine for instant what-if recalculation.
 * This enables <500ms updates without API calls.
 */

const SCORE_MIN = 300
const SCORE_MAX = 900
const SCORE_RANGE = SCORE_MAX - SCORE_MIN

const WEIGHTS = {
  payment_consistency: 0.30,
  savings_ratio: 0.25,
  income_stability: 0.20,
  spending_discipline: 0.15,
  debt_to_income: 0.10,
}

function computePaymentConsistency(input) {
  let score = 0
  const billScores = { always_on_time: 100, sometimes_late: 50, often_late: 15 }
  const rentScores = { consistent: 100, occasional_gap: 50, irregular: 15 }

  score += (billScores[input.bill_payment] || 50) * 0.60
  score += (rentScores[input.rent_history] || 50) * 0.30
  score += (input.telecom_regularity ? 100 : 40) * 0.10

  return Math.min(Math.max(score, 0), 100)
}

function computeSavingsRatio(input) {
  if (input.monthly_income <= 0) return 20
  const ratio = input.savings_amount / input.monthly_income

  if (ratio >= 0.30) return 100
  if (ratio >= 0.20) return 85
  if (ratio >= 0.15) return 70
  if (ratio >= 0.10) return 55
  if (ratio >= 0.05) return 40
  if (ratio > 0) return 25
  return 10
}

function computeIncomeStability(input) {
  const empScores = { salaried: 90, self_employed: 70, freelance: 55, gig: 45, none: 15 }
  let base = empScores[input.employment_type] || 50

  if (input.monthly_income > 0) {
    const surplusRatio = (input.monthly_income - input.monthly_expenses) / input.monthly_income
    if (surplusRatio >= 0.3) base = Math.min(base + 10, 100)
    else if (surplusRatio < 0) base = Math.max(base - 15, 0)
  }

  return Math.min(Math.max(base, 0), 100)
}

function computeSpendingDiscipline(input) {
  if (input.monthly_income <= 0) return 30
  const ratio = input.discretionary / input.monthly_income

  if (ratio <= 0.05) return 95
  if (ratio <= 0.10) return 85
  if (ratio <= 0.15) return 70
  if (ratio <= 0.20) return 55
  if (ratio <= 0.30) return 40
  if (ratio <= 0.40) return 25
  return 10
}

function computeDebtToIncome(input) {
  if (input.monthly_income <= 0) return input.existing_debt === 0 ? 50 : 10
  if (input.existing_debt === 0) return 100

  const dti = input.existing_debt / input.monthly_income
  if (dti <= 0.10) return 85
  if (dti <= 0.20) return 70
  if (dti <= 0.30) return 55
  if (dti <= 0.40) return 40
  if (dti <= 0.50) return 25
  return 10
}

export function computeScore(input) {
  const factors = {
    payment_consistency: computePaymentConsistency(input),
    savings_ratio: computeSavingsRatio(input),
    income_stability: computeIncomeStability(input),
    spending_discipline: computeSpendingDiscipline(input),
    debt_to_income: computeDebtToIncome(input),
  }

  const weightedSum = Object.entries(factors).reduce(
    (sum, [key, value]) => sum + value * WEIGHTS[key],
    0
  )

  const score = Math.min(Math.max(
    Math.round(SCORE_MIN + (weightedSum / 100) * SCORE_RANGE),
    SCORE_MIN
  ), SCORE_MAX)

  return { score, factors }
}

export function getBand(score) {
  if (score >= 750) return { band: 'Excellent', color: '#10B981' }
  if (score >= 650) return { band: 'Good', color: '#3B82F6' }
  if (score >= 500) return { band: 'Fair', color: '#F59E0B' }
  return { band: 'Poor', color: '#EF4444' }
}
