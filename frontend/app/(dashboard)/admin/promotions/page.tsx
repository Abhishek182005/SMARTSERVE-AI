'use client';
import { useState, useEffect } from 'react';
import axiosInstance from '@/lib/axiosInstance';
import { Tag, Plus, Loader2, Edit, Trash2, Copy, CheckCircle2, Percent, IndianRupee, Gift } from 'lucide-react';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';

interface Promotion {
  _id: string;
  name: string;
  code: string;
  type: 'Percentage' | 'Fixed' | 'BOGO' | 'FreeItem';
  discountValue?: number;
  minOrderAmount: number;
  maxDiscountAmount?: number;
  validFrom?: string;
  validUntil?: string;
  usageLimit?: number;
  usedCount: number;
  isActive: boolean;
}

export default function PromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState<Promotion | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const { register, handleSubmit, reset, watch, formState: { isSubmitting } } = useForm<any>();
  const promoType = watch('type', 'Percentage');

  useEffect(() => { fetchPromotions(); }, []);

  const fetchPromotions = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/promotions');
      setPromotions(res.data.data || []);
    } catch { toast.error('Failed to load promotions'); }
    finally { setLoading(false); }
  };

  const onSubmit = async (data: any) => {
    try {
      if (editingPromo) {
        await axiosInstance.put(`/promotions/${editingPromo._id}`, data);
        toast.success('Promotion updated');
      } else {
        await axiosInstance.post('/promotions', data);
        toast.success('Promotion created');
      }
      setIsModalOpen(false);
      fetchPromotions();
    } catch (e: any) { toast.error(e.response?.data?.message || 'Save failed'); }
  };

  const deletePromo = async (id: string) => {
    if (!confirm('Delete this promotion?')) return;
    try { await axiosInstance.delete(`/promotions/${id}`); toast.success('Deleted'); fetchPromotions(); }
    catch { toast.error('Delete failed'); }
  };

  const toggleActive = async (promo: Promotion) => {
    try {
      await axiosInstance.put(`/promotions/${promo._id}`, { isActive: !promo.isActive });
      toast.success(`Promotion ${promo.isActive ? 'deactivated' : 'activated'}`);
      fetchPromotions();
    } catch { toast.error('Failed to toggle status'); }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Code "${code}" copied!`);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const openModal = (promo?: Promotion) => {
    setEditingPromo(promo ?? null);
    reset(promo ? {
      name: promo.name, code: promo.code, type: promo.type,
      discountValue: promo.discountValue, minOrderAmount: promo.minOrderAmount,
      maxDiscountAmount: promo.maxDiscountAmount,
      validFrom: promo.validFrom?.split('T')[0], validUntil: promo.validUntil?.split('T')[0],
      usageLimit: promo.usageLimit,
    } : { type: 'Percentage', minOrderAmount: 0, isActive: true });
    setIsModalOpen(true);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Percentage': return <Percent className="w-4 h-4" />;
      case 'Fixed': return <IndianRupee className="w-4 h-4" />;
      case 'BOGO': return <Gift className="w-4 h-4" />;
      default: return <Tag className="w-4 h-4" />;
    }
  };

  const getDiscountLabel = (p: Promotion) => {
    if (p.type === 'Percentage') return `${p.discountValue}% off`;
    if (p.type === 'Fixed') return `₹${p.discountValue} off`;
    if (p.type === 'BOGO') return 'Buy 1 Get 1';
    return 'Free Item';
  };

  const isExpired = (p: Promotion) => p.validUntil && new Date(p.validUntil) < new Date();

  return (
    <div className="space-y-6 animate-fadeIn h-full flex flex-col">
      <div className="page-header shrink-0">
        <div>
          <h1 className="page-title">Promotions & Offers</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{promotions.filter(p => p.isActive).length} active promotions</p>
        </div>
        <button onClick={() => openModal()} className="btn-primary"><Plus className="w-4 h-4" /> Create Promotion</button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 shrink-0">
        <div className="card p-4 text-center"><p className="text-2xl font-black text-green-600">{promotions.filter(p => p.isActive).length}</p><p className="text-sm text-gray-500 mt-1">Active</p></div>
        <div className="card p-4 text-center"><p className="text-2xl font-black text-gray-600">{promotions.filter(p => !p.isActive).length}</p><p className="text-sm text-gray-500 mt-1">Inactive</p></div>
        <div className="card p-4 text-center"><p className="text-2xl font-black text-blue-600">{promotions.reduce((s, p) => s + p.usedCount, 0)}</p><p className="text-sm text-gray-500 mt-1">Total Uses</p></div>
      </div>

      {/* Promotions Grid */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
        ) : promotions.length === 0 ? (
          <div className="card p-12 flex flex-col items-center justify-center text-gray-400">
            <Tag className="w-16 h-16 mb-4 opacity-20" />
            <p className="text-xl font-medium">No promotions yet</p>
            <p className="text-sm mt-2">Create your first promotion to boost sales</p>
            <button onClick={() => openModal()} className="btn-primary mt-4">Create First Promotion</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {promotions.map(promo => (
              <div key={promo._id} className={`card p-5 relative group ${!promo.isActive || isExpired(promo) ? 'opacity-60' : ''}`}>
                {/* Badges */}
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <span className={`badge ${promo.type === 'Percentage' ? 'badge-blue' : promo.type === 'Fixed' ? 'badge-green' : 'badge-purple'} flex items-center gap-1`}>
                    {getTypeIcon(promo.type)} {promo.type}
                  </span>
                  {promo.isActive && !isExpired(promo) && <span className="badge-green">Active</span>}
                  {!promo.isActive && <span className="badge-gray">Inactive</span>}
                  {isExpired(promo) && <span className="badge-red">Expired</span>}
                </div>

                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{promo.name}</h3>
                <p className="text-2xl font-black text-blue-600 mb-3">{getDiscountLabel(promo)}</p>

                {/* Code */}
                <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-xl px-3 py-2 mb-3">
                  <code className="flex-1 font-mono font-bold text-gray-800 dark:text-gray-200 text-sm tracking-widest">{promo.code}</code>
                  <button onClick={() => copyCode(promo.code)} className="text-gray-400 hover:text-blue-600 transition-colors">
                    {copiedCode === promo.code ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                <div className="space-y-1 text-sm text-gray-500">
                  {promo.minOrderAmount > 0 && <p>Min. order: <span className="font-semibold text-gray-700 dark:text-gray-300">₹{promo.minOrderAmount}</span></p>}
                  {promo.usageLimit && <p>Usage: <span className="font-semibold text-gray-700 dark:text-gray-300">{promo.usedCount}/{promo.usageLimit}</span></p>}
                  {promo.validUntil && <p>Expires: <span className="font-semibold text-gray-700 dark:text-gray-300">{new Date(promo.validUntil).toLocaleDateString('en-IN')}</span></p>}
                </div>

                {/* Usage progress */}
                {promo.usageLimit && (
                  <div className="mt-3">
                    <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full">
                      <div className="h-1.5 rounded-full bg-blue-500" style={{ width: `${Math.min((promo.usedCount / promo.usageLimit) * 100, 100)}%` }} />
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => toggleActive(promo)} className={`p-1.5 rounded-lg ${promo.isActive ? 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/30' : 'text-green-600 bg-green-50 dark:bg-green-900/30'}`}>
                    {promo.isActive ? '⏸' : '▶'}
                  </button>
                  <button onClick={() => openModal(promo)} className="p-1.5 text-blue-600 bg-blue-50 dark:bg-blue-900/30 rounded-lg"><Edit className="w-3.5 h-3.5" /></button>
                  <button onClick={() => deletePromo(promo._id)} className="p-1.5 text-red-500 bg-red-50 dark:bg-red-900/30 rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setIsModalOpen(false)}>
          <div className="modal-box max-w-xl">
            <div className="sticky top-0 p-5 border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 z-10 flex justify-between">
              <h2 className="text-xl font-bold">{editingPromo ? 'Edit Promotion' : 'Create Promotion'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-700">✕</button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="label">Promotion Name *</label><input {...register('name', { required: true })} className="input-field" placeholder="e.g., Weekend Sale" /></div>
                <div><label className="label">Coupon Code *</label><input {...register('code', { required: true })} className="input-field" placeholder="e.g., SAVE20" style={{ textTransform: 'uppercase' }} /></div>
              </div>
              <div>
                <label className="label">Type *</label>
                <select {...register('type', { required: true })} className="input-field">
                  <option value="Percentage">Percentage Discount</option>
                  <option value="Fixed">Fixed Amount Off</option>
                  <option value="BOGO">Buy 1 Get 1</option>
                  <option value="FreeItem">Free Item</option>
                </select>
              </div>
              {(promoType === 'Percentage' || promoType === 'Fixed') && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">{promoType === 'Percentage' ? 'Discount %' : 'Amount Off (₹)'} *</label>
                    <input type="number" step="0.01" {...register('discountValue', { required: true, valueAsNumber: true })} className="input-field" />
                  </div>
                  {promoType === 'Percentage' && (
                    <div>
                      <label className="label">Max Discount (₹)</label>
                      <input type="number" step="0.01" {...register('maxDiscountAmount', { valueAsNumber: true })} className="input-field" />
                    </div>
                  )}
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div><label className="label">Min. Order Amount (₹)</label><input type="number" defaultValue={0} {...register('minOrderAmount', { valueAsNumber: true })} className="input-field" /></div>
                <div><label className="label">Usage Limit</label><input type="number" {...register('usageLimit', { valueAsNumber: true })} className="input-field" placeholder="Unlimited" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="label">Valid From</label><input type="date" {...register('validFrom')} className="input-field" /></div>
                <div><label className="label">Valid Until</label><input type="date" {...register('validUntil')} className="input-field" /></div>
              </div>
              <div className="sticky bottom-0 pt-4 border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="btn-primary">
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : editingPromo ? 'Update' : 'Create Promotion'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
