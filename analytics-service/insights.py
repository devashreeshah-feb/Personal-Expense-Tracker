from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timedelta
from collections import defaultdict

router = APIRouter()

class IncomeItem(BaseModel):
    source: str = ""
    amount: float
    date: Optional[str] = None

class ExpenseItem(BaseModel):
    category: str
    amount: float
    date: Optional[str] = None

class BudgetItem(BaseModel):
    category: str
    limitAmount: float

class AnalyzeRequest(BaseModel):
    income: List[IncomeItem]
    expenses: List[ExpenseItem]
    budget: List[BudgetItem]

@router.post("/analyze")
def analyze(data: AnalyzeRequest):
    total_income = sum(i.amount for i in data.income)
    total_expenses = sum(e.amount for e in data.expenses)
    savings = total_income - total_expenses
    savings_percent = round((savings / total_income) * 100, 1) if total_income > 0 else 0

    # Category breakdown
    category_totals = defaultdict(float)
    for e in data.expenses:
        category_totals[e.category] += e.amount

    highest_category = max(category_totals, key=category_totals.get) if category_totals else "N/A"
    highest_category_amount = category_totals.get(highest_category, 0)

    # Average daily spending
    if data.expenses:
        dates = []
        for e in data.expenses:
            if e.date:
                try:
                    d = datetime.fromisoformat(str(e.date).replace("Z", "+00:00"))
                    dates.append(d)
                except:
                    pass
        if dates:
            min_date = min(dates)
            max_date = max(dates)
            days = max((max_date - min_date).days, 1)
        else:
            days = 30
        avg_daily_spend = round(total_expenses / days, 2)
    else:
        avg_daily_spend = 0

    # Budget warnings
    warnings = []
    for b in data.budget:
        spent = category_totals.get(b.category, 0)
        if spent > b.limitAmount:
            overspend = round(spent - b.limitAmount, 2)
            warnings.append(f"Overspending on {b.category} by ₹{overspend}")
        elif spent > b.limitAmount * 0.8:
            warnings.append(f"Nearing budget limit for {b.category} ({round(spent/b.limitAmount*100)}% used)")

    # Estimated end-of-month balance
    now = datetime.now()
    days_in_month = 30
    days_passed = now.day
    days_remaining = max(days_in_month - days_passed, 1)
    daily_rate = total_expenses / max(days_passed, 1)
    estimated_total_expense = total_expenses + (daily_rate * days_remaining)
    estimated_end_of_month = round(total_income - estimated_total_expense, 2)

    # Smart insights
    insights = []
    if total_income > 0:
        food_pct = round((category_totals.get("Food", 0) / total_income) * 100, 1)
        if food_pct > 30:
            insights.append(f"You spent {food_pct}% of income on food — consider meal planning")

    if savings_percent > 20:
        insights.append(f"Great job! You saved {savings_percent}% this month")
    elif savings_percent > 0:
        insights.append(f"You saved {savings_percent}% this month — try to aim for 20%+")
    elif savings_percent <= 0:
        insights.append("You're spending more than you earn — review your expenses")

    if highest_category != "N/A":
        insights.append(f"Highest spending: {highest_category} (₹{round(highest_category_amount, 2)})")

    return {
        "highestCategory": highest_category,
        "highestCategoryAmount": round(highest_category_amount, 2),
        "avgDailySpend": avg_daily_spend,
        "savingsPercent": savings_percent,
        "totalIncome": total_income,
        "totalExpenses": total_expenses,
        "savings": savings,
        "warning": "; ".join(warnings) if warnings else None,
        "warnings": warnings,
        "estimatedEndOfMonth": estimated_end_of_month,
        "insights": insights,
        "categoryBreakdown": dict(category_totals)
    }
