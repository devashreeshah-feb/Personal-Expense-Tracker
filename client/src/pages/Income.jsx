import { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import { Plus, Edit2, Trash2, Calendar, DollarSign, Tag } from 'lucide-react';

export default function Income() {
    const [incomes, setIncomes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentIncome, setCurrentIncome] = useState(null);
    const [formData, setFormData] = useState({ source: 'Salary', amount: '', date: new Date().toISOString().split('T')[0] });

    // Filters
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());

    const sources = ['Salary', 'Freelance', 'Business', 'Pocket Money', 'Other'];

    const fetchIncomes = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/income?month=${month}&year=${year}`);
            setIncomes(res.data);
        } catch (error) {
            console.error('Failed to fetch incomes', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchIncomes();
    }, [month, year]);

    const handleOpenModal = (income = null) => {
        if (income) {
            setCurrentIncome(income);
            setFormData({
                source: income.source,
                amount: income.amount,
                date: new Date(income.date).toISOString().split('T')[0]
            });
        } else {
            setCurrentIncome(null);
            setFormData({ source: 'Salary', amount: '', date: new Date().toISOString().split('T')[0] });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (currentIncome) {
                await api.put(`/income/${currentIncome._id}`, formData);
            } else {
                await api.post('/income/add', formData);
            }
            setIsModalOpen(false);
            fetchIncomes();
        } catch (error) {
            console.error('Failed to save income', error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this income?')) {
            try {
                await api.delete(`/income/${id}`);
                fetchIncomes();
            } catch (error) {
                console.error('Failed to delete income', error);
            }
        }
    };

    const totalIncome = incomes.reduce((sum, item) => sum + item.amount, 0);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Income Management</h2>
                    <p className="text-gray-500 text-sm mt-1">Track and manage your revenue streams</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-secondary hover:bg-teal-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                    <Plus size={18} /> Add Income
                </button>
            </div>

            {/* Filters & Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-card p-4 rounded-xl shadow-sm border border-gray-100 col-span-1 md:col-span-2 flex flex-col sm:flex-row gap-4 items-center">
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Calendar size={18} className="text-gray-400" />
                        <select
                            className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-secondary focus:border-secondary block w-full p-2.5 outline-none"
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
                            className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-secondary focus:border-secondary block w-full p-2.5 outline-none"
                            value={year}
                            onChange={(e) => setYear(e.target.value)}
                        >
                            {[new Date().getFullYear() - 1, new Date().getFullYear(), new Date().getFullYear() + 1].map(y => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-secondary to-teal-700 p-4 rounded-xl shadow-sm text-white flex flex-col justify-center">
                    <p className="text-teal-100 text-sm font-medium">Total Income ({new Date(year, month - 1).toLocaleString('default', { month: 'short' })})</p>
                    <h3 className="text-3xl font-bold mt-1">₹{totalIncome.toLocaleString()}</h3>
                </div>
            </div>

            {/* Income List */}
            <div className="bg-card rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-gray-500">Loading...</div>
                ) : incomes.length === 0 ? (
                    <div className="p-12 text-center flex flex-col items-center">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                            <DollarSign size={24} className="text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">No income found</h3>
                        <p className="text-gray-500 mt-1">You haven't added any income for this month yet.</p>
                        <button
                            onClick={() => handleOpenModal()}
                            className="text-secondary font-medium mt-4 hover:underline"
                        >
                            Add your first income
                        </button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-500">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th scope="col" className="px-6 py-4">Source</th>
                                    <th scope="col" className="px-6 py-4">Date</th>
                                    <th scope="col" className="px-6 py-4">Amount</th>
                                    <th scope="col" className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {incomes.map((income) => (
                                    <tr key={income._id} className="bg-white border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-secondary/10 text-secondary flex items-center justify-center">
                                                <Tag size={14} />
                                            </div>
                                            {income.source}
                                        </td>
                                        <td className="px-6 py-4">
                                            {new Date(income.date).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 font-semibold text-gray-900">
                                            ₹{income.amount.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleOpenModal(income)}
                                                    className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(income._id)}
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
                title={currentIncome ? 'Edit Income' : 'Add New Income'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
                        <select
                            required
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent outline-none transition-all"
                            value={formData.source}
                            onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                        >
                            {sources.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
                        <input
                            type="number"
                            required
                            min="1"
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent outline-none transition-all"
                            value={formData.amount}
                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                        <input
                            type="date"
                            required
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent outline-none transition-all"
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
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
                            className="flex-1 px-4 py-2 bg-secondary text-white rounded-lg hover:bg-teal-600 transition-colors font-medium"
                        >
                            {currentIncome ? 'Update' : 'Save'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
