'use client';
import { useState, useEffect } from 'react';
import axiosInstance from '@/lib/axiosInstance';
import { Search, Plus, Filter, Loader2, Edit, Trash2, Package, AlertTriangle, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';

interface InventoryItem {
  _id: string;
  itemName: string;
  category: string;
  unit: string;
  currentStock: number;
  minimumStock: number;
  maximumStock?: number;
  costPerUnit: number;
  isActive: boolean;
  expiryDate?: string;
}

type FormValues = {
  itemName: string;
  category: string;
  unit: string;
  currentStock: number;
  minimumStock: number;
  maximumStock?: number;
  costPerUnit: number;
};

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLow, setFilterLow] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [stockUpdateId, setStockUpdateId] = useState<string | null>(null);
  const [stockDelta, setStockDelta] = useState<number>(0);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormValues>();

  useEffect(() => { fetchInventory(); }, []);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/inventory');
      setItems(res.data.data || []);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch inventory');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (item?: InventoryItem) => {
    setEditingItem(item ?? null);
    reset(item ? {
      itemName: item.itemName, category: item.category, unit: item.unit,
      currentStock: item.currentStock, minimumStock: item.minimumStock,
      maximumStock: item.maximumStock, costPerUnit: item.costPerUnit,
    } : {});
    setIsModalOpen(true);
  };

  const onSubmit = async (data: FormValues) => {
    try {
      if (editingItem) {
        await axiosInstance.put(`/inventory/${editingItem._id}`, data);
        toast.success('Item updated successfully');
      } else {
        await axiosInstance.post('/inventory', data);
        toast.success('Item added to inventory');
      }
      setIsModalOpen(false);
      fetchInventory();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save item');
    }
  };

  const deleteItem = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}" from inventory?`)) return;
    try {
      await axiosInstance.delete(`/inventory/${id}`);
      toast.success('Item deleted');
      fetchInventory();
    } catch {
      toast.error('Failed to delete item');
    }
  };

  const updateStock = async (id: string) => {
    if (stockDelta === 0) { toast.error('Enter a non-zero quantity'); return; }
    try {
      await axiosInstance.patch(`/inventory/${id}/stock`, { quantity: stockDelta });
      toast.success(`Stock ${stockDelta > 0 ? 'added' : 'deducted'} successfully`);
      setStockUpdateId(null);
      setStockDelta(0);
      fetchInventory();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update stock');
    }
  };

  const filtered = items.filter(item => {
    const matchSearch = item.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchLow = !filterLow || item.currentStock <= item.minimumStock;
    return matchSearch && matchLow;
  });

  const lowStockCount = items.filter(i => i.currentStock <= i.minimumStock).length;

  return (
    <div className="space-y-6 animate-fadeIn h-full flex flex-col">
      {/* Header */}
      <div className="page-header shrink-0">
        <div>
          <h1 className="page-title">Inventory Management</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Track raw materials, supplies, and stock levels.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchInventory} className="btn-secondary" title="Refresh"><RefreshCw className="w-4 h-4" /></button>
          <button onClick={() => openModal()} className="btn-primary">
            <Plus className="w-4 h-4" /> Add Item
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 shrink-0">
        <div className="card p-4 flex items-center gap-4">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-xl"><Package className="w-6 h-6" /></div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Items</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{items.length}</p>
          </div>
        </div>
        <div
          className={`card p-4 flex items-center gap-4 cursor-pointer transition-all ${filterLow ? 'ring-2 ring-red-500' : ''}`}
          onClick={() => setFilterLow(!filterLow)}
        >
          <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-xl"><AlertTriangle className="w-6 h-6" /></div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Low Stock Alerts {filterLow && '(filtered)'}</p>
            <p className="text-2xl font-bold text-red-600">{lowStockCount}</p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-4">
          <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-xl"><Package className="w-6 h-6" /></div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Healthy Stock</p>
            <p className="text-2xl font-bold text-green-600">{items.length - lowStockCount}</p>
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="card flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Filters */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row gap-3 shrink-0">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-9"
            />
          </div>
          <button
            onClick={() => setFilterLow(!filterLow)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${filterLow ? 'bg-red-50 border-red-300 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400' : 'btn-secondary'}`}
          >
            <Filter className="w-4 h-4" /> {filterLow ? 'All Items' : 'Low Stock Only'}
          </button>
        </div>

        {/* Data Table */}
        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <Package className="w-12 h-12 mb-3 opacity-20" />
              <p className="text-lg font-medium">No inventory items found</p>
              <p className="text-sm mt-1">Add your first item to start tracking stock</p>
            </div>
          ) : (
            <table className="min-w-full">
              <thead className="sticky top-0 bg-gray-50 dark:bg-gray-800 z-10">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Item Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Current Stock</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Min. Stock</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Cost/Unit</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700 bg-white dark:bg-gray-800">
                {filtered.map(item => {
                  const isLow = item.currentStock <= item.minimumStock;
                  return (
                    <tr key={item._id} className={`hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors ${isLow ? 'bg-red-50/50 dark:bg-red-900/5' : ''}`}>
                      <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">{item.itemName}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{item.category}</td>
                      <td className="px-4 py-3">
                        {stockUpdateId === item._id ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              value={stockDelta}
                              onChange={e => setStockDelta(Number(e.target.value))}
                              className="w-20 px-2 py-1 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                              placeholder="+/-"
                            />
                            <button onClick={() => updateStock(item._id)} className="px-2 py-1 bg-blue-600 text-white rounded text-xs">OK</button>
                            <button onClick={() => setStockUpdateId(null)} className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs">✕</button>
                          </div>
                        ) : (
                          <button
                            onClick={() => { setStockUpdateId(item._id); setStockDelta(0); }}
                            className={`font-bold text-sm hover:underline ${isLow ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-gray-300'}`}
                          >
                            {item.currentStock} {item.unit}
                          </button>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">{item.minimumStock} {item.unit}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-300">₹{item.costPerUnit}</td>
                      <td className="px-4 py-3">
                        <span className={isLow ? 'badge-red' : 'badge-green'}>{isLow ? '⚠ Low Stock' : 'Healthy'}</span>
                      </td>
                      <td className="px-4 py-3 text-right flex justify-end gap-2">
                        <button onClick={() => openModal(item)} className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => deleteItem(item._id, item.itemName)} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer count */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-700 text-sm text-gray-500 shrink-0">
          Showing {filtered.length} of {items.length} items
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setIsModalOpen(false)}>
          <div className="modal-box">
            <div className="sticky top-0 p-5 border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 z-10 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{editingItem ? 'Edit Item' : 'Add Inventory Item'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xl">✕</button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4">
              <div>
                <label className="label">Item Name *</label>
                <input {...register('itemName', { required: 'Required' })} className="input-field" placeholder="e.g., Tomatoes" />
                {errors.itemName && <p className="text-red-500 text-xs mt-1">{errors.itemName.message}</p>}
              </div>
              <div>
                <label className="label">Category *</label>
                <input {...register('category', { required: 'Required' })} className="input-field" placeholder="e.g., Vegetables, Dairy, Spices" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Unit *</label>
                  <select {...register('unit', { required: true })} className="input-field">
                    <option value="kg">kg</option>
                    <option value="g">g</option>
                    <option value="L">L (Litres)</option>
                    <option value="ml">ml</option>
                    <option value="pcs">pcs</option>
                    <option value="dozen">dozen</option>
                  </select>
                </div>
                <div>
                  <label className="label">Cost per Unit (₹) *</label>
                  <input type="number" step="0.01" min="0" {...register('costPerUnit', { required: true, valueAsNumber: true, min: 0 })} className="input-field" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Current Stock *</label>
                  <input type="number" step="0.01" min="0" {...register('currentStock', { required: true, valueAsNumber: true, min: 0 })} className="input-field" />
                </div>
                <div>
                  <label className="label">Minimum Stock *</label>
                  <input type="number" step="0.01" min="0" {...register('minimumStock', { required: true, valueAsNumber: true, min: 0 })} className="input-field" />
                </div>
              </div>
              <div>
                <label className="label">Maximum Stock</label>
                <input type="number" step="0.01" min="0" {...register('maximumStock', { valueAsNumber: true })} className="input-field" />
              </div>
              <div className="sticky bottom-0 pt-4 border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="btn-primary">
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : editingItem ? 'Update Item' : 'Add Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
