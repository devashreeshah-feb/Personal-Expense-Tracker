const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    category: {
        type: String,
        required: true,
        enum: ['Food', 'Rent', 'Travel', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Education', 'Other']
    },
    amount: { type: Number, required: true, min: 0 },
    date: { type: Date, required: true, default: Date.now },
    note: { type: String, trim: true, default: '' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Expense', expenseSchema);
