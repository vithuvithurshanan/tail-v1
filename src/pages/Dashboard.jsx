import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Users,
    UserCircle,
    Clock,
    AlertTriangle,
    TrendingUp,
    Package,
    ShoppingBag,
    Plus,
    DollarSign,
    ExternalLink
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

import { useNavigate } from 'react-router-dom';

const StatCard = ({ title, value, icon: Icon, color, trend, trendValue }) => (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl hover:border-blue-500/50 dark:hover:border-slate-700 transition-all group shadow-sm dark:shadow-none">
        <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-xl ${color} bg-opacity-10 text-${color.split('-')[1]}-600 dark:text-${color.split('-')[1]}-400 group-hover:scale-110 transition-transform`}>
                <Icon size={24} />
            </div>
            {trend && (
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${trend === 'up' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'}`}>
                    {trend === 'up' ? '+' : '-'}{trendValue}
                </span>
            )}
        </div>
        <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">{title}</h3>
        <p className="text-3xl font-bold text-slate-900 dark:text-white">{value}</p>
    </div>
);

const Dashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        employees: 0,
        customers: 0,
        pendingOrders: 0,
        lowStock: 0,
        totalRevenue: 0,
        balanceDue: 0,
        chartData: [],
        recentOrders: []
    });

    const fetchStats = async () => {
        try {
            const res = await axios.get('http://localhost:3001/api/stats');
            setStats(res.data);
        } catch (err) {
            console.error("Error fetching stats:", err);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    return (
        <div className="p-6 md:p-10 lg:p-12 w-full space-y-8 transition-all duration-300">
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold mb-2 text-slate-900 dark:text-white">Business Overview</h1>
                    <p className="text-slate-500 dark:text-slate-400">Track your tailoring operations in real-time.</p>
                </div>
                <div className="text-xs md:text-sm text-slate-500 bg-white dark:bg-slate-900 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
                    Last updated: {new Date().toLocaleTimeString()}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
                <StatCard
                    title="Total Income (LKR)"
                    value={`LKR ${stats.totalRevenue.toLocaleString()}`}
                    icon={DollarSign}
                    color="bg-emerald-500"
                    trend="up"
                    trendValue="Delivered"
                />
                <StatCard
                    title="Balance Due (LKR)"
                    value={`LKR ${stats.balanceDue.toLocaleString()}`}
                    icon={AlertTriangle}
                    color="bg-amber-500"
                />
                <StatCard
                    title="Total Employees"
                    value={stats.employees}
                    icon={Users}
                    color="bg-blue-500"
                />
                <StatCard
                    title="Total Customers"
                    value={stats.customers}
                    icon={UserCircle}
                    color="bg-purple-500"
                />
                <StatCard
                    title="Active Orders"
                    value={stats.pendingOrders}
                    icon={Clock}
                    color="bg-indigo-500"
                />
                <StatCard
                    title="Low Stock Alerts"
                    value={stats.lowStock}
                    icon={AlertTriangle}
                    color="bg-rose-500"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Orders Chart */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm dark:shadow-none">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-semibold text-lg flex items-center gap-2 text-slate-900 dark:text-white">
                            <TrendingUp size={20} className="text-blue-500 dark:text-blue-400" />
                            Weekly Order Volume
                        </h3>
                    </div>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-200 dark:text-slate-800" vertical={false} />
                                <XAxis dataKey="name" stroke="currentColor" className="text-slate-400 dark:text-slate-500" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="currentColor" className="text-slate-400 dark:text-slate-500" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'var(--tw-background-opacity) === 1 ? "#fff" : "#0f172a"',
                                        border: '1px solid currentColor',
                                        borderRadius: '8px',
                                    }}
                                    itemStyle={{ color: 'currentColor' }}
                                    className="dark:text-white text-slate-900 dark:bg-slate-900 bg-white dark:border-slate-800 border-slate-200"
                                />
                                <Bar dataKey="orders" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={32} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm dark:shadow-none">
                    <h3 className="font-semibold text-lg mb-6 flex items-center gap-2 text-slate-900 dark:text-white">
                        <ShoppingBag size={20} className="text-purple-500 dark:text-purple-400" />
                        Quick Actions
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={() => navigate('/orders')}
                            className="flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-800/50 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors gap-3 border border-slate-200 dark:border-slate-700/50 group"
                        >
                            <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                                <Plus size={24} />
                            </div>
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">New Order</span>
                        </button>
                        <button
                            onClick={() => navigate('/customers')}
                            className="flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-800/50 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors gap-3 border border-slate-200 dark:border-slate-700/50 group"
                        >
                            <div className="w-10 h-10 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-all shadow-sm">
                                <UserCircle size={24} />
                            </div>
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Add Customer</span>
                        </button>
                        <button
                            onClick={() => navigate('/inventory')}
                            className="flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-800/50 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors gap-3 border border-slate-200 dark:border-slate-700/50 group"
                        >
                            <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-all shadow-sm">
                                <Package size={24} />
                            </div>
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Restock Fabric</span>
                        </button>
                        <button
                            onClick={() => navigate('/finance')}
                            className="flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-800/50 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors gap-3 border border-slate-200 dark:border-slate-700/50 group"
                        >
                            <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-sm">
                                <TrendingUp size={24} />
                            </div>
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">View Reports</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Recent Orders Table */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm dark:shadow-none">
                <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-transparent">
                    <h3 className="font-bold text-lg flex items-center gap-2 text-slate-900 dark:text-white">
                        <Clock size={20} className="text-blue-500 dark:text-blue-400" />
                        Recent Orders
                    </h3>
                    <button
                        onClick={() => navigate('/orders')}
                        className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1 font-medium"
                    >
                        View All <ExternalLink size={14} />
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 dark:bg-slate-800/30 text-xs font-semibold uppercase text-slate-500">
                            <tr>
                                <th className="px-6 py-4">Order ID</th>
                                <th className="px-6 py-4">Customer</th>
                                <th className="px-6 py-4">Delivery</th>
                                <th className="px-6 py-4">Amount</th>
                                <th className="px-6 py-4">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                            {stats.recentOrders.map((order) => (
                                <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors group">
                                    <td className="px-6 py-4 font-mono text-sm text-blue-600 dark:text-blue-400">{order.id}</td>
                                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{order.customer_name}</td>
                                    <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400">{order.delivery_date}</td>
                                    <td className="px-6 py-4 font-bold text-slate-700 dark:text-slate-200">LKR {order.total_amount.toLocaleString()}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${order.status === 'Delivered' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                                            order.status === 'Pending' ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400' : 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                                            }`}>
                                            {order.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
