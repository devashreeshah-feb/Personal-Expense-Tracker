const express = require('express');
const router = express.Router();
const axios = require('axios');
const Income = require('../models/Income');
const Expense = require('../models/Expense');
const Budget = require('../models/Budget');
const auth = require('../middleware/auth');

const PYTHON_URL = process.env.PYTHON_SERVICE_URL || 'http://localhost:8000';

// GET /api/insights
router.get('/', auth, async (req, res) => {
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

        const budgets = await Budget.find({
            userId: req.user.id,
            month: `${y}-${String(m).padStart(2, '0')}`
        });

        // Call Python service
        const response = await axios.post(`${PYTHON_URL}/insights/analyze`, {
            income: incomes.map((i) => ({ source: i.source, amount: i.amount, date: i.date })),
            expenses: expenses.map((e) => ({ category: e.category, amount: e.amount, date: e.date })),
            budget: budgets.map((b) => ({ category: b.category, limitAmount: b.limitAmount }))
        });

        res.json(response.data);
    } catch (error) {
        // If Python service is unavailable, return basic insights
        if (error.code === 'ECONNREFUSED') {
            return res.json({
                highestCategory: 'N/A',
                avgDailySpend: 0,
                savingsPercent: 0,
                warning: 'Analytics service unavailable',
                estimatedEndOfMonth: 0,
                insights: []
            });
        }
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
