"""
HTML email templates for credit score alerts and spending warnings.
Tone: constructive criticism with aggressive motivation.
"""


def build_low_score_email(
    user_name: str,
    score: int,
    factor_scores: dict,
    recommendations: list[str],
) -> tuple[str, str]:
    """
    Build a warning email for credit score below 450.

    Returns:
        (subject, html_body)
    """
    subject = f"⚠️ WAKE-UP CALL: Your Credit Score Dropped to {score} — Time to Fight Back!"

    # Identify weakest factors
    sorted_factors = sorted(factor_scores.items(), key=lambda x: x[1])
    weakest = sorted_factors[:3]

    factor_labels = {
        "payment_consistency": "Payment Consistency",
        "savings_ratio": "Savings Ratio",
        "income_stability": "Income Stability",
        "spending_discipline": "Spending Discipline",
        "debt_to_income": "Debt-to-Income Ratio",
    }

    weakness_rows = ""
    for factor_key, factor_val in weakest:
        label = factor_labels.get(factor_key, factor_key)
        bar_width = max(int(factor_val), 5)
        bar_color = "#EF4444" if factor_val < 40 else "#F59E0B" if factor_val < 60 else "#10B981"
        weakness_rows += f"""
        <tr>
            <td style="padding: 10px 16px; font-weight: 600; color: #1F2937;">{label}</td>
            <td style="padding: 10px 16px;">
                <div style="background: #F3F4F6; border-radius: 8px; overflow: hidden; height: 24px;">
                    <div style="background: {bar_color}; width: {bar_width}%; height: 100%; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-size: 12px; font-weight: 700;">
                        {int(factor_val)}/100
                    </div>
                </div>
            </td>
        </tr>"""

    rec_items = ""
    for i, rec in enumerate(recommendations[:5], 1):
        rec_items += f"""
        <tr>
            <td style="padding: 12px 16px; border-bottom: 1px solid #F3F4F6;">
                <span style="display: inline-block; width: 28px; height: 28px; background: #6366F1; color: white; border-radius: 50%; text-align: center; line-height: 28px; font-weight: 700; font-size: 13px; margin-right: 12px;">{i}</span>
                <span style="color: #1F2937; font-size: 15px;">{rec}</span>
            </td>
        </tr>"""

    html_body = f"""
    <!DOCTYPE html>
    <html>
    <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
    <body style="margin: 0; padding: 0; background: #0F172A; font-family: 'Segoe UI', Arial, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background: #0F172A;">

            <!-- Header -->
            <div style="background: linear-gradient(135deg, #DC2626 0%, #991B1B 100%); padding: 40px 32px; text-align: center;">
                <div style="font-size: 48px; margin-bottom: 8px;">🚨</div>
                <h1 style="color: white; font-size: 26px; margin: 0 0 8px 0; font-weight: 800;">
                    YOUR SCORE IS {score}
                </h1>
                <p style="color: #FCA5A5; font-size: 16px; margin: 0;">
                    This is below the 450 danger zone. But this is NOT the end — it's your starting line.
                </p>
            </div>

            <!-- Motivation Block -->
            <div style="background: #1E293B; padding: 28px 32px; border-left: 4px solid #F59E0B;">
                <p style="color: #FCD34D; font-size: 18px; font-weight: 700; margin: 0 0 8px 0;">
                    Hey {user_name}, let's be real.
                </p>
                <p style="color: #CBD5E1; font-size: 15px; line-height: 1.6; margin: 0;">
                    A score of <strong style="color: #EF4444;">{score}</strong> means lenders see you as high-risk.
                    You need a guarantor or collateral just to be considered for a loan.
                    <strong style="color: #FCD34D;">But here's the thing — scores change. Yours WILL change.</strong>
                    Every single person who ever hit 750+ was once where you are now.
                    The only difference? They decided to fight.
                </p>
            </div>

            <!-- Weakest Factors -->
            <div style="padding: 28px 32px; background: #0F172A;">
                <h2 style="color: #F1F5F9; font-size: 18px; margin: 0 0 16px 0; font-weight: 700;">
                    🎯 Where You're Bleeding Points
                </h2>
                <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 12px; overflow: hidden;">
                    {weakness_rows}
                </table>
            </div>

            <!-- Action Plan -->
            <div style="padding: 0 32px 28px 32px; background: #0F172A;">
                <h2 style="color: #F1F5F9; font-size: 18px; margin: 0 0 16px 0; font-weight: 700;">
                    🔥 Your Comeback Playbook
                </h2>
                <table style="width: 100%; border-collapse: collapse; background: #1E293B; border-radius: 12px; overflow: hidden;">
                    {rec_items if rec_items else '<tr><td style="padding: 16px; color: #94A3B8;">Log your daily expenses to unlock personalised recommendations.</td></tr>'}
                </table>
            </div>

            <!-- Motivational CTA -->
            <div style="padding: 32px; background: linear-gradient(135deg, #4F46E5 0%, #6366F1 100%); text-align: center;">
                <p style="color: white; font-size: 20px; font-weight: 800; margin: 0 0 8px 0;">
                    Stop scrolling. Start acting.
                </p>
                <p style="color: #C7D2FE; font-size: 15px; margin: 0 0 20px 0;">
                    Every day you log your expenses, pay a bill on time, or save even ₹100 — your score climbs.
                    Consistency beats talent. Discipline beats luck. <strong>You've got this.</strong>
                </p>
                <div style="display: inline-block; background: white; color: #4F46E5; padding: 14px 36px; border-radius: 8px; font-weight: 800; font-size: 16px; text-decoration: none;">
                    LOG TODAY'S EXPENSES NOW →
                </div>
            </div>

            <!-- Footer -->
            <div style="padding: 24px 32px; text-align: center; background: #0F172A;">
                <p style="color: #64748B; font-size: 12px; margin: 0;">
                    CreditWise — Alternative Credit Risk Assessment Tool<br>
                    This is an automated alert. You received this because your score dropped below 450.
                </p>
            </div>
        </div>
    </body>
    </html>
    """

    return subject, html_body


def build_spending_spike_email(
    user_name: str,
    current_week_avg: float,
    historical_avg: float,
    pct_increase: float,
    top_categories: list[dict],
) -> tuple[str, str]:
    """
    Build a spending spike warning email.

    Args:
        user_name: User's display name.
        current_week_avg: Average daily spending this week (INR).
        historical_avg: Average daily spending historically (INR).
        pct_increase: Percentage increase (e.g. 25.3 for 25.3%).
        top_categories: List of dicts with 'name', 'current', 'average', 'increase_pct'.

    Returns:
        (subject, html_body)
    """
    subject = f"📊 Spending Alert: Your expenses surged {pct_increase:.0f}% this week — Here's your damage report"

    category_rows = ""
    for cat in top_categories[:4]:
        arrow = "📈" if cat.get("increase_pct", 0) > 0 else "➡️"
        color = "#EF4444" if cat.get("increase_pct", 0) > 20 else "#F59E0B" if cat.get("increase_pct", 0) > 0 else "#10B981"
        category_rows += f"""
        <tr>
            <td style="padding: 12px 16px; color: #1F2937; font-weight: 600;">{arrow} {cat['name']}</td>
            <td style="padding: 12px 16px; color: #6B7280;">₹{cat['average']:,.0f}/day</td>
            <td style="padding: 12px 16px; color: {color}; font-weight: 700;">₹{cat['current']:,.0f}/day</td>
            <td style="padding: 12px 16px; color: {color}; font-weight: 700;">+{cat.get('increase_pct', 0):.0f}%</td>
        </tr>"""

    html_body = f"""
    <!DOCTYPE html>
    <html>
    <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
    <body style="margin: 0; padding: 0; background: #0F172A; font-family: 'Segoe UI', Arial, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background: #0F172A;">

            <!-- Header -->
            <div style="background: linear-gradient(135deg, #D97706 0%, #B45309 100%); padding: 40px 32px; text-align: center;">
                <div style="font-size: 48px; margin-bottom: 8px;">💸</div>
                <h1 style="color: white; font-size: 24px; margin: 0 0 8px 0; font-weight: 800;">
                    SPENDING SPIKE DETECTED
                </h1>
                <p style="color: #FDE68A; font-size: 16px; margin: 0;">
                    Your weekly spending is <strong>{pct_increase:.0f}% above</strong> your usual average
                </p>
            </div>

            <!-- Reality Check -->
            <div style="background: #1E293B; padding: 28px 32px; border-left: 4px solid #EF4444;">
                <p style="color: #F87171; font-size: 18px; font-weight: 700; margin: 0 0 8px 0;">
                    {user_name}, your wallet is screaming.
                </p>
                <p style="color: #CBD5E1; font-size: 15px; line-height: 1.6; margin: 0;">
                    Your average daily spend this week: <strong style="color: #EF4444;">₹{current_week_avg:,.0f}</strong><br>
                    Your usual daily average: <strong style="color: #10B981;">₹{historical_avg:,.0f}</strong><br><br>
                    That's <strong style="color: #FCD34D;">₹{(current_week_avg - historical_avg) * 7:,.0f} extra burned this week</strong>.
                    This kind of spike tanks your Spending Discipline factor and drags your credit score down. 
                    <strong style="color: #FCD34D;">But you caught it early — that's what winners do.</strong>
                </p>
            </div>

            <!-- Category Breakdown -->
            <div style="padding: 28px 32px; background: #0F172A;">
                <h2 style="color: #F1F5F9; font-size: 18px; margin: 0 0 16px 0; font-weight: 700;">
                    📋 Where Your Money Went
                </h2>
                <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 12px; overflow: hidden;">
                    <tr style="background: #F1F5F9;">
                        <th style="padding: 10px 16px; text-align: left; font-size: 13px; color: #6B7280;">Category</th>
                        <th style="padding: 10px 16px; text-align: left; font-size: 13px; color: #6B7280;">Usual</th>
                        <th style="padding: 10px 16px; text-align: left; font-size: 13px; color: #6B7280;">This Week</th>
                        <th style="padding: 10px 16px; text-align: left; font-size: 13px; color: #6B7280;">Change</th>
                    </tr>
                    {category_rows}
                </table>
            </div>

            <!-- Action Items -->
            <div style="padding: 0 32px 28px 32px; background: #0F172A;">
                <h2 style="color: #F1F5F9; font-size: 18px; margin: 0 0 16px 0; font-weight: 700;">
                    ⚡ Immediate Damage Control
                </h2>
                <div style="background: #1E293B; border-radius: 12px; padding: 20px;">
                    <p style="color: #CBD5E1; font-size: 14px; line-height: 1.8; margin: 0;">
                        <strong style="color: #FCD34D;">1. FREEZE discretionary spending</strong> for the rest of the week. Needs only, no wants.<br>
                        <strong style="color: #FCD34D;">2. SET a daily budget</strong> of ₹{historical_avg:,.0f} for tomorrow and stick to it.<br>
                        <strong style="color: #FCD34D;">3. REVIEW</strong> your top spending category above — is there a subscription or habit you can cut?<br>
                        <strong style="color: #FCD34D;">4. LOG everything</strong> today. Awareness is the #1 predictor of behavior change.
                    </p>
                </div>
            </div>

            <!-- Motivational CTA -->
            <div style="padding: 32px; background: linear-gradient(135deg, #059669 0%, #10B981 100%); text-align: center;">
                <p style="color: white; font-size: 20px; font-weight: 800; margin: 0 0 8px 0;">
                    One bad week doesn't define you.
                </p>
                <p style="color: #A7F3D0; font-size: 15px; margin: 0 0 20px 0;">
                    The fact that you're reading this means you care about your financial future.
                    That already puts you ahead of 90% of people. <strong>Now prove it with your next expense log.</strong>
                </p>
                <div style="display: inline-block; background: white; color: #059669; padding: 14px 36px; border-radius: 8px; font-weight: 800; font-size: 16px; text-decoration: none;">
                    LOG TODAY'S EXPENSES →
                </div>
            </div>

            <!-- Footer -->
            <div style="padding: 24px 32px; text-align: center; background: #0F172A;">
                <p style="color: #64748B; font-size: 12px; margin: 0;">
                    CreditWise — Alternative Credit Risk Assessment Tool<br>
                    This is an automated alert. You received this because your weekly spending spiked 20%+ above average.
                </p>
            </div>
        </div>
    </body>
    </html>
    """

    return subject, html_body


def build_test_email(user_name: str) -> tuple[str, str]:
    """Build a simple test email to verify Resend is working."""
    subject = "✅ CreditWise — Email System Connected!"
    html_body = f"""
    <!DOCTYPE html>
    <html>
    <head><meta charset="UTF-8"></head>
    <body style="margin: 0; padding: 0; background: #0F172A; font-family: 'Segoe UI', Arial, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #4F46E5 0%, #6366F1 100%); padding: 40px 32px; text-align: center;">
                <div style="font-size: 48px; margin-bottom: 12px;">🎉</div>
                <h1 style="color: white; font-size: 24px; margin: 0 0 8px 0;">Connection Successful!</h1>
                <p style="color: #C7D2FE; font-size: 15px; margin: 0;">
                    Hey {user_name}, your CreditWise email alerts are now active.
                </p>
            </div>
            <div style="background: #1E293B; padding: 24px 32px;">
                <p style="color: #CBD5E1; font-size: 15px; line-height: 1.6;">
                    You'll receive automated emails when:
                </p>
                <ul style="color: #CBD5E1; font-size: 14px; line-height: 1.8;">
                    <li>📉 Your credit score drops below <strong style="color: #EF4444;">450</strong></li>
                    <li>💸 Your weekly spending spikes <strong style="color: #F59E0B;">20%+</strong> above average</li>
                </ul>
                <p style="color: #94A3B8; font-size: 13px; margin-top: 16px;">
                    This was a test email. No action needed.
                </p>
            </div>
        </div>
    </body>
    </html>
    """
    return subject, html_body


def build_timer_complete_email(
    user_name: str,
    item_description: str = "",
    item_price: float = 0,
) -> tuple[str, str]:
    """Build email sent when anti-impulse timer waiting period is over."""
    price_str = f"₹{item_price:,.0f}" if item_price > 0 else ""
    item_display = item_description or "an impulse purchase"

    subject = f"⏰ Timer Up: Do you still want {item_display}?" if item_description else "⏰ Your Waiting Period is Over — Decision Time!"

    item_block = ""
    if item_description or item_price > 0:
        item_block = f"""
            <!-- Item Details -->
            <div style="padding: 24px 32px; background: #0F172A;">
                <div style="background: #1E293B; border-radius: 16px; padding: 24px; text-align: center; border: 1px solid rgba(20, 184, 166, 0.2);">
                    <p style="color: #94A3B8; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 8px 0;">You were tempted by</p>
                    <p style="color: #F1F5F9; font-size: 22px; font-weight: 700; margin: 0 0 4px 0;">
                        🛍️ {item_description or "Impulse Purchase"}
                    </p>
                    {"<p style='color: #14B8A6; font-size: 28px; font-weight: 800; margin: 8px 0 0 0;'>" + price_str + "</p>" if price_str else ""}
                </div>
            </div>
        """

    html_body = f"""
    <!DOCTYPE html>
    <html>
    <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
    <body style="margin: 0; padding: 0; background: #0F172A; font-family: 'Segoe UI', Arial, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background: #0F172A;">

            <!-- Header -->
            <div style="background: linear-gradient(135deg, #14B8A6 0%, #06B6D4 100%); padding: 40px 32px; text-align: center;">
                <div style="font-size: 48px; margin-bottom: 8px;">⏰</div>
                <h1 style="color: white; font-size: 24px; margin: 0 0 8px 0; font-weight: 800;">
                    TIME'S UP!
                </h1>
                <p style="color: #A7F3D0; font-size: 16px; margin: 0;">
                    Your anti-impulse waiting period has ended
                </p>
            </div>

            {item_block}

            <!-- Decision Block -->
            <div style="background: #1E293B; padding: 28px 32px; border-left: 4px solid #14B8A6;">
                <p style="color: #5EEAD4; font-size: 18px; font-weight: 700; margin: 0 0 8px 0;">
                    Hey {user_name}, it's decision time.
                </p>
                <p style="color: #CBD5E1; font-size: 15px; line-height: 1.6; margin: 0;">
                    You set a waiting period before buying <strong style="color: #F1F5F9;">{item_display}</strong>{" for <strong style='color: #14B8A6;'>" + price_str + "</strong>" if price_str else ""}. That period is now over.<br><br>
                    <strong style="color: #FCD34D;">Ask yourself:</strong><br>
                    • Do you still want to buy it?<br>
                    • Is it a need or a want?<br>
                    • Will you regret it next month?<br><br>
                    If the urge has faded, <strong style="color: #14B8A6;">congratulations!</strong>
                    {"You just saved <strong style='color: #10B981;'>" + price_str + "</strong> and" if price_str else "You"} improved your Spending Discipline score.
                </p>
            </div>

            <!-- Stats -->
            <div style="padding: 32px; background: linear-gradient(135deg, #059669 0%, #10B981 100%); text-align: center;">
                <p style="color: white; font-size: 20px; font-weight: 800; margin: 0 0 8px 0;">
                    Impulse control = financial freedom.
                </p>
                <p style="color: #A7F3D0; font-size: 15px; margin: 0;">
                    Studies show that waiting 12–24 hours eliminates 70% of impulse purchases.
                    <strong>You just beat the system.</strong>
                </p>
            </div>

            <!-- Footer -->
            <div style="padding: 24px 32px; text-align: center; background: #0F172A;">
                <p style="color: #64748B; font-size: 12px; margin: 0;">
                    FinFix — Alternative Credit Risk Assessment Tool<br>
                    This timer notification was sent because your anti-impulse timer completed.
                </p>
            </div>
        </div>
    </body>
    </html>
    """
    return subject, html_body


def build_payment_reminder_email(
    user_name: str,
    payment_name: str,
    payment_amount: float,
    payment_type: str,
    due_date_str: str,
    reminder_type: str,
) -> tuple[str, str]:
    emoji = "⏰" if reminder_type == "upcoming" else "🔴"
    headline = f"Payment due in 3 days" if reminder_type == "upcoming" else "Payment due today"
    subject = f"{emoji} {headline}: {payment_name} — ₹{payment_amount:,.0f}"

    type_labels = {"loan": "EMI / Loan", "cc": "Credit Card", "bill": "Recurring Bill"}
    type_label = type_labels.get(payment_type, "Payment")

    urgency_color = "#F59E0B" if reminder_type == "upcoming" else "#EF4444"
    urgency_bg = "rgba(245, 158, 11, 0.1)" if reminder_type == "upcoming" else "rgba(239, 68, 68, 0.1)"

    html_body = f"""
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
    <body style="margin: 0; padding: 0; background: #0A0A0A; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <div style="max-width: 560px; margin: 0 auto; background: #111111; border-radius: 16px; overflow: hidden; border: 1px solid #262626;">

            <div style="padding: 32px; background: linear-gradient(135deg, {urgency_color} 0%, #FF8C00 100%); text-align: center;">
                <p style="font-size: 48px; margin: 0 0 12px 0;">{emoji}</p>
                <h1 style="color: white; font-size: 22px; font-weight: 800; margin: 0 0 6px 0; letter-spacing: -0.5px;">
                    {headline.upper()}
                </h1>
                <p style="color: rgba(255,255,255,0.85); font-size: 14px; margin: 0;">
                    {user_name}, don't miss this payment.
                </p>
            </div>

            <div style="padding: 32px;">
                <div style="background: {urgency_bg}; border: 1px solid {urgency_color}33; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                    <p style="color: #A3A3A3; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; margin: 0 0 8px 0;">Payment Details</p>
                    <p style="color: #FAFAFA; font-size: 18px; font-weight: 700; margin: 0 0 6px 0;">{payment_name}</p>
                    <p style="color: #A3A3A3; font-size: 13px; margin: 0 0 16px 0;">{type_label} · Due {due_date_str}</p>
                    <p style="color: {urgency_color}; font-size: 28px; font-weight: 800; margin: 0; font-variant-numeric: tabular-nums;">
                        ₹{payment_amount:,.0f}
                    </p>
                </div>

                <p style="color: #737373; font-size: 14px; line-height: 1.6; margin: 0;">
                    {"This is a friendly heads-up. You have 3 days to arrange the payment. On-time payments directly boost your FinFix credit score." if reminder_type == "upcoming" else "This payment is due today. Paying on time keeps your credit score healthy and avoids late fees."}
                </p>
            </div>

            <div style="padding: 20px 32px; background: #0A0A0A; text-align: center; border-top: 1px solid #262626;">
                <p style="color: #525252; font-size: 11px; margin: 0;">
                    FinFix Payment Reminders · Keeping your credit score on track<br>
                    <a href="https://finfix.strawhats.co.in" style="color: #FF8C00; text-decoration: none;">Manage payments →</a>
                </p>
            </div>
        </div>
    </body>
    </html>
    """
    return subject, html_body

