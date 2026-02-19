import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
    Plus,
    Search,
    UserCircle,
    Phone,
    MapPin,
    Ruler,
    ChevronRight,
    MoreVertical,
    X,
    Edit,
    Trash2,
    History,
    ChevronLeft,
    Clock,
    ShoppingBag,
    CheckCircle2,
    Printer
} from 'lucide-react';

const Customers = () => {
    const [customers, setCustomers] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showMeasurementModal, setShowMeasurementModal] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);
    const [viewingDetails, setViewingDetails] = useState(null); // The customer object being viewed
    const [customerOrders, setCustomerOrders] = useState([]);
    const [customerMeasurements, setCustomerMeasurements] = useState([]);

    const [formData, setFormData] = useState({
        name: '',
        contact: '',
        address: ''
    });

    const [measurementData, setMeasurementData] = useState({
        category: 'Shirt',
        values: {}
    });

    const MEASUREMENT_CONFIG = {
        'Shirt': ['Length', 'Chest', 'Waist', 'Hips', 'Shoulder', 'Sleeves', 'Neck'],
        'Pant': ['Length', 'Waist', 'Hips', 'Inseam', 'Thigh', 'Knee', 'Bottom'],
        'Frock': ['Length', 'Chest', 'Waist', 'Shoulder', 'Sleeves', 'Flare'],
        'Blouse': ['Length', 'Chest', 'Waist', 'Shoulder', 'Sleeves', 'Front Neck', 'Back Neck'],
        'Other': ['Length', 'Width', 'Notes']
    };

    const [searchQuery, setSearchQuery] = useState('');

    const fetchCustomers = async () => {
        try {
            const res = await axios.get('http://localhost:3001/api/customers');
            setCustomers(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomerHistory = async (id) => {
        try {
            const [ordersRes, measureRes] = await Promise.all([
                axios.get(`http://localhost:3001/api/customers/${id}/orders`),
                axios.get(`http://localhost:3001/api/customers/${id}/measurements`)
            ]);
            setCustomerOrders(ordersRes.data);
            setCustomerMeasurements(measureRes.data);
        } catch (err) {
            console.error("Error fetching history:", err);
            toast.error("Failed to load customer history");
        }
    };

    const handleViewDetails = (cus) => {
        setViewingDetails(cus);
        fetchCustomerHistory(cus.id);
    };

    const filteredCustomers = customers.filter(cus =>
        cus.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cus.contact.includes(searchQuery) ||
        cus.id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await axios.patch(`http://localhost:3001/api/customers/${editId}`, formData);
                toast.success('Customer updated successfully!');
            } else {
                const id = 'CUS' + Date.now().toString().slice(-4);
                await axios.post('http://localhost:3001/api/customers', { ...formData, id });
                toast.success('Customer profile created!');
            }
            setShowAddModal(false);
            setIsEditing(false);
            setEditId(null);
            fetchCustomers();
            if (viewingDetails && viewingDetails.id === editId) {
                setViewingDetails({ ...viewingDetails, ...formData });
            }
            setFormData({ name: '', contact: '', address: '' });
        } catch (err) {
            toast.error(err.response?.data?.error || `Error ${isEditing ? 'updating' : 'creating'} customer`);
        }
    };

    const handleEdit = (cus) => {
        setFormData({
            name: cus.name,
            contact: cus.contact,
            address: cus.address || ''
        });
        setEditId(cus.id);
        setIsEditing(true);
        setShowAddModal(true);
    };

    const closeModal = () => {
        setShowAddModal(false);
        setIsEditing(false);
        setEditId(null);
        setFormData({ name: '', contact: '', address: '' });
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this customer?")) return;
        try {
            await axios.delete(`http://localhost:3001/api/customers/${id}`);
            toast.success('Customer deleted successfully!');
            if (viewingDetails?.id === id) setViewingDetails(null);
            fetchCustomers();
        } catch (err) {
            toast.error(err.response?.data?.error || "Error deleting customer");
        }
    };

    const handleMeasurementSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:3001/api/measurements', {
                customer_id: selectedCustomer.id,
                category: measurementData.category,
                values_json: measurementData.values
            });
            toast.success(`Measurements saved for ${selectedCustomer.name}`);
            setShowMeasurementModal(false);
            if (viewingDetails?.id === selectedCustomer.id) {
                fetchCustomerHistory(selectedCustomer.id);
            }
        } catch (err) {
            toast.error(err.response?.data?.error || "Error saving measurements");
        }
    };

    const openMeasurementModal = (cus, e) => {
        if (e) e.stopPropagation();
        setSelectedCustomer(cus);
        setShowMeasurementModal(true);
    };

    return (
        <div className="w-full">
            {viewingDetails ? (
                <div className="p-8 space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                    <button onClick={() => setViewingDetails(null)} className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors">
                        <ChevronLeft size={20} /> Back to Customers
                    </button>

                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-6">
                            <div className="w-20 h-20 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-3xl shadow-lg shadow-blue-500/20">
                                {viewingDetails.name[0]}
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">{viewingDetails.name}</h1>
                                <p className="text-blue-600 dark:text-blue-400 font-mono text-sm font-bold mt-1">{viewingDetails.id}</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => handleEdit(viewingDetails)} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
                                <Edit size={20} />
                            </button>
                            <button onClick={() => openMeasurementModal(viewingDetails)} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-bold shadow-lg shadow-blue-500/20 active:scale-95 transition-all">
                                <Ruler size={18} /> Add Measurements
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Contact & Bio */}
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm h-fit">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Contact Information</h3>
                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-blue-600">
                                        <Phone size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 font-bold uppercase mb-1">Phone Number</p>
                                        <p className="text-lg font-bold text-slate-900 dark:text-white">{viewingDetails.contact}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-blue-600">
                                        <MapPin size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 font-bold uppercase mb-1">Residential Address</p>
                                        <p className="text-slate-900 dark:text-white font-medium">{viewingDetails.address || 'No address provided'}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-blue-600">
                                        <Clock size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 font-bold uppercase mb-1">Joined Date</p>
                                        <p className="text-slate-900 dark:text-white font-medium">{new Date(viewingDetails.created_at).toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Order History */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm">
                                <div className="flex justify-between items-center mb-8">
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Order History</h3>
                                    <span className="bg-blue-600/10 text-blue-600 px-3 py-1 rounded-full text-xs font-bold">{customerOrders.length} Orders</span>
                                </div>
                                <div className="space-y-4">
                                    {customerOrders.length === 0 ? (
                                        <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                                            <ShoppingBag className="mx-auto text-slate-300 mb-2" size={40} />
                                            <p className="text-slate-500 font-medium">No orders found for this customer.</p>
                                        </div>
                                    ) : (
                                        customerOrders.map(order => (
                                            <div key={order.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-blue-500/30 transition-all cursor-pointer">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-full bg-blue-600/10 text-blue-600 flex items-center justify-center">
                                                        <ShoppingBag size={18} />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-900 dark:text-white">{order.category} - <span className="font-mono text-blue-600 text-xs">{order.id}</span></p>
                                                        <p className="text-xs text-slate-500">Delivery: {order.delivery_date}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-6">
                                                    <div className="text-right">
                                                        <p className="font-bold text-slate-900 dark:text-white">LKR {order.total_amount.toLocaleString()}</p>
                                                        <p className="text-[10px] text-slate-400 font-bold uppercase">{order.status}</p>
                                                    </div>
                                                    <ChevronRight size={16} className="text-slate-300" />
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Saved Measurements */}
                            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-8">Standard Measurements</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {customerMeasurements.length === 0 ? (
                                        <div className="col-span-2 text-center py-8 text-slate-400 italic">No historical measurements saved yet.</div>
                                    ) : (
                                        customerMeasurements.map(m => (
                                            <div key={m.id} className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-800">
                                                <div className="flex items-center gap-2 mb-4 text-blue-600">
                                                    <Ruler size={16} />
                                                    <p className="font-black text-xs uppercase tracking-widest">{m.category}</p>
                                                </div>
                                                <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                                                    {Object.entries(JSON.parse(m.values_json)).map(([k, v]) => (
                                                        <div key={k} className="flex justify-between items-center border-b border-slate-100 dark:border-slate-700 pb-1">
                                                            <span className="text-[10px] text-slate-400 font-bold uppercase">{k}</span>
                                                            <span className="text-sm font-mono font-bold text-slate-700 dark:text-slate-200">{v}″</span>
                                                        </div>
                                                    ))}
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
                <div className="p-6 md:p-10 lg:p-12 w-full space-y-6 transition-all duration-300 animate-in fade-in">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">Customers</h1>
                            <p className="text-slate-500 dark:text-slate-400">Manage customer profiles and historical records.</p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => window.print()}
                                className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 px-4 py-2 rounded-lg flex items-center gap-2 transition-all font-bold no-print"
                            >
                                <Printer size={20} /> Print List
                            </button>
                            <button
                                onClick={() => { setShowAddModal(true); setIsEditing(false); }}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-transform active:scale-95 shadow-lg shadow-blue-500/20 font-bold no-print"
                            >
                                <Plus size={20} /> New Customer
                            </button>
                        </div>
                    </div>

                    {/* Print Only Content */}
                    <div className="print-only">
                        <div className="print-header">
                            <h1 className="text-2xl font-bold">Rajani Tailors - Customer List</h1>
                            <p>Date: {new Date().toLocaleDateString()}</p>
                        </div>
                        <table className="w-full border-collapse border border-slate-300">
                            <thead>
                                <tr className="bg-slate-100">
                                    <th className="border p-2">Customer ID</th>
                                    <th className="border p-2">Name</th>
                                    <th className="border p-2">Contact</th>
                                    <th className="border p-2">Address</th>
                                    <th className="border p-2">Joined Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredCustomers.map(cus => (
                                    <tr key={cus.id}>
                                        <td className="border p-2 font-mono">{cus.id}</td>
                                        <td className="border p-2 font-bold">{cus.name}</td>
                                        <td className="border p-2">{cus.contact}</td>
                                        <td className="border p-2">{cus.address || 'N/A'}</td>
                                        <td className="border p-2">{new Date(cus.created_at).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="relative mb-8 print:hidden">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by name, contact or ID..."
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-4 pl-14 pr-4 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-slate-900 dark:text-white shadow-sm"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 print:hidden">
                        {filteredCustomers.map((cus) => (
                            <div
                                key={cus.id}
                                onClick={() => handleViewDetails(cus)}
                                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 hover:shadow-xl hover:shadow-blue-500/5 hover:-translate-y-1 transition-all cursor-pointer group shadow-sm"
                            >
                                <div className="flex justify-between items-start mb-6">
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-black text-xl shadow-lg ring-4 ring-white dark:ring-slate-900 transition-transform group-hover:scale-110">
                                        {cus.name[0]}
                                    </div>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={(e) => { e.stopPropagation(); handleEdit(cus); }} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-400 hover:text-blue-600 transition-colors">
                                            <Edit size={16} />
                                        </button>
                                        <button onClick={(e) => { e.stopPropagation(); handleDelete(cus.id); }} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-400 hover:text-rose-600 transition-colors">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>

                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1 group-hover:text-blue-600 transition-colors">{cus.name}</h3>
                                <p className="text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-widest mb-4 opacity-70">{cus.id}</p>

                                <div className="space-y-3 text-sm text-slate-500 dark:text-slate-400 mb-8">
                                    <div className="flex items-center gap-3">
                                        <div className="w-6 h-6 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center"><Phone size={12} /></div>
                                        <span className="font-bold">{cus.contact}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-6 h-6 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center"><MapPin size={12} /></div>
                                        <span className="truncate">{cus.address || 'No address'}</span>
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                                    <button
                                        onClick={(e) => openMeasurementModal(cus, e)}
                                        className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all text-slate-600 dark:text-slate-200 active:scale-95"
                                    >
                                        <Ruler size={14} /> Measurements
                                    </button>
                                    <div className="w-12 h-12 bg-blue-600/10 text-blue-600 rounded-xl flex items-center justify-center transition-transform group-hover:translate-x-1">
                                        <ChevronRight size={20} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Measurement Modal */}
            {showMeasurementModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl">
                        <div className="p-8 bg-blue-600 text-white">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="text-2xl font-bold tracking-tight">Measurements</h3>
                                <button onClick={() => setShowMeasurementModal(false)} className="hover:bg-white/10 rounded-full p-2 transition-colors"><X size={24} /></button>
                            </div>
                            <p className="text-blue-100 text-sm font-medium">Recording for {selectedCustomer?.name}</p>
                        </div>
                        <form onSubmit={handleMeasurementSubmit} className="p-8 space-y-6">
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Dress Category</label>
                                <select
                                    className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 rounded-2xl px-5 py-4 outline-none text-slate-900 dark:text-white focus:border-blue-600 transition-all font-bold"
                                    value={measurementData.category}
                                    onChange={(e) => setMeasurementData({ ...measurementData, category: e.target.value })}
                                >
                                    <option>Shirt</option>
                                    <option>Pant</option>
                                    <option>Frock</option>
                                    <option>Blouse</option>
                                    <option>Other</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                                {(MEASUREMENT_CONFIG[measurementData.category] || MEASUREMENT_CONFIG['Shirt']).map((field) => (
                                    <div key={field}>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1 tracking-widest">{field} (in)</label>
                                        <input
                                            type="text"
                                            placeholder="0.0"
                                            value={measurementData.values[field] || ''}
                                            onChange={(e) => setMeasurementData({
                                                ...measurementData,
                                                values: { ...measurementData.values, [field]: e.target.value }
                                            })}
                                            className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 rounded-2xl px-5 py-3 text-sm outline-none focus:border-blue-600 text-slate-900 dark:text-white transition-all font-mono font-bold"
                                        />
                                    </div>
                                ))}
                            </div>

                            <div className="pt-4 flex gap-4">
                                <button type="button" onClick={() => setShowMeasurementModal(false)} className="flex-1 bg-slate-100 dark:bg-slate-800 py-4 rounded-2xl font-bold text-slate-500 active:scale-95 transition-all">Cancel</button>
                                <button type="submit" className="flex-1 bg-blue-600 py-4 rounded-2xl font-bold text-white shadow-xl shadow-blue-600/30 active:scale-95 transition-all">Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Add/Edit Customer Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[100] flex items-center justify-center p-4 transition-all animate-in fade-in">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl">
                        <div className="bg-blue-600 p-8">
                            <div className="flex justify-between items-center text-white">
                                <h3 className="text-2xl font-bold tracking-tight">{isEditing ? 'Update Profile' : 'New Customer'}</h3>
                                <button onClick={closeModal} className="hover:bg-white/10 rounded-full p-2 transition-colors"><X size={24} /></button>
                            </div>
                        </div>
                        <form onSubmit={handleSubmit} className="p-8 space-y-5">
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Customer Full Name</label>
                                <input
                                    required
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 rounded-2xl px-5 py-4 focus:border-blue-600 outline-none transition-all text-slate-900 dark:text-white font-bold shadow-sm"
                                    placeholder="Enter name..."
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Contact Number</label>
                                <input
                                    required
                                    type="text"
                                    value={formData.contact}
                                    onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                                    className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 rounded-2xl px-5 py-4 focus:border-blue-600 outline-none transition-all text-slate-900 dark:text-white font-bold shadow-sm"
                                    placeholder="07X XXX XXXX"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Residential Address</label>
                                <textarea
                                    rows={3}
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 rounded-2xl px-5 py-4 focus:border-blue-600 outline-none transition-all text-slate-900 dark:text-white font-medium shadow-sm"
                                    placeholder="Full address here..."
                                />
                            </div>
                            <div className="pt-6">
                                <button
                                    type="submit"
                                    className="w-full bg-blue-600 hover:bg-blue-700 py-5 rounded-2xl font-black text-white transition-all shadow-xl shadow-blue-600/20 active:scale-[0.98] uppercase tracking-widest"
                                >
                                    {isEditing ? 'Save Changes' : 'Create Profile'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Customers;
