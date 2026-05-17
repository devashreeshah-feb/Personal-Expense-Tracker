const express = require('express');
const router = express.Router();
const Income = require('../models/Income');
const Expense = require('../models/Expense');
const auth = require('../middleware/auth');

// GET /api/dashboard/stats
router.get('/stats', auth, async (req, res) => {
    try {
        const { month, year } = req.query;
        const now = new Date();
        const m = month ? parseInt(month) : now.getMonth() + 1;
        const y = year ? parseInt(year) : now.getFullYear();

        const startDate = new Date(y, m - 1, 1);
        const endDate = new Date(y, m, 0, 23, 59, 59);

        // Total income for the month
        const incomeAgg = await Income.aggregate([
            { $match: { userId: req.user.id, date: { $gte: startDate, $lte: endDate } } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        // Total expenses for the month
        const expenseAgg = await Expense.aggregate([
            { $match: { userId: req.user.id, date: { $gte: startDate, $lte: endDate } } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        // Expense by category
        const categoryAgg = await Expense.aggregate([
            { $match: { userId: req.user.id, date: { $gte: startDate, $lte: endDate } } },
            { $group: { _id: '$category', total: { $sum: '$amount' } } },
            { $sort: { total: -1 } }
        ]);

        // Monthly trend (last 6 months)
        const sixMonthsAgo = new Date(y, m - 7, 1);
        const monthlyTrend = await Expense.aggregate([
            { $match: { userId: req.user.id, date: { $gte: sixMonthsAgo, $lte: endDate } } },
            {
                $group: {
                    _id: { year: { $year: '$date' }, month: { $month: '$date' } },
                    total: { $sum: '$amount' }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        const incomeTrend = await Income.aggregate([
            { $match: { userId: req.user.id, date: { $gte: sixMonthsAgo, $lte: endDate } } },
            {
                $group: {
                    _id: { year: { $year: '$date' }, month: { $month: '$date' } },
                    total: { $sum: '$amount' }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        const totalIncome = incomeAgg.length > 0 ? incomeAgg[0].total : 0;
        const totalExpense = expenseAgg.length > 0 ? expenseAgg[0].total : 0;
        const savings = totalIncome - totalExpense;
        const savingsPercent = totalIncome > 0 ? Math.round((savings / totalIncome) * 100) : 0;

        // Previous month comparison
        const prevStart = new Date(y, m - 2, 1);
        const prevEnd = new Date(y, m - 1, 0, 23, 59, 59);

        const prevIncomeAgg = await Income.aggregate([
            { $match: { userId: req.user.id, date: { $gte: prevStart, $lte: prevEnd } } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        const prevExpenseAgg = await Expense.aggregate([
            { $match: { userId: req.user.id, date: { $gte: prevStart, $lte: prevEnd } } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        const prevIncome = prevIncomeAgg.length > 0 ? prevIncomeAgg[0].total : 0;
        const prevExpense = prevExpenseAgg.length > 0 ? prevExpenseAgg[0].total : 0;

        const incomeChange = prevIncome > 0 ? Math.round(((totalIncome - prevIncome) / prevIncome) * 100) : 0;
        const expenseChange = prevExpense > 0 ? Math.round(((totalExpense - prevExpense) / prevExpense) * 100) : 0;

        res.json({
            totalIncome,
            totalExpense,
            savings,
            savingsPercent,
            balance: savings,
            incomeChange,
            expenseChange,
            categoryBreakdown: categoryAgg,
            monthlyExpenseTrend: monthlyTrend,
            monthlyIncomeTrend: incomeTrend
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// GET /api/dashboard/transactions — combined income + expenses
router.get('/transactions', auth, async (req, res) => {
    try {
        const { search, sort, type, page = 1, limit = 20 } = req.query;
        const skip = (page - 1) * limit;

        let transactions = [];

        if (!type || type === 'all' || type === 'income') {
            const incomes = await Income.find({ userId: req.user.id });
            transactions.push(
                ...incomes.map((i) => ({
                    _id: i._id,
                    type: 'income',
                    category: i.source,
                    amount: i.amount,
                    date: i.date,
                    note: '',
                    createdAt: i.createdAt
                }))
            );
        }

        if (!type || type === 'all' || type === 'expense') {
            const expenses = await Expense.find({ userId: req.user.id });
            transactions.push(
                ...expenses.map((e) => ({
                    _id: e._id,
                    type: 'expense',
                    category: e.category,
                    amount: e.amount,
                    date: e.date,
                    note: e.note,
                    createdAt: e.createdAt
                }))
            );
        }

        // Search
        if (search) {
            const s = search.toLowerCase();
            transactions = transactions.filter(
                (t) =>
                    t.category.toLowerCase().includes(s) ||
                    (t.note && t.note.toLowerCase().includes(s))
            );
        }

        // Sort
        if (sort === 'amount_asc') {
            transactions.sort((a, b) => a.amount - b.amount);
        } else if (sort === 'amount_desc') {
            transactions.sort((a, b) => b.amount - a.amount);
        } else if (sort === 'date_asc') {
            transactions.sort((a, b) => new Date(a.date) - new Date(b.date));
        } else {
            transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
        }

        const total = transactions.length;
        const paginated = transactions.slice(skip, skip + parseInt(limit));

        res.json({ transactions: paginated, total, page: parseInt(page), pages: Math.ceil(total / limit) });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
