import { useState } from 'react';
import api from '../services/api';
import { FileText, Download, FileJson } from 'lucide-react';

export default function Reports() {
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());
    const [loadingType, setLoadingType] = useState(null);
    const [error, setError] = useState('');

    const handleDownload = async (type) => {
        try {
            setLoadingType(type);
            setError('');

            // We use standard fetch here to handle file downloads more easily than Axios
            const token = localStorage.getItem('token');
            const res = await fetch(`http://localhost:5000/api/export/${type}?month=${month}&year=${year}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || 'Server error');
            }

            // Create blob link to download
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `finance_report_${year}_${month}.${type}`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

        } catch (err) {
            console.error('Download failed:', err);
            setError(err.message || 'Failed to download report. Please ensure the Python analytics service is running for PDF exports.');
        } finally {
            setLoadingType(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Export Reports</h2>
                    <p className="text-gray-500 text-sm mt-1">Download your monthly financial summaries</p>
                </div>
            </div>

            {error && (
                <div className="bg-alert/10 text-alert p-4 rounded-lg font-medium text-sm">
                    {error}
                </div>
            )}

            <div className="bg-card p-6 rounded-xl shadow-sm border border-gray-100 max-w-2xl">
                <h3 className="font-semibold text-gray-900 mb-4 text-lg">Select Report Period</h3>

                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
                        <select
                            className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block p-2.5 outline-none transition-all"
                            value={month}
                            onChange={(e) => setMonth(e.target.value)}
                        >
                            {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                                <option key={m} value={m}>{new Date(2000, m - 1, 1).toLocaleString('default', { month: 'long' })}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                        <select
                            className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block p-2.5 outline-none transition-all"
                            value={year}
                            onChange={(e) => setYear(e.target.value)}
                        >
                            {[new Date().getFullYear() - 1, new Date().getFullYear(), new Date().getFullYear() + 1].map(y => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                        onClick={() => handleDownload('pdf')}
                        disabled={loadingType !== null}
                        className="flex items-center justify-center gap-2 p-4 border border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary rounded-xl font-medium transition-colors disabled:opacity-50"
                    >
                        {loadingType === 'pdf' ? (
                            <span className="animate-pulse">Generating PDF...</span>
                        ) : (
                            <>
                                <FileText size={20} />
                                Download PDF Report
                                <Download size={16} className="ml-auto" />
                            </>
                        )}
                    </button>

                    <button
                        onClick={() => handleDownload('csv')}
                        disabled={loadingType !== null}
                        className="flex items-center justify-center gap-2 p-4 border border-secondary/20 bg-secondary/5 hover:bg-secondary/10 text-secondary rounded-xl font-medium transition-colors disabled:opacity-50"
                    >
                        {loadingType === 'csv' ? (
                            <span className="animate-pulse">Generating CSV...</span>
                        ) : (
                            <>
                                <FileJson size={20} />
                                Download CSV Report
                                <Download size={16} className="ml-auto" />
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
