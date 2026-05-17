import { useState, useEffect } from 'react';
import api from '../services/api';
import {
    ArrowUpRight,
    ArrowDownRight,
    DollarSign,
    Wallet,
    TrendingUp,
    CreditCard,
    AlertCircle
} from 'lucide-react';
import {
    PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    LineChart, Line
} from 'recharts';

const COLORS = ['#4F46E5', '#14B8A6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#10B981', '#6366F1', '#64748B'];

export default function Dashboard() {
    const [stats, setStats] = useState(null);
    const [insights, setInsights] = useState(null);
    const [loading, setLoading] = useState(true);

    const currentMonth = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
    const [month, setMonth] = useState(currentMonth);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [year, m] = month.split('-');
                const [statsRes, insightsRes] = await Promise.all([
                    api.get(`/dashboard/stats?month=${m}&year=${year}`),
                    api.get(`/insights?month=${m}&year=${year}`)
                ]);

                setStats(statsRes.data);
                setInsights(insightsRes.data);
            } catch (error) {
                console.error('Failed to fetch dashboard data', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [month]);

    if (loading) {
        return <div className="p-8 text-center text-gray-500">Loading dashboard data...</div>;
    }

    if (!stats) return null;

    // Format charts data
    const pieData = stats.categoryBreakdown.map(c => ({ name: c._id, value: c.total }));

    const barData = stats.monthlyExpenseTrend.map((t, index) => {
        const monthName = new Date(t._id.year, t._id.month - 1).toLocaleString('default', { month: 'short' });
        const incomeObj = stats.monthlyIncomeTrend.find(i => i._id.year === t._id.year && i._id.month === t._id.month);
        return {
            name: monthName,
            Expense: t.total,
            Income: incomeObj ? incomeObj.total : 0
        };
    });

    const StatCard = ({ title, amount, icon: Icon, trend, color, trendUp, isCurrency = true }) => (
        <div className="bg-card rounded-xl border border-border-color p-6 shadow-sm transition-colors duration-200">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-sm font-medium text-text-secondary mb-1">{title}</p>
                    <h3 className="text-2xl font-bold text-text-primary">
                        {isCurrency ? `₹${amount.toLocaleString()}` : amount}
                    </h3>
                </div>
                <div className={`p-3 rounded-lg ${color}`}>
                    <Icon size={20} />
                </div>
            </div>
            {trend !== undefined && (
                <div className={`flex items-center gap-1 mt-4 text-sm font-medium ${trendUp ? 'text-success' : 'text-alert'}`}>
                    {trendUp ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                    <span>{Math.abs(trend)}% from last month</span>
                </div>
            )}
        </div>
    );

    return (
        <div className="space-y-6 pb-12">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-text-primary">Financial Overview</h2>
                    <p className="text-text-secondary text-sm mt-1">Here's your financial summary for the selected month</p>
                </div>
                <input
                    type="month"
                    className="bg-card border border-border-color text-text-primary rounded-lg focus:ring-primary focus:border-primary p-2 outline-none shadow-sm transition-colors duration-200"
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                />
            </div>

            {/* Top Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <StatCard
                    title="Total Income"
                    amount={stats.totalIncome}
                    icon={Wallet}
                    color="bg-primary/10 text-primary"
                    trend={stats.incomeChange}
                    trendUp={stats.incomeChange >= 0}
                />
                <StatCard
                    title="Total Expenses"
                    amount={stats.totalExpense}
                    icon={CreditCard}
                    color="bg-alert/10 text-alert"
                    trend={stats.expenseChange}
                    trendUp={stats.expenseChange <= 0} // Less expenses is good
                />
                <StatCard
                    title="Net Savings"
                    amount={stats.savings}
                    icon={DollarSign}
                    color="bg-success/10 text-success"
                />
                <StatCard
                    title="Savings Rate"
                    amount={`${stats.savingsPercent}%`}
                    isCurrency={false}
                    icon={TrendingUp}
                    color="bg-secondary/10 text-secondary"
                />
            </div>

            {/* Smart Insights Section (Python Analytics) */}
            {insights && insights.insights && insights.insights.length > 0 && (
                <div className="bg-gradient-to-r from-primary to-indigo-700 rounded-xl shadow-md p-6 text-white text-sm">
                    <div className="flex items-center gap-2 mb-3">
                        <span className="bg-white text-primary text-xs font-bold px-2 py-1 rounded">AI INSIGHT</span>
                        <h3 className="font-semibold text-base">Smart Financial Analysis</h3>
                    </div>
                    <ul className="space-y-2">
                        {insights.insights.map((insight, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                                <span className="text-indigo-200 mt-0.5">•</span>
                                <span>{insight}</span>
                            </li>
                        ))}
                        {insights.warning && (
                            <li className="flex items-start gap-2 text-red-200 bg-red-900/30 p-2 rounded mt-2 border border-red-800/50">
                                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                                <span>{insights.warning}</span>
                            </li>
                        )}
                    </ul>
                </div>
            )}

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Expense Category Pie Chart */}
                <div className="bg-card rounded-xl border border-gray-100 p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Expenses by Category</h3>
                    {pieData.length > 0 ? (
                        <div className="h-64 sm:h-80 w-full relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip
                                        formatter={(value) => `₹${value.toLocaleString()}`}
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-xs text-gray-500">Total</span>
                                <span className="text-lg font-bold text-gray-900">₹{stats.totalExpense.toLocaleString()}</span>
                            </div>
                        </div>
                    ) : (
                        <div className="h-64 flex items-center justify-center text-gray-500 text-sm">No expenses recorded</div>
                    )}
                </div>

                {/* Monthly Trend Bar Chart */}
                <div className="bg-card rounded-xl border border-gray-100 p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">6-Month Trend</h3>
                    {barData.length > 0 ? (
                        <div className="h-64 sm:h-80 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={barData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} dy={10} />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tickFormatter={(value) => `₹${value / 1000}k`}
                                        tick={{ fontSize: 12, fill: '#64748B' }}
                                        dx={-10}
                                    />
                                    <RechartsTooltip
                                        cursor={{ fill: 'transparent' }}
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        formatter={(value) => `₹${value.toLocaleString()}`}
                                    />
                                    <Bar dataKey="Income" fill="#4F46E5" radius={[4, 4, 0, 0]} maxBarSize={40} />
                                    <Bar dataKey="Expense" fill="#EF4444" radius={[4, 4, 0, 0]} maxBarSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="h-64 flex items-center justify-center text-gray-500 text-sm">No trend data available</div>
                    )}
                </div>

                {/* Additional insights row depending on python output could go here */}

            </div>
        </div>
    );
}
