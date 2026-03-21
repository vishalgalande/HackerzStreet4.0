"""
Explainability module — generates SHAP-style factor attributions
and plain-language explanations in English and Hindi.
"""

from models import UserInput, FactorContribution
from scoring import WEIGHTS, BASE_SCORE, SCORE_RANGE, compute_all_factors


# Factor display names
FACTOR_LABELS = {
    "payment_consistency": {
        "en": "Payment Consistency",
        "hi": "भुगतान नियमितता",
    },
    "savings_ratio": {
        "en": "Savings Discipline",
        "hi": "बचत अनुशासन",
    },
    "income_stability": {
        "en": "Income Stability",
        "hi": "आय स्थिरता",
    },
    "spending_discipline": {
        "en": "Spending Discipline",
        "hi": "खर्च अनुशासन",
    },
    "debt_to_income": {
        "en": "Debt-to-Income Ratio",
        "hi": "ऋण-से-आय अनुपात",
    },
}


def _get_description(factor: str, sub_score: float, user: UserInput) -> tuple[str, str]:
    """Generate plain-language description for a factor score."""

    if factor == "payment_consistency":
        if sub_score >= 80:
            return (
                "Consistent bill and rent payments demonstrate strong reliability",
                "नियमित बिल और किराया भुगतान मजबूत विश्वसनीयता दर्शाते हैं"
            )
        elif sub_score >= 50:
            return (
                "Some late payments detected — improving consistency would boost your score",
                "कुछ देर से भुगतान पाए गए — नियमितता सुधारने से स्कोर बढ़ेगा"
            )
        else:
            return (
                "Frequent late or missed payments are significantly reducing your score",
                "बार-बार देर से या छूटे भुगतान आपके स्कोर को काफी कम कर रहे हैं"
            )

    elif factor == "savings_ratio":
        if user.monthly_income > 0:
            ratio = user.savings_amount / user.monthly_income * 100
            ratio_str = f"{ratio:.0f}%"
        else:
            ratio_str = "N/A"

        if sub_score >= 80:
            return (
                f"Strong savings discipline ({ratio_str} of income saved each month)",
                f"मजबूत बचत अनुशासन (आय का {ratio_str} हर महीने बचाया जाता है)"
            )
        elif sub_score >= 50:
            return (
                f"Moderate savings rate ({ratio_str}) — aim for 20%+ for better score",
                f"मध्यम बचत दर ({ratio_str}) — बेहतर स्कोर के लिए 20%+ का लक्ष्य रखें"
            )
        else:
            return (
                f"Low savings ratio ({ratio_str}) indicates vulnerability to income shocks",
                f"कम बचत अनुपात ({ratio_str}) आय के झटकों के प्रति संवेदनशीलता दर्शाता है"
            )

    elif factor == "income_stability":
        emp_type = user.employment_type.value.replace("_", " ").title()
        if sub_score >= 80:
            return (
                f"Stable income source ({emp_type}) with healthy surplus",
                f"स्थिर आय स्रोत ({emp_type}) स्वस्थ अधिशेष के साथ"
            )
        elif sub_score >= 50:
            return (
                f"Income source ({emp_type}) has moderate stability — regularity helps",
                f"आय स्रोत ({emp_type}) में मध्यम स्थिरता है — नियमितता मदद करती है"
            )
        else:
            return (
                f"Irregular income pattern ({emp_type}) increases perceived risk",
                f"अनियमित आय पैटर्न ({emp_type}) कथित जोखिम बढ़ाता है"
            )

    elif factor == "spending_discipline":
        if sub_score >= 80:
            return (
                "Low discretionary spending shows strong financial maturity",
                "कम विवेकाधीन खर्च मजबूत वित्तीय परिपक्वता दर्शाता है"
            )
        elif sub_score >= 50:
            return (
                "Moderate discretionary spending — reducing non-essentials would help",
                "मध्यम विवेकाधीन खर्च — गैर-आवश्यक खर्चों को कम करना सहायक होगा"
            )
        else:
            return (
                "High discretionary spending relative to income signals financial risk",
                "आय के सापेक्ष उच्च विवेकाधीन खर्च वित्तीय जोखिम का संकेत देता है"
            )

    elif factor == "debt_to_income":
        if user.existing_debt == 0:
            return (
                "No existing debt obligations — full capacity for new credit",
                "कोई मौजूदा ऋण दायित्व नहीं — नए ऋण के लिए पूर्ण क्षमता"
            )
        elif sub_score >= 70:
            return (
                "Manageable debt level relative to income",
                "आय के सापेक्ष प्रबंधनीय ऋण स्तर"
            )
        elif sub_score >= 40:
            return (
                "Moderate debt burden — clearing some obligations would improve score",
                "मध्यम ऋण भार — कुछ दायित्वों को चुकाने से स्कोर में सुधार होगा"
            )
        else:
            return (
                "High debt-to-income ratio severely limits creditworthiness",
                "उच्च ऋण-से-आय अनुपात साख को गंभीर रूप से सीमित करता है"
            )

    return ("", "")


def compute_factor_contributions(
    user: UserInput,
    factor_scores: dict[str, float],
    final_score: int,
) -> list[FactorContribution]:
    """
    Compute SHAP-style point contributions for each factor.

    Each factor's contribution is calculated as:
      points = (factor_sub_score / 100) * weight * SCORE_RANGE - neutral_contribution

    where neutral_contribution is what a 50/100 sub-score would contribute.
    """
    contributions = []
    neutral_sub_score = 50  # midpoint

    for factor, sub_score in factor_scores.items():
        weight = WEIGHTS[factor]

        # Points relative to neutral midpoint
        neutral_contribution = (neutral_sub_score / 100) * weight * SCORE_RANGE
        actual_contribution = (sub_score / 100) * weight * SCORE_RANGE
        points = actual_contribution - neutral_contribution

        labels = FACTOR_LABELS[factor]
        desc_en, desc_hi = _get_description(factor, sub_score, user)

        contributions.append(FactorContribution(
            factor=factor,
            label=labels["en"],
            label_hi=labels["hi"],
            points=round(points, 1),
            is_positive=points >= 0,
            description=desc_en,
            description_hi=desc_hi,
        ))

    # Sort by absolute impact descending
    contributions.sort(key=lambda c: abs(c.points), reverse=True)
    return contributions


def get_positive_factors(contributions: list[FactorContribution]) -> list[FactorContribution]:
    """Get top 3 positive contributors."""
    return [c for c in contributions if c.is_positive][:3]


def get_negative_factors(contributions: list[FactorContribution]) -> list[FactorContribution]:
    """Get top 3 negative contributors."""
    return [c for c in contributions if not c.is_positive][:3]


def generate_summary(score: int, band: str, contributions: list[FactorContribution]) -> tuple[str, str]:
    """Generate a one-paragraph plain-language summary."""
    top_positive = [c for c in contributions if c.is_positive]
    top_negative = [c for c in contributions if not c.is_positive]

    pos_text = ""
    if top_positive:
        pos_text = f"Your strongest factor is {top_positive[0].label.lower()} (+{top_positive[0].points:.0f} pts). "

    neg_text = ""
    if top_negative:
        neg_text = f"The biggest area for improvement is {top_negative[0].label.lower()} ({top_negative[0].points:.0f} pts). "

    summary_en = (
        f"Your alternative credit score is {score} ({band}). "
        f"{pos_text}{neg_text}"
        f"Focus on your weakest factors to improve your score over the next 3-6 months."
    )

    pos_text_hi = ""
    if top_positive:
        pos_text_hi = f"आपका सबसे मजबूत कारक {top_positive[0].label_hi} (+{top_positive[0].points:.0f} अंक) है। "

    neg_text_hi = ""
    if top_negative:
        neg_text_hi = f"सुधार का सबसे बड़ा क्षेत्र {top_negative[0].label_hi} ({top_negative[0].points:.0f} अंक) है। "

    summary_hi = (
        f"आपका वैकल्पिक क्रेडिट स्कोर {score} ({band}) है। "
        f"{pos_text_hi}{neg_text_hi}"
        f"अगले 3-6 महीनों में अपना स्कोर सुधारने के लिए अपने सबसे कमजोर कारकों पर ध्यान दें।"
    )

    return summary_en, summary_hi
