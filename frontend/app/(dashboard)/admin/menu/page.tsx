'use client';
import { useState, useEffect } from 'react';
import axiosInstance from '@/lib/axiosInstance';
import { Search, Plus, Loader2, Edit, Trash2, Star, UtensilsCrossed, Tag, RefreshCw, ImageOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';

interface MenuCategory { _id: string; name: string; description?: string; isActive: boolean; }
interface MenuItem {
  _id: string; name: string; description?: string; price: number; discountedPrice?: number;
  categoryId: MenuCategory | string; isVeg: boolean; isAvailable: boolean;
  preparationTime?: number; rating: number; isBestSeller: boolean; isSpecial: boolean;
}

export default function MenuPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'items' | 'categories'>('items');
  const [searchQuery, setSearchQuery] = useState('');
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [editingCat, setEditingCat] = useState<MenuCategory | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const itemForm = useForm<any>();
  const catForm = useForm<any>();

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [itemsRes, catRes] = await Promise.all([
        axiosInstance.get('/menu/items'),
        axiosInstance.get('/menu/categories'),
      ]);
      setItems(itemsRes.data.data || []);
      setCategories(catRes.data.data || []);
    } catch {
      toast.error('Failed to load menu data');
    } finally {
      setLoading(false);
    }
  };

  const onSubmitItem = async (data: any) => {
    try {
      const payload = { ...data, isVeg: data.isVeg === true || data.isVeg === 'true', isAvailable: data.isAvailable !== false };
      if (editingItem) {
        await axiosInstance.put(`/menu/items/${editingItem._id}`, payload);
        toast.success('Item updated');
      } else {
        await axiosInstance.post('/menu/items', payload);
        toast.success('Item added to menu');
      }
      setIsItemModalOpen(false);
      fetchData();
    } catch (e: any) { toast.error(e.response?.data?.message || 'Save failed'); }
  };

  const onSubmitCat = async (data: any) => {
    try {
      if (editingCat) {
        await axiosInstance.put(`/menu/categories/${editingCat._id}`, data);
        toast.success('Category updated');
      } else {
        await axiosInstance.post('/menu/categories', data);
        toast.success('Category created');
      }
      setIsCatModalOpen(false);
      fetchData();
    } catch (e: any) { toast.error(e.response?.data?.message || 'Save failed'); }
  };

  const deleteItem = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}" from menu?`)) return;
    try { await axiosInstance.delete(`/menu/items/${id}`); toast.success('Item deleted'); fetchData(); }
    catch { toast.error('Delete failed'); }
  };

  const deleteCat = async (id: string, name: string) => {
    if (!confirm(`Delete category "${name}"? This will not delete items in this category.`)) return;
    try { await axiosInstance.delete(`/menu/categories/${id}`); toast.success('Category deleted'); fetchData(); }
    catch { toast.error('Delete failed'); }
  };

  const openItemModal = (item?: MenuItem) => {
    setEditingItem(item ?? null);
    itemForm.reset(item ? {
      name: item.name, description: item.description, price: item.price,
      discountedPrice: item.discountedPrice, categoryId: typeof item.categoryId === 'object' ? (item.categoryId as MenuCategory)._id : item.categoryId,
      isVeg: item.isVeg, isAvailable: item.isAvailable, preparationTime: item.preparationTime,
      isBestSeller: item.isBestSeller, isSpecial: item.isSpecial,
    } : { isVeg: true, isAvailable: true });
    setIsItemModalOpen(true);
  };

  const openCatModal = (cat?: MenuCategory) => {
    setEditingCat(cat ?? null);
    catForm.reset(cat ? { name: cat.name, description: cat.description } : {});
    setIsCatModalOpen(true);
  };

  const filteredItems = items.filter(i => {
    const matchSearch = i.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = selectedCategory === 'all' || (
      typeof i.categoryId === 'object' ? (i.categoryId as MenuCategory)._id === selectedCategory : i.categoryId === selectedCategory
    );
    return matchSearch && matchCat;
  });

  const getCatName = (c: MenuCategory | string) => typeof c === 'object' ? c.name : categories.find(cat => cat._id === c)?.name ?? '—';

  return (
    <div className="space-y-6 animate-fadeIn h-full flex flex-col">
      <div className="page-header shrink-0">
        <div>
          <h1 className="page-title">Menu Management</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{items.length} items across {categories.length} categories</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => openCatModal()} className="btn-secondary"><Plus className="w-4 h-4" /> Add Category</button>
          <button onClick={() => openItemModal()} className="btn-primary"><Plus className="w-4 h-4" /> Add Item</button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 dark:border-gray-700 shrink-0">
        {(['items', 'categories'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors capitalize ${activeTab === tab ? 'border-blue-600 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            {tab === 'items' ? `Menu Items (${items.length})` : `Categories (${categories.length})`}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
        ) : activeTab === 'items' ? (
          <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" placeholder="Search items…" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="input-field pl-9" />
              </div>
              <div className="flex gap-2 overflow-x-auto hide-scrollbar">
                <button onClick={() => setSelectedCategory('all')} className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${selectedCategory === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>All</button>
                {categories.map(c => (
                  <button key={c._id} onClick={() => setSelectedCategory(c._id)} className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${selectedCategory === c._id ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>{c.name}</button>
                ))}
              </div>
            </div>

            {filteredItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                <UtensilsCrossed className="w-12 h-12 mb-3 opacity-20" />
                <p className="font-medium">No items found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredItems.map(item => (
                  <div key={item._id} className="card p-4 group hover:shadow-md transition-shadow relative flex flex-col">
                    {/* Badges */}
                    <div className="flex gap-1 mb-3 flex-wrap">
                      <div className={`w-4 h-4 border-2 rounded-sm flex items-center justify-center flex-shrink-0 ${item.isVeg ? 'border-green-500' : 'border-red-500'}`}>
                        <div className={`w-2 h-2 rounded-full ${item.isVeg ? 'bg-green-500' : 'bg-red-500'}`} />
                      </div>
                      {item.isBestSeller && <span className="badge-yellow">⭐ Best</span>}
                      {item.isSpecial && <span className="badge-purple">✨ Special</span>}
                      {!item.isAvailable && <span className="badge-red">Unavailable</span>}
                    </div>

                    {/* Image placeholder */}
                    <div className="w-full h-24 bg-gray-100 dark:bg-gray-700 rounded-xl mb-3 flex items-center justify-center text-3xl">
                      {item.isVeg ? '🥗' : '🍗'}
                    </div>

                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 dark:text-white leading-tight">{item.name}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">{getCatName(item.categoryId)}</p>
                      {item.description && <p className="text-xs text-gray-400 mt-1 line-clamp-2">{item.description}</p>}
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                      <div>
                        <span className="font-black text-blue-600">₹{item.discountedPrice || item.price}</span>
                        {item.discountedPrice && <span className="text-xs text-gray-400 line-through ml-1.5">₹{item.price}</span>}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                        {item.rating.toFixed(1)}
                      </div>
                    </div>

                    {/* Action overlay */}
                    <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openItemModal(item)} className="p-1.5 bg-white dark:bg-gray-700 shadow-md rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors">
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => deleteItem(item._id, item.name)} className="p-1.5 bg-white dark:bg-gray-700 shadow-md rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map(cat => (
              <div key={cat._id} className="card p-5 group hover:shadow-md transition-shadow relative">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2.5 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-xl"><Tag className="w-5 h-5" /></div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">{cat.name}</h3>
                    <p className="text-xs text-gray-500">{items.filter(i => typeof i.categoryId === 'object' ? (i.categoryId as MenuCategory)._id === cat._id : i.categoryId === cat._id).length} items</p>
                  </div>
                </div>
                {cat.description && <p className="text-sm text-gray-400 mt-2">{cat.description}</p>}
                <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openCatModal(cat)} className="p-1.5 bg-white dark:bg-gray-700 shadow rounded-lg text-blue-600"><Edit className="w-3.5 h-3.5" /></button>
                  <button onClick={() => deleteCat(cat._id, cat.name)} className="p-1.5 bg-white dark:bg-gray-700 shadow rounded-lg text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            ))}
            <button onClick={() => openCatModal()} className="card p-5 border-dashed border-2 border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-blue-500 hover:text-blue-500 transition-colors min-h-[100px]">
              <Plus className="w-6 h-6" />
              <span className="font-medium text-sm">Add Category</span>
            </button>
          </div>
        )}
      </div>

      {/* Item Modal */}
      {isItemModalOpen && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setIsItemModalOpen(false)}>
          <div className="modal-box max-w-xl">
            <div className="sticky top-0 p-5 border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 z-10 flex justify-between">
              <h2 className="text-xl font-bold">{editingItem ? 'Edit Menu Item' : 'Add Menu Item'}</h2>
              <button onClick={() => setIsItemModalOpen(false)} className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">✕</button>
            </div>
            <form onSubmit={itemForm.handleSubmit(onSubmitItem)} className="p-5 space-y-4">
              <div><label className="label">Item Name *</label><input {...itemForm.register('name', { required: true })} className="input-field" /></div>
              <div><label className="label">Category *</label>
                <select {...itemForm.register('categoryId', { required: true })} className="input-field">
                  <option value="">Select category…</option>
                  {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>
              <div><label className="label">Description</label><textarea {...itemForm.register('description')} className="input-field" rows={2} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="label">Price (₹) *</label><input type="number" step="0.01" {...itemForm.register('price', { required: true, valueAsNumber: true })} className="input-field" /></div>
                <div><label className="label">Discounted Price (₹)</label><input type="number" step="0.01" {...itemForm.register('discountedPrice', { valueAsNumber: true })} className="input-field" /></div>
              </div>
              <div><label className="label">Preparation Time (minutes)</label><input type="number" {...itemForm.register('preparationTime', { valueAsNumber: true })} className="input-field" /></div>
              <div className="flex flex-wrap gap-4 items-center">
                <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                  <input type="checkbox" {...itemForm.register('isVeg')} className="w-4 h-4 rounded accent-green-500" />
                  <span className="text-green-600">Vegetarian</span>
                </label>
                <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                  <input type="checkbox" {...itemForm.register('isAvailable')} className="w-4 h-4 rounded accent-blue-500" />
                  <span>Available</span>
                </label>
                <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                  <input type="checkbox" {...itemForm.register('isBestSeller')} className="w-4 h-4 rounded accent-yellow-500" />
                  <span>Best Seller</span>
                </label>
                <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                  <input type="checkbox" {...itemForm.register('isSpecial')} className="w-4 h-4 rounded accent-purple-500" />
                  <span>Special</span>
                </label>
              </div>
              <div className="sticky bottom-0 pt-4 border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 flex justify-end gap-3">
                <button type="button" onClick={() => setIsItemModalOpen(false)} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={itemForm.formState.isSubmitting} className="btn-primary">
                  {itemForm.formState.isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : editingItem ? 'Update' : 'Add Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {isCatModalOpen && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setIsCatModalOpen(false)}>
          <div className="modal-box max-w-md">
            <div className="sticky top-0 p-5 border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 z-10 flex justify-between">
              <h2 className="text-xl font-bold">{editingCat ? 'Edit Category' : 'Add Category'}</h2>
              <button onClick={() => setIsCatModalOpen(false)} className="text-gray-400 hover:text-gray-700">✕</button>
            </div>
            <form onSubmit={catForm.handleSubmit(onSubmitCat)} className="p-5 space-y-4">
              <div><label className="label">Category Name *</label><input {...catForm.register('name', { required: true })} className="input-field" placeholder="e.g., Starters, Mains, Desserts" /></div>
              <div><label className="label">Description</label><textarea {...catForm.register('description')} className="input-field" rows={2} /></div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setIsCatModalOpen(false)} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={catForm.formState.isSubmitting} className="btn-primary">
                  {catForm.formState.isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : editingCat ? 'Update' : 'Add Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}