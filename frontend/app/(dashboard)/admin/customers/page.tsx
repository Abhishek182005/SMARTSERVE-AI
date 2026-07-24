'use client';
import { useState, useEffect } from 'react';
import axiosInstance from '@/lib/axiosInstance';
import { Search, Plus, Filter, Loader2, Edit, Trash2, Mail, Phone, MapPin, Award, Star, History } from 'lucide-react';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';

interface Customer {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  membershipTier: string;
  loyaltyPoints: number;
  totalSpent: number;
  totalOrders: number;
  isActive: boolean;
  createdAt: string;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await axiosInstance.get('/customers');
      setCustomers(res.data.data || res.data);
    } catch (error) {
      toast.error('Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: any) => {
    try {
      if (editingCustomer) {
        await axiosInstance.put(`/customers/${editingCustomer._id}`, data);
        toast.success('Customer updated');
      } else {
        await axiosInstance.post('/customers', data);
        toast.success('Customer added');
      }
      setIsModalOpen(false);
      fetchCustomers();
    } catch (error) {
      toast.error('Failed to save customer');
    }
  };

  const deleteCustomer = async (id: string) => {
    if (!confirm('Are you sure you want to delete this customer?')) return;
    try {
      await axiosInstance.delete(`/customers/${id}`);
      toast.success('Customer deleted');
      fetchCustomers();
    } catch (error) {
      toast.error('Failed to delete customer');
    }
  };

  const filtered = customers.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.phone.includes(searchQuery)
  );

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Platinum': return 'bg-slate-800 text-slate-200 border-slate-600';
      case 'Gold': return 'bg-yellow-100 text-yellow-800 border-yellow-400 dark:bg-yellow-900/30 dark:text-yellow-500';
      case 'Silver': return 'bg-gray-100 text-gray-800 border-gray-400 dark:bg-gray-700 dark:text-gray-300';
      default: return 'bg-orange-50 text-orange-800 border-orange-300 dark:bg-orange-900/30 dark:text-orange-400';
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn h-full flex flex-col">
      <div className="page-header shrink-0">
        <div>
          <h1 className="page-title">Customer Relationship</h1>
          <p className="text-gray-500 mt-1">Manage customer profiles, loyalty points, and history.</p>
        </div>
        <button 
          onClick={() => { setEditingCustomer(null); reset({ membershipTier: 'Bronze', loyaltyPoints: 0, totalOrders: 0, totalSpent: 0 }); setIsModalOpen(true); }}
          className="btn-primary"
        >
          <Plus className="w-4 h-4" /> Add Customer
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 shrink-0">
        <div className="card p-4 flex flex-col justify-center items-center text-center">
          <p className="text-sm font-medium text-gray-500">Total Customers</p>
          <p className="text-3xl font-black text-blue-600">{customers.length}</p>
        </div>
        <div className="card p-4 flex flex-col justify-center items-center text-center bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 border-yellow-500/20">
          <p className="text-sm font-medium text-yellow-700 dark:text-yellow-500">Gold/Platinum Members</p>
          <p className="text-3xl font-black text-yellow-600">{customers.filter(c => c.membershipTier === 'Gold' || c.membershipTier === 'Platinum').length}</p>
        </div>
        <div className="card p-4 flex flex-col justify-center items-center text-center">
          <p className="text-sm font-medium text-gray-500">Total Points Issued</p>
          <p className="text-3xl font-black text-purple-600">{customers.reduce((acc, c) => acc + (c.loyaltyPoints || 0), 0)}</p>
        </div>
        <div className="card p-4 flex flex-col justify-center items-center text-center">
          <p className="text-sm font-medium text-gray-500">Total Lifetime Value</p>
          <p className="text-3xl font-black text-green-600">₹{customers.reduce((acc, c) => acc + (c.totalSpent || 0), 0).toLocaleString()}</p>
        </div>
      </div>

      <div className="card flex-1 flex flex-col min-h-0 overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex gap-4 shrink-0">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by name or phone..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-9"
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900/50 p-4">
          {loading ? (
            <div className="flex items-center justify-center h-full"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map(customer => (
                <div key={customer._id} className="card p-5 relative group hover:border-blue-500 transition-colors">
                  <div className="absolute top-4 right-4 flex opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => { setEditingCustomer(customer); reset(customer); setIsModalOpen(true); }} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => deleteCustomer(customer._id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
                  </div>
                  
                  <div className="flex justify-between items-start mb-4 pr-12">
                    <div>
                      <h3 className="font-bold text-lg leading-tight">{customer.name}</h3>
                      <p className="text-sm text-gray-500">Joined {new Date(customer.createdAt).toLocaleDateString()}</p>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getTierColor(customer.membershipTier)}`}>
                      {customer.membershipTier}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-gray-400" /> {customer.phone}</div>
                    {customer.email && <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-gray-400" /> <span className="truncate">{customer.email}</span></div>}
                  </div>

                  <div className="grid grid-cols-3 gap-2 border-t border-gray-100 dark:border-gray-800 pt-4">
                    <div>
                      <p className="text-xs text-gray-500 flex items-center gap-1"><History className="w-3 h-3" /> Orders</p>
                      <p className="font-bold text-lg">{customer.totalOrders}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 flex items-center gap-1"><Star className="w-3 h-3" /> Spent</p>
                      <p className="font-bold text-lg text-green-600">₹{customer.totalSpent}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 flex items-center gap-1"><Award className="w-3 h-3" /> Pts</p>
                      <p className="font-bold text-lg text-purple-600">{customer.loyaltyPoints}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-box p-6">
            <h2 className="text-xl font-bold mb-4">{editingCustomer ? 'Edit Customer' : 'Add Customer'}</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div><label className="label">Full Name</label><input {...register('name')} className="input-field" required /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="label">Phone</label><input type="tel" {...register('phone')} className="input-field" required /></div>
                <div><label className="label">Email</label><input type="email" {...register('email')} className="input-field" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Tier</label>
                  <select {...register('membershipTier')} className="input-field">
                    <option value="Bronze">Bronze</option>
                    <option value="Silver">Silver</option>
                    <option value="Gold">Gold</option>
                    <option value="Platinum">Platinum</option>
                  </select>
                </div>
                <div><label className="label">Points</label><input type="number" {...register('loyaltyPoints', { valueAsNumber: true })} className="input-field" /></div>
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="btn-primary">
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}