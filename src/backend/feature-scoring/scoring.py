"""
Rule-based weighted credit scoring engine.
Weights grounded in CIBIL/FICO factor research.

Factor weights:
  - Payment consistency:  30%  (most predictive of default risk)
  - Savings ratio:        25%  (buffer against income shocks)
  - Income stability:     20%  (variance matters more than amount)
  - Spending discipline:  15%  (discretionary vs essential ratio)
  - Debt-to-income:       10%  (existing obligations)

Each factor produces a 0-100 sub-score.
Weighted sum is mapped to the 300-900 scale.
"""

from models import (
    UserInput,
    BillPaymentBehavior,
    EmploymentType,
    RentHistory,
)

# Score range constants
SCORE_MIN = 300
SCORE_MAX = 900
SCORE_RANGE = SCORE_MAX - SCORE_MIN  # 600

# Factor weights (must sum to 1.0)
WEIGHTS = {
    "payment_consistency": 0.30,
    "savings_ratio": 0.25,
    "income_stability": 0.20,
    "spending_discipline": 0.15,
    "debt_to_income": 0.10,
}

# Base score (midpoint)
BASE_SCORE = 550


def compute_payment_consistency(user: UserInput) -> float:
    """
    Score 0-100 based on bill payment behavior, rent history,
    and telecom regularity.
    """
    score = 0.0

    # Bill payment behavior (60% of this factor)
    bill_scores = {
        BillPaymentBehavior.ALWAYS_ON_TIME: 100,
        BillPaymentBehavior.SOMETIMES_LATE: 50,
        BillPaymentBehavior.OFTEN_LATE: 15,
    }
    score += bill_scores[user.bill_payment] * 0.60

    # Rent payment history (30% of this factor)
    rent_scores = {
        RentHistory.CONSISTENT: 100,
        RentHistory.OCCASIONAL_GAP: 50,
        RentHistory.IRREGULAR: 15,
    }
    score += rent_scores[user.rent_history] * 0.30

    # Telecom regularity (10% of this factor)
    score += (100 if user.telecom_regularity else 40) * 0.10

    return min(max(score, 0), 100)


def compute_savings_ratio(user: UserInput) -> float:
    """
    Score 0-100 based on savings as a percentage of income.
    Target: 20%+ savings ratio is excellent.
    """
    if user.monthly_income <= 0:
        return 20  # No income info — low but not zero

    ratio = user.savings_amount / user.monthly_income

    if ratio >= 0.30:
        return 100
    elif ratio >= 0.20:
        return 85
    elif ratio >= 0.15:
        return 70
    elif ratio >= 0.10:
        return 55
    elif ratio >= 0.05:
        return 40
    elif ratio > 0:
        return 25
    else:
        return 10


def compute_income_stability(user: UserInput) -> float:
    """
    Score 0-100 based on employment type and income level.
    Salaried is most stable; gig/freelance scored on income adequacy.
    """
    # Employment type base scores
    emp_scores = {
        EmploymentType.SALARIED: 90,
        EmploymentType.SELF_EMPLOYED: 70,
        EmploymentType.FREELANCE: 55,
        EmploymentType.GIG: 45,
        EmploymentType.NONE: 15,
    }
    base = emp_scores[user.employment_type]

    # Income adequacy bonus (income > expenses is a positive signal)
    if user.monthly_income > 0:
        surplus_ratio = (user.monthly_income - user.monthly_expenses) / user.monthly_income
        if surplus_ratio >= 0.3:
            base = min(base + 10, 100)
        elif surplus_ratio < 0:
            base = max(base - 15, 0)

    return min(max(base, 0), 100)


def compute_spending_discipline(user: UserInput) -> float:
    """
    Score 0-100 based on discretionary spending relative to income.
    Lower discretionary ratio = higher discipline.
    """
    if user.monthly_income <= 0:
        return 30

    discretionary_ratio = user.discretionary / user.monthly_income

    if discretionary_ratio <= 0.05:
        return 95
    elif discretionary_ratio <= 0.10:
        return 85
    elif discretionary_ratio <= 0.15:
        return 70
    elif discretionary_ratio <= 0.20:
        return 55
    elif discretionary_ratio <= 0.30:
        return 40
    elif discretionary_ratio <= 0.40:
        return 25
    else:
        return 10


def compute_debt_to_income(user: UserInput) -> float:
    """
    Score 0-100 based on existing debt obligations relative to income.
    Lower DTI = higher score.
    """
    if user.monthly_income <= 0:
        return 50 if user.existing_debt == 0 else 10

    if user.existing_debt == 0:
        return 100

    dti = user.existing_debt / user.monthly_income

    if dti <= 0.10:
        return 85
    elif dti <= 0.20:
        return 70
    elif dti <= 0.30:
        return 55
    elif dti <= 0.40:
        return 40
    elif dti <= 0.50:
        return 25
    else:
        return 10


def compute_all_factors(user: UserInput) -> dict[str, float]:
    """Compute all factor sub-scores (0-100 each)."""
    return {
        "payment_consistency": compute_payment_consistency(user),
        "savings_ratio": compute_savings_ratio(user),
        "income_stability": compute_income_stability(user),
        "spending_discipline": compute_spending_discipline(user),
        "debt_to_income": compute_debt_to_income(user),
    }


def compute_score(user: UserInput) -> tuple[int, dict[str, float]]:
    """
    Compute the final credit score (300-900) and factor sub-scores.

    Returns:
        (score, factor_scores) where score is 300-900 int
        and factor_scores is dict of factor_name -> 0-100 float.
    """
    factors = compute_all_factors(user)

    # Weighted sum → 0-100 scale
    weighted_sum = sum(
        factors[factor] * weight
        for factor, weight in WEIGHTS.items()
    )

    # Map to 300-900 range
    score = int(SCORE_MIN + (weighted_sum / 100) * SCORE_RANGE)
    score = min(max(score, SCORE_MIN), SCORE_MAX)

    return score, factors


def get_band(score: int) -> tuple[str, str]:
    """
    Get the credit band and color for a given score.

    Returns:
        (band_name, band_color_hex)
    """
    if score >= 750:
        return "Excellent", "#10B981"
    elif score >= 650:
        return "Good", "#3B82F6"
    elif score >= 500:
        return "Fair", "#F59E0B"
    else:
        return "Poor", "#EF4444"


def compute_confidence_margin(user: UserInput) -> int:
    """
    Compute confidence margin based on data completeness.
    More data = narrower confidence interval.
    """
    data_points = 0
    total_possible = 8

    if user.monthly_income > 0:
        data_points += 1
    if user.monthly_expenses > 0:
        data_points += 1
    if user.savings_amount > 0:
        data_points += 1
    if user.existing_debt >= 0:
        data_points += 1
    if user.rent > 0:
        data_points += 1
    if user.discretionary >= 0:
        data_points += 1
    if user.telecom_regularity:
        data_points += 1
    # bill_payment and employment_type always provided
    data_points += 1

    completeness = data_points / total_possible
    # Max margin 50, minimum 15 with full data
    margin = int(50 - (completeness * 35))
    return max(margin, 15)


def compute_benchmark_percentile(score: int) -> int:
    """
    Compute approximate benchmark percentile.
    Based on simulated distribution of alternative credit scores.
    """
    # Approximate percentile mapping
    if score >= 800:
        return 95
    elif score >= 750:
        return 88
    elif score >= 700:
        return 78
    elif score >= 650:
        return 67
    elif score >= 600:
        return 52
    elif score >= 550:
        return 40
    elif score >= 500:
        return 28
    elif score >= 450:
        return 18
    elif score >= 400:
        return 10
    else:
        return 5
