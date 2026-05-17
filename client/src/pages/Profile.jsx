import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, DollarSign, Save } from 'lucide-react';

export default function Profile() {
    const { user, updateProfile } = useAuth();
    const [formData, setFormData] = useState({
        name: user?.name || '',
        monthlyIncome: user?.monthlyIncome || 0
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            await updateProfile({
                name: formData.name,
                monthlyIncome: Number(formData.monthlyIncome)
            });
            setMessage({ type: 'success', text: 'Profile updated successfully' });
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to update profile' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Profile Settings</h2>

            <div className="bg-card rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 sm:p-8">

                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center text-2xl font-bold">
                            {user?.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">{user?.name}</h3>
                            <p className="text-gray-500">{user?.email}</p>
                        </div>
                    </div>

                    {message.text && (
                        <div className={`p-4 rounded-lg mb-6 text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
                            }`}>
                            {message.text}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                                <User size={16} /> Full Name
                            </label>
                            <input
                                type="text"
                                name="name"
                                required
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                value={formData.name}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                                <Mail size={16} /> Email Address
                            </label>
                            <input
                                type="email"
                                disabled
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                                value={user?.email || ''}
                            />
                            <p className="text-xs text-gray-500 mt-1">Email address cannot be changed</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                                <DollarSign size={16} /> Base Monthly Income (₹)
                            </label>
                            <input
                                type="number"
                                name="monthlyIncome"
                                min="0"
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                value={formData.monthlyIncome}
                                onChange={handleChange}
                            />
                            <p className="text-xs text-gray-500 mt-1">This helps calculate your overall savings target</p>
                        </div>

                        <div className="pt-4 border-t border-gray-100 flex justify-end">
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-primary hover:bg-indigo-700 text-white font-medium py-2.5 px-6 rounded-lg transition-colors flex items-center gap-2"
                            >
                                <Save size={18} />
                                {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>

                </div>
            </div>
        </div>
    );
}
