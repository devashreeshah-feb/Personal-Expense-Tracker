import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';

import Login from './pages/Login';
import Register from './pages/Register';

import Dashboard from './pages/Dashboard';
import Income from './pages/Income';
import Expenses from './pages/Expenses';
import Budget from './pages/Budget';
import Profile from './pages/Profile';
import Transactions from './pages/Transactions';
import Reports from './pages/Reports';

function App() {
    return (
        <Router>
            <ThemeProvider>
                <NotificationProvider>
                    <AuthProvider>
                        <Routes>
                            {/* Public Routes */}
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />

                            {/* Protected Routes inside DashboardLayout */}
                            <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
                                <Route path="/" element={<Dashboard />} />
                                <Route path="/income" element={<Income />} />
                                <Route path="/expenses" element={<Expenses />} />
                                <Route path="/budget" element={<Budget />} />
                                <Route path="/transactions" element={<Transactions />} />
                                <Route path="/reports" element={<Reports />} />
                                <Route path="/profile" element={<Profile />} />
                            </Route>

                            {/* 404 Redirect */}
                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                    </AuthProvider>
                </NotificationProvider>
            </ThemeProvider>
        </Router>
    );
}

export default App;
