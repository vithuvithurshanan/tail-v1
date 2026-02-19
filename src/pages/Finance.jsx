import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
    CreditCard,
    Receipt,
    Plus,
    FileText,
    DollarSign,
    Calendar,
    AlertCircle,
    Download,
    Image as ImageIcon,
    X,
    Upload,
    UserCircle
} from 'lucide-react';

const Finance = () => {
    const [activeTab, setActiveTab] = useState('salaries');
    const [cheques, setCheques] = useState([]);
    const [utilities, setUtilities] = useState([]);
    const [salaries, setSalaries] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [file, setFile] = useState(null);

    const [formData, setFormData] = useState({
        cheque_number: '',
        amount: '',
        due_date: '',
        given_to: '',
        type: 'Electricity', // for utilities
        employee_id: '',
        month: '',
        payment_date: new Date().toISOString().split('T')[0],
        notes: '',
        salary_type: 'Full Salary',
        pay_period: 'Monthly'
    });

    const fetchData = async () => {
        try {
            const [chqRes, utlRes, salRes, empRes] = await Promise.all([
                axios.get('http://localhost:3001/api/finance/cheques'),
                axios.get('http://localhost:3001/api/finance/utilities'),
                axios.get('http://localhost:3001/api/finance/salaries'),
                axios.get('http://localhost:3001/api/employees')
            ]);
            setCheques(chqRes.data);
            setUtilities(utlRes.data);
            setSalaries(salRes.data);
            setEmployees(empRes.data);
        } catch (err) {
            console.error("Fetch history error:", err);
            toast.error("Failed to load financial records or employees");
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (activeTab === 'cheques') {
                const data = new FormData();
                data.append('cheque_number', formData.cheque_number);
                data.append('amount', formData.amount);
                data.append('due_date', formData.due_date);
                data.append('given_to', formData.given_to);
                if (file) data.append('proof', file);
                await axios.post('http://localhost:3001/api/finance/cheques', data);
            } else if (activeTab === 'utilities') {
                await axios.post('http://localhost:3001/api/finance/utilities', formData);
            } else if (activeTab === 'salaries') {
                await axios.post('http://localhost:3001/api/finance/salaries', {
                    employee_id: formData.employee_id,
                    amount: formData.amount,
                    month: formData.month,
                    payment_date: formData.payment_date,
                    type: formData.salary_type,
                    pay_period: formData.pay_period,
                    notes: formData.notes
                });
            }
            toast.success('Record saved successfully!');
            setShowAddModal(false);
            fetchData();
            setFormData({
                cheque_number: '',
                amount: '',
                due_date: '',
                given_to: '',
                type: 'Electricity',
                employee_id: '',
                month: '',
                payment_date: new Date().toISOString().split('T')[0],
                notes: '',
                salary_type: 'Full Salary',
                pay_period: 'Monthly'
            });
            setFile(null);
        } catch (err) {
            toast.error(err.response?.data?.error || err.message);
        }
    };

    const handlePayUtility = async (id) => {
        try {
            await axios.patch(`http://localhost:3001/api/finance/utilities/${id}/pay`);
            toast.success('Bill marked as paid!');
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.error || err.message);
        }
    };

    return (
        <div className="page-container">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <div>
                    <h1 className="page-header-h1">Finance</h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium tracking-tight">Manage employee salaries, cheques, and utility expenses.</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="btn-primary"
                >
                    <Plus size={18} /> New Entry
                </button>
            </div>

            <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800/50 rounded-xl w-fit">
                <button
                    onClick={() => setActiveTab('salaries')}
                    className={`px-6 py-2 rounded-lg font-bold text-xs uppercase tracking-widest transition-all ${activeTab === 'salaries' ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                >
                    Employee Salaries
                </button>
                <button
                    onClick={() => setActiveTab('cheques')}
                    className={`px-6 py-2 rounded-lg font-bold text-xs uppercase tracking-widest transition-all ${activeTab === 'cheques' ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                >
                    Cheque Management
                </button>
                <button
                    onClick={() => setActiveTab('utilities')}
                    className={`px-6 py-2 rounded-lg font-bold text-xs uppercase tracking-widest transition-all ${activeTab === 'utilities' ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                >
                    Utility & Expenses
                </button>
            </div>

            {activeTab === 'salaries' && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                                <tr>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Employee</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Payment For</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Amount</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Date Paid</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Period</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Type</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {salaries.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-8 py-20 text-center text-slate-400 font-medium italic">No salary records found.</td>
                                    </tr>
                                ) : (
                                    salaries.map(sal => (
                                        <tr key={sal.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                                            <td className="px-8 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center font-bold text-xs">
                                                        {sal.employee_name[0]}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-900 dark:text-white uppercase text-xs">{sal.employee_name}</p>
                                                        <p className="text-[10px] text-slate-500 font-mono tracking-tighter">{sal.employee_id}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-4 font-bold text-slate-700 dark:text-slate-300 text-sm italic">{sal.month}</td>
                                            <td className="px-8 py-4">
                                                <p className="font-black text-slate-900 dark:text-white">LKR {sal.amount.toLocaleString()}</p>
                                            </td>
                                            <td className="px-8 py-4 text-xs font-bold text-slate-500 uppercase">{sal.payment_date}</td>
                                            <td className="px-8 py-4">
                                                <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded text-[10px] font-bold uppercase tracking-tighter">
                                                    {sal.pay_period}
                                                </span>
                                            </td>
                                            <td className="px-8 py-4">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${sal.type === 'Full Salary' ? 'bg-emerald-500/10 text-emerald-600' :
                                                    sal.type === 'Advance' ? 'bg-blue-500/10 text-blue-600' : 'bg-amber-500/10 text-amber-600'
                                                    }`}>
                                                    {sal.type}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'cheques' && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                                <tr>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Cheque Number</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Amount</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Due Date</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Purpose</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Status</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Proof</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {cheques.map(chq => (
                                    <tr key={chq.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                                        <td className="px-8 py-4 font-mono font-black text-blue-600 dark:text-blue-400">{chq.cheque_number}</td>
                                        <td className="px-8 py-4 font-black text-slate-900 dark:text-white">LKR {chq.amount.toLocaleString()}</td>
                                        <td className="px-8 py-4 text-xs font-bold text-slate-500 uppercase">{chq.due_date}</td>
                                        <td className="px-8 py-4 text-sm font-medium text-slate-600 dark:text-slate-400">{chq.given_to}</td>
                                        <td className="px-8 py-4">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${chq.status === 'Paid' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'}`}>
                                                {chq.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-4 text-right">
                                            {chq.proof_path && (
                                                <a href={`http://localhost:3001${chq.proof_path}`} target="_blank" className="text-blue-600 dark:text-blue-400 hover:scale-110 transition-transform inline-block">
                                                    <ImageIcon size={20} />
                                                </a>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'utilities' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {utilities.map(util => (
                        <div key={util.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-3xl shadow-sm hover:shadow-xl hover:shadow-blue-500/5 transition-all group">
                            <div className="flex justify-between items-start mb-6">
                                <div className={`p-4 rounded-2xl ${util.status === 'Paid' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-blue-600/10 text-blue-600'}`}>
                                    <Receipt size={24} />
                                </div>
                                <span className={`text-[10px] font-black uppercase tracking-widest ${util.status === 'Paid' ? 'text-emerald-500' : 'text-amber-500'}`}>{util.status}</span>
                            </div>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-1 uppercase h-[2em] line-clamp-2">{util.type}</h3>
                            <p className="text-3xl font-black mb-8 text-blue-600 dark:text-blue-400">LKR {util.amount.toLocaleString()}</p>
                            <div className="flex items-center gap-2 text-slate-400 font-bold text-xs uppercase mb-8 tracking-widest">
                                <Calendar size={14} />
                                Due: {util.due_date}
                            </div>
                            <button
                                onClick={() => handlePayUtility(util.id)}
                                disabled={util.status === 'Paid'}
                                className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all ${util.status === 'Paid' ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-600/20 active:scale-95'}`}
                            >
                                {util.status === 'Paid' ? 'Completed' : 'Mark as Paid'}
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {showAddModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl">
                        <div className="p-8 bg-blue-600 text-white flex justify-between items-center">
                            <div>
                                <h3 className="text-2xl font-bold tracking-tight">Record {activeTab === 'salaries' ? 'Salary' : activeTab === 'cheques' ? 'Cheque' : 'Expense'}</h3>
                                <p className="text-blue-100 text-xs font-bold uppercase tracking-widest mt-1">Financial Entry</p>
                            </div>
                            <button onClick={() => setShowAddModal(false)} className="bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors"><X size={24} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-8 space-y-5">
                            {activeTab === 'salaries' && (
                                <>
                                    <div>
                                        <label className="label-standard">Select Employee</label>
                                        <select
                                            className="input-standard appearance-none cursor-pointer"
                                            onChange={e => setFormData({ ...formData, employee_id: e.target.value })}
                                            value={formData.employee_id}
                                            required
                                        >
                                            <option value="">Choose worker...</option>
                                            {employees.map(emp => (
                                                <option key={emp.id} value={emp.id}>{emp.name} ({emp.id})</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="label-standard">Amount (LKR)</label>
                                            <input type="number" placeholder="0.00" className="input-standard" onChange={e => setFormData({ ...formData, amount: e.target.value })} required />
                                        </div>
                                        <div>
                                            <label className="label-standard">Payment Month</label>
                                            <input type="text" placeholder="e.g. Oct 2026" className="input-standard" onChange={e => setFormData({ ...formData, month: e.target.value })} required />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="label-standard">Payment Period</label>
                                            <select className="input-standard appearance-none cursor-pointer" onChange={e => setFormData({ ...formData, pay_period: e.target.value })} value={formData.pay_period}>
                                                <option>Daily</option>
                                                <option>Weekly</option>
                                                <option>Monthly</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="label-standard">Type</label>
                                            <select className="input-standard appearance-none cursor-pointer" onChange={e => setFormData({ ...formData, salary_type: e.target.value })}>
                                                <option>Full Salary</option>
                                                <option>Advance</option>
                                                <option>Bonus</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="label-standard">Notes (Optional)</label>
                                        <input type="text" placeholder="Additional details..." className="input-standard" onChange={e => setFormData({ ...formData, notes: e.target.value })} />
                                    </div>
                                </>
                            )}

                            {activeTab === 'cheques' && (
                                <>
                                    <div>
                                        <label className="label-standard">Cheque Number</label>
                                        <input type="text" placeholder="CHQ-0000" className="input-standard" onChange={e => setFormData({ ...formData, cheque_number: e.target.value })} required />
                                    </div>
                                    <div>
                                        <label className="label-standard">Amount (LKR)</label>
                                        <input type="number" placeholder="0.00" className="input-standard" onChange={e => setFormData({ ...formData, amount: e.target.value })} required />
                                    </div>
                                    <div>
                                        <label className="label-standard">Due Date</label>
                                        <input type="date" className="input-standard" onChange={e => setFormData({ ...formData, due_date: e.target.value })} required />
                                    </div>
                                    <div>
                                        <label className="label-standard">Receiver / Purpose</label>
                                        <input type="text" placeholder="Vendor name..." className="input-standard" onChange={e => setFormData({ ...formData, given_to: e.target.value })} />
                                    </div>
                                    <div className="border-4 border-dashed border-slate-100 dark:border-slate-800 p-8 rounded-3xl text-center hover:border-blue-600 transition-colors group">
                                        <input type="file" id="file" className="hidden" onChange={e => setFile(e.target.files[0])} />
                                        <label htmlFor="file" className="cursor-pointer flex flex-col items-center gap-3">
                                            <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                <Upload size={24} className="text-slate-400" />
                                            </div>
                                            <span className="text-xs font-black uppercase tracking-widest text-slate-500">{file ? file.name : 'Click to Upload Proof'}</span>
                                        </label>
                                    </div>
                                </>
                            )}

                            {activeTab === 'utilities' && (
                                <>
                                    <div>
                                        <label className="label-standard">Category</label>
                                        <select className="input-standard appearance-none cursor-pointer" onChange={e => setFormData({ ...formData, type: e.target.value })}>
                                            <option>Electricity</option>
                                            <option>Water</option>
                                            <option>EPF</option>
                                            <option>Other</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="label-standard">Amount (LKR)</label>
                                        <input type="number" placeholder="0.00" className="input-standard" onChange={e => setFormData({ ...formData, amount: e.target.value })} required />
                                    </div>
                                    <div>
                                        <label className="label-standard">Due Date</label>
                                        <input type="date" className="input-standard" onChange={e => setFormData({ ...formData, due_date: e.target.value })} required />
                                    </div>
                                </>
                            )}
                            <div className="pt-6">
                                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 py-5 rounded-2xl font-black uppercase tracking-widest text-xs text-white shadow-xl shadow-blue-600/30 active:scale-[0.98] transition-all">Save Financial Entry</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Finance;
