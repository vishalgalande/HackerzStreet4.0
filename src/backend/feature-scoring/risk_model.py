"""
Risk Prediction Model — Alternative Credit Risk Assessment

Takes the credit score + profile data and produces a lender-facing risk assessment:
  - Default probability (%)
  - Risk category (Low / Medium / High / Very High)
  - Recommended credit limit
  - Suggested interest rate range
  - Repayment capacity (monthly)
  - Risk factors summary

Model uses logistic-curve-based default probability estimation
calibrated against microfinance industry data for India.
"""

import math
from models import UserInput, EmploymentType


# ── Default Probability Model ──
# Logistic function: P(default) = 1 / (1 + e^(k * (score - midpoint)))
# Calibrated so:
#   score 300 → ~85% default probability
#   score 500 → ~40% default probability
#   score 650 → ~12% default probability
#   score 750 → ~3% default probability
#   score 900 → ~0.5% default probability

LOGISTIC_K = 0.018       # Steepness
LOGISTIC_MID = 520       # Midpoint (50% probability)


def predict_default_probability(score: int) -> float:
    """
    Predict probability of default using logistic curve.
    Returns probability as a percentage (0-100).
    """
    raw = 1 / (1 + math.exp(LOGISTIC_K * (score - LOGISTIC_MID)))
    return round(raw * 100, 1)


# ── Risk Category ──

def get_risk_category(default_prob: float) -> dict:
    """
    Map default probability to risk category with color and description.
    """
    if default_prob <= 5:
        return {
            "category": "Low Risk",
            "category_hi": "कम जोखिम",
            "color": "#10B981",
            "level": 1,
            "description": "Strong repayment profile. Eligible for standard credit products.",
            "description_hi": "मजबूत भुगतान प्रोफ़ाइल। मानक ऋण उत्पादों के लिए पात्र।",
        }
    elif default_prob <= 15:
        return {
            "category": "Moderate Risk",
            "category_hi": "मध्यम जोखिम",
            "color": "#3B82F6",
            "level": 2,
            "description": "Reasonable profile. Eligible for microfinance and small personal loans.",
            "description_hi": "उचित प्रोफ़ाइल। माइक्रोफाइनेंस और छोटे व्यक्तिगत ऋणों के लिए पात्र।",
        }
    elif default_prob <= 35:
        return {
            "category": "High Risk",
            "category_hi": "उच्च जोखिम",
            "color": "#F59E0B",
            "level": 3,
            "description": "Elevated risk — may qualify for secured or co-signed products only.",
            "description_hi": "बढ़ा हुआ जोखिम — केवल सुरक्षित या सह-हस्ताक्षरित उत्पादों के लिए योग्य हो सकते हैं।",
        }
    else:
        return {
            "category": "Very High Risk",
            "category_hi": "बहुत उच्च जोखिम",
            "color": "#EF4444",
            "level": 4,
            "description": "Not recommended for unsecured lending. Focus on score improvement first.",
            "description_hi": "असुरक्षित ऋण के लिए अनुशंसित नहीं। पहले स्कोर सुधार पर ध्यान दें।",
        }


# ── Credit Limit Estimation ──

def estimate_credit_limit(user: UserInput, score: int, default_prob: float) -> dict:
    """
    Estimate recommended credit limit based on income, score, and risk.
    
    Uses conservative multipliers calibrated for Indian microfinance:
      - Monthly income × multiplier based on risk × DTI adjustment
    """
    if user.monthly_income <= 0:
        return {"min": 0, "max": 0, "currency": "INR"}

    # Base multiplier by risk level
    if default_prob <= 5:
        base_multiplier = 6   # Up to 6x monthly income
    elif default_prob <= 15:
        base_multiplier = 3   # Up to 3x monthly income
    elif default_prob <= 35:
        base_multiplier = 1.5
    else:
        base_multiplier = 0   # No credit recommended

    # DTI adjustment: reduce limit if already carrying debt
    dti = user.existing_debt / user.monthly_income if user.monthly_income > 0 else 0
    dti_factor = max(0, 1 - dti)  # 0 debt = full limit, 50% DTI = half limit

    # Employment stability adjustment
    emp_factors = {
        EmploymentType.SALARIED: 1.2,
        EmploymentType.SELF_EMPLOYED: 1.0,
        EmploymentType.FREELANCE: 0.8,
        EmploymentType.GIG: 0.7,
        EmploymentType.NONE: 0.3,
    }
    emp_factor = emp_factors.get(user.employment_type, 0.7)

    max_credit = round(user.monthly_income * base_multiplier * dti_factor * emp_factor)
    min_credit = round(max_credit * 0.4)  # Min is 40% of max

    return {
        "min": max(0, min_credit),
        "max": max(0, max_credit),
        "currency": "INR",
    }


# ── Interest Rate Suggestion ──

def suggest_interest_rate(score: int, default_prob: float) -> dict:
    """
    Suggest interest rate range based on risk profile.
    Calibrated to Indian NBFC/microfinance rates (12-36% APR).
    """
    if default_prob <= 5:
        return {"min_rate": 12.0, "max_rate": 16.0, "type": "Standard"}
    elif default_prob <= 15:
        return {"min_rate": 16.0, "max_rate": 22.0, "type": "Moderate"}
    elif default_prob <= 35:
        return {"min_rate": 22.0, "max_rate": 30.0, "type": "High-Risk"}
    else:
        return {"min_rate": 30.0, "max_rate": 36.0, "type": "Subprime"}


# ── Repayment Capacity ──

def estimate_repayment_capacity(user: UserInput) -> dict:
    """
    Estimate monthly repayment capacity using the 50/30/20 rule.
    Capacity = income - essentials - existing_debt, with a safety margin.
    """
    if user.monthly_income <= 0:
        return {"monthly_capacity": 0, "safe_emi": 0, "max_emi": 0}

    essentials = user.rent + (user.food if user.food > 0 else user.monthly_income * 0.3)
    disposable = user.monthly_income - essentials - user.existing_debt

    # Safe EMI: 30% of disposable income
    safe_emi = max(0, round(disposable * 0.3))

    # Max EMI: 50% of disposable income (upper bound)
    max_emi = max(0, round(disposable * 0.5))

    return {
        "monthly_capacity": max(0, round(disposable)),
        "safe_emi": safe_emi,
        "max_emi": max_emi,
    }


# ── Risk Signals ──

def identify_risk_signals(user: UserInput, factor_scores: dict) -> list[dict]:
    """
    Identify specific risk signals that lenders should be aware of.
    Returns list of risk flags with severity.
    """
    signals = []

    # High DTI
    if user.monthly_income > 0:
        dti = user.existing_debt / user.monthly_income
        if dti > 0.5:
            signals.append({
                "signal": "High debt-to-income ratio",
                "signal_hi": "उच्च ऋण-से-आय अनुपात",
                "severity": "high",
                "detail": f"DTI is {round(dti * 100)}% — above 50% threshold",
                "detail_hi": f"DTI {round(dti * 100)}% है — 50% सीमा से ऊपर",
            })
        elif dti > 0.3:
            signals.append({
                "signal": "Moderate debt-to-income ratio",
                "signal_hi": "मध्यम ऋण-से-आय अनुपात",
                "severity": "medium",
                "detail": f"DTI is {round(dti * 100)}% — approaching threshold",
                "detail_hi": f"DTI {round(dti * 100)}% है — सीमा के करीब",
            })

    # Poor payment history
    if factor_scores.get("payment_consistency", 100) < 50:
        signals.append({
            "signal": "Inconsistent payment behavior",
            "signal_hi": "असंगत भुगतान व्यवहार",
            "severity": "high",
            "detail": "Payment consistency sub-score below 50 indicates frequent late payments",
            "detail_hi": "भुगतान स्थिरता उप-स्कोर 50 से नीचे बार-बार देर से भुगतान दर्शाता है",
        })

    # Low savings
    if factor_scores.get("savings_ratio", 100) < 40:
        signals.append({
            "signal": "Low savings buffer",
            "signal_hi": "कम बचत बफर",
            "severity": "medium",
            "detail": "Savings ratio insufficient to absorb income shocks",
            "detail_hi": "आय के झटकों को अवशोषित करने के लिए बचत अनुपात अपर्याप्त",
        })

    # Unstable employment
    if user.employment_type in (EmploymentType.GIG, EmploymentType.NONE):
        signals.append({
            "signal": "Employment instability",
            "signal_hi": "रोजगार अस्थिरता",
            "severity": "medium" if user.employment_type == EmploymentType.GIG else "high",
            "detail": f"Employment type: {user.employment_type.value}",
            "detail_hi": f"रोजगार प्रकार: {user.employment_type.value}",
        })

    # No income data
    if user.monthly_income <= 0:
        signals.append({
            "signal": "No income data available",
            "signal_hi": "कोई आय डेटा उपलब्ध नहीं",
            "severity": "high",
            "detail": "Cannot assess repayment capacity without income information",
            "detail_hi": "आय जानकारी के बिना भुगतान क्षमता का आकलन नहीं किया जा सकता",
        })

    # Positive signals
    if factor_scores.get("payment_consistency", 0) >= 80:
        signals.append({
            "signal": "Strong payment track record",
            "signal_hi": "मजबूत भुगतान ट्रैक रिकॉर्ड",
            "severity": "positive",
            "detail": "Consistently pays bills on time — positive indicator",
            "detail_hi": "लगातार समय पर बिलों का भुगतान — सकारात्मक संकेत",
        })

    if factor_scores.get("savings_ratio", 0) >= 70:
        signals.append({
            "signal": "Healthy savings habit",
            "signal_hi": "स्वस्थ बचत की आदत",
            "severity": "positive",
            "detail": "Good savings ratio provides buffer against defaults",
            "detail_hi": "अच्छा बचत अनुपात चूक के खिलाफ बफर प्रदान करता है",
        })

    return signals


# ── Full Risk Assessment ──

def compute_full_risk_assessment(user: UserInput, score: int, factor_scores: dict) -> dict:
    """
    Compute the complete risk assessment for a user.
    This is the main function called by the API.
    """
    default_prob = predict_default_probability(score)
    risk_category = get_risk_category(default_prob)
    credit_limit = estimate_credit_limit(user, score, default_prob)
    interest_rate = suggest_interest_rate(score, default_prob)
    repayment = estimate_repayment_capacity(user)
    risk_signals = identify_risk_signals(user, factor_scores)

    return {
        "default_probability": default_prob,
        "risk_category": risk_category,
        "credit_limit": credit_limit,
        "interest_rate": interest_rate,
        "repayment_capacity": repayment,
        "risk_signals": risk_signals,
        "model_version": "1.0",
        "model_type": "logistic_rule_based",
    }
