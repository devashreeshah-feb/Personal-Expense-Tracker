from datetime import datetime
from typing import List

def predict_monthly_expense(expenses_by_month: List[dict]) -> float:
    """
    Simple linear prediction for next month's expenses.
    Input: list of {month: str, total: float}
    """
    if len(expenses_by_month) < 2:
        return expenses_by_month[-1]["total"] if expenses_by_month else 0

    values = [e["total"] for e in expenses_by_month]
    n = len(values)

    # Simple moving average of last 3 months
    window = min(3, n)
    avg = sum(values[-window:]) / window

    # Trend: difference between recent and earlier averages
    if n >= 4:
        recent = sum(values[-2:]) / 2
        earlier = sum(values[-4:-2]) / 2
        trend = recent - earlier
        return round(avg + trend * 0.5, 2)

    return round(avg, 2)


def predict_savings(income_total: float, predicted_expense: float) -> dict:
    """Predict savings based on income and predicted expenses."""
    predicted_savings = income_total - predicted_expense
    savings_percent = round((predicted_savings / income_total) * 100, 1) if income_total > 0 else 0

    return {
        "predictedExpense": predicted_expense,
        "predictedSavings": round(predicted_savings, 2),
        "predictedSavingsPercent": savings_percent
    }
