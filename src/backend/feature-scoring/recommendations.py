"""
Recommendation engine — generates ranked improvement suggestions
based on the user's lowest-scoring factors.
"""

from models import UserInput, Recommendation


def generate_recommendations(
    user: UserInput,
    factor_scores: dict[str, float],
) -> list[Recommendation]:
    """
    Generate ranked recommendations based on lowest-scoring factors.
    Each recommendation includes action, impact, effort, timeframe, and explanation.
    """
    recommendations = []

    # Payment consistency recommendations
    if factor_scores["payment_consistency"] < 80:
        if factor_scores["payment_consistency"] < 50:
            recommendations.append(Recommendation(
                action="Pay all bills (electricity, mobile, rent) on time for 3 consecutive months",
                action_hi="3 लगातार महीनों तक सभी बिल (बिजली, मोबाइल, किराया) समय पर भुगतान करें",
                impact_min=15,
                impact_max=25,
                effort="medium",
                timeframe="90 days",
                explanation="Payment history is the strongest predictor of creditworthiness. Consistent on-time payments demonstrate financial reliability.",
                explanation_hi="भुगतान इतिहास साख का सबसे मजबूत भविष्यवक्ता है। लगातार समय पर भुगतान वित्तीय विश्वसनीयता दर्शाता है।",
            ))
        else:
            recommendations.append(Recommendation(
                action="Maintain your current bill payment streak — avoid any late payments",
                action_hi="अपनी वर्तमान बिल भुगतान श्रृंखला बनाए रखें — किसी भी देर से भुगतान से बचें",
                impact_min=8,
                impact_max=15,
                effort="low",
                timeframe="60 days",
                explanation="You're already paying most bills on time. Eliminating the occasional late payment can significantly improve your score.",
                explanation_hi="आप पहले से अधिकांश बिल समय पर भुगतान कर रहे हैं। कभी-कभार देर से भुगतान को समाप्त करने से आपका स्कोर काफी सुधर सकता है।",
            ))

    # Savings ratio recommendations
    if factor_scores["savings_ratio"] < 80:
        savings_pct = 0
        if user.monthly_income > 0:
            savings_pct = (user.savings_amount / user.monthly_income) * 100

        if savings_pct < 10:
            recommendations.append(Recommendation(
                action="Build an emergency savings buffer of at least 1 month's income",
                action_hi="कम से कम 1 महीने की आय का आपातकालीन बचत कोष बनाएं",
                impact_min=20,
                impact_max=30,
                effort="high",
                timeframe="6 months",
                explanation="An emergency fund signals financial resilience and reduces your default risk in lenders' eyes.",
                explanation_hi="आपातकालीन कोष वित्तीय लचीलापन दर्शाता है और उधारदाताओं की नजर में आपका चूक जोखिम कम करता है।",
            ))
        else:
            recommendations.append(Recommendation(
                action=f"Increase your savings rate from {savings_pct:.0f}% to 20% of income",
                action_hi=f"अपनी बचत दर को आय के {savings_pct:.0f}% से 20% तक बढ़ाएं",
                impact_min=10,
                impact_max=18,
                effort="medium",
                timeframe="3 months",
                explanation="A 20%+ savings ratio provides a strong buffer against income shocks and is a key indicator for alternative credit scoring.",
                explanation_hi="20%+ बचत अनुपात आय के झटकों के खिलाफ मजबूत बफर प्रदान करता है और वैकल्पिक क्रेडिट स्कोरिंग के लिए एक प्रमुख संकेतक है।",
            ))

    # Income stability recommendations
    if factor_scores["income_stability"] < 70:
        recommendations.append(Recommendation(
            action="Diversify income sources or establish a regular payment pattern from clients",
            action_hi="आय के स्रोतों में विविधता लाएं या ग्राहकों से नियमित भुगतान पैटर्न स्थापित करें",
            impact_min=8,
            impact_max=15,
            effort="high",
            timeframe="3-6 months",
            explanation="Stable, predictable income patterns reduce perceived lending risk even for gig and freelance workers.",
            explanation_hi="स्थिर, पूर्वानुमेय आय पैटर्न गिग और फ्रीलांस श्रमिकों के लिए भी कथित ऋण जोखिम को कम करता है।",
        ))

    # Spending discipline recommendations
    if factor_scores["spending_discipline"] < 70:
        recommendations.append(Recommendation(
            action="Reduce discretionary spending to below 20% of monthly income",
            action_hi="विवेकाधीन खर्च को मासिक आय के 20% से नीचे कम करें",
            impact_min=10,
            impact_max=15,
            effort="medium",
            timeframe="60 days",
            explanation="High non-essential spending signals lower financial maturity. Reducing it shows discipline and increases repayment capacity.",
            explanation_hi="उच्च गैर-आवश्यक खर्च कम वित्तीय परिपक्वता का संकेत देता है। इसे कम करना अनुशासन दर्शाता है और पुनर्भुगतान क्षमता बढ़ाता है।",
        ))

    # Debt-to-income recommendations
    if factor_scores["debt_to_income"] < 80 and user.existing_debt > 0:
        recommendations.append(Recommendation(
            action="Clear your smallest existing debt first (debt snowball method)",
            action_hi="पहले अपना सबसे छोटा मौजूदा ऋण चुकाएं (ऋण स्नोबॉल विधि)",
            impact_min=8,
            impact_max=12,
            effort="medium",
            timeframe="Per debt cleared",
            explanation="Each debt you clear reduces your debt-to-income ratio and frees up capacity for new credit.",
            explanation_hi="आप जो प्रत्येक ऋण चुकाते हैं, वह आपके ऋण-से-आय अनुपात को कम करता है और नए ऋण के लिए क्षमता मुक्त करता है।",
        ))

    # Telecom regularity recommendation
    if not user.telecom_regularity:
        recommendations.append(Recommendation(
            action="Set up auto-pay for your mobile/telecom plan to build payment track record",
            action_hi="भुगतान ट्रैक रिकॉर्ड बनाने के लिए अपने मोबाइल/टेलीकॉम प्लान के लिए ऑटो-पे सेट करें",
            impact_min=3,
            impact_max=8,
            effort="low",
            timeframe="30 days",
            explanation="Regular telecom payments are an easy win — they add a small but consistent positive signal to your credit profile.",
            explanation_hi="नियमित टेलीकॉम भुगतान एक आसान जीत है — वे आपकी क्रेडिट प्रोफ़ाइल में एक छोटा लेकिन लगातार सकारात्मक संकेत जोड़ते हैं।",
        ))

    # Sort by maximum impact descending
    recommendations.sort(key=lambda r: r.impact_max, reverse=True)

    return recommendations
