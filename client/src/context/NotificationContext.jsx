import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchNotifications = async () => {
        try {
            // We can re-use the insights endpoint to generate "smart" notifications
            const currentMonth = new Date().getMonth() + 1;
            const currentYear = new Date().getFullYear();

            const res = await api.get(`/insights?month=${currentMonth}&year=${currentYear}`);

            if (res.data) {
                const newNotifs = [];
                let idCounter = 1;

                // Budget Warnings
                if (res.data.warnings && res.data.warnings.length > 0) {
                    res.data.warnings.forEach(warning => {
                        newNotifs.push({
                            id: idCounter++,
                            type: 'warning',
                            message: warning,
                            time: 'Just now',
                            read: false
                        });
                    });
                }

                // AI Insights
                if (res.data.insights && res.data.insights.length > 0) {
                    res.data.insights.forEach(insight => {
                        newNotifs.push({
                            id: idCounter++,
                            type: 'info',
                            message: insight,
                            time: 'Just now',
                            read: false
                        });
                    });
                }

                setNotifications(newNotifs);
                setUnreadCount(newNotifs.length);
            }
        } catch (error) {
            console.error('Failed to fetch notifications', error);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            fetchNotifications();
        }
    }, []);

    const markAsRead = (id) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
    };

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setUnreadCount(0);
    };

    return (
        <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, markAllAsRead, refreshNotifications: fetchNotifications }}>
            {children}
        </NotificationContext.Provider>
    );
};
