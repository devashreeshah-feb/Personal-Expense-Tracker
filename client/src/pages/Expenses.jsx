import { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import { Plus, Edit2, Trash2, Calendar, ShoppingCart, Filter, Tag } from 'lucide-react';

export default function Expenses() {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentExpense, setCurrentExpense] = useState(null);
    const [formData, setFormData] = useState({ category: 'Food', amount: '', date: new Date().toISOString().split('T')[0], note: '' });

    // Filters
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());
    const [categoryFilter, setCategoryFilter] = useState('All');

    const categories = ['Food', 'Rent', 'Travel', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Education', 'Other'];

    const fetchExpenses = async () => {
        try {
            setLoading(true);
            let url = `/expense?month=${month}&year=${year}`;
            if (categoryFilter !== 'All') {
                url += `&category=${categoryFilter}`;
            }
            const res = await api.get(url);
            setExpenses(res.data);
        } catch (error) {
            console.error('Failed to fetch expenses', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExpenses();
    }, [month, year, categoryFilter]);

    const handleOpenModal = (expense = null) => {
        if (expense) {
            setCurrentExpense(expense);
            setFormData({
                category: expense.category,
                amount: expense.amount,
                date: new Date(expense.date).toISOString().split('T')[0],
                note: expense.note || ''
            });
        } else {
            setCurrentExpense(null);
            setFormData({ category: 'Food', amount: '', date: new Date().toISOString().split('T')[0], note: '' });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (currentExpense) {
                await api.put(`/expense/${currentExpense._id}`, formData);
            } else {
                await api.post('/expense/add', formData);
            }
            setIsModalOpen(false);
            fetchExpenses();
        } catch (error) {
            console.error('Failed to save expense', error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this expense?')) {
            try {
                await api.delete(`/expense/${id}`);
                fetchExpenses();
            } catch (error) {
                console.error('Failed to delete expense', error);
            }
        }
    };

    const totalExpense = expenses.reduce((sum, item) => sum + item.amount, 0);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Expense Tracking</h2>
                    <p className="text-gray-500 text-sm mt-1">Monitor where your money goes</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-alert hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                    <Plus size={18} /> Add Expense
                </button>
            </div>

            {/* Filters & Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-card p-4 rounded-xl shadow-sm border border-gray-100 col-span-1 md:col-span-2 flex flex-col sm:flex-row gap-4 items-center">
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Calendar size={18} className="text-gray-400" />
                        <select
                            className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5 outline-none"
                            value={month}
                            onChange={(e) => setMonth(e.target.value)}
                        >
                            {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                                <option key={m} value={m}>{new Date(2000, m - 1, 1).toLocaleString('default', { month: 'long' })}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <select
                            className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5 outline-none"
                            value={year}
                            onChange={(e) => setYear(e.target.value)}
                        >
                            {[new Date().getFullYear() - 1, new Date().getFullYear(), new Date().getFullYear() + 1].map(y => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto ml-auto">
                        <Filter size={18} className="text-gray-400" />
                        <select
                            className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5 outline-none"
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                        >
                            <option value="All">All Categories</option>
                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-alert to-red-700 p-4 rounded-xl shadow-sm text-white flex flex-col justify-center">
                    <p className="text-red-100 text-sm font-medium">Total Expenses ({new Date(year, month - 1).toLocaleString('default', { month: 'short' })})</p>
                    <h3 className="text-3xl font-bold mt-1">₹{totalExpense.toLocaleString()}</h3>
                </div>
            </div>

            {/* Expense List */}
            <div className="bg-card rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-gray-500">Loading...</div>
                ) : expenses.length === 0 ? (
                    <div className="p-12 text-center flex flex-col items-center">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                            <ShoppingCart size={24} className="text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">No expenses found</h3>
                        <p className="text-gray-500 mt-1">You haven't added any expenses matching these filters.</p>
                        <button
                            onClick={() => handleOpenModal()}
                            className="text-primary font-medium mt-4 hover:underline"
                        >
                            Add a new expense
                        </button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-500">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th scope="col" className="px-6 py-4">Category / Note</th>
                                    <th scope="col" className="px-6 py-4">Date</th>
                                    <th scope="col" className="px-6 py-4">Amount</th>
                                    <th scope="col" className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {expenses.map((expense) => (
                                    <tr key={expense._id} className="bg-white border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                                    <Tag size={14} />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">{expense.category}</p>
                                                    {expense.note && <p className="text-xs text-gray-500 truncate max-w-xs">{expense.note}</p>}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {new Date(expense.date).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 font-semibold text-gray-900 whitespace-nowrap">
                                            ₹{expense.amount.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleOpenModal(expense)}
                                                    className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(expense._id)}
                                                    className="p-2 text-gray-400 hover:text-alert hover:bg-alert/10 rounded-lg transition-colors"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={currentExpense ? 'Edit Expense' : 'Add New Expense'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                        <select
                            required
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        >
                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
                        <input
                            type="number"
                            required
                            min="1"
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                            value={formData.amount}
                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                        <input
                            type="date"
                            required
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Note (Optional)</label>
                        <input
                            type="text"
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                            value={formData.note}
                            onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                            placeholder="e.g. Lunch with team"
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
                            {currentExpense ? 'Update' : 'Save'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
