import React, { useState, useEffect } from 'react';
import { inventoryService, supplierService } from '../services/db';
import toast from 'react-hot-toast';
import {
    Package,
    Plus,
    Search,
    AlertCircle,
    Trash2,
    Edit,
    Printer,
    Truck
} from 'lucide-react';

const Inventory = () => {
    const [items, setItems] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);
    const [formData, setFormData] = useState({
        item_name: '',
        quantity: 0,
        min_level: 5,
        unit: 'Meters',
        supplier_id: '',
        cost_price: ''
    });
    const [searchQuery, setSearchQuery] = useState('');

    const fetchInventory = async () => {
        try {
            const [inventoryData, suppliersData] = await Promise.all([
                inventoryService.getAll(),
                supplierService.getAll()
            ]);
            setItems(inventoryData);
            setSuppliers(suppliersData);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchInventory();
    }, []);

    const filteredItems = items.filter(item =>
        item.item_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await inventoryService.update(editId, formData);
                toast.success('Inventory item updated!');
            } else {
                await inventoryService.add(formData);
                toast.success('Item added to inventory!');
            }
            setShowAddModal(false);
            setIsEditing(false);
            setEditId(null);
            fetchInventory();
            setFormData({ item_name: '', quantity: 0, min_level: 5, unit: 'Meters', supplier_id: '', cost_price: '' });
        } catch (err) {
            toast.error(err.message || `Error ${isEditing ? 'updating' : 'adding'} item`);
        }
    };

    const handleEdit = (item) => {
        setFormData({
            item_name: item.item_name || '',
            quantity: item.quantity ?? '',
            min_level: item.min_level ?? '',
            unit: item.unit || 'Meters',
            supplier_id: item.supplier_id || '',
            cost_price: item.cost_price || ''
        });
        setEditId(item.id);
        setIsEditing(true);
        setShowAddModal(true);
    };

    const closeModal = () => {
        setShowAddModal(false);
        setIsEditing(false);
        setEditId(null);
        setFormData({ item_name: '', quantity: 0, min_level: 5, unit: 'Meters', supplier_id: '', cost_price: '' });
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this item?")) return;
        try {
            await inventoryService.delete(id);
            toast.success('Item deleted successfully!');
            fetchInventory();
        } catch (err) {
            toast.error(err.message || "Error deleting item");
        }
    };

    return (
        <>
            {/* Main UI - Hidden during printing */}
            <div className="page-container print:hidden">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                    <div>
                        <h1 className="page-header-h1">Inventory</h1>
                        <p className="text-slate-500 dark:text-slate-400 font-medium tracking-tight">Track fabric, threads, and tailoring accessories.</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => window.print()}
                            className="btn-secondary"
                        >
                            <Printer size={18} /> Print List
                        </button>
                        <button
                            onClick={() => { setShowAddModal(true); setIsEditing(false); }}
                            className="btn-primary"
                        >
                            <Plus size={18} /> Add Item
                        </button>
                    </div>
                </div>

                <div className="flex gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search inventory items..."
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-900 dark:text-white shadow-sm"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm dark:shadow-none">
                        <p className="text-sm text-slate-500 dark:text-slate-400">Total Items</p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">{items.length}</p>
                    </div>
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl border-l-rose-500 border-l-4 shadow-sm dark:shadow-none">
                        <p className="text-sm text-slate-500 dark:text-slate-400">Low Stock</p>
                        <p className="text-2xl font-bold text-rose-600 dark:text-rose-500">
                            {items.filter(i => i.quantity <= i.min_level).length}
                        </p>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm dark:shadow-none">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left min-w-[800px]">
                            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase">Item Name</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase">Supplier</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase">Cost / Unit</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase">Quantity</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase">Min Level</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase">Status</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                {filteredItems.map((item) => {
                                    const IsLow = item.quantity <= item.min_level;
                                    return (
                                        <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                                            <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{item.item_name}</td>
                                            <td className="px-6 py-4">
                                                {item.supplier_name ? (
                                                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-2 py-1 rounded-full">
                                                        <Truck size={11} /> {item.supplier_name}
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-slate-400 italic">No supplier</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 font-bold text-slate-700 dark:text-slate-200">
                                                {item.cost_price > 0 ? `LKR ${Number(item.cost_price).toLocaleString()}` : <span className="text-slate-400 text-xs italic">—</span>}
                                            </td>
                                            <td className="px-6 py-4 text-slate-700 dark:text-slate-200">
                                                {item.quantity} <span className="text-slate-500 dark:text-slate-500 text-xs">{item.unit}</span>
                                            </td>
                                            <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{item.min_level}</td>
                                            <td className="px-6 py-4">
                                                {IsLow ? (
                                                    <span className="flex items-center gap-1 text-xs text-rose-600 dark:text-rose-400 bg-rose-500/10 px-2 py-1 rounded-full w-fit">
                                                        <AlertCircle size={12} /> Low Stock
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full">Optimal</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => handleEdit(item)}
                                                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all"
                                                    >
                                                        <Edit size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(item.id)}
                                                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-all"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {showAddModal && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[200] transition-all animate-in fade-in">
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-2xl shadow-2xl">
                            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-transparent rounded-t-2xl">
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{isEditing ? 'Edit Item' : 'Add Inventory Item'}</h3>
                                <button onClick={closeModal} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-500 dark:text-slate-400 transition-colors">
                                    <Plus size={24} className="rotate-45" />
                                </button>
                            </div>
                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                <div>
                                    <label className="label-standard">Item Name</label>
                                    <input
                                        required
                                        type="text"
                                        value={formData.item_name}
                                        onChange={(e) => setFormData({ ...formData, item_name: e.target.value })}
                                        className="input-standard"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="label-standard">Quantity</label>
                                        <input
                                            type="number"
                                            value={formData.quantity}
                                            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                            className="input-standard"
                                        />
                                    </div>
                                    <div>
                                        <label className="label-standard">Unit</label>
                                        <select
                                            value={formData.unit}
                                            onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                                            className="input-standard cursor-pointer"
                                        >
                                            <option>Meters</option>
                                            <option>Pieces</option>
                                            <option>Rolls</option>
                                            <option>Boxes</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="label-standard">Minimum Alert Level</label>
                                        <input
                                            type="number"
                                            value={formData.min_level}
                                            onChange={(e) => setFormData({ ...formData, min_level: e.target.value })}
                                            className="input-standard"
                                        />
                                    </div>
                                    <div>
                                        <label className="label-standard">Cost per Unit (LKR)</label>
                                        <input
                                            type="number"
                                            placeholder="0.00"
                                            value={formData.cost_price}
                                            onChange={(e) => setFormData({ ...formData, cost_price: e.target.value })}
                                            className="input-standard"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="label-standard flex items-center gap-1"><Truck size={13} /> Supplier</label>
                                    <select
                                        value={formData.supplier_id}
                                        onChange={(e) => setFormData({ ...formData, supplier_id: e.target.value })}
                                        className="input-standard cursor-pointer"
                                    >
                                        <option value="">No Supplier / Unknown</option>
                                        {suppliers.map(s => (
                                            <option key={s.id} value={s.id}>{s.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="pt-4">
                                    <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 py-4 rounded-xl font-bold text-white transition-all shadow-xl shadow-blue-500/20 uppercase tracking-[0.2em] text-[10px]">
                                        {isEditing ? 'Update Item' : 'Add to Inventory'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>

            {/* Print View - Only shows when printing */}
            <div className="hidden print:block p-10 bg-white min-h-screen">
                <div className="flex justify-between items-center mb-10 border-b-2 border-slate-900 pb-6 text-slate-900">
                    <div>
                        <h1 className="text-4xl font-black uppercase tracking-tighter">Inventory Report</h1>
                        <p className="text-slate-500 font-bold uppercase text-xs tracking-widest mt-1">Stock Level Summary • {new Date().toLocaleDateString()}</p>
                    </div>
                </div>

                <table className="w-full text-left border-collapse border-slate-900 text-slate-900">
                    <thead>
                        <tr className="border-b-2 border-slate-900">
                            <th className="py-4 text-xs font-black uppercase tracking-widest">Item Name</th>
                            <th className="py-4 text-xs font-black uppercase tracking-widest">Current Stock</th>
                            <th className="py-4 text-xs font-black uppercase tracking-widest">Min Level</th>
                            <th className="py-4 text-xs font-black uppercase tracking-widest">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                        {items.map(item => (
                            <tr key={item.id}>
                                <td className="py-4 font-bold uppercase text-sm border-b border-slate-100">{item.item_name}</td>
                                <td className="py-4 text-sm font-mono border-b border-slate-100">{item.quantity} {item.unit}</td>
                                <td className="py-4 text-sm font-mono text-slate-500 border-b border-slate-100">{item.min_level}</td>
                                <td className="py-4 border-b border-slate-100">
                                    <span className={`text-[10px] font-black uppercase ${item.quantity <= item.min_level ? 'text-rose-600' : 'text-emerald-600'}`}>
                                        {item.quantity <= item.min_level ? 'Low Stock' : 'In Stock'}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="mt-20 flex justify-between pt-10 border-t border-slate-200 text-slate-900">
                    <div className="text-center">
                        <div className="w-40 border-b border-slate-900 mb-2"></div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Inventory Manager</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-mono">Total Unique Items: {items.length}</p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Inventory;
