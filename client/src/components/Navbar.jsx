import { useState } from 'react';
import { Bell, Menu, Sun, Moon, AlertCircle, Info, Check, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNotifications } from '../context/NotificationContext';

export default function Navbar({ onMenuClick }) {
    const { user } = useAuth();
    const { darkMode, toggleTheme } = useTheme();
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
    const [showNotifications, setShowNotifications] = useState(false);

    return (
        <header className="bg-card border-b border-gray-100 dark:border-gray-800 sticky top-0 z-20 transition-colors duration-200">
            <div className="flex items-center justify-between px-6 py-4">
                {/* Mobile menu button */}
                <button
                    onClick={onMenuClick}
                    className="md:hidden text-text-secondary hover:text-text-primary"
                >
                    <Menu size={24} />
                </button>

                <div className="hidden md:block text-text-primary font-medium">
                    Welcome back, {user?.name?.split(' ')[0] || 'User'} 👋
                </div>

                <div className="flex items-center gap-4 sm:gap-6 relative">
                    <button
                        onClick={toggleTheme}
                        className="text-text-secondary hover:text-text-primary transition-colors"
                        aria-label="Toggle dark mode"
                    >
                        {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                    </button>

                    <div className="relative">
                        <button
                            onClick={() => setShowNotifications(!showNotifications)}
                            className="relative text-text-secondary hover:text-text-primary transition-colors"
                        >
                            <Bell size={20} />
                            {unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 w-4 h-4 text-[10px] font-bold text-white bg-alert rounded-full border-2 border-card flex items-center justify-center">
                                    {unreadCount}
                                </span>
                            )}
                        </button>

                        {/* Notifications Dropdown */}
                        {showNotifications && (
                            <div className="absolute right-0 mt-3 w-80 bg-card rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden z-50">
                                <div className="p-3 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-background">
                                    <h3 className="font-semibold text-text-primary text-sm">Notifications</h3>
                                    {unreadCount > 0 && (
                                        <button
                                            onClick={markAllAsRead}
                                            className="text-xs text-primary hover:text-primary/80 font-medium"
                                        >
                                            Mark all read
                                        </button>
                                    )}
                                </div>

                                <div className="max-h-80 overflow-y-auto custom-scrollbar">
                                    {notifications.length === 0 ? (
                                        <div className="p-4 text-center text-text-secondary text-sm">
                                            No notifications right now.
                                        </div>
                                    ) : (
                                        notifications.map(notif => (
                                            <div
                                                key={notif.id}
                                                className={`p-4 border-b border-gray-50 dark:border-gray-800 flex gap-3 hover:bg-background transition-colors ${!notif.read ? 'bg-primary/5 dark:bg-primary/10' : ''}`}
                                            >
                                                <div className={`mt-0.5 shrink-0 ${notif.type === 'warning' ? 'text-alert' : 'text-primary'}`}>
                                                    {notif.type === 'warning' ? <AlertCircle size={18} /> : <Info size={18} />}
                                                </div>
                                                <div className="flex-1">
                                                    <p className={`text-sm ${notif.read ? 'text-text-secondary' : 'text-text-primary font-medium'}`}>
                                                        {notif.message}
                                                    </p>
                                                    <p className="text-xs text-text-secondary mt-1">{notif.time}</p>
                                                </div>
                                                {!notif.read && (
                                                    <button
                                                        onClick={() => markAsRead(notif.id)}
                                                        className="shrink-0 text-text-secondary hover:text-success transition-colors"
                                                        title="Mark as read"
                                                    >
                                                        <Check size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                            {user?.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="hidden sm:block">
                            <p className="text-sm font-medium text-text-primary">{user?.name}</p>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
