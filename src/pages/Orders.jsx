import React, { useState, useEffect } from 'react';
import { orderService, employeeService, customerService, measurementService } from '../services/db';
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
    const [printType, setPrintType] = useState('invoice'); // 'invoice' or 'task'
    const [employees, setEmployees] = useState([]);
    const [customers, setCustomers] = useState([]);

    // Standard measurement fields configuration
    const MEASUREMENT_CONFIG = {
        'Shirt': ['Length', 'Chest', 'Waist', 'Hips', 'Shoulder', 'Sleeves', 'Neck'],
        'Pant': ['Length', 'Waist', 'Hips', 'Inseam', 'Thigh', 'Knee', 'Bottom'],
        'Frock': ['Length', 'Chest', 'Waist', 'Shoulder', 'Sleeves', 'Flare'],
        'Blouse': ['Length', 'Chest', 'Waist', 'Shoulder', 'Sleeves', 'Front Neck', 'Back Neck'],
        'Other': ['Length', 'Width', 'Notes']
    };

    const [formData, setFormData] = useState({
        customer_id: '',
        category: 'Shirt',
        dress_color: '',
        delivery_date: '',
        advance_amount: '',
        total_amount: '',
        cutter_id: '',
        stitcher_id: '',
        measurements: {}
    });

    const fetchData = async () => {
        try {
            const [ordersData, employeesData, customersData] = await Promise.all([
                orderService.getAll(),
                employeeService.getAll(),
                customerService.getAll()
            ]);
            setOrders(ordersData);
            setEmployees(employeesData);
            setCustomers(customersData);

            if (selectedOrder) {
                const refreshed = ordersData.find(o => o.id === selectedOrder.id);
                if (refreshed) setSelectedOrder(refreshed);
            }
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
                    const res = await measurementService.get(formData.customer_id, formData.category);
                    if (res) {
                        const savedMeasurements = typeof res.values_json === 'string'
                            ? JSON.parse(res.values_json)
                            : res.values_json;
                        setFormData(prev => ({ ...prev, measurements: savedMeasurements }));
                        toast.success('Measurements pre-filled from history');
                    } else {
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
            if (formData.customer_id && formData.category) {
                await measurementService.save({
                    customer_id: formData.customer_id,
                    category: formData.category,
                    values_json: JSON.stringify(formData.measurements)
                });
            }

            const orderPayload = {
                ...formData,
                assignments,
                measurements_json: JSON.stringify(formData.measurements)
            };

            if (isEditing) {
                await orderService.update(editId, orderPayload);
                toast.success('Order updated successfully!');
            } else {
                const id = 'ORD' + Date.now().toString().slice(-6);
                await orderService.add(id, orderPayload);
                toast.success('New order created successfully!');
            }

            setShowAddModal(false);
            setIsEditing(false);
            setEditId(null);
            fetchData();
            if (isEditing && selectedOrder && selectedOrder.id === editId) {
                setSelectedOrder(null);
            }
            setFormData({
                customer_id: '',
                category: 'Shirt',
                dress_color: '',
                delivery_date: '',
                advance_amount: '',
                total_amount: '',
                cutter_id: '',
                stitcher_id: '',
                measurements: {}
            });
        } catch (err) {
            toast.error(err.message || `Error ${isEditing ? 'updating' : 'creating'} order`);
        }
    };

    const handleEdit = (ord) => {
        const parsedMeasurements = ord.measurements_json ? JSON.parse(ord.measurements_json) : {};

        // Extract assignments from assignments_data string
        let cutterId = '';
        let stitcherId = '';
        if (ord.assignments_data) {
            ord.assignments_data.split(',').forEach(pair => {
                const [id, role] = pair.split(':');
                if (role === 'Cutter') cutterId = id;
                if (role === 'Stitcher') stitcherId = id;
            });
        }

        setFormData({
            customer_id: ord.customer_id,
            category: ord.category || 'Shirt',
            dress_color: ord.dress_color || '',
            delivery_date: ord.delivery_date,
            advance_amount: ord.advance_amount,
            total_amount: ord.total_amount,
            cutter_id: cutterId,
            stitcher_id: stitcherId,
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
            dress_color: '',
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
            await orderService.delete(id);
            toast.success('Order deleted successfully!');
            setSelectedOrder(null);
            fetchData();
        } catch (err) {
            toast.error(err.message || "Error deleting order");
        }
    };

    const handleStatusChange = async (newStatus) => {
        try {
            await orderService.updateStatus(selectedOrder.id, newStatus);
            if (newStatus === 'Delivered') {
                toast.success(`✅ Order delivered! LKR ${Number(selectedOrder.total_amount).toLocaleString()} added to Total Income.`);
            } else {
                toast.success(`Order status updated to ${newStatus}`);
            }
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
            case 'Delivered': return 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400';
            default: return 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400';
        }
    };

    const handlePrintInvoice = () => {
        setPrintType('invoice');
        setTimeout(() => window.print(), 100);
    };

    const handlePrintTask = () => {
        setPrintType('task');
        setTimeout(() => window.print(), 100);
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
                                onClick={handlePrintInvoice}
                                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-900 dark:text-white px-4 py-2 rounded-lg flex items-center gap-2 no-print transition-colors shadow-sm"
                            >
                                <Printer size={20} /> Print Invoice
                            </button>
                            <button
                                onClick={handlePrintTask}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 no-print transition-all shadow-lg shadow-blue-500/20 font-bold"
                            >
                                <CheckCircle2 size={20} /> Print Task Card
                            </button>
                            <button
                                onClick={() => handleDeleteOrder(selectedOrder.id)}
                                disabled={selectedOrder.status !== 'Pending'}
                                className={`px-4 py-2 rounded-lg flex items-center gap-2 no-print transition-all shadow-sm ${selectedOrder.status === 'Pending'
                                    ? "bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-600 text-rose-600 dark:text-rose-500 hover:text-white"
                                    : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed opacity-50"
                                    }`}
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
                                    <div>
                                        <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Dress Type</h4>
                                        <p className="font-bold text-slate-900 dark:text-white">{selectedOrder.category}</p>
                                    </div>
                                    {selectedOrder.dress_color && (
                                        <div className="text-right">
                                            <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Dress Color</h4>
                                            <div className="flex items-center justify-end gap-2">
                                                {selectedOrder.dress_color.startsWith('#') && (
                                                    <span
                                                        className="w-5 h-5 rounded-full border border-slate-200 dark:border-slate-700 flex-shrink-0 inline-block"
                                                        style={{ backgroundColor: selectedOrder.dress_color }}
                                                    />
                                                )}
                                                <p className="font-bold text-slate-900 dark:text-white">{selectedOrder.dress_color}</p>
                                            </div>
                                        </div>
                                    )}
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
                                    {selectedOrder.status === 'Delivered' ? (
                                        <div className="flex justify-between items-center border-t border-slate-200 dark:border-slate-800 pt-4">
                                            <span className="font-bold text-slate-900 dark:text-white text-xl">Status</span>
                                            <span className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-black text-sm px-4 py-2 rounded-full">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                                                Delivered / Paid
                                            </span>
                                        </div>
                                    ) : (
                                        <div className="flex justify-between border-t border-slate-200 dark:border-slate-800 pt-4 text-xl">
                                            <span className="font-bold text-slate-900 dark:text-white">Balance Due</span>
                                            <span className="font-black text-blue-600 dark:text-blue-400">LKR {(selectedOrder.total_amount - selectedOrder.advance_amount).toLocaleString()}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6 no-print">
                            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm dark:shadow-none">
                                <h3 className="font-bold mb-4 text-slate-900 dark:text-white">Production Status</h3>
                                <div className="space-y-4 mb-8">
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

                                {selectedOrder.assignments_data && (
                                    <div className="border-t border-slate-100 dark:border-slate-800 pt-6">
                                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Assigned Team</h4>
                                        <div className="space-y-3">
                                            {selectedOrder.assignments_data.split(',').map((pair, idx) => {
                                                const [empId, role] = pair.split(':');
                                                return (
                                                    <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                                                        <div className="flex flex-col">
                                                            <span className="text-[10px] text-slate-500 font-bold uppercase">{role}</span>
                                                            <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{empId}</span>
                                                        </div>
                                                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                                            <User size={13} />
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Print Section (Invoice or Task Card) */}
                    <div className="hidden print:block fixed inset-0 bg-white text-black p-12 z-[9999]">
                        {printType === 'invoice' ? (
                            <>
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
                                    {selectedOrder.dress_color && <p><strong>Dress Color:</strong> {selectedOrder.dress_color}</p>}
                                    <p><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
                                    <p><strong>Expected Delivery:</strong> {selectedOrder.delivery_date}</p>
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
                            </>
                        ) : (
                            <>
                                <div className="border-4 border-black p-8">
                                    <div className="flex justify-between items-center border-b-4 border-black pb-4 mb-8">
                                        <div>
                                            <h1 className="text-3xl font-black uppercase">Production Job Card</h1>
                                            <p className="text-xl font-bold">ORDER ID: {selectedOrder.id}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold">Delivery Date</p>
                                            <p className="text-xl font-black border-2 border-black px-4 py-2 inline-block mt-2">{selectedOrder.delivery_date}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-10 mb-10">
                                        <div>
                                            <p className="text-sm font-bold uppercase text-gray-600">Customer</p>
                                            <p className="text-xl font-bold">{selectedOrder.customer_name}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-bold uppercase text-gray-600">Category</p>
                                            <p className="text-xl font-bold">{selectedOrder.category}</p>
                                        </div>
                                        {selectedOrder.dress_color && (
                                            <div>
                                                <p className="text-sm font-bold uppercase text-gray-600">Dress Color</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    {selectedOrder.dress_color.startsWith('#') && (
                                                        <span className="w-6 h-6 rounded-full border-2 border-black inline-block flex-shrink-0" style={{ backgroundColor: selectedOrder.dress_color }} />
                                                    )}
                                                    <p className="text-xl font-bold">{selectedOrder.dress_color}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="mb-10">
                                        <h3 className="text-xl font-bold mb-4 bg-black text-white px-4 py-1 inline-block">MEASUREMENTS</h3>
                                        <div className="grid grid-cols-4 gap-6">
                                            {selectedOrder.measurements_json && Object.entries(JSON.parse(selectedOrder.measurements_json)).map(([k, v]) => (
                                                <div key={k} className="border-b-2 border-black/30 pb-1">
                                                    <p className="text-xs uppercase font-bold">{k}</p>
                                                    <p className="text-2xl font-mono font-black">{v || '-'}″</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-6 pt-6 border-t-4 border-black">
                                        <h3 className="text-xl font-bold bg-black text-white px-4 py-1 inline-block w-fit">ASSIGNED TEAM</h3>
                                        <div className="grid grid-cols-2 gap-8">
                                            {selectedOrder.assignments_data ? selectedOrder.assignments_data.split(',').map((pair, idx) => {
                                                const [empId, role] = pair.split(':');
                                                return (
                                                    <div key={idx} className="border-2 border-black p-4">
                                                        <p className="text-xs font-bold uppercase opacity-60">{role}</p>
                                                        <p className="text-2xl font-black">{empId}</p>
                                                    </div>
                                                );
                                            }) : <p className="text-xl italic">No team members assigned</p>}
                                        </div>
                                    </div>

                                    <div className="mt-20 pt-10 border-t-2 border-dashed border-black">
                                        <p className="font-bold text-center italic text-gray-600">Please return this card with the finished garment.</p>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            ) : (
                <div className="page-container">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                        <div>
                            <h1 className="page-header-h1">Orders</h1>
                            <p className="text-slate-500 dark:text-slate-400 font-medium tracking-tight">Track dress orders and production stages.</p>
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
                                <Plus size={18} /> New Order
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

                            {/* Dress Color */}
                            <div>
                                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Dress Color</label>
                                <div className="flex gap-2 items-center">
                                    <div
                                        className="w-10 h-10 rounded-lg border-2 border-slate-200 dark:border-slate-700 flex-shrink-0 transition-colors"
                                        style={{ backgroundColor: formData.dress_color || 'transparent' }}
                                        title={formData.dress_color || 'No color selected'}
                                    >
                                        {!formData.dress_color && (
                                            <div className="w-full h-full rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 text-[10px] font-bold">?</div>
                                        )}
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="e.g. Red, Navy, Maroon, White..."
                                        value={formData.dress_color}
                                        onChange={(e) => setFormData({ ...formData, dress_color: e.target.value })}
                                        className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white transition-all shadow-sm"
                                    />
                                </div>
                                <p className="text-[10px] text-slate-400 mt-1 italic">Type a color name and the preview will update automatically.</p>
                            </div>

                            {/* Measurement Inputs Section */}
                            <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                                <div className="flex items-center gap-2 mb-4 text-blue-600 dark:text-blue-400">
                                    <Ruler size={18} />
                                    <h4 className="text-sm font-bold uppercase tracking-wider">Measurements (Inches)</h4>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    {(MEASUREMENT_CONFIG[formData.category] || MEASUREMENT_CONFIG['Shirt']).map(field => (
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
