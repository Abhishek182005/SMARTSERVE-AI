'use client';
import { useState, useEffect } from 'react';
import axiosInstance from '@/lib/axiosInstance';
import { Search, Plus, Filter, Loader2, Edit, Trash2, Phone, Mail, Building2, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';

interface Supplier {
  _id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  gstNumber: string;
  rating: number;
  isActive: boolean;
}

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<Supplier | null>(null);

  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const res = await axiosInstance.get('/suppliers');
      setSuppliers(res.data.data || res.data);
    } catch (error) {
      toast.error('Failed to load suppliers');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: any) => {
    try {
      if (editing) {
        await axiosInstance.put(`/suppliers/${editing._id}`, data);
      } else {
        await axiosInstance.post('/suppliers', data);
      }
      toast.success('Saved successfully');
      setIsModalOpen(false);
      fetchSuppliers();
    } catch (error) {
      toast.error('Operation failed');
    }
  };

  const deleteSupplier = async (id: string) => {
    if (!confirm('Delete this supplier?')) return;
    try {
      await axiosInstance.delete('/suppliers/' + id);
      toast.success('Supplier deleted');
      fetchSuppliers();
    } catch {
      toast.error('Failed to delete');
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn h-full flex flex-col">
      <div className="page-header shrink-0">
        <div>
          <h1 className="page-title">Suppliers</h1>
          <p className="text-gray-500 mt-1">Manage inventory suppliers and vendors.</p>
        </div>
        <button 
          onClick={() => { setEditing(null); reset({}); setIsModalOpen(true); }}
          className="btn-primary"
        >
          <Plus className="w-4 h-4" /> Add Supplier
        </button>
      </div>

      <div className="card flex-1 flex flex-col min-h-0 overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search suppliers..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-9"
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900/50 p-4">
          {loading ? (
            <div className="flex justify-center h-full items-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600"/></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {suppliers.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase())).map(supplier => (
                <div key={supplier._id} className="card p-5 relative group">
                  <div className="absolute top-4 right-4 flex opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => { setEditing(supplier); reset(supplier); setIsModalOpen(true); }} className="p-1.5 text-blue-600 bg-blue-50 rounded mr-1"><Edit className="w-3 h-3" /></button>
                    <button onClick={() => deleteSupplier(supplier._id)} className="p-1.5 text-red-600 bg-red-50 rounded"><Trash2 className="w-3 h-3" /></button>
                  </div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-600"><Building2 className="w-6 h-6" /></div>
                    <div>
                      <h3 className="font-bold text-lg">{supplier.name}</h3>
                      <p className="text-sm text-gray-500">{supplier.contactPerson}</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-gray-400" /> {supplier.phone}</div>
                    <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-gray-400" /> {supplier.email}</div>
                    <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-gray-400" /> {supplier.address}</div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-between text-sm">
                    <span className="font-medium text-gray-500">GST: {supplier.gstNumber}</span>
                    <span className={supplier.isActive ? "text-green-500 font-medium" : "text-red-500 font-medium"}>{supplier.isActive ? 'Active' : 'Inactive'}</span>
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
            <h2 className="text-xl font-bold mb-4">{editing ? 'Edit Supplier' : 'Add Supplier'}</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div><label className="label">Company Name</label><input {...register('name')} className="input-field" required /></div>
              <div><label className="label">Contact Person</label><input {...register('contactPerson')} className="input-field" required /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="label">Phone</label><input type="tel" {...register('phone')} className="input-field" required /></div>
                <div><label className="label">Email</label><input type="email" {...register('email')} className="input-field" /></div>
              </div>
              <div><label className="label">GST Number</label><input {...register('gstNumber')} className="input-field" /></div>
              <div><label className="label">Address</label><textarea {...register('address')} className="input-field" rows={2}></textarea></div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
