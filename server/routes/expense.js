const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');
const auth = require('../middleware/auth');

// POST /api/expense/add
router.post('/add', auth, async (req, res) => {
    try {
        const { category, amount, date, note } = req.body;
        const expense = new Expense({ userId: req.user.id, category, amount, date, note });
        await expense.save();
        res.status(201).json(expense);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// GET /api/expense
router.get('/', auth, async (req, res) => {
    try {
        const { month, year, category, startDate, endDate } = req.query;
        let filter = { userId: req.user.id };

        if (month && year) {
            const start = new Date(year, month - 1, 1);
            const end = new Date(year, month, 0, 23, 59, 59);
            filter.date = { $gte: start, $lte: end };
        } else if (startDate && endDate) {
            filter.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
        }

        if (category) filter.category = category;

        const expenses = await Expense.find(filter).sort({ date: -1 });
        res.json(expenses);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// GET /api/expense/category/:name
router.get('/category/:name', auth, async (req, res) => {
    try {
        const expenses = await Expense.find({
            userId: req.user.id,
            category: req.params.name
        }).sort({ date: -1 });
        res.json(expenses);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// PUT /api/expense/:id
router.put('/:id', auth, async (req, res) => {
    try {
        const { category, amount, date, note } = req.body;
        const expense = await Expense.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id },
            { category, amount, date, note },
            { new: true }
        );
        if (!expense) return res.status(404).json({ message: 'Expense not found' });
        res.json(expense);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// DELETE /api/expense/:id
router.delete('/:id', auth, async (req, res) => {
    try {
        const expense = await Expense.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
        if (!expense) return res.status(404).json({ message: 'Expense not found' });
        res.json({ message: 'Expense deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
