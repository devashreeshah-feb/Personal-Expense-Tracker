const mongoose = require('mongoose');

const incomeSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    source: {
        type: String,
        required: true,
        enum: ['Salary', 'Freelance', 'Business', 'Pocket Money', 'Other']
    },
    amount: { type: Number, required: true, min: 0 },
    date: { type: Date, required: true, default: Date.now },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Income', incomeSchema);
