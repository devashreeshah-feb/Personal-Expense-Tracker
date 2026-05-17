const express = require('express');
const router = express.Router();
const Income = require('../models/Income');
const auth = require('../middleware/auth');

// POST /api/income/add
router.post('/add', auth, async (req, res) => {
    try {
        const { source, amount, date } = req.body;
        const income = new Income({ userId: req.user.id, source, amount, date });
        await income.save();
        res.status(201).json(income);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// GET /api/income
router.get('/', auth, async (req, res) => {
    try {
        const { month, year } = req.query;
        let filter = { userId: req.user.id };

        if (month && year) {
            const startDate = new Date(year, month - 1, 1);
            const endDate = new Date(year, month, 0, 23, 59, 59);
            filter.date = { $gte: startDate, $lte: endDate };
        }

        const incomes = await Income.find(filter).sort({ date: -1 });
        res.json(incomes);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// PUT /api/income/:id
router.put('/:id', auth, async (req, res) => {
    try {
        const { source, amount, date } = req.body;
        const income = await Income.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id },
            { source, amount, date },
            { new: true }
        );
        if (!income) return res.status(404).json({ message: 'Income not found' });
        res.json(income);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// DELETE /api/income/:id
router.delete('/:id', auth, async (req, res) => {
    try {
        const income = await Income.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
        if (!income) return res.status(404).json({ message: 'Income not found' });
        res.json({ message: 'Income deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
