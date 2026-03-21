"""
Aggregation logic — converts daily entries into monthly summaries
that can be fed into the scoring engine.
"""

from datetime import date, datetime
from dashboard_models import MonthlyAggregation


def aggregate_daily_to_monthly(entries: list[dict], target_month: str = None) -> MonthlyAggregation:
    """
    Aggregate a list of daily entries into a monthly summary.

    Args:
        entries: List of daily entry dicts from Supabase.
        target_month: Optional "YYYY-MM" string. If None, uses current month.

    Returns:
        MonthlyAggregation with totals and averages.
    """
    if target_month is None:
        target_month = datetime.now().strftime("%Y-%m")

    # Filter entries to target month
    month_entries = [
        e for e in entries
        if e.get("date", "").startswith(target_month)
    ]

    if not month_entries:
        return MonthlyAggregation(
            month=target_month,
            total_rent=0,
            total_food=0,
            total_transport=0,
            total_discretionary=0,
            total_savings=0,
            total_expenses=0,
            bills_on_time_pct=0,
            entry_count=0,
        )

    total_rent = sum(e.get("rent", 0) for e in month_entries)
    total_food = sum(e.get("food", 0) for e in month_entries)
    total_transport = sum(e.get("transport", 0) for e in month_entries)
    total_discretionary = sum(e.get("discretionary", 0) for e in month_entries)
    total_savings = sum(e.get("savings", 0) for e in month_entries)
    total_expenses = total_rent + total_food + total_transport + total_discretionary

    # Bill payment consistency — % of entries where bill was paid on time
    bill_entries = [e for e in month_entries if "bill_paid_on_time" in e]
    if bill_entries:
        bills_on_time = sum(1 for e in bill_entries if e["bill_paid_on_time"])
        bills_on_time_pct = bills_on_time / len(bill_entries)
    else:
        bills_on_time_pct = 1.0  # No bill data = assume on-time

    return MonthlyAggregation(
        month=target_month,
        total_rent=total_rent,
        total_food=total_food,
        total_transport=total_transport,
        total_discretionary=total_discretionary,
        total_savings=total_savings,
        total_expenses=total_expenses,
        bills_on_time_pct=round(bills_on_time_pct, 2),
        entry_count=len(month_entries),
    )
