import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
    ShoppingBag,
    Plus,
    Calendar,
    User,
    Clock,
    ChevronRight,
    Filter,
    CheckCircle2,
    Printer,
    ChevronLeft,
    X,
    Trash2,
    Edit,
    Ruler
} from 'lucide-react';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [employees, setEmployees] = useState([]);
    const [customers, setCustomers] = useState([]);

    // Standard measurement fields
    const measurementFields = ['Length', 'Chest', 'Waist', 'Hips', 'Shoulder', 'Sleeves'];

    const [formData, setFormData] = useState({
        customer_id: '',
        category: 'Shirt',
        delivery_date: '',
        advance_amount: '',
        total_amount: '',
        cutter_id: '',
        stitcher_id: '',
        measurements: {}
    });

    const fetchData = async () => {
        try {
            const [ordRes, empRes, cusRes] = await Promise.all([
                axios.get('http://localhost:3001/api/orders'),
                axios.get('http://localhost:3001/api/employees'),
                axios.get('http://localhost:3001/api/customers')
            ]);
            setOrders(ordRes.data);
            setEmployees(empRes.data);
            setCustomers(cusRes.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Fetch measurements when customer or category changes
    useEffect(() => {
        const fetchMeasurements = async () => {
            if (formData.customer_id && formData.category && !isEditing) {
                try {
                    const res = await axios.get(`http://localhost:3001/api/measurements/${formData.customer_id}/${formData.category}`);
                    if (res.data) {
                        const savedMeasurements = typeof res.data.values_json === 'string'
                            ? JSON.parse(res.data.values_json)
                            : res.data.values_json;
                        setFormData(prev => ({ ...prev, measurements: savedMeasurements }));
                        toast.success('Measurements pre-filled from history');
                    } else {
                        // Reset measurements if none found
                        setFormData(prev => ({ ...prev, measurements: {} }));
                    }
                } catch (err) {
                    console.error('Error fetching measurements:', err);
                }
            }
        };

        fetchMeasurements();
    }, [formData.customer_id, formData.category, isEditing]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const assignments = [];
        if (formData.cutter_id) assignments.push({ employee_id: formData.cutter_id, role: 'Cutter' });
        if (formData.stitcher_id) assignments.push({ employee_id: formData.stitcher_id, role: 'Stitcher' });

        try {
            // 1. Save measurements to the measurements table first (for future refilling)
            if (formData.customer_id && formData.category) {
                await axios.post('http://localhost:3001/api/measurements', {
                    customer_id: formData.customer_id,
                    category: formData.category,
                    values_json: formData.measurements
                });
            }

            // 2. Prepare the order data
            const orderPayload = {
                ...formData,
                assignments,
                measurements_json: JSON.stringify(formData.measurements)
            };

            if (isEditing) {
                await axios.patch(`http://localhost:3001/api/orders/${editId}`, orderPayload);
                toast.success('Order updated successfully!');
            } else {
                const id = 'ORD' + Date.now().toString().slice(-6);
                await axios.post('http://localhost:3001/api/orders', { ...orderPayload, id });
                toast.success('New order created successfully!');
            }

            setShowAddModal(false);
            setIsEditing(false);
            setEditId(null);
            fetchData();
            if (isEditing && selectedOrder && selectedOrder.id === editId) {
                setSelectedOrder(null);
            }
            // Reset form
            setFormData({
                customer_id: '',
                category: 'Shirt',
                delivery_date: '',
                advance_amount: '',
                total_amount: '',
                cutter_id: '',
                stitcher_id: '',
                measurements: {}
            });
        } catch (err) {
            toast.error(err.response?.data?.error || `Error ${isEditing ? 'updating' : 'creating'} order`);
        }
    };

    const handleEdit = (ord) => {
        const parsedMeasurements = ord.measurements_json ? JSON.parse(ord.measurements_json) : {};
        setFormData({
            customer_id: ord.customer_id,
            category: ord.category || 'Shirt',
            delivery_date: ord.delivery_date,
            advance_amount: ord.advance_amount,
            total_amount: ord.total_amount,
            cutter_id: '',
            stitcher_id: '',
            measurements: parsedMeasurements
        });
        setEditId(ord.id);
        setIsEditing(true);
        setShowAddModal(true);
    };

    const closeModal = () => {
        setShowAddModal(false);
        setIsEditing(false);
        setEditId(null);
        setFormData({
            customer_id: '',
            category: 'Shirt',
            delivery_date: '',
            advance_amount: '',
            total_amount: '',
            cutter_id: '',
            stitcher_id: '',
            measurements: {}
        });
    };

    const handleDeleteOrder = async (id) => {
        if (!window.confirm("Are you sure you want to cancel and delete this order?")) return;
        try {
            await axios.delete(`http://localhost:3001/api/orders/${id}`);
            toast.success('Order deleted successfully!');
            setSelectedOrder(null);
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.error || "Error deleting order");
        }
    };

    const handleStatusChange = async (newStatus) => {
        try {
            await axios.patch(`http://localhost:3001/api/orders/${selectedOrder.id}/status`, { status: newStatus });
            toast.success(`Order status updated to ${newStatus}`);
            setSelectedOrder({ ...selectedOrder, status: newStatus });
            fetchData();
        } catch (err) {
            toast.error(err.message || "Error updating status");
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending': return 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400';
            case 'Cutting': return 'bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400';
            case 'Stitching': return 'bg-purple-100 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400';
            case 'Finished': return 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400';
            case 'Delivered': return 'bg-slate-200 dark:bg-slate-900 text-slate-700 dark:text-slate-600';
            default: return 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400';
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const handleMeasurementChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            measurements: {
                ...prev.measurements,
                [field]: value
            }
        }));
    };

    return (
        <div className="w-full">
            {selectedOrder ? (
                <div className="p-8 space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                    <button onClick={() => setSelectedOrder(null)} className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-white transition-colors">
                        <ChevronLeft size={20} /> Back to Orders
                    </button>

                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-bold mb-2 text-slate-900 dark:text-white">Order Details</h1>
                            <p className="text-slate-500 dark:text-slate-400 font-mono text-sm">{selectedOrder.id} - {selectedOrder.category}</p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleEdit(selectedOrder)}
                                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-blue-600 dark:text-blue-400 px-4 py-2 rounded-lg flex items-center gap-2 no-print transition-colors shadow-sm"
                            >
                                <Edit size={20} /> Edit Order
                            </button>
                            <button
                                onClick={handlePrint}
                                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-900 dark:text-white px-4 py-2 rounded-lg flex items-center gap-2 no-print transition-colors shadow-sm"
                            >
                                <Printer size={20} /> Print Invoice
                            </button>
                            <button
                                onClick={() => handleDeleteOrder(selectedOrder.id)}
                                className="bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-600 text-rose-600 dark:text-rose-500 hover:text-white px-4 py-2 rounded-lg flex items-center gap-2 no-print transition-all shadow-sm"
                            >
                                <Trash2 size={20} /> Cancel Order
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 print:border-none print:shadow-none print:p-0 shadow-sm dark:shadow-none">
                                <div className="flex justify-between items-center mb-8">
                                    <div className="text-left">
                                        <h2 className="text-2xl font-bold text-blue-600 dark:text-blue-400">INVOICE</h2>
                                        <p className="text-slate-500 text-sm">Mannar Rajani Tailors & Textiles</p>
                                    </div>
                                    <div className="text-right text-sm text-slate-500">
                                        <p>Date: {new Date(selectedOrder.created_at).toLocaleDateString()}</p>
                                        <p>Order ID: {selectedOrder.id}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-8 mb-12">
                                    <div>
                                        <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Customer</h4>
                                        <p className="font-bold text-lg text-slate-900 dark:text-white">{selectedOrder.customer_name}</p>
                                    </div>
                                    <div className="text-right">
                                        <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Delivery Date</h4>
                                        <p className="font-bold text-lg text-slate-900 dark:text-white">{selectedOrder.delivery_date}</p>
                                    </div>
                                </div>

                                {/* Measurements Section in Invoice */}
                                <div className="mb-12">
                                    <h4 className="text-xs font-bold text-slate-500 uppercase mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">Measurements ({selectedOrder.category})</h4>
                                    <div className="grid grid-cols-3 gap-4">
                                        {selectedOrder.measurements_json && Object.entries(JSON.parse(selectedOrder.measurements_json)).map(([k, v]) => (
                                            <div key={k} className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                                                <p className="text-[10px] text-slate-500 uppercase font-bold">{k}</p>
                                                <p className="text-slate-900 dark:text-white font-mono">{v}″</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="border-t border-slate-200 dark:border-slate-800 py-6 space-y-4">
                                    <div className="flex justify-between">
                                        <span className="text-slate-500 dark:text-slate-400">Total Amount</span>
                                        <span className="font-bold text-slate-900 dark:text-white">LKR {selectedOrder.total_amount?.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500 dark:text-slate-400">Advance Paid</span>
                                        <span className="text-emerald-600 dark:text-emerald-400">LKR {selectedOrder.advance_amount?.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between border-t border-slate-200 dark:border-slate-800 pt-4 text-xl">
                                        <span className="font-bold text-slate-900 dark:text-white">Balance Due</span>
                                        <span className="font-black text-blue-600 dark:text-blue-400">LKR {(selectedOrder.total_amount - selectedOrder.advance_amount).toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6 no-print">
                            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm dark:shadow-none">
                                <h3 className="font-bold mb-4 text-slate-900 dark:text-white">Production Status</h3>
                                <div className="space-y-4">
                                    {['Pending', 'Cutting', 'Stitching', 'Finished', 'Delivered'].map((status) => (
                                        <button
                                            key={status}
                                            onClick={() => handleStatusChange(status)}
                                            className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                        >
                                            <div className={`w-3 h-3 rounded-full ${selectedOrder.status === status ? 'bg-blue-600 dark:bg-blue-500 ring-4 ring-blue-500/20' : 'bg-slate-200 dark:bg-slate-800'}`}></div>
                                            <span className={selectedOrder.status === status ? 'text-blue-600 dark:text-white font-medium' : 'text-slate-500 dark:text-slate-500'}>{status}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Print only section */}
                    <div className="hidden print:block fixed inset-0 bg-white text-black p-12 z-[9999]">
                        <div className="flex justify-between mb-20">
                            <div>
                                <h1 className="text-4xl font-black">Mannar Rajani Tailors</h1>
                                <p>Main Street, Mannar</p>
                                <p>+94 77 123 4567</p>
                            </div>
                            <div className="text-right">
                                <h2 className="text-2xl font-bold">OFFICIAL INVOICE</h2>
                                <p>No: {selectedOrder.id}</p>
                            </div>
                        </div>
                        <div className="mb-10 text-lg">
                            <p><strong>Customer:</strong> {selectedOrder.customer_name}</p>
                            <p><strong>Dress Category:</strong> {selectedOrder.category}</p>
                            <p><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
                            <p><strong>Expected Delivery:</strong> {selectedOrder.delivery_date}</p>
                        </div>

                        {/* Measurements in Print */}
                        <div className="mb-10">
                            <h3 className="text-xl font-bold mb-4 border-b-2 border-black pb-2">Measurements</h3>
                            <div className="grid grid-cols-4 gap-6">
                                {selectedOrder.measurements_json && Object.entries(JSON.parse(selectedOrder.measurements_json)).map(([k, v]) => (
                                    <div key={k} className="border-b border-black/20 pb-1">
                                        <p className="text-[10px] uppercase font-bold">{k}</p>
                                        <p className="text-lg font-mono">{v}″</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <table className="w-full text-left mb-20 border-collapse">
                            <thead>
                                <tr className="border-b-2 border-black">
                                    <th className="py-2">Description</th>
                                    <th className="py-2 text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-gray-300">
                                    <td className="py-4">Tailoring Order ({selectedOrder.category})</td>
                                    <td className="py-4 text-right">LKR {selectedOrder.total_amount?.toLocaleString()}</td>
                                </tr>
                                <tr>
                                    <td className="py-4 font-bold">Total</td>
                                    <td className="py-4 text-right font-bold">LKR {selectedOrder.total_amount?.toLocaleString()}</td>
                                </tr>
                                <tr>
                                    <td className="py-4 font-bold">Advance Paid</td>
                                    <td className="py-4 text-right font-bold">LKR {selectedOrder.advance_amount?.toLocaleString()}</td>
                                </tr>
                                <tr className="text-xl">
                                    <td className="py-4 font-black">Balance Due</td>
                                    <td className="py-4 text-right font-black">LKR {(selectedOrder.total_amount - selectedOrder.advance_amount).toLocaleString()}</td>
                                </tr>
                            </tbody>
                        </table>
                        <div className="mt-40 flex justify-between">
                            <div className="border-t border-black w-48 text-center pt-2">Authorized Sign</div>
                            <div className="border-t border-black w-48 text-center pt-2">Customer Sign</div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="p-6 md:p-10 lg:p-12 w-full space-y-6 transition-all duration-300">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">Orders</h1>
                            <p className="text-slate-500 dark:text-slate-400">Track dress orders and production stages.</p>
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
                                <Plus size={20} /> New Order
                            </button>
                        </div>
                    </div>

                    {/* Print Only Content */}
                    <div className="print-only">
                        <div className="print-header">
                            <h1 className="text-2xl font-bold text-center">Rajani Tailors - Order List</h1>
                            <p className="text-center">Date: {new Date().toLocaleDateString()}</p>
                        </div>
                        <table className="w-full border-collapse border border-slate-300 mt-8">
                            <thead>
                                <tr className="bg-slate-100">
                                    <th className="border p-2">Order ID</th>
                                    <th className="border p-2">Customer</th>
                                    <th className="border p-2">Dress Type</th>
                                    <th className="border p-2">Delivery Date</th>
                                    <th className="border p-2">Total Amount</th>
                                    <th className="border p-2">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map(ord => (
                                    <tr key={ord.id}>
                                        <td className="border p-2 font-mono">{ord.id}</td>
                                        <td className="border p-2 font-bold">{ord.customer_name}</td>
                                        <td className="border p-2">{ord.category}</td>
                                        <td className="border p-2">{ord.delivery_date}</td>
                                        <td className="border p-2">LKR {ord.total_amount?.toLocaleString()}</td>
                                        <td className="border p-2">{ord.status}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm dark:shadow-none no-print">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left min-w-[900px]">
                                <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                                    <tr>
                                        <th className="px-6 py-4 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase">Order ID</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase">Customer</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase">Dress</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase">Delivery Date</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase">Total Amount</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase">Status</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                    {orders.map((ord) => (
                                        <tr key={ord.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer group" onClick={() => setSelectedOrder(ord)}>
                                            <td className="px-6 py-4 font-mono text-blue-600 dark:text-blue-400 text-sm">{ord.id}</td>
                                            <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{ord.customer_name}</td>
                                            <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400 font-bold">{ord.category}</td>
                                            <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                                                <div className="flex items-center gap-2">
                                                    <Calendar size={14} /> {ord.delivery_date}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-bold text-slate-700 dark:text-slate-200">LKR {ord.total_amount?.toLocaleString()}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${getStatusColor(ord.status)}`}>
                                                    {ord.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button className="bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 dark:hover:bg-blue-600 hover:text-white p-2 rounded-lg transition-all text-slate-400 dark:text-slate-500">
                                                    <ChevronRight size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {showAddModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 transition-all animate-in fade-in">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden">
                        <div className="p-6 bg-blue-600 text-white flex justify-between items-center">
                            <h3 className="text-xl font-bold">{isEditing ? 'Edit Order' : 'New Dress Order'}</h3>
                            <button onClick={closeModal} className="hover:bg-white/10 rounded p-1 transition-colors"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[85vh] overflow-y-auto">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Select Customer</label>
                                    <select
                                        required
                                        value={formData.customer_id}
                                        onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white transition-all shadow-sm"
                                    >
                                        <option value="">Choose Customer...</option>
                                        {customers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.id})</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Dress Type</label>
                                    <select
                                        required
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white transition-all shadow-sm"
                                    >
                                        <option>Shirt</option>
                                        <option>Pant</option>
                                        <option>Frock</option>
                                        <option>Blouse</option>
                                        <option>Other</option>
                                    </select>
                                </div>
                            </div>

                            {/* Measurement Inputs Section */}
                            <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                                <div className="flex items-center gap-2 mb-4 text-blue-600 dark:text-blue-400">
                                    <Ruler size={18} />
                                    <h4 className="text-sm font-bold uppercase tracking-wider">Measurements (Inches)</h4>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    {measurementFields.map(field => (
                                        <div key={field}>
                                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">{field}</label>
                                            <input
                                                type="text"
                                                placeholder="0.0"
                                                value={formData.measurements[field] || ''}
                                                onChange={(e) => handleMeasurementChange(field, e.target.value)}
                                                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white transition-all"
                                            />
                                        </div>
                                    ))}
                                </div>
                                <p className="text-[10px] text-slate-400 mt-4 italic">* These measurements will be saved to this order and updated in the customer history.</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Delivery Date</label>
                                    <input
                                        required
                                        type="date"
                                        value={formData.delivery_date}
                                        onChange={(e) => setFormData({ ...formData, delivery_date: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white transition-all shadow-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Total Amount (LKR)</label>
                                    <input
                                        required
                                        type="number"
                                        value={formData.total_amount}
                                        onChange={(e) => setFormData({ ...formData, total_amount: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white transition-all shadow-sm"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Advance Payment</label>
                                    <input
                                        type="number"
                                        value={formData.advance_amount}
                                        onChange={(e) => setFormData({ ...formData, advance_amount: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white transition-all shadow-sm"
                                    />
                                </div>
                            </div>

                            {!isEditing && (
                                <div className="border-t border-slate-200 dark:border-slate-800 pt-4 mt-4">
                                    <h4 className="text-sm font-bold text-slate-500 uppercase mb-3 text-slate-400 dark:text-slate-500">Assignments</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Cutting Master</label>
                                            <select
                                                value={formData.cutter_id}
                                                onChange={(e) => setFormData({ ...formData, cutter_id: e.target.value })}
                                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 outline-none text-sm text-slate-900 dark:text-white transition-all shadow-sm"
                                            >
                                                <option value="">Unassigned</option>
                                                {employees.filter(e => e.category === 'Cutting Master').map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Stitching Master</label>
                                            <select
                                                value={formData.stitcher_id}
                                                onChange={(e) => setFormData({ ...formData, stitcher_id: e.target.value })}
                                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 outline-none text-sm text-slate-900 dark:text-white transition-all shadow-sm"
                                            >
                                                <option value="">Unassigned</option>
                                                {employees.filter(e => e.category === 'Stitching Master').map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="pt-6">
                                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-xl font-bold text-white transition-all shadow-lg shadow-blue-500/20">
                                    {isEditing ? 'Update Order Details' : 'Create Order & Invoice'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Orders;
