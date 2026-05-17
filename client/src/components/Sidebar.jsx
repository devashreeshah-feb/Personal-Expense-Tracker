import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard,
    ArrowDownCircle,
    ArrowUpCircle,
    Target,
    History,
    FileText,
    User,
    LogOut
} from 'lucide-react';

export default function Sidebar() {
    const location = useLocation();
    const { logout } = useAuth();

    const links = [
        { name: 'Dashboard', path: '/', icon: LayoutDashboard },
        { name: 'Income', path: '/income', icon: ArrowDownCircle },
        { name: 'Expenses', path: '/expenses', icon: ArrowUpCircle },
        { name: 'Budget', path: '/budget', icon: Target },
        { name: 'Transactions', path: '/transactions', icon: History },
        { name: 'Reports', path: '/reports', icon: FileText },
        { name: 'Profile', path: '/profile', icon: User },
    ];

    return (
        <aside className="bg-card w-64 h-full border-r border-border-color flex flex-col transition-colors duration-200">
            <div className="p-6">
                <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent flex items-center gap-2">
                    <Target className="text-primary" size={24} />
                    SmartFinance
                </h1>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-1">
                {links.map((link) => {
                    const Icon = link.icon;
                    const isActive = location.pathname === link.path ||
                        (link.path !== '/' && location.pathname.startsWith(link.path));

                    return (
                        <Link
                            key={link.name}
                            to={link.path}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium ${isActive
                                ? 'bg-primary/10 text-primary dark:bg-primary/20'
                                : 'text-text-secondary hover:bg-background hover:text-text-primary'
                                }`}
                        >
                            <Icon size={20} className={isActive ? 'text-primary' : 'text-text-secondary opacity-70'} />
                            {link.name}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-border-color">
                <button
                    onClick={logout}
                    className="flex items-center gap-3 w-full px-4 py-3 text-alert font-medium rounded-lg hover:bg-alert/10 transition-colors"
                >
                    <LogOut size={20} />
                    Logout
                </button>
            </div>
        </aside>
    );
}
