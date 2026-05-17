import { useState, useEffect } from 'react';
import api from '../services/api';
import { Search, Filter, ArrowUpRight, ArrowDownRight, ArrowDown, ArrowUp } from 'lucide-react';

export default function Transactions() {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [type, setType] = useState('all');
    const [search, setSearch] = useState('');
    const [sort, setSort] = useState('desc');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 500);
        return () => clearTimeout(timer);
    }, [search]);

    const fetchTransactions = async () => {
        try {
            setLoading(true);
            let query = `?sort=${sort}`;
            if (type !== 'all') query += `&type=${type}`;
            if (debouncedSearch) query += `&search=${debouncedSearch}`;

            const res = await api.get(`/transactions${query}`);
            setTransactions(res.data.transactions);
        } catch (error) {
            console.error('Failed to fetch transactions', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, [type, sort, debouncedSearch]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Transaction History</h2>
                    <p className="text-gray-500 text-sm mt-1">View and filter all your incomes and expenses</p>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="bg-card p-4 rounded-xl shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search size={18} className="text-gray-400" />
                    </div>
                    <input
                        type="text"
                        className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full pl-10 p-2.5 outline-none"
                        placeholder="Search by title, category, or description..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-2">
                    <Filter size={18} className="text-gray-400" />
                    <select
                        className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5 outline-none"
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                    >
                        <option value="all">All Types</option>
                        <option value="income">Income Only</option>
                        <option value="expense">Expense Only</option>
                    </select>
                </div>

                <div className="flex items-center gap-2">
                    {sort === 'desc' ? <ArrowDown size={18} className="text-gray-400" /> : <ArrowUp size={18} className="text-gray-400" />}
                    <select
                        className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5 outline-none"
                        value={sort}
                        onChange={(e) => setSort(e.target.value)}
                    >
                        <option value="desc">Newest First</option>
                        <option value="asc">Oldest First</option>
                    </select>
                </div>
            </div>

            {/* Transaction List */}
            <div className="bg-card rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-gray-500">Loading...</div>
                ) : transactions.length === 0 ? (
                    <div className="p-12 text-center flex flex-col items-center">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                            <Search size={24} className="text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">No transactions found</h3>
                        <p className="text-gray-500 mt-1">Try adjusting your filters or search term.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-500">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th scope="col" className="px-6 py-4">Title / Source</th>
                                    <th scope="col" className="px-6 py-4">Category</th>
                                    <th scope="col" className="px-6 py-4">Date</th>
                                    <th scope="col" className="px-6 py-4 text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.map((t) => (
                                    <tr key={t._id} className="bg-white border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${t.transactionType === 'income'
                                                    ? 'bg-secondary/10 text-secondary'
                                                    : 'bg-alert/10 text-alert'
                                                }`}>
                                                {t.transactionType === 'income' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                            </div>
                                            <div>
                                                <div>{t.title || t.source}</div>
                                                {t.description && <span className="text-xs text-gray-500 font-normal">{t.description}</span>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium">
                                                {t.category || t.source}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {new Date(t.date).toLocaleDateString()}
                                        </td>
                                        <td className={`px-6 py-4 text-right font-semibold whitespace-nowrap ${t.transactionType === 'income' ? 'text-secondary' : 'text-gray-900'
                                            }`}>
                                            {t.transactionType === 'income' ? '+' : '-'}₹{t.amount.toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
