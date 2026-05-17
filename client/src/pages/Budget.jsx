import { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import { Target, Plus, Edit2, Trash2, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function Budget() {
    const [budgets, setBudgets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentBudget, setCurrentBudget] = useState(null);

    const currentMonth = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
    const [month, setMonth] = useState(currentMonth);
    const [formData, setFormData] = useState({ category: 'Overall', limitAmount: '' });

    const categories = ['Overall', 'Food', 'Rent', 'Travel', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Education', 'Other'];

    const fetchBudgets = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/budget?month=${month}`);
            setBudgets(res.data);
        } catch (error) {
            console.error('Failed to fetch budgets', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBudgets();
    }, [month]);

    const handleOpenModal = (budget = null) => {
        if (budget) {
            setCurrentBudget(budget);
            setFormData({
                category: budget.category,
                limitAmount: budget.limitAmount
            });
        } else {
            setCurrentBudget(null);
            setFormData({ category: 'Overall', limitAmount: '' });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (currentBudget) {
                await api.put(`/budget/${currentBudget._id}`, { limitAmount: formData.limitAmount });
            } else {
                await api.post('/budget/set', { ...formData, month });
            }
            setIsModalOpen(false);
            fetchBudgets();
        } catch (error) {
            console.error('Failed to save budget', error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this budget?')) {
            try {
                await api.delete(`/budget/${id}`);
                fetchBudgets();
            } catch (error) {
                console.error('Failed to delete budget', error);
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Budget Planning</h2>
                    <p className="text-gray-500 text-sm mt-1">Set limits and track your spending</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-primary hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                    <Plus size={18} /> Set Budget
                </button>
            </div>

            {/* Month Selector */}
            <div className="bg-card p-4 rounded-xl shadow-sm border border-gray-100 max-w-xs">
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Month</label>
                <input
                    type="month"
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-lg focus:ring-primary focus:border-primary p-2.5 outline-none"
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                />
            </div>

            {/* Budget Cards */}
            {loading ? (
                <div className="p-8 text-center text-gray-500 bg-card rounded-xl border border-gray-100">Loading...</div>
            ) : budgets.length === 0 ? (
                <div className="bg-card p-12 text-center rounded-xl border border-gray-100 flex flex-col items-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                        <Target size={24} className="text-primary" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">No budgets set</h3>
                    <p className="text-gray-500 mt-1">Set monthly limits to stay on top of your finances.</p>
                    <button
                        onClick={() => handleOpenModal()}
                        className="text-primary font-medium mt-4 hover:underline"
                    >
                        Set your first budget
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {budgets.map((budget) => {
                        const isWarning = budget.percentUsed >= 80 && budget.percentUsed < 100;
                        const isDanger = budget.percentUsed >= 100;

                        return (
                            <div key={budget._id} className="bg-card rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col h-full">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${budget.category === 'Overall' ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-secondary'
                                            }`}>
                                            <Target size={20} />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900">{budget.category}</h3>
                                            <p className="text-xs text-gray-500">Monthly Limit</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => handleOpenModal(budget)}
                                            className="p-1.5 text-gray-400 hover:text-primary transition-colors"
                                        >
                                            <Edit2 size={14} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(budget._id)}
                                            className="p-1.5 text-gray-400 hover:text-alert transition-colors"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>

                                <div className="mt-2 mb-6">
                                    <div className="flex justify-between items-end mb-2">
                                        <div className="text-3xl font-bold text-gray-900">
                                            ₹{budget.spent.toLocaleString()}
                                        </div>
                                        <div className="text-sm font-medium text-gray-500 pb-1">
                                            of ₹{budget.limitAmount.toLocaleString()}
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="w-full bg-gray-100 rounded-full h-2.5 mb-1 overflow-hidden">
                                        <div
                                            className={`h-2.5 rounded-full ${isDanger ? 'bg-alert' : isWarning ? 'bg-yellow-400' : 'bg-success'
                                                }`}
                                            style={{ width: `${Math.min(budget.percentUsed, 100)}%` }}
                                        ></div>
                                    </div>

                                    <div className="flex justify-between items-center mt-2 text-xs">
                                        <span className="font-medium text-gray-500">{budget.percentUsed}% used</span>
                                        <span className={`font-medium flex items-center gap-1 ${isDanger ? 'text-alert' : 'text-gray-500'
                                            }`}>
                                            {isDanger && <AlertCircle size={12} />}
                                            {budget.remaining >= 0
                                                ? `₹${budget.remaining.toLocaleString()} left`
                                                : `₹${Math.abs(budget.remaining).toLocaleString()} over`}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={currentBudget ? 'Update Budget' : 'Set New Budget'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                        <select
                            required
                            disabled={!!currentBudget}
                            className={`w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all ${currentBudget ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''
                                }`}
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        >
                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        {!!currentBudget && <p className="text-xs text-gray-500 mt-1">Category cannot be changed after creation</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Limit (₹)</label>
                        <input
                            type="number"
                            required
                            min="1"
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                            value={formData.limitAmount}
                            onChange={(e) => setFormData({ ...formData, limitAmount: e.target.value })}
                        />
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                        >
                            {currentBudget ? 'Update Limit' : 'Set Budget'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
