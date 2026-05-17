const express = require('express');
const router = express.Router();
const Budget = require('../models/Budget');
const Expense = require('../models/Expense');
const auth = require('../middleware/auth');

// POST /api/budget/set
router.post('/set', auth, async (req, res) => {
    try {
        const { category, limitAmount, month } = req.body;

        // Upsert: update if exists, create if not
        const budget = await Budget.findOneAndUpdate(
            { userId: req.user.id, category, month },
            { limitAmount },
            { new: true, upsert: true }
        );

        res.status(201).json(budget);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// GET /api/budget
router.get('/', auth, async (req, res) => {
    try {
        const { month } = req.query;
        let filter = { userId: req.user.id };
        if (month) filter.month = month;

        const budgets = await Budget.find(filter);

        // Calculate spending per category for the month
        const budgetsWithSpent = await Promise.all(
            budgets.map(async (budget) => {
                const [year, mon] = budget.month.split('-');
                const startDate = new Date(year, mon - 1, 1);
                const endDate = new Date(year, mon, 0, 23, 59, 59);

                let expenseFilter = {
                    userId: req.user.id,
                    date: { $gte: startDate, $lte: endDate }
                };

                if (budget.category !== 'Overall') {
                    expenseFilter.category = budget.category;
                }

                const expenses = await Expense.aggregate([
                    { $match: expenseFilter },
                    { $group: { _id: null, total: { $sum: '$amount' } } }
                ]);

                const spent = expenses.length > 0 ? expenses[0].total : 0;

                return {
                    ...budget.toObject(),
                    spent,
                    remaining: budget.limitAmount - spent,
                    percentUsed: budget.limitAmount > 0 ? Math.round((spent / budget.limitAmount) * 100) : 0
                };
            })
        );

        res.json(budgetsWithSpent);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// PUT /api/budget/:id
router.put('/:id', auth, async (req, res) => {
    try {
        const { limitAmount } = req.body;
        const budget = await Budget.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id },
            { limitAmount },
            { new: true }
        );
        if (!budget) return res.status(404).json({ message: 'Budget not found' });
        res.json(budget);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// DELETE /api/budget/:id
router.delete('/:id', auth, async (req, res) => {
    try {
        const budget = await Budget.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
        if (!budget) return res.status(404).json({ message: 'Budget not found' });
        res.json({ message: 'Budget deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
