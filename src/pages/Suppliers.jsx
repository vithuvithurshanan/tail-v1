import React, { useState, useEffect } from 'react';
import { supplierService, inventoryService } from '../services/db';
import toast from 'react-hot-toast';
import {
    Truck,
    Plus,
    Phone,
    MapPin,
    FileText,
    Edit,
    Trash2,
    X,
    Package,
    Search,
    ChevronRight
} from 'lucide-react';

const Suppliers = () => {
    const [suppliers, setSuppliers] = useState([]);
    const [inventory, setInventory] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);
    const [selectedSupplier, setSelectedSupplier] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        contact: '',
        address: '',
        notes: ''
    });

    const fetchData = async () => {
        try {
            const [suppliersData, inventoryData] = await Promise.all([
                supplierService.getAll(),
                inventoryService.getAll()
            ]);
            setSuppliers(suppliersData);
            setInventory(inventoryData);
        } catch (err) {
            console.error(err);
            toast.error('Failed to load supplier data');
        }
    };

    useEffect(() => { fetchData(); }, []);

    const getSupplierItems = (supplierId) =>
        inventory.filter(item => item.supplier_id === supplierId);

    const getSupplierTotalCost = (supplierId) =>
        getSupplierItems(supplierId).reduce((sum, item) => sum + (Number(item.cost_price) || 0) * (Number(item.quantity) || 0), 0);

    const filteredSuppliers = suppliers.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.contact || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await supplierService.update(editId, formData);
                toast.success('Supplier updated successfully!');
            } else {
                await supplierService.add(formData);
                toast.success('Supplier added successfully!');
            }
            closeModal();
            fetchData();
        } catch (err) {
            toast.error(err.message || 'Error saving supplier');
        }
    };

    const handleEdit = (supplier) => {
        setFormData({
            name: supplier.name || '',
            contact: supplier.contact || '',
            address: supplier.address || '',
            notes: supplier.notes || ''
        });
        setEditId(supplier.id);
        setIsEditing(true);
        setShowAddModal(true);
    };

    const handleDelete = async (id) => {
        const items = getSupplierItems(id);
        if (items.length > 0) {
            if (!window.confirm(`This supplier has ${items.length} inventory item(s) linked. Delete anyway? Those items will lose their supplier link.`)) return;
        } else {
            if (!window.confirm('Delete this supplier?')) return;
        }
        try {
            await supplierService.delete(id);
            toast.success('Supplier deleted');
            if (selectedSupplier?.id === id) setSelectedSupplier(null);
            fetchData();
        } catch (err) {
            toast.error(err.message || 'Error deleting supplier');
        }
    };

    const closeModal = () => {
        setShowAddModal(false);
        setIsEditing(false);
        setEditId(null);
        setFormData({ name: '', contact: '', address: '', notes: '' });
    };

    return (
        <div className="page-container">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <div>
                    <h1 className="page-header-h1">Suppliers</h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium tracking-tight">
                        Manage fabric & material suppliers and their inventory contributions.
                    </p>
                </div>
                <button onClick={() => setShowAddModal(true)} className="btn-primary">
                    <Plus size={18} /> Add Supplier
                </button>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm">
                    <p className="text-sm text-slate-500 dark:text-slate-400">Total Suppliers</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{suppliers.length}</p>
                </div>
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm">
                    <p className="text-sm text-slate-500 dark:text-slate-400">Items Sourced</p>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {inventory.filter(i => i.supplier_id).length}
                    </p>
                </div>
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm">
                    <p className="text-sm text-slate-500 dark:text-slate-400">Total Purchase Value</p>
                    <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                        LKR {inventory.reduce((s, i) => s + (Number(i.cost_price) || 0) * (Number(i.quantity) || 0), 0).toLocaleString()}
                    </p>
                </div>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search suppliers by name or contact..."
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white shadow-sm transition-all"
                />
            </div>

            {/* Two-panel layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Supplier List */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                    <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 flex items-center gap-2">
                        <Truck size={16} className="text-blue-500" />
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm uppercase tracking-widest">Supplier Directory</h3>
                    </div>
                    {filteredSuppliers.length === 0 ? (
                        <div className="p-12 text-center text-slate-400 italic text-sm">
                            No suppliers found. Add your first supplier.
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                            {filteredSuppliers.map(supplier => {
                                const itemCount = getSupplierItems(supplier.id).length;
                                const totalCost = getSupplierTotalCost(supplier.id);
                                const isSelected = selectedSupplier?.id === supplier.id;
                                return (
                                    <div
                                        key={supplier.id}
                                        onClick={() => setSelectedSupplier(isSelected ? null : supplier)}
                                        className={`p-5 cursor-pointer transition-all flex items-center justify-between gap-4 group ${isSelected
                                            ? 'bg-blue-50 dark:bg-blue-500/10 border-l-4 border-blue-500'
                                            : 'hover:bg-slate-50 dark:hover:bg-slate-800/30 border-l-4 border-transparent'
                                            }`}
                                    >
                                        <div className="flex items-center gap-4 flex-1 min-w-0">
                                            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-lg flex-shrink-0">
                                                {supplier.name[0].toUpperCase()}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-bold text-slate-900 dark:text-white truncate">{supplier.name}</p>
                                                <div className="flex items-center gap-3 mt-0.5">
                                                    {supplier.contact && (
                                                        <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                                            <Phone size={10} /> {supplier.contact}
                                                        </span>
                                                    )}
                                                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${itemCount > 0 ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                                                        {itemCount} item{itemCount !== 1 ? 's' : ''}
                                                    </span>
                                                    {totalCost > 0 && (
                                                        <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                                                            LKR {totalCost.toLocaleString()}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 flex-shrink-0">
                                            <button
                                                onClick={e => { e.stopPropagation(); handleEdit(supplier); }}
                                                className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-all"
                                            >
                                                <Edit size={15} />
                                            </button>
                                            <button
                                                onClick={e => { e.stopPropagation(); handleDelete(supplier.id); }}
                                                className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all"
                                            >
                                                <Trash2 size={15} />
                                            </button>
                                            <ChevronRight size={16} className={`text-slate-300 transition-transform ${isSelected ? 'rotate-90' : ''}`} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Supplier Detail Panel */}
                <div>
                    {selectedSupplier ? (
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm animate-in fade-in duration-200">
                            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg">
                                            {selectedSupplier.name[0].toUpperCase()}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-900 dark:text-white">{selectedSupplier.name}</h3>
                                            <p className="text-xs text-slate-500">Supplier Details</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setSelectedSupplier(null)} className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400">
                                        <X size={18} />
                                    </button>
                                </div>
                            </div>

                            {/* Info */}
                            <div className="p-6 space-y-3 border-b border-slate-100 dark:border-slate-800">
                                {selectedSupplier.contact && (
                                    <div className="flex items-center gap-3 text-sm">
                                        <Phone size={15} className="text-blue-500 flex-shrink-0" />
                                        <span className="text-slate-700 dark:text-slate-300 font-medium">{selectedSupplier.contact}</span>
                                    </div>
                                )}
                                {selectedSupplier.address && (
                                    <div className="flex items-start gap-3 text-sm">
                                        <MapPin size={15} className="text-blue-500 flex-shrink-0 mt-0.5" />
                                        <span className="text-slate-700 dark:text-slate-300">{selectedSupplier.address}</span>
                                    </div>
                                )}
                                {selectedSupplier.notes && (
                                    <div className="flex items-start gap-3 text-sm">
                                        <FileText size={15} className="text-blue-500 flex-shrink-0 mt-0.5" />
                                        <span className="text-slate-500 dark:text-slate-400 italic">{selectedSupplier.notes}</span>
                                    </div>
                                )}
                            </div>

                            {/* Linked Inventory Items */}
                            <div className="p-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <Package size={15} className="text-blue-500" />
                                    <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                                        Inventory Items from this Supplier
                                    </h4>
                                </div>
                                {getSupplierItems(selectedSupplier.id).length === 0 ? (
                                    <p className="text-sm text-slate-400 italic text-center py-6">
                                        No inventory items linked to this supplier yet.
                                    </p>
                                ) : (
                                    <div className="space-y-2">
                                        {getSupplierItems(selectedSupplier.id).map(item => (
                                            <div key={item.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                                                <div>
                                                    <p className="font-bold text-slate-900 dark:text-white text-sm">{item.item_name}</p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                                        {item.quantity} {item.unit} in stock
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold text-blue-600 dark:text-blue-400 text-sm">
                                                        LKR {Number(item.cost_price || 0).toLocaleString()}
                                                        <span className="text-slate-400 font-normal text-xs"> / unit</span>
                                                    </p>
                                                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                                                        Total: LKR {(Number(item.cost_price || 0) * Number(item.quantity || 0)).toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                        {/* Total Cost Bar */}
                                        <div className="flex justify-between items-center pt-3 mt-2 border-t border-slate-200 dark:border-slate-700">
                                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Total Purchase Value</span>
                                            <span className="font-black text-slate-900 dark:text-white">
                                                LKR {getSupplierTotalCost(selectedSupplier.id).toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-12 flex flex-col items-center justify-center text-center gap-4 h-full min-h-[300px]">
                            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                <Truck size={32} className="text-slate-400" />
                            </div>
                            <div>
                                <p className="font-bold text-slate-500 dark:text-slate-400">Select a supplier</p>
                                <p className="text-sm text-slate-400 mt-1">Click any supplier to see their inventory items and costs</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Add/Edit Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
                        <div className="p-6 bg-blue-600 text-white flex justify-between items-center">
                            <h3 className="text-xl font-bold">{isEditing ? 'Edit Supplier' : 'Add New Supplier'}</h3>
                            <button onClick={closeModal} className="hover:bg-white/10 rounded p-1 transition-colors"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="label-standard">Supplier Name *</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="e.g. Rajam Textiles"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="input-standard"
                                />
                            </div>
                            <div>
                                <label className="label-standard">Contact Number</label>
                                <input
                                    type="text"
                                    placeholder="+94 77 000 0000"
                                    value={formData.contact}
                                    onChange={e => setFormData({ ...formData, contact: e.target.value })}
                                    className="input-standard"
                                />
                            </div>
                            <div>
                                <label className="label-standard">Address</label>
                                <input
                                    type="text"
                                    placeholder="Street, City"
                                    value={formData.address}
                                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                                    className="input-standard"
                                />
                            </div>
                            <div>
                                <label className="label-standard">Notes (Optional)</label>
                                <textarea
                                    rows={3}
                                    placeholder="Any additional notes..."
                                    value={formData.notes}
                                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                    className="input-standard resize-none"
                                />
                            </div>
                            <div className="pt-2">
                                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-xl font-bold text-white transition-all shadow-lg shadow-blue-500/20">
                                    {isEditing ? 'Update Supplier' : 'Add Supplier'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Suppliers;
