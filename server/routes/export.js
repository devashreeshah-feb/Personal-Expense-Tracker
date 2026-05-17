const express = require('express');
const router = express.Router();
const axios = require('axios');
const Income = require('../models/Income');
const Expense = require('../models/Expense');
const auth = require('../middleware/auth');

const PYTHON_URL = process.env.PYTHON_SERVICE_URL || 'http://localhost:8000';

// GET /api/export/csv
router.get('/csv', auth, async (req, res) => {
    try {
        const { month, year } = req.query;
        const now = new Date();
        const m = month ? parseInt(month) : now.getMonth() + 1;
        const y = year ? parseInt(year) : now.getFullYear();

        const startDate = new Date(y, m - 1, 1);
        const endDate = new Date(y, m, 0, 23, 59, 59);

        const incomes = await Income.find({
            userId: req.user.id,
            date: { $gte: startDate, $lte: endDate }
        }).sort({ date: -1 });

        const expenses = await Expense.find({
            userId: req.user.id,
            date: { $gte: startDate, $lte: endDate }
        }).sort({ date: -1 });

        // Build CSV
        let csv = 'Type,Category/Source,Amount,Date,Note\n';

        incomes.forEach((i) => {
            csv += `Income,${i.source},${i.amount},${new Date(i.date).toLocaleDateString()},\n`;
        });

        expenses.forEach((e) => {
            csv += `Expense,${e.category},${e.amount},${new Date(e.date).toLocaleDateString()},${e.note || ''}\n`;
        });

        const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0);
        const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);
        csv += `\nSummary\nTotal Income,${totalIncome}\nTotal Expenses,${totalExpense}\nSavings,${totalIncome - totalExpense}\n`;

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=finance_report_${y}_${m}.csv`);
        res.send(csv);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// GET /api/export/pdf
router.get('/pdf', auth, async (req, res) => {
    try {
        const { month, year } = req.query;
        const now = new Date();
        const m = month ? parseInt(month) : now.getMonth() + 1;
        const y = year ? parseInt(year) : now.getFullYear();

        const startDate = new Date(y, m - 1, 1);
        const endDate = new Date(y, m, 0, 23, 59, 59);

        const incomes = await Income.find({
            userId: req.user.id,
            date: { $gte: startDate, $lte: endDate }
        });

        const expenses = await Expense.find({
            userId: req.user.id,
            date: { $gte: startDate, $lte: endDate }
        });

        // Call Python PDF service
        const response = await axios.post(
            `${PYTHON_URL}/export/pdf`,
            {
                income: incomes.map((i) => ({ source: i.source, amount: i.amount, date: i.date })),
                expenses: expenses.map((e) => ({
                    category: e.category,
                    amount: e.amount,
                    date: e.date,
                    note: e.note
                })),
                month: m,
                year: y
            },
            { responseType: 'arraybuffer' }
        );

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=finance_report_${y}_${m}.pdf`);
        res.send(Buffer.from(response.data));
    } catch (error) {
        if (error.code === 'ECONNREFUSED') {
            return res.status(503).json({ message: 'PDF service unavailable' });
        }
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
