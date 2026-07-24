'use client';

import React, { useState, useEffect } from 'react';
import axiosInstance from '@/lib/axiosInstance';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2, MapPin, Phone, User, Clock, CheckCircle, XCircle, Store } from 'lucide-react';

interface Address {
  street: string;
  city: string;
  state: string;
  pincode: string;
}

interface Branch {
  _id: string;
  restaurantId: string;
  name: string;
  address: Address;
  phone: string;
  managerName: string;
  isActive: boolean;
  openingTime: string;
  closingTime: string;
}

export default function BranchesPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    managerName: '',
    openingTime: '09:00',
    closingTime: '22:00',
    address: {
      street: '',
      city: '',
      state: '',
      pincode: ''
    }
  });

  const fetchBranches = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get('/branches');
      if (res.data.success) {
        setBranches(res.data.data);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch branches');
      setBranches([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  const handleOpenModal = (branch?: Branch) => {
    if (branch) {
      setEditingId(branch._id);
      setFormData({
        name: branch.name,
        phone: branch.phone,
        managerName: branch.managerName,
        openingTime: branch.openingTime,
        closingTime: branch.closingTime,
        address: { ...branch.address }
      });
    } else {
      setEditingId(null);
      setFormData({
        name: '',
        phone: '',
        managerName: '',
        openingTime: '09:00',
        closingTime: '22:00',
        address: { street: '', city: '', state: '', pincode: '' }
      });
    }
    setShowModal(true);
  };

  const handleAddressChange = (field: keyof Address, value: string) => {
    setFormData({
      ...formData,
      address: {
        ...formData.address,
        [field]: value
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        const res = await axiosInstance.put(`/branches/${editingId}`, formData);
        if (res.data.success) {
          toast.success('Branch updated successfully');
        }
      } else {
        const res = await axiosInstance.post('/branches', formData);
        if (res.data.success) {
          toast.success('Branch created successfully');
        }
      }
      setShowModal(false);
      fetchBranches();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save branch');
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const res = await axiosInstance.put(`/branches/${id}`, { isActive: !currentStatus });
      if (res.data.success) {
        toast.success(`Branch ${!currentStatus ? 'activated' : 'deactivated'}`);
        fetchBranches();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update branch status');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this branch? This action cannot be undone.')) {
      try {
        const res = await axiosInstance.delete(`/branches/${id}`);
        if (res.data.success) {
          toast.success('Branch deleted successfully');
          fetchBranches();
        }
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Failed to delete branch');
      }
    }
  };

  const activeBranches = branches.filter(b => b.isActive).length;

  return (
    <div className="space-y-6">
      <div className="page-header items-center justify-between">
        <h1 className="page-title text-gray-900 dark:text-white flex items-center gap-2">
          <Store className="w-6 h-6" /> Branch Management
        </h1>
        <button onClick={() => handleOpenModal()} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Branch
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card p-5 border border-gray-200 dark:border-gray-700 flex items-center gap-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-full dark:bg-blue-900 dark:text-blue-300">
            <Store className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Total Branches</p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{branches.length}</h3>
          </div>
        </div>
        
        <div className="card p-5 border border-gray-200 dark:border-gray-700 flex items-center gap-4">
          <div className="p-3 bg-green-100 text-green-600 rounded-full dark:bg-green-900 dark:text-green-300">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Active Branches</p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{activeBranches}</h3>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card p-6 border border-gray-200 dark:border-gray-700 animate-pulse space-y-4">
              <div className="flex justify-between">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
              </div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      ) : branches.length === 0 ? (
        <div className="card p-12 text-center border border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center">
          <Store className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No branches configured</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">Start by adding your first restaurant branch to the system.</p>
          <button onClick={() => handleOpenModal()} className="btn-primary">Add First Branch</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {branches.map(branch => (
            <div key={branch._id} className="card border border-gray-200 dark:border-gray-700 flex flex-col relative overflow-hidden transition-all hover:shadow-lg">
              <div className={`absolute top-0 left-0 w-full h-1 ${branch.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
              
              <div className="p-5 flex-1">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">{branch.name}</h3>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full flex items-center gap-1 ${
                    branch.isActive ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                  }`}>
                    {branch.isActive ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                    {branch.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                
                <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>{branch.address.street}, {branch.address.city}, {branch.address.state} - {branch.address.pincode}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 shrink-0" />
                    <span>Manager: <strong className="text-gray-900 dark:text-gray-200">{branch.managerName}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 shrink-0" />
                    <span>{branch.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 shrink-0" />
                    <span>{branch.openingTime} - {branch.closingTime}</span>
                  </div>
                </div>
              </div>
              
              <div className="border-t border-gray-200 dark:border-gray-700 p-3 bg-gray-50 dark:bg-gray-800/50 flex gap-2">
                <button 
                  onClick={() => handleToggleActive(branch._id, branch.isActive)}
                  className={`flex-1 py-1.5 px-3 rounded text-sm font-medium transition-colors ${
                    branch.isActive 
                      ? 'bg-orange-100 text-orange-700 hover:bg-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:hover:bg-orange-900/50' 
                      : 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50'
                  }`}
                >
                  {branch.isActive ? 'Deactivate' : 'Activate'}
                </button>
                <button 
                  onClick={() => handleOpenModal(branch)}
                  className="p-1.5 text-blue-600 hover:bg-blue-100 rounded dark:text-blue-400 dark:hover:bg-blue-900/30 transition-colors"
                  title="Edit Branch"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => handleDelete(branch._id)}
                  className="p-1.5 text-red-600 hover:bg-red-100 rounded dark:text-red-400 dark:hover:bg-red-900/30 transition-colors"
                  title="Delete Branch"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm modal-overlay overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl overflow-hidden modal-box animate-fadeIn border border-gray-200 dark:border-gray-700 my-8">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center sticky top-0 bg-white dark:bg-gray-800 z-10">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {editingId ? 'Edit Branch' : 'Add New Branch'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                &times;
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Basic Information</h4>
                
                <div>
                  <label className="label text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Branch Name</label>
                  <input 
                    type="text" 
                    className="input-field w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g. Downtown Main"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Manager Name</label>
                    <input 
                      type="text" 
                      className="input-field w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      value={formData.managerName}
                      onChange={(e) => setFormData({...formData, managerName: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label className="label text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Phone Number</label>
                    <input 
                      type="tel" 
                      className="input-field w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Opening Time</label>
                    <input 
                      type="time" 
                      className="input-field w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      value={formData.openingTime}
                      onChange={(e) => setFormData({...formData, openingTime: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label className="label text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Closing Time</label>
                    <input 
                      type="time" 
                      className="input-field w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      value={formData.closingTime}
                      onChange={(e) => setFormData({...formData, closingTime: e.target.value})}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-t border-gray-200 dark:border-gray-700 pt-4">Location</h4>
                
                <div>
                  <label className="label text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Street Address</label>
                  <input 
                    type="text" 
                    className="input-field w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    value={formData.address.street}
                    onChange={(e) => handleAddressChange('street', e.target.value)}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="label text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">City</label>
                    <input 
                      type="text" 
                      className="input-field w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      value={formData.address.city}
                      onChange={(e) => handleAddressChange('city', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="label text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">State</label>
                    <input 
                      type="text" 
                      className="input-field w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      value={formData.address.state}
                      onChange={(e) => handleAddressChange('state', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="label text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Pincode</label>
                    <input 
                      type="text" 
                      className="input-field w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      value={formData.address.pincode}
                      onChange={(e) => handleAddressChange('pincode', e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700 sticky bottom-0 bg-white dark:bg-gray-800 pb-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1 py-2 rounded-lg font-medium bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors">
                  Cancel
                </button>
                <button type="submit" className="btn-primary flex-1 py-2 rounded-lg font-medium transition-colors">
                  {editingId ? 'Update Branch' : 'Create Branch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
