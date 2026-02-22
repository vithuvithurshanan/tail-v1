import React, { useState } from 'react';
import { LogIn, Scissors } from 'lucide-react';

const Login = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (username === 'admin' && password === 'admin') {
            onLogin({ username: 'Admin User', role: 'admin' });
        } else if (username === 'staff' && password === 'staff') {
            onLogin({ username: 'Staff User', role: 'staff' });
        } else {
            setError('Invalid credentials. Try admin/admin or staff/staff');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 transition-colors duration-300">
            <div className="max-w-md w-full">
                {/* Logo Section */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-white shadow-xl shadow-blue-500/10 dark:shadow-blue-900/20 mb-4 overflow-hidden border-4 border-white dark:border-slate-800 transform -rotate-12 transition-transform hover:rotate-0 duration-300">
                        <img
                            src="/logo.jpg"
                            alt="Rajani Tailors Logo"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Rajani Tailors</h1>
                    <p className="text-slate-500 dark:text-slate-500 font-medium">Management System Portal</p>
                </div>

                {/* Card Section */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl dark:shadow-2xl">
                    <h2 className="text-xl font-bold mb-6 text-slate-900 dark:text-slate-200">Welcome Back</h2>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Username</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm"
                                placeholder="Enter your username"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm"
                                placeholder="••••••••"
                            />
                        </div>

                        {error && (
                            <div className="text-rose-600 dark:text-rose-400 text-sm font-medium bg-rose-50 dark:bg-rose-400/10 p-3 rounded-lg border border-rose-100 dark:border-rose-400/20 animate-in fade-in slide-in-from-top-2">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-500/30 dark:shadow-blue-900/40 transition-all active:scale-95 flex items-center justify-center gap-2"
                        >
                            <LogIn size={20} /> Sign In
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
                        <p className="text-slate-500 dark:text-slate-500 text-sm italic">
                            "Crafting elegance since 1995"
                        </p>
                    </div>
                </div>

                <div className="mt-8 text-center text-slate-400 dark:text-slate-600 text-xs translate-y-10 opacity-50">
                    &copy; 2026 Mannar Rajani Tailors & Textiles. All rights reserved.
                </div>
            </div>
        </div>
    );
};

export default Login;
