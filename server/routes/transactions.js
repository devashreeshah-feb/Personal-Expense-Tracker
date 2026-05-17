const express = require('express');
const router = express.Router();
const Income = require('../models/Income');
const Expense = require('../models/Expense');
const auth = require('../middleware/auth');

// @route   GET /api/transactions
// @desc    Get all transactions (income + expenses)
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const { type, search, sort = 'desc' } = req.query;

        let incomes = [];
        let expenses = [];

        if (!type || type === 'income') {
            incomes = await Income.find({ userId: req.user.id }).lean();
            incomes = incomes.map(inc => ({ ...inc, transactionType: 'income', title: inc.source, category: 'Income', description: '' }));
        }

        if (!type || type === 'expense') {
            expenses = await Expense.find({ userId: req.user.id }).lean();
            expenses = expenses.map(exp => ({ ...exp, transactionType: 'expense', title: exp.category, category: 'Expense', description: exp.note }));
        }

        let transactions = [...incomes, ...expenses];

        // Search by title, description or category
        if (search) {
            const lowerSearch = search.toLowerCase();
            transactions = transactions.filter(t =>
                (t.title && t.title.toLowerCase().includes(lowerSearch)) ||
                (t.description && t.description.toLowerCase().includes(lowerSearch)) ||
                (t.category && t.category.toLowerCase().includes(lowerSearch))
            );
        }

        // Sort by date
        transactions.sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            return sort === 'desc' ? dateB - dateA : dateA - dateB;
        });

        res.json({ transactions });
    } catch (err) {
        console.error('Error fetching transactions:', err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
