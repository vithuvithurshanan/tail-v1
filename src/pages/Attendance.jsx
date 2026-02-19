import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
    Clock,
    CheckCircle2,
    XCircle,
    MinusCircle,
    Calendar,
    RefreshCw,
    ClipboardList,
    Plus,
    X,
    ShoppingBag,
    Printer
} from 'lucide-react';

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const Attendance = () => {
    const [todayData, setTodayData] = useState({ date: '', employees: [] });
    const [weeklyData, setWeeklyData] = useState({ days: [], employees: [] });
    const [activeView, setActiveView] = useState('today');
    const [loading, setLoading] = useState(false);

    // Task order selection
    const [taskModal, setTaskModal] = useState({ open: false, employeeId: '', employeeName: '' });
    const [availableOrders, setAvailableOrders] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [todayRes, weekRes] = await Promise.all([
                axios.get('http://localhost:3001/api/attendance/today'),
                axios.get('http://localhost:3001/api/attendance/weekly')
            ]);
            setTodayData(todayRes.data);
            setWeeklyData(weekRes.data);
        } catch (err) {
            console.error(err);
            toast.error('Failed to load attendance data');
        }
        setLoading(false);
    };

    useEffect(() => { fetchData(); }, []);

    const markAttendance = async (employeeId, status) => {
        try {
            await axios.post('http://localhost:3001/api/attendance/mark', {
                employee_id: employeeId,
                status
            });
            toast.success(`Marked as ${status}`);
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Error marking attendance');
        }
    };

    const openTaskModal = async (employeeId, employeeName) => {
        setTaskModal({ open: true, employeeId, employeeName });
        setOrdersLoading(true);
        try {
            const res = await axios.get(`http://localhost:3001/api/attendance/orders/${employeeId}`);
            setAvailableOrders(res.data);
        } catch (err) {
            toast.error('Failed to load orders');
        }
        setOrdersLoading(false);
    };

    const addTaskEntry = async (orderId) => {
        try {
            await axios.post('http://localhost:3001/api/attendance/tasks', {
                employee_id: taskModal.employeeId,
                order_id: orderId
            });
            toast.success('Task added!');
            setTaskModal({ open: false, employeeId: '', employeeName: '' });
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Error adding task');
        }
    };

    const removeTaskEntry = async (taskId) => {
        try {
            await axios.delete(`http://localhost:3001/api/attendance/tasks/${taskId}`);
            toast.success('Task removed');
            fetchData();
        } catch (err) {
            toast.error('Error removing task');
        }
    };

    const unmarkAttendance = async (employeeId) => {
        try {
            await axios.delete(`http://localhost:3001/api/attendance/${employeeId}`);
            toast.success('Attendance removed');
            fetchData();
        } catch (err) {
            toast.error('Error removing attendance');
        }
    };

    const todayFormatted = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const presentToday = todayData.employees.filter(e => e.status === 'Present').length;
    const halfDayToday = todayData.employees.filter(e => e.status === 'Half-Day').length;
    const absentToday = todayData.employees.filter(e => e.status === 'Absent').length;
    const totalTasksToday = todayData.employees.reduce((s, e) => s + (e.tasks_completed || 0), 0);

    return (
        <div className="page-container">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <div>
                    <h1 className="page-header-h1">Attendance & Tasks</h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium tracking-tight">
                        {todayFormatted}
                    </p>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => window.print()} className="btn-secondary no-print">
                        <Printer size={18} /> Print
                    </button>
                    <button onClick={fetchData} disabled={loading} className="btn-secondary no-print">
                        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} /> Refresh
                    </button>
                </div>
            </div>

            {/* Print Only Content */}
            <div className="print-only">
                <div className="print-header">
                    <h1 className="text-2xl font-bold text-center">Rajani Tailors - Attendance Sheet</h1>
                    <p className="text-center">{activeView === 'today' ? `Date: ${todayFormatted}` : `Week: ${weeklyData.weekStart} to ${weeklyData.weekEnd}`}</p>
                </div>

                {activeView === 'today' ? (
                    <table className="w-full border-collapse border border-slate-300 mt-8">
                        <thead>
                            <tr className="bg-slate-100">
                                <th className="border p-2 text-left">#</th>
                                <th className="border p-2 text-left">Employee ID</th>
                                <th className="border p-2 text-left">Name</th>
                                <th className="border p-2 text-left">Category</th>
                                <th className="border p-2 text-center">Status</th>
                                <th className="border p-2 text-center">Tasks</th>
                                <th className="border p-2 text-left">Orders Worked</th>
                            </tr>
                        </thead>
                        <tbody>
                            {todayData.employees.map((emp, idx) => (
                                <tr key={emp.id}>
                                    <td className="border p-2">{idx + 1}</td>
                                    <td className="border p-2 font-mono">{emp.id}</td>
                                    <td className="border p-2 font-bold">{emp.name}</td>
                                    <td className="border p-2">{emp.category}</td>
                                    <td className="border p-2 text-center font-bold">{emp.status || '—'}</td>
                                    <td className="border p-2 text-center font-bold">{emp.tasks_completed || 0}</td>
                                    <td className="border p-2 text-sm">
                                        {emp.task_entries?.map(t => t.order_id).join(', ') || '—'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr className="bg-slate-50 font-bold">
                                <td className="border p-2" colSpan="4">Total</td>
                                <td className="border p-2 text-center">P:{presentToday} H:{halfDayToday} A:{absentToday}</td>
                                <td className="border p-2 text-center">{totalTasksToday}</td>
                                <td className="border p-2"></td>
                            </tr>
                        </tfoot>
                    </table>
                ) : (
                    <table className="w-full border-collapse border border-slate-300 mt-8">
                        <thead>
                            <tr className="bg-slate-100">
                                <th className="border p-2 text-left">Employee</th>
                                <th className="border p-2 text-left">ID</th>
                                {DAY_LABELS.map(d => (
                                    <th key={d} className="border p-2 text-center">{d}</th>
                                ))}
                                <th className="border p-2 text-center">Days</th>
                                <th className="border p-2 text-center">Tasks</th>
                            </tr>
                        </thead>
                        <tbody>
                            {weeklyData.employees?.map(emp => (
                                <tr key={emp.id}>
                                    <td className="border p-2 font-bold">{emp.name}</td>
                                    <td className="border p-2 font-mono text-sm">{emp.id}</td>
                                    {emp.days.map((day, i) => {
                                        const isFuture = new Date(day.date) > new Date();
                                        return (
                                            <td key={i} className="border p-2 text-center">
                                                {isFuture ? '—' : day.status === 'Present' ? '✓' : day.status === 'Half-Day' ? '½' : day.status === 'Absent' ? '✗' : '·'}
                                                {!isFuture && day.tasks > 0 && ` (${day.tasks})`}
                                            </td>
                                        );
                                    })}
                                    <td className="border p-2 text-center font-bold">{emp.totalDays}</td>
                                    <td className="border p-2 text-center font-bold">{emp.totalTasks}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                <div className="mt-8 text-sm text-slate-500">
                    <p>✓ = Present | ½ = Half-Day | ✗ = Absent | (n) = Tasks completed</p>
                    <p className="mt-2">Printed on: {new Date().toLocaleString()}</p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 no-print">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm">
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Present</p>
                    <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{presentToday}</p>
                </div>
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm">
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Half-Day</p>
                    <p className="text-2xl font-black text-amber-600 dark:text-amber-400">{halfDayToday}</p>
                </div>
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm">
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Absent</p>
                    <p className="text-2xl font-black text-rose-600 dark:text-rose-400">{absentToday}</p>
                </div>
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm border-l-4 border-l-blue-500">
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Tasks Today</p>
                    <p className="text-2xl font-black text-blue-600 dark:text-blue-400">{totalTasksToday}</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800/50 rounded-xl w-fit no-print">
                <button
                    onClick={() => setActiveView('today')}
                    className={`px-6 py-2 rounded-lg font-bold text-xs uppercase tracking-widest transition-all flex items-center gap-2 ${activeView === 'today' ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                >
                    <Clock size={14} /> Today
                </button>
                <button
                    onClick={() => setActiveView('weekly')}
                    className={`px-6 py-2 rounded-lg font-bold text-xs uppercase tracking-widest transition-all flex items-center gap-2 ${activeView === 'weekly' ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                >
                    <Calendar size={14} /> Weekly View
                </button>
            </div>

            {/* Today's Attendance + Tasks */}
            {activeView === 'today' && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm no-print">
                    {todayData.employees.length === 0 ? (
                        <div className="p-12 text-center text-slate-400 italic">No employees found. Add employees first.</div>
                    ) : (
                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                            {todayData.employees.map(emp => (
                                <div key={emp.id} className="p-4 sm:px-6 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                    <div className="flex items-center justify-between gap-4">
                                        {/* Employee Info */}
                                        <div className="flex items-center gap-4 min-w-0 flex-shrink-0">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg flex-shrink-0 ${emp.status === 'Present' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' :
                                                emp.status === 'Absent' ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-600' :
                                                    emp.status === 'Half-Day' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600' :
                                                        'bg-slate-100 dark:bg-slate-800 text-slate-400'
                                                }`}>
                                                {emp.name[0].toUpperCase()}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-bold text-slate-900 dark:text-white truncate">{emp.name}</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400"><span className="font-mono">{emp.id}</span> • {emp.category}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
                                            {/* Task Count + Add Button */}
                                            <button
                                                onClick={() => openTaskModal(emp.id, emp.name)}
                                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 font-bold text-sm transition-all border border-blue-100 dark:border-blue-500/20"
                                            >
                                                <Plus size={14} />
                                                <span>{emp.tasks_completed || 0} Tasks</span>
                                            </button>

                                            {/* Status Badge */}
                                            {emp.marked && (
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider hidden sm:inline-block ${emp.status === 'Present' ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                                                    emp.status === 'Absent' ? 'bg-rose-100 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400' :
                                                        'bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400'
                                                    }`}>
                                                    {emp.status}
                                                </span>
                                            )}

                                            {/* Attendance Buttons */}
                                            <div className="flex gap-1">
                                                <button onClick={() => markAttendance(emp.id, 'Present')} title="Present"
                                                    className={`p-2 rounded-lg transition-all ${emp.status === 'Present' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20' : 'text-slate-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 hover:text-emerald-600'}`}>
                                                    <CheckCircle2 size={18} />
                                                </button>
                                                <button onClick={() => markAttendance(emp.id, 'Half-Day')} title="Half-Day"
                                                    className={`p-2 rounded-lg transition-all ${emp.status === 'Half-Day' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 'text-slate-400 hover:bg-amber-50 dark:hover:bg-amber-500/10 hover:text-amber-600'}`}>
                                                    <MinusCircle size={18} />
                                                </button>
                                                <button onClick={() => markAttendance(emp.id, 'Absent')} title="Absent"
                                                    className={`p-2 rounded-lg transition-all ${emp.status === 'Absent' ? 'bg-rose-600 text-white shadow-lg shadow-rose-500/20' : 'text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:text-rose-600'}`}>
                                                    <XCircle size={18} />
                                                </button>
                                                {emp.marked && (
                                                    <button onClick={() => unmarkAttendance(emp.id)} title="Clear"
                                                        className="p-2 rounded-lg text-slate-300 hover:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-xs font-bold">
                                                        ✕
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Show linked tasks below */}
                                    {emp.task_entries && emp.task_entries.length > 0 && (
                                        <div className="ml-14 mt-2 flex flex-wrap gap-2">
                                            {emp.task_entries.map(task => (
                                                <div key={task.id} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs group">
                                                    <ShoppingBag size={11} className="text-blue-500" />
                                                    <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{task.order_id}</span>
                                                    <span className="text-slate-400">•</span>
                                                    <span className="text-slate-500 dark:text-slate-400">{task.customer_name} — {task.category}</span>
                                                    <button
                                                        onClick={() => removeTaskEntry(task.id)}
                                                        className="ml-1 text-slate-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                                                    >
                                                        <X size={12} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Weekly View */}
            {activeView === 'weekly' && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm no-print">
                    <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Calendar size={16} className="text-blue-500" />
                            <h3 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
                                Week: {weeklyData.weekStart} → {weeklyData.weekEnd}
                            </h3>
                        </div>
                        <div className="flex items-center gap-4 text-xs font-bold text-slate-400">
                            <span className="flex items-center gap-1"><CheckCircle2 size={12} className="text-emerald-500" /> Present</span>
                            <span className="flex items-center gap-1"><MinusCircle size={12} className="text-amber-500" /> Half</span>
                            <span className="flex items-center gap-1"><XCircle size={12} className="text-rose-500" /> Absent</span>
                            <span className="flex items-center gap-1"><ClipboardList size={12} className="text-blue-500" /> Tasks</span>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left min-w-[850px]">
                            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Employee</th>
                                    {DAY_LABELS.map((day, i) => {
                                        const isToday = weeklyData.days && weeklyData.days[i] === new Date().toISOString().split('T')[0];
                                        return (
                                            <th key={day} className={`px-2 py-4 text-xs font-bold uppercase tracking-wider text-center ${isToday ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`}>
                                                {day}
                                                {isToday && <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mx-auto mt-1" />}
                                            </th>
                                        );
                                    })}
                                    <th className="px-3 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Days</th>
                                    <th className="px-3 py-4 text-xs font-bold text-blue-500 uppercase tracking-wider text-center">Tasks</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {weeklyData.employees?.map(emp => (
                                    <tr key={emp.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                        <td className="px-6 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm flex-shrink-0">
                                                    {emp.name[0]}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900 dark:text-white text-sm">{emp.name}</p>
                                                    <p className="text-[10px] text-slate-500"><span className="font-mono">{emp.id}</span> • {emp.category}</p>
                                                </div>
                                            </div>
                                        </td>
                                        {emp.days.map((day, i) => {
                                            const isFuture = new Date(day.date) > new Date();
                                            return (
                                                <td key={i} className="px-2 py-3 text-center">
                                                    {isFuture ? (
                                                        <span className="text-slate-300 dark:text-slate-700 text-lg">—</span>
                                                    ) : (
                                                        <div className="flex flex-col items-center gap-0.5">
                                                            {day.status === 'Present' ? (
                                                                <span className="inline-flex w-7 h-7 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-500/10">
                                                                    <CheckCircle2 size={14} className="text-emerald-600 dark:text-emerald-400" />
                                                                </span>
                                                            ) : day.status === 'Half-Day' ? (
                                                                <span className="inline-flex w-7 h-7 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-500/10">
                                                                    <MinusCircle size={14} className="text-amber-500" />
                                                                </span>
                                                            ) : day.status === 'Absent' ? (
                                                                <span className="inline-flex w-7 h-7 items-center justify-center rounded-lg bg-rose-100 dark:bg-rose-500/10">
                                                                    <XCircle size={14} className="text-rose-500" />
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex w-7 h-7 items-center justify-center rounded-lg bg-slate-50 dark:bg-slate-800">
                                                                    <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600" />
                                                                </span>
                                                            )}
                                                            {day.tasks > 0 && (
                                                                <span className="text-[10px] font-black text-blue-600 dark:text-blue-400">{day.tasks}</span>
                                                            )}
                                                        </div>
                                                    )}
                                                </td>
                                            );
                                        })}
                                        <td className="px-3 py-3 text-center">
                                            <span className={`inline-flex items-center justify-center min-w-[2.2rem] px-2 py-1 rounded-full font-black text-sm ${emp.totalDays >= 5 ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600' :
                                                emp.totalDays >= 3 ? 'bg-blue-100 dark:bg-blue-500/10 text-blue-600' :
                                                    'bg-slate-100 dark:bg-slate-800 text-slate-500'
                                                }`}>
                                                {emp.totalDays}
                                            </span>
                                        </td>
                                        <td className="px-3 py-3 text-center">
                                            <span className={`inline-flex items-center justify-center min-w-[2.2rem] px-2 py-1 rounded-full font-black text-sm ${emp.totalTasks > 0 ? 'bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400' : 'bg-slate-50 dark:bg-slate-800 text-slate-400'
                                                }`}>
                                                {emp.totalTasks}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Task Order Selection Modal */}
            {taskModal.open && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
                        <div className="p-5 bg-blue-600 text-white flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-bold">Add Task</h3>
                                <p className="text-blue-100 text-xs font-bold uppercase tracking-widest mt-0.5">
                                    For {taskModal.employeeName} • Today
                                </p>
                            </div>
                            <button onClick={() => setTaskModal({ open: false, employeeId: '', employeeName: '' })}
                                className="bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="max-h-[400px] overflow-y-auto">
                            {ordersLoading ? (
                                <div className="p-8 text-center text-slate-400 animate-pulse">Loading orders...</div>
                            ) : availableOrders.length === 0 ? (
                                <div className="p-8 text-center text-slate-400 italic">No active orders found.</div>
                            ) : (
                                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {availableOrders.map(order => (
                                        <button
                                            key={order.id}
                                            onClick={() => addTaskEntry(order.id)}
                                            className="w-full text-left p-4 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors flex items-center gap-4 group"
                                        >
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${order.assigned ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                                                }`}>
                                                <ShoppingBag size={18} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <p className="font-mono font-black text-blue-600 dark:text-blue-400 text-sm">{order.id}</p>
                                                    {order.assigned ? (
                                                        <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[9px] font-black uppercase rounded-full">Assigned</span>
                                                    ) : null}
                                                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${order.status === 'Cutting' ? 'bg-amber-100 text-amber-600' :
                                                        order.status === 'Stitching' ? 'bg-purple-100 text-purple-600' :
                                                            order.status === 'Finished' ? 'bg-emerald-100 text-emerald-600' :
                                                                'bg-slate-100 text-slate-500'
                                                        }`}>{order.status}</span>
                                                </div>
                                                <p className="text-sm text-slate-600 dark:text-slate-400 truncate">{order.customer_name} • {order.category}</p>
                                            </div>
                                            <div className="text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Plus size={20} />
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Attendance;
