from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Optional
from io import BytesIO
from datetime import datetime
from collections import defaultdict

router = APIRouter()

class IncomeExport(BaseModel):
    source: str = ""
    amount: float
    date: Optional[str] = None

class ExpenseExport(BaseModel):
    category: str
    amount: float
    date: Optional[str] = None
    note: Optional[str] = ""

class ExportRequest(BaseModel):
    income: List[IncomeExport]
    expenses: List[ExpenseExport]
    month: int
    year: int

@router.post("/pdf")
def export_pdf(data: ExportRequest):
    try:
        from reportlab.lib.pagesizes import A4
        from reportlab.lib import colors
        from reportlab.lib.units import inch
        from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    except ImportError:
        return {"error": "ReportLab not installed. Run: pip install reportlab"}

    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, topMargin=0.5*inch, bottomMargin=0.5*inch)
    elements = []
    styles = getSampleStyleSheet()

    # Title
    title_style = ParagraphStyle(
        'CustomTitle', parent=styles['Title'],
        fontSize=20, spaceAfter=20,
        textColor=colors.HexColor('#4F46E5')
    )
    elements.append(Paragraph(f"Financial Report — {data.month}/{data.year}", title_style))
    elements.append(Spacer(1, 12))

    # Summary
    total_income = sum(i.amount for i in data.income)
    total_expenses = sum(e.amount for e in data.expenses)
    savings = total_income - total_expenses

    summary_data = [
        ["Metric", "Amount (₹)"],
        ["Total Income", f"₹{total_income:,.2f}"],
        ["Total Expenses", f"₹{total_expenses:,.2f}"],
        ["Savings", f"₹{savings:,.2f}"],
        ["Savings %", f"{round((savings/total_income)*100, 1) if total_income > 0 else 0}%"]
    ]

    summary_table = Table(summary_data, colWidths=[3*inch, 2.5*inch])
    summary_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#4F46E5')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#F8FAFC')]),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
    ]))
    elements.append(summary_table)
    elements.append(Spacer(1, 20))

    # Income table
    elements.append(Paragraph("Income", styles['Heading2']))
    elements.append(Spacer(1, 8))

    if data.income:
        income_data = [["Source", "Amount (₹)", "Date"]]
        for i in data.income:
            date_str = ""
            if i.date:
                try:
                    d = datetime.fromisoformat(str(i.date).replace("Z", "+00:00"))
                    date_str = d.strftime("%d/%m/%Y")
                except:
                    date_str = str(i.date)[:10]
            income_data.append([i.source, f"₹{i.amount:,.2f}", date_str])

        income_table = Table(income_data, colWidths=[2*inch, 2*inch, 1.5*inch])
        income_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#14B8A6')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
            ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#F0FDFA')]),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
        ]))
        elements.append(income_table)
    else:
        elements.append(Paragraph("No income recorded.", styles['Normal']))
    elements.append(Spacer(1, 20))

    # Expense table
    elements.append(Paragraph("Expenses", styles['Heading2']))
    elements.append(Spacer(1, 8))

    if data.expenses:
        expense_data = [["Category", "Amount (₹)", "Date", "Note"]]
        for e in data.expenses:
            date_str = ""
            if e.date:
                try:
                    d = datetime.fromisoformat(str(e.date).replace("Z", "+00:00"))
                    date_str = d.strftime("%d/%m/%Y")
                except:
                    date_str = str(e.date)[:10]
            expense_data.append([e.category, f"₹{e.amount:,.2f}", date_str, e.note or ""])

        expense_table = Table(expense_data, colWidths=[1.5*inch, 1.5*inch, 1.2*inch, 1.5*inch])
        expense_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#EF4444')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
            ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#FEF2F2')]),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
        ]))
        elements.append(expense_table)
    else:
        elements.append(Paragraph("No expenses recorded.", styles['Normal']))
    elements.append(Spacer(1, 20))

    # Category breakdown
    elements.append(Paragraph("Category Breakdown", styles['Heading2']))
    elements.append(Spacer(1, 8))

    category_totals = defaultdict(float)
    for e in data.expenses:
        category_totals[e.category] += e.amount

    if category_totals:
        cat_data = [["Category", "Total (₹)", "% of Total"]]
        for cat, total in sorted(category_totals.items(), key=lambda x: -x[1]):
            pct = round((total / total_expenses) * 100, 1) if total_expenses > 0 else 0
            cat_data.append([cat, f"₹{total:,.2f}", f"{pct}%"])

        cat_table = Table(cat_data, colWidths=[2*inch, 2*inch, 1.5*inch])
        cat_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#4F46E5')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
            ('ALIGN', (1, 0), (-1, -1), 'RIGHT'),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#F8FAFC')]),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
        ]))
        elements.append(cat_table)

    doc.build(elements)
    buffer.seek(0)

    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=finance_report_{data.year}_{data.month}.pdf"}
    )
