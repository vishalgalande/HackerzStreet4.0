"""
Email trigger logic — checks credit score and spending patterns,
sends automated emails when thresholds are breached.
"""

from email_service import send_email, is_email_enabled
from email_templates import (
    build_low_score_email,
    build_spending_spike_email,
)
from spending_analysis import detect_spending_spike

# Thresholds
SCORE_THRESHOLD = 450
SPENDING_SPIKE_THRESHOLD = 0.20  # 20%


async def check_and_send_alerts(
    user_email: str,
    user_name: str,
    score: int,
    factor_scores: dict,
    recommendations: list[str],
    entries: list[dict],
) -> dict:
    """
    Master trigger function — checks all alert conditions and sends emails.

    Called after score computation or on manual trigger.

    Args:
        user_email: Recipient email address.
        user_name: User's display name.
        score: Credit score (300-900).
        factor_scores: Dict of factor_name -> sub-score (0-100).
        recommendations: List of recommendation strings.
        entries: User's daily entry dicts (for spending analysis).

    Returns:
        dict summarising which alerts were triggered and sent.
    """
    if not is_email_enabled():
        return {
            "alerts_checked": True,
            "email_enabled": False,
            "alerts_sent": [],
            "errors": ["RESEND_API_KEY not configured — no emails sent"],
        }

    alerts_sent = []
    errors = []

    # ── Check 1: Low credit score ──
    if score < SCORE_THRESHOLD:
        subject, html = build_low_score_email(
            user_name=user_name,
            score=score,
            factor_scores=factor_scores,
            recommendations=recommendations,
        )
        result = await send_email(user_email, subject, html)

        if result["success"]:
            alerts_sent.append({
                "type": "low_score",
                "trigger": f"Score {score} < {SCORE_THRESHOLD}",
                "email_id": result["id"],
            })
        else:
            errors.append(f"Low score email failed: {result['error']}")

    # ── Check 2: Spending spike ──
    spike = detect_spending_spike(entries, threshold=SPENDING_SPIKE_THRESHOLD)
    if spike:
        subject, html = build_spending_spike_email(
            user_name=user_name,
            current_week_avg=spike["current_week_avg"],
            historical_avg=spike["historical_avg"],
            pct_increase=spike["pct_increase"],
            top_categories=spike["top_categories"],
        )
        result = await send_email(user_email, subject, html)

        if result["success"]:
            alerts_sent.append({
                "type": "spending_spike",
                "trigger": f"Weekly spending up {spike['pct_increase']:.1f}%",
                "email_id": result["id"],
                "details": spike,
            })
        else:
            errors.append(f"Spending spike email failed: {result['error']}")

    return {
        "alerts_checked": True,
        "email_enabled": True,
        "score_below_threshold": score < SCORE_THRESHOLD,
        "spending_spike_detected": spike is not None,
        "alerts_sent": alerts_sent,
        "errors": errors if errors else None,
    }
