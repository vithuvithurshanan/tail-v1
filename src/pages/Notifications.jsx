import React, { useState, useEffect } from 'react';
import { statsService, orderService } from '../services/db';
import { Bell, AlertTriangle, Clock, CheckCircle2, ShoppingBag } from 'lucide-react';

const Notifications = () => {
    const [alerts, setAlerts] = useState([]);

    useEffect(() => {
        const generateAlerts = async () => {
            try {
                const [statsData, ordersData] = await Promise.all([
                    statsService.getStats(),
                    orderService.getAll()
                ]);

                const newAlerts = [];

                // Low Stock Alerts
                if (statsData.lowStock > 0) {
                    newAlerts.push({
                        id: 1,
                        type: 'warning',
                        title: 'Critical Stock Alert',
                        message: `${statsData.lowStock} items are below minimum quantity levels.`,
                        icon: AlertTriangle,
                        time: 'Just now'
                    });
                }

                // Delivery Alerts
                const today = new Date().toISOString().split('T')[0];
                const dueToday = ordersData.filter(o => o.delivery_date === today && o.status !== 'Delivered');
                if (dueToday.length > 0) {
                    newAlerts.push({
                        id: 2,
                        type: 'info',
                        title: 'Deliveries Due Today',
                        message: `You have ${dueToday.length} orders scheduled for delivery today.`,
                        icon: Clock,
                        time: 'Morning'
                    });
                }

                // Pending Orders
                if (statsData.pendingOrders > 10) {
                    newAlerts.push({
                        id: 3,
                        type: 'success',
                        title: 'Production Busy',
                        message: `Current workload is high with ${statsData.pendingOrders} active orders.`,
                        icon: ShoppingBag,
                        time: 'Daily Update'
                    });
                }

                setAlerts(newAlerts);
            } catch (err) {
                console.error(err);
            }
        };

        generateAlerts();
    }, []);

    return (
        <div className="p-6 md:p-10 lg:p-12 w-full space-y-6 transition-all duration-300">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
                <div className="p-3 bg-blue-600/10 text-blue-400 rounded-2xl">
                    <Bell size={24} />
                </div>
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold">Alert Center</h1>
                    <p className="text-slate-400 text-sm md:text-base">System notifications and action items.</p>
                </div>
            </div>

            <div className="space-y-4">
                {alerts.map((alert) => (
                    <div
                        key={alert.id}
                        className={`flex items-start gap-4 p-6 rounded-2xl border transition-all hover:scale-[1.01] ${alert.type === 'warning' ? 'bg-rose-500/5 border-rose-500/20' :
                            alert.type === 'info' ? 'bg-blue-500/5 border-blue-500/20' :
                                'bg-emerald-500/5 border-emerald-500/20'
                            }`}
                    >
                        <div className={`p-2 rounded-xl ${alert.type === 'warning' ? 'bg-rose-500/10 text-rose-400' :
                            alert.type === 'info' ? 'bg-blue-500/10 text-blue-400' :
                                'bg-emerald-500/10 text-emerald-400'
                            }`}>
                            <alert.icon size={20} />
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between items-start mb-1">
                                <h3 className="font-bold text-slate-200">{alert.title}</h3>
                                <span className="text-[10px] uppercase font-black text-slate-600 tracking-widest">{alert.time}</span>
                            </div>
                            <p className="text-slate-400 text-sm leading-relaxed">{alert.message}</p>
                        </div>
                    </div>
                ))}

                {alerts.length === 0 && (
                    <div className="text-center py-20 bg-slate-900/50 border border-slate-800 border-dashed rounded-3xl">
                        <CheckCircle2 size={48} className="mx-auto mb-4 text-slate-700" />
                        <p className="text-slate-500">All caught up! No active alerts.</p>
                    </div>
                )}
            </div>

            <div className="pt-8 border-t border-slate-800">
                <h4 className="text-xs font-bold text-slate-500 uppercase mb-4 tracking-widest">Recent Activity</h4>
                <div className="space-y-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="flex gap-4 items-center">
                            <div className="w-2 h-2 rounded-full bg-slate-800"></div>
                            <p className="text-sm text-slate-500">System backup completed successfully.</p>
                            <span className="text-[10px] text-slate-700 ml-auto">Feb {18 - i}, 2026</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Notifications;
