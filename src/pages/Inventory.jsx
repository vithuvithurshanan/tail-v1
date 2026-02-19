import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
    Package,
    Plus,
    Search,
    AlertCircle,
    RefreshCw,
    MoreVertical,
    Trash2,
    Edit
} from 'lucide-react';

const Inventory = () => {
    const [items, setItems] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);
    const [formData, setFormData] = useState({
        item_name: '',
        quantity: 0,
        min_level: 5,
        unit: 'Meters'
    });
    const [searchQuery, setSearchQuery] = useState('');

    const fetchInventory = async () => {
        try {
            const res = await axios.get('http://localhost:3001/api/inventory');
            setItems(res.data);
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
                await axios.patch(`http://localhost:3001/api/inventory/${editId}`, formData);
                toast.success('Inventory item updated!');
            } else {
                await axios.post('http://localhost:3001/api/inventory', formData);
                toast.success('Item added to inventory!');
            }
            setShowAddModal(false);
            setIsEditing(false);
            setEditId(null);
            fetchInventory();
            setFormData({ item_name: '', quantity: 0, min_level: 5, unit: 'Meters' });
        } catch (err) {
            toast.error(err.response?.data?.error || `Error ${isEditing ? 'updating' : 'adding'} item`);
        }
    };

    const handleEdit = (item) => {
        setFormData({
            item_name: item.item_name || '',
            quantity: item.quantity ?? '',
            min_level: item.min_level ?? '',
            unit: item.unit || 'Meters'
        });
        setEditId(item.id);
        setIsEditing(true);
        setShowAddModal(true);
    };

    const closeModal = () => {
        setShowAddModal(false);
        setIsEditing(false);
        setEditId(null);
        setFormData({ item_name: '', quantity: 0, min_level: 5, unit: 'Meters' });
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this item?")) return;
        try {
            await axios.delete(`http://localhost:3001/api/inventory/${id}`);
            toast.success('Item deleted successfully!');
            fetchInventory();
        } catch (err) {
            toast.error(err.response?.data?.error || "Error deleting item");
        }
    };

    return (
        <div className="p-6 md:p-10 lg:p-12 w-full space-y-6 transition-all duration-300">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">Inventory</h1>
                    <p className="text-slate-500 dark:text-slate-400">Track fabric, threads, and tailoring accessories.</p>
                </div>
                <button
                    onClick={() => { setShowAddModal(true); setIsEditing(false); }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-transform active:scale-95 shadow-lg shadow-blue-500/20"
                >
                    <Plus size={20} /> Add Item
                </button>
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
                    <table className="w-full text-left min-w-[700px]">
                        <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase">Item Name</th>
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
                                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Item Name</label>
                                <input
                                    required
                                    type="text"
                                    value={formData.item_name}
                                    onChange={(e) => setFormData({ ...formData, item_name: e.target.value })}
                                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white transition-all shadow-sm"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Quantity</label>
                                    <input
                                        type="number"
                                        value={formData.quantity}
                                        onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white transition-all shadow-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Unit</label>
                                    <select
                                        value={formData.unit}
                                        onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                                        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white transition-all shadow-sm"
                                    >
                                        <option>Meters</option>
                                        <option>Pieces</option>
                                        <option>Rolls</option>
                                        <option>Boxes</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Minimum Alert Level</label>
                                <input
                                    type="number"
                                    value={formData.min_level}
                                    onChange={(e) => setFormData({ ...formData, min_level: e.target.value })}
                                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white transition-all shadow-sm"
                                />
                            </div>
                            <div className="pt-4">
                                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-xl font-bold text-white transition-all shadow-lg shadow-blue-500/20">
                                    {isEditing ? 'Update Item' : 'Add to Inventory'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Inventory;
