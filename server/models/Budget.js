const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    category: {
        type: String,
        required: true,
        enum: ['Food', 'Rent', 'Travel', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Education', 'Other', 'Overall']
    },
    limitAmount: { type: Number, required: true, min: 0 },
    month: { type: String, required: true } // Format: "YYYY-MM"
});

budgetSchema.index({ userId: 1, category: 1, month: 1 }, { unique: true });

module.exports = mongoose.model('Budget', budgetSchema);
