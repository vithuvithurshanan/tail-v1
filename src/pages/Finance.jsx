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
    Upload
} from 'lucide-react';

const Finance = () => {
    const [activeTab, setActiveTab] = useState('cheques');
    const [cheques, setCheques] = useState([]);
    const [utilities, setUtilities] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [file, setFile] = useState(null);

    const [formData, setFormData] = useState({
        cheque_number: '',
        amount: '',
        due_date: '',
        given_to: '',
        type: 'Electricity' // for utilities
    });

    const fetchData = async () => {
        try {
            const [chqRes, utlRes] = await Promise.all([
                axios.get('http://localhost:3001/api/finance/cheques'),
                axios.get('http://localhost:3001/api/finance/utilities')
            ]);
            setCheques(chqRes.data);
            setUtilities(utlRes.data);
        } catch (err) {
            console.error(err);
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
            } else {
                await axios.post('http://localhost:3001/api/finance/utilities', formData);
            }
            toast.success(`${activeTab === 'cheques' ? 'Cheque' : 'Bill'} recorded successfully!`);
            setShowAddModal(false);
            fetchData();
            setFormData({ cheque_number: '', amount: '', due_date: '', given_to: '', type: 'Electricity' });
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
        <div className="p-6 md:p-10 lg:p-12 w-full space-y-6 transition-all duration-300">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">Finance & Bills</h1>
                    <p className="text-slate-500 dark:text-slate-400">Manage cheques, utility payments, and expenses.</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-transform active:scale-95 shadow-lg shadow-blue-500/20"
                >
                    <Plus size={20} /> Record Entry
                </button>
            </div>

            <div className="flex border-b border-slate-200 dark:border-slate-800">
                <button
                    onClick={() => setActiveTab('cheques')}
                    className={`px-6 py-3 font-medium transition-colors border-b-2 ${activeTab === 'cheques' ? 'border-blue-600 dark:border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-slate-500 dark:text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'}`}
                >
                    Cheque Management
                </button>
                <button
                    onClick={() => setActiveTab('utilities')}
                    className={`px-6 py-3 font-medium transition-colors border-b-2 ${activeTab === 'utilities' ? 'border-blue-600 dark:border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-slate-500 dark:text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'}`}
                >
                    Utility & Expenses
                </button>
            </div>

            {activeTab === 'cheques' ? (
                <div className="space-y-6">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm dark:shadow-none">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left min-w-[800px]">
                                <thead className="bg-slate-50 dark:bg-slate-800/30 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold uppercase text-slate-400 dark:text-slate-500">
                                    <tr>
                                        <th className="px-6 py-4">Cheque Number</th>
                                        <th className="px-6 py-4">Amount</th>
                                        <th className="px-6 py-4">Due Date</th>
                                        <th className="px-6 py-4">Purpose</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 text-right">Proof</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-sm">
                                    {cheques.map(chq => (
                                        <tr key={chq.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 group transition-colors">
                                            <td className="px-6 py-4 font-mono text-blue-600 dark:text-blue-400">{chq.cheque_number}</td>
                                            <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">LKR {chq.amount.toLocaleString()}</td>
                                            <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{chq.due_date}</td>
                                            <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{chq.given_to}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${chq.status === 'Paid' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'}`}>
                                                    {chq.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {chq.proof_path && (
                                                    <a href={`http://localhost:3001${chq.proof_path}`} target="_blank" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors inline-block">
                                                        <ImageIcon size={18} />
                                                    </a>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {utilities.map(util => (
                        <div key={util.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm dark:shadow-none hover:border-blue-500/50 transition-all">
                            <div className="flex justify-between mb-4">
                                <Receipt size={24} className="text-blue-600 dark:text-blue-400" />
                                <span className="text-xs uppercase font-bold text-slate-400">{util.status}</span>
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{util.type}</h3>
                            <p className="text-2xl font-black mb-4 text-slate-900 dark:text-white">LKR {util.amount.toLocaleString()}</p>
                            <p className="text-sm text-slate-500 dark:text-slate-500 mb-6 font-mono">Due: {util.due_date}</p>
                            <button
                                onClick={() => handlePayUtility(util.id)}
                                disabled={util.status === 'Paid'}
                                className={`w-full py-2.5 rounded-xl font-bold transition-all ${util.status === 'Paid' ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20'}`}
                            >
                                {util.status === 'Paid' ? 'Bill Paid' : 'Mark as Paid'}
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {showAddModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 transition-all animate-in fade-in">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl">
                        <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                            <h3 className="font-bold text-slate-900 dark:text-white">Add {activeTab === 'cheques' ? 'Cheque' : 'Utility Bill'}</h3>
                            <button onClick={() => setShowAddModal(false)} className="text-slate-500 dark:text-slate-400 hover:text-rose-600 transition-colors"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {activeTab === 'cheques' ? (
                                <>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Cheque Number</label>
                                        <input type="text" placeholder="CHQ-0000" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white transition-all shadow-sm" onChange={e => setFormData({ ...formData, cheque_number: e.target.value })} required />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Amount (LKR)</label>
                                        <input type="number" placeholder="0.00" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white transition-all shadow-sm" onChange={e => setFormData({ ...formData, amount: e.target.value })} required />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Due Date</label>
                                        <input type="date" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white transition-all shadow-sm" onChange={e => setFormData({ ...formData, due_date: e.target.value })} required />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Receiver / Purpose</label>
                                        <input type="text" placeholder="Vendor name..." className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white transition-all shadow-sm" onChange={e => setFormData({ ...formData, given_to: e.target.value })} />
                                    </div>
                                    <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 p-6 rounded-2xl text-center hover:border-blue-500 transition-colors">
                                        <input type="file" id="file" className="hidden" onChange={e => setFile(e.target.files[0])} />
                                        <label htmlFor="file" className="cursor-pointer flex flex-col items-center gap-2">
                                            <Upload size={32} className="text-slate-400" />
                                            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{file ? file.name : 'Upload Proof (Image/PDF)'}</span>
                                        </label>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Category</label>
                                        <select className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white transition-all shadow-sm" onChange={e => setFormData({ ...formData, type: e.target.value })}>
                                            <option>Electricity</option>
                                            <option>Water</option>
                                            <option>EPF</option>
                                            <option>Other</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Amount (LKR)</label>
                                        <input type="number" placeholder="0.00" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white transition-all shadow-sm" onChange={e => setFormData({ ...formData, amount: e.target.value })} required />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Due Date</label>
                                        <input type="date" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white transition-all shadow-sm" onChange={e => setFormData({ ...formData, due_date: e.target.value })} required />
                                    </div>
                                </>
                            )}
                            <div className="pt-4">
                                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-xl font-bold text-white transition-all shadow-lg shadow-blue-500/20">Save Entry</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Finance;
