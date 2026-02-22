import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
    Plus,
    Search,
    MoreVertical,
    Edit,
    Trash2,
    Filter,
    Download,
    Users,
    X,
    ChevronLeft,
    ChevronRight,
    MapPin,
    Phone,
    Calendar,
    Briefcase,
    Activity,
    CheckCircle2,
    Clock,
    Printer
} from 'lucide-react';

const Employees = () => {
    const [employees, setEmployees] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);
    const [viewingDetails, setViewingDetails] = useState(null);
    const [assignments, setAssignments] = useState([]);

    const [formData, setFormData] = useState({
        name: '',
        age: '',
        contact: '',
        address: '',
        category: 'Stitching Master'
    });
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

    const fetchEmployees = async () => {
        try {
            const res = await axios.get('http://localhost:3001/api/employees');
            setEmployees(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployeeAssignments = async (id) => {
        try {
            const res = await axios.get(`http://localhost:3001/api/employees/${id}/assignments`);
            setAssignments(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleViewDetails = (emp) => {
        setViewingDetails(emp);
        fetchEmployeeAssignments(emp.id);
    };

    const filteredEmployees = employees.filter(emp => {
        const matchesSearch = emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            emp.id.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || emp.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await axios.patch(`http://localhost:3001/api/employees/${editId}`, formData);
                toast.success('Employee updated successfully!');
            } else {
                const id = 'EMP' + Date.now().toString().slice(-3);
                await axios.post('http://localhost:3001/api/employees', { ...formData, id });
                toast.success('Employee added successfully!');
            }
            setShowAddModal(false);
            setIsEditing(false);
            setEditId(null);
            fetchEmployees();
            if (viewingDetails && viewingDetails.id === editId) {
                setViewingDetails({ ...viewingDetails, ...formData });
            }
            setFormData({ name: '', age: '', contact: '', address: '', category: 'Stitching Master' });
        } catch (err) {
            toast.error(err.response?.data?.error || `Error ${isEditing ? 'updating' : 'adding'} employee`);
        }
    };

    const handleEdit = (emp, e) => {
        if (e) e.stopPropagation();
        setFormData({
            name: emp.name || '',
            age: emp.age || '',
            contact: emp.contact || '',
            address: emp.address || '',
            category: emp.category || 'Stitching Master'
        });
        setEditId(emp.id);
        setIsEditing(true);
        setShowAddModal(true);
    };

    const handleDelete = async (id, e) => {
        if (e) e.stopPropagation();
        if (!window.confirm("Are you sure you want to delete this employee?")) return;
        try {
            await axios.delete(`http://localhost:3001/api/employees/${id}`);
            toast.success('Employee deleted successfully!');
            if (viewingDetails?.id === id) setViewingDetails(null);
            fetchEmployees();
        } catch (err) {
            toast.error(err.response?.data?.error || "Error deleting employee");
        }
    };

    const closeModal = () => {
        setShowAddModal(false);
        setIsEditing(false);
        setEditId(null);
        setFormData({ name: '', age: '', contact: '', address: '', category: 'Stitching Master' });
    };

    return (
        <div className="w-full">
            {viewingDetails ? (
                <div className="p-8 space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                    <button onClick={() => setViewingDetails(null)} className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors no-print">
                        <ChevronLeft size={20} /> Back to Workforce
                    </button>

                    <div className="flex justify-between items-end bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <div className="flex items-center gap-8">
                            <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white flex items-center justify-center font-black text-5xl shadow-2xl shadow-blue-500/30">
                                {viewingDetails.name[0]}
                            </div>
                            <div className="space-y-2">
                                <span className="px-3 py-1 bg-blue-600/10 text-blue-600 text-[10px] font-black uppercase tracking-[0.2em] rounded-full">{viewingDetails.category}</span>
                                <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">{viewingDetails.name}</h1>
                                <div className="flex items-center gap-4 text-slate-500 font-medium">
                                    <span className="flex items-center gap-1 font-mono text-xs">{viewingDetails.id}</span>
                                    <span>•</span>
                                    <span className="flex items-center gap-1"><Users size={14} /> {viewingDetails.age || 'N/A'} Years Old</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-3 no-print">
                            <button onClick={(e) => handleEdit(viewingDetails, e)} className="btn-secondary">
                                <Edit size={18} /> Edit Profile
                            </button>
                            <button onClick={(e) => handleDelete(viewingDetails.id, e)} className="p-3 bg-rose-600/10 text-rose-600 rounded-2xl hover:bg-rose-600 hover:text-white transition-all active:scale-95">
                                <Trash2 size={20} />
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Stats Dashboard */}
                        <div className="space-y-6">
                            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm">
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Experience & Contact</h3>
                                <div className="space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-blue-50 dark:bg-blue-500/10 text-blue-600 rounded-2xl flex items-center justify-center">
                                            <Phone size={20} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase">Mobile Number</p>
                                            <p className="font-bold text-slate-900 dark:text-white">{viewingDetails.contact}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                                            <MapPin size={20} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase">Home Address</p>
                                            <p className="font-bold text-slate-900 dark:text-white text-sm line-clamp-2">{viewingDetails.address || 'Not Registered'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center">
                                            <Calendar size={20} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase">Registered Date</p>
                                            <p className="font-bold text-slate-900 dark:text-white text-sm">{new Date(viewingDetails.created_at).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 text-white shadow-xl">
                                <Activity className="text-blue-500 mb-4" size={32} />
                                <h3 className="text-xl font-black mb-2 uppercase tracking-tighter">Work Intensity</h3>
                                <p className="text-slate-400 text-sm mb-6 leading-relaxed">Current workload based on active assignments in the tailoring pipeline.</p>
                                <div className="flex items-end gap-2">
                                    <span className="text-5xl font-black">{assignments.filter(a => a.status !== 'Delivered' && a.status !== 'Finished').length}</span>
                                    <span className="text-slate-400 font-bold mb-2 uppercase text-xs">Active Tasks</span>
                                </div>
                            </div>
                        </div>

                        {/* Recent Work / Assignments */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm">
                                <div className="flex justify-between items-center mb-8">
                                    <div className="flex items-center gap-3">
                                        <Briefcase className="text-blue-600" size={24} />
                                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Active & Past Assignments</h3>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    {assignments.length === 0 ? (
                                        <div className="py-16 text-center bg-slate-50 dark:bg-slate-800/50 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                                            <p className="text-slate-500 font-bold">No assignments recorded for this employee.</p>
                                        </div>
                                    ) : (
                                        assignments.map(assign => (
                                            <div key={assign.id} className="group p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-blue-500/40 rounded-3xl transition-all hover:bg-slate-50 active:scale-[0.99] flex justify-between items-center">
                                                <div className="flex items-center gap-6">
                                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${assign.status === 'Finished' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                                                        {assign.status === 'Finished' ? <CheckCircle2 size={24} /> : <Clock size={24} />}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-tight text-lg">{assign.customer_name}</h4>
                                                        <div className="flex items-center gap-3 text-xs text-slate-400 font-bold">
                                                            <span>{assign.category}</span>
                                                            <span>•</span>
                                                            <span className="text-blue-600 uppercase tracking-widest">{assign.order_id}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className={`text-[10px] font-black uppercase px-3 py-1 rounded-full inline-block mb-1 ${assign.status === 'Finished' ? 'bg-emerald-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600'}`}>
                                                        {assign.status}
                                                    </p>
                                                    <p className="text-xs text-slate-400 font-medium">Delivery: {assign.delivery_date}</p>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="page-container">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                        <div>
                            <h1 className="page-header-h1">Workforce</h1>
                            <p className="text-slate-500 dark:text-slate-400 font-medium tracking-tight">Manage your tailoring team and production staff.</p>
                        </div>
                        <div className="flex gap-3 items-center">
                            <button
                                onClick={() => window.print()}
                                className="btn-secondary no-print"
                            >
                                <Printer size={18} /> Print List
                            </button>
                            <button
                                onClick={() => { setShowAddModal(true); setIsEditing(false); }}
                                className="btn-primary no-print"
                            >
                                <Plus size={18} /> Add Employee
                            </button>
                        </div>
                    </div>

                    {/* Print Only Content */}
                    <div className="print-only">
                        <div className="print-header">
                            <h1 className="text-2xl font-bold text-center">Rajani Tailors - Employee List</h1>
                            <p className="text-center">Date: {new Date().toLocaleDateString()}</p>
                        </div>
                        <table className="w-full border-collapse border border-slate-300 mt-8">
                            <thead>
                                <tr className="bg-slate-100">
                                    <th className="border p-2">Employee ID</th>
                                    <th className="border p-2">Name</th>
                                    <th className="border p-2">Category</th>
                                    <th className="border p-2">Contact</th>
                                    <th className="border p-2">Age</th>
                                    <th className="border p-2">Address</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredEmployees.map(emp => (
                                    <tr key={emp.id}>
                                        <td className="border p-2 font-mono">{emp.id}</td>
                                        <td className="border p-2 font-bold">{emp.name}</td>
                                        <td className="border p-2">{emp.category}</td>
                                        <td className="border p-2">{emp.contact}</td>
                                        <td className="border p-2">{emp.age || 'N/A'}</td>
                                        <td className="border p-2">{emp.address || 'N/A'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-6 mb-8 no-print">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search workforce..."
                                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-4 pl-14 pr-4 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all text-slate-900 dark:text-white shadow-sm"
                            />
                        </div>
                        <div className="flex bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-1.5 shadow-sm">
                            {['All', 'Cutting Master', 'Stitching Master'].map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${selectedCategory === cat ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/30' : 'text-slate-500 hover:text-blue-600'}`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 no-print">
                        {filteredEmployees.map((emp) => (
                            <div
                                key={emp.id}
                                onClick={() => handleViewDetails(emp)}
                                className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1 transition-all cursor-pointer group shadow-sm border-b-4 border-b-transparent hover:border-b-blue-600"
                            >
                                <div className="flex flex-col items-center text-center">
                                    <div className="w-24 h-24 rounded-[2rem] bg-slate-50 dark:bg-slate-800 text-blue-600 flex items-center justify-center font-black text-3xl mb-6 shadow-inner ring-4 ring-white dark:ring-slate-900 transition-transform group-hover:rotate-6">
                                        {emp.name[0]}
                                    </div>
                                    <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-3">{emp.category}</span>
                                    <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-1 group-hover:text-blue-600 transition-colors uppercase tracking-tight text-ellipsis overflow-hidden w-full px-2">{emp.name}</h3>
                                    <p className="font-mono text-xs text-slate-400 mb-6 font-bold">{emp.id}</p>

                                    <div className="w-full space-y-3 mb-8 pt-6 border-t border-slate-50 dark:border-slate-800">
                                        <div className="flex items-center gap-3 text-sm text-slate-500 font-bold">
                                            <Phone size={14} className="text-blue-600" /> {emp.contact}
                                        </div>
                                    </div>

                                    <div className="w-full flex justify-center gap-4">
                                        <button onClick={(e) => handleEdit(emp, e)} className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all">
                                            <Edit size={18} />
                                        </button>
                                        <button onClick={(e) => handleDelete(emp.id, e)} className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {employees.length === 0 && (
                        <div className="p-24 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-[3rem] border-4 border-dashed border-slate-50 dark:border-slate-800">
                            <Users size={64} className="mx-auto mb-6 opacity-10" />
                            <p className="text-xl font-black uppercase tracking-widest">No workforce registered</p>
                            <p className="text-sm">Click "Add Employee" to build your team.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Add/Edit Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[100] flex items-center justify-center p-4 transition-all animate-in fade-in">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden">
                        <div className="p-8 bg-blue-600 text-white">
                            <h3 className="text-2xl font-black tracking-tight">{isEditing ? 'UPDATE WORKER' : 'NEW EMPLOYEE'}</h3>
                            <p className="text-blue-100 font-bold mt-1 uppercase text-[10px] tracking-widest">Employee Profile Management</p>
                        </div>
                        <form onSubmit={handleSubmit} className="p-8 space-y-5">
                            <div>
                                <label className="label-standard">Full Identity Name</label>
                                <input
                                    required
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="input-standard text-base"
                                    placeholder="Enter employee name..."
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="label-standard">Age</label>
                                    <input
                                        type="number"
                                        value={formData.age}
                                        onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                                        className="input-standard text-base"
                                    />
                                </div>
                                <div>
                                    <label className="label-standard">Work Group</label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="input-standard text-base appearance-none cursor-pointer"
                                    >
                                        <option>Cutting Master</option>
                                        <option>Stitching Master</option>
                                        <option>Helper</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="label-standard">Active Contact</label>
                                <input
                                    required
                                    type="text"
                                    value={formData.contact}
                                    onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                                    className="input-standard text-base"
                                    placeholder="07X XXX XXXX"
                                />
                            </div>
                            <div>
                                <label className="label-standard">Current Address</label>
                                <textarea
                                    rows={2}
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    className="input-standard font-medium text-base h-20"
                                />
                            </div>
                            <div className="pt-6 flex gap-4">
                                <button type="button" onClick={closeModal} className="flex-1 bg-slate-100 dark:bg-slate-800 py-4 rounded-2xl font-bold text-slate-500 active:scale-95 transition-all uppercase tracking-widest text-[10px]">Cancel</button>
                                <button type="submit" className="flex-1 bg-blue-600 py-4 rounded-2xl font-black text-white shadow-xl shadow-blue-500/30 active:scale-95 transition-all uppercase tracking-[0.2em] text-[10px]">
                                    {isEditing ? 'Save Changes' : 'Register Worker'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Employees;
