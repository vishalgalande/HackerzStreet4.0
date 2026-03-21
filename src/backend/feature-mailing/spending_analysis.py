"""
Weekly spending pattern analysis.
Detects spending spikes by comparing the most recent week against
the historical weekly average.
"""

from datetime import datetime, timedelta


def _parse_date(date_str: str) -> datetime:
    """Parse a date string (YYYY-MM-DD) to datetime."""
    try:
        return datetime.strptime(date_str, "%Y-%m-%d")
    except (ValueError, TypeError):
        return datetime.now()


def _daily_total(entry: dict) -> float:
    """Sum all spending categories for a single daily entry."""
    return (
        entry.get("rent", 0)
        + entry.get("food", 0)
        + entry.get("transport", 0)
        + entry.get("discretionary", 0)
    )


def compute_weekly_average(entries: list[dict]) -> float:
    """
    Compute average daily spending across all entries (historical).

    Args:
        entries: List of daily entry dicts with category fields and 'date'.

    Returns:
        Average daily spending (INR). Returns 0 if no entries.
    """
    if not entries:
        return 0.0

    total = sum(_daily_total(e) for e in entries)
    return total / len(entries)


def _get_entries_in_range(entries: list[dict], start: datetime, end: datetime) -> list[dict]:
    """Filter entries within a date range (inclusive)."""
    filtered = []
    for e in entries:
        entry_date = _parse_date(e.get("date", ""))
        if start <= entry_date <= end:
            filtered.append(e)
    return filtered


def detect_spending_spike(entries: list[dict], threshold: float = 0.20) -> dict | None:
    """
    Detect if the most recent week's spending is >= threshold% above the
    historical weekly average.

    Args:
        entries: All daily entries for the user, sorted by date.
        threshold: Fractional threshold (0.20 = 20%).

    Returns:
        dict with spike details if spike detected, None otherwise.
        {
            "current_week_avg": float,   # avg daily spend this week
            "historical_avg": float,     # avg daily spend overall (excl. this week)
            "pct_increase": float,       # percentage increase
            "top_categories": [...]      # categories driving the spike
        }
    """
    if len(entries) < 14:
        # Need at least 2 weeks of data to compare
        return None

    # Sort entries by date
    sorted_entries = sorted(entries, key=lambda e: e.get("date", ""))

    # Determine the last 7 days
    today = datetime.now()
    week_ago = today - timedelta(days=7)

    current_week = _get_entries_in_range(sorted_entries, week_ago, today)
    historical = _get_entries_in_range(
        sorted_entries,
        _parse_date(sorted_entries[0].get("date", "")),
        week_ago - timedelta(days=1),
    )

    if not current_week or not historical:
        return None

    # Calculate averages
    current_avg = sum(_daily_total(e) for e in current_week) / len(current_week)
    historical_avg = sum(_daily_total(e) for e in historical) / len(historical)

    if historical_avg <= 0:
        return None

    pct_increase = ((current_avg - historical_avg) / historical_avg) * 100

    if pct_increase < threshold * 100:
        return None

    # Find top spending categories driving the spike
    top_categories = get_top_spending_categories(historical, current_week)

    return {
        "current_week_avg": round(current_avg, 2),
        "historical_avg": round(historical_avg, 2),
        "pct_increase": round(pct_increase, 1),
        "top_categories": top_categories,
    }


def get_top_spending_categories(
    historical: list[dict],
    current_week: list[dict],
) -> list[dict]:
    """
    Identify which categories drove the spending spike.

    Returns list of dicts sorted by increase percentage:
    [{"name": "Food", "current": 450, "average": 300, "increase_pct": 50}, ...]
    """
    categories = {
        "Food": "food",
        "Transport": "transport",
        "Discretionary": "discretionary",
        "Rent": "rent",
    }

    result = []
    for label, key in categories.items():
        hist_avg = sum(e.get(key, 0) for e in historical) / max(len(historical), 1)
        curr_avg = sum(e.get(key, 0) for e in current_week) / max(len(current_week), 1)

        if hist_avg > 0:
            increase_pct = ((curr_avg - hist_avg) / hist_avg) * 100
        elif curr_avg > 0:
            increase_pct = 100.0
        else:
            increase_pct = 0.0

        result.append({
            "name": label,
            "current": round(curr_avg, 2),
            "average": round(hist_avg, 2),
            "increase_pct": round(increase_pct, 1),
        })

    # Sort by increase percentage descending
    result.sort(key=lambda x: x["increase_pct"], reverse=True)
    return result
