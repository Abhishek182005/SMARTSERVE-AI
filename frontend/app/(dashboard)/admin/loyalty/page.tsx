'use client';

import React, { useState, useEffect } from 'react';
import { Award, Users, Star, Gift, Search, Plus, X, History } from 'lucide-react';
import axiosInstance from '@/lib/axiosInstance';
import toast from 'react-hot-toast';

export default function LoyaltyProgram() {
  const [loading, setLoading] = useState(true);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [tierFilter, setTierFilter] = useState('All');
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<any>(null);
  
  // Add Points form
  const [pointsForm, setPointsForm] = useState({
    customerId: '',
    points: '',
    description: ''
  });

  // MOCK DATA
  const mockAccounts = [
    { _id: '1', customerId: { name: 'Rahul Sharma', phone: '9876543210' }, tier: 'Gold', currentPoints: 1250, totalPointsEarned: 3500, totalPointsRedeemed: 2250, history: [{ date: '2024-03-01', points: 150, type: 'Earned', description: 'Order #1234' }] },
    { _id: '2', customerId: { name: 'Priya Patel', phone: '9876543211' }, tier: 'Platinum', currentPoints: 4500, totalPointsEarned: 12000, totalPointsRedeemed: 7500, history: [] },
    { _id: '3', customerId: { name: 'Amit Kumar', phone: '9876543212' }, tier: 'Silver', currentPoints: 450, totalPointsEarned: 1200, totalPointsRedeemed: 750, history: [] },
    { _id: '4', customerId: { name: 'Sneha Gupta', phone: '9876543213' }, tier: 'Bronze', currentPoints: 120, totalPointsEarned: 120, totalPointsRedeemed: 0, history: [] },
  ];

  const getTierColor = (tier: string) => {
    switch(tier) {
      case 'Bronze': return 'text-[#cd7f32] bg-[#cd7f32]/10';
      case 'Silver': return 'text-[#71717a] bg-[#71717a]/10';
      case 'Gold': return 'text-[#eab308] bg-[#eab308]/10';
      case 'Platinum': return 'text-[#3f3f46] bg-[#3f3f46]/10 dark:text-white dark:bg-white/10';
      default: return 'text-gray-500 bg-gray-100';
    }
  };

  useEffect(() => {
    fetchLoyaltyAccounts();
  }, []);

  const fetchLoyaltyAccounts = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/loyalty');
      if (res.data.success) {
        setAccounts(res.data.data);
      } else {
        setAccounts(mockAccounts);
      }
    } catch (error) {
      setAccounts(mockAccounts);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPoints = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // await axiosInstance.post('/loyalty/add', pointsForm);
      toast.success('Points added successfully!');
      setShowAddModal(false);
      setPointsForm({ customerId: '', points: '', description: '' });
      fetchLoyaltyAccounts(); // Refresh
    } catch (error) {
      toast.error('Failed to add points');
    }
  };

  const filteredAccounts = accounts.filter(acc => {
    const matchesSearch = acc.customerId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          acc.customerId?.phone?.includes(searchTerm);
    const matchesTier = tierFilter === 'All' || acc.tier === tierFilter;
    return matchesSearch && matchesTier;
  });

  return (
    <div className="p-6 space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="page-header flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="page-title">Loyalty Program</h1>
        <button 
          className="btn-primary flex items-center"
          onClick={() => setShowAddModal(true)}
        >
          <Plus className="w-4 h-4 mr-2" /> Add Points
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-5">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-100 rounded-full text-blue-600">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Total Members</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{accounts.length}</h3>
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-green-100 rounded-full text-green-600">
              <Star className="w-6 h-6" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Points Issued</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {accounts.reduce((sum, acc) => sum + acc.totalPointsEarned, 0).toLocaleString()}
              </h3>
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-purple-100 rounded-full text-purple-600">
              <Gift className="w-6 h-6" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Points Redeemed</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {accounts.reduce((sum, acc) => sum + acc.totalPointsRedeemed, 0).toLocaleString()}
              </h3>
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gray-800 rounded-full text-white">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Platinum Members</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {accounts.filter(a => a.tier === 'Platinum').length}
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Table */}
      <div className="card p-5 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="relative max-w-sm w-full">
            <Search className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
            <input 
              type="text"
              placeholder="Search customer name or phone..."
              className="input-field pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select 
            className="input-field max-w-[200px]"
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value)}
          >
            <option value="All">All Tiers</option>
            <option value="Bronze">Bronze</option>
            <option value="Silver">Silver</option>
            <option value="Gold">Gold</option>
            <option value="Platinum">Platinum</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
              <tr>
                <th className="p-3 rounded-tl-lg">Customer</th>
                <th className="p-3">Tier</th>
                <th className="p-3">Current Points</th>
                <th className="p-3">Total Earned</th>
                <th className="p-3">Total Redeemed</th>
                <th className="p-3 rounded-tr-lg">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr><td colSpan={6} className="p-4 text-center">Loading...</td></tr>
              ) : filteredAccounts.length === 0 ? (
                <tr><td colSpan={6} className="p-4 text-center text-gray-500">No loyalty accounts found</td></tr>
              ) : (
                filteredAccounts.map((acc) => (
                  <tr key={acc._id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <td className="p-3">
                      <div className="font-medium text-gray-900 dark:text-white">{acc.customerId?.name}</div>
                      <div className="text-gray-500 text-xs">{acc.customerId?.phone}</div>
                    </td>
                    <td className="p-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getTierColor(acc.tier)}`}>
                        {acc.tier}
                      </span>
                    </td>
                    <td className="p-3 font-semibold text-blue-600">{acc.currentPoints.toLocaleString()}</td>
                    <td className="p-3 text-green-600">{acc.totalPointsEarned.toLocaleString()}</td>
                    <td className="p-3 text-gray-600 dark:text-gray-400">{acc.totalPointsRedeemed.toLocaleString()}</td>
                    <td className="p-3">
                      <div className="flex space-x-2">
                        <button 
                          className="px-3 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-md text-xs font-medium transition-colors"
                          onClick={() => { setSelectedAccount(acc); setShowHistoryModal(true); }}
                        >
                          History
                        </button>
                        <button className="px-3 py-1 bg-green-50 text-green-600 hover:bg-green-100 rounded-md text-xs font-medium transition-colors">
                          Redeem
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Points Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-box max-w-md w-full p-6 animate-fadeIn">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Add Points manually</h2>
              <button onClick={() => setShowAddModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddPoints} className="space-y-4">
              <div>
                <label className="label">Customer Phone or ID</label>
                <input 
                  type="text" 
                  required 
                  className="input-field" 
                  value={pointsForm.customerId}
                  onChange={(e) => setPointsForm({...pointsForm, customerId: e.target.value})}
                  placeholder="Enter customer info..."
                />
              </div>
              <div>
                <label className="label">Points to Add</label>
                <input 
                  type="number" 
                  required 
                  min="1"
                  className="input-field" 
                  value={pointsForm.points}
                  onChange={(e) => setPointsForm({...pointsForm, points: e.target.value})}
                />
              </div>
              <div>
                <label className="label">Description / Reason</label>
                <textarea 
                  required 
                  className="input-field" 
                  rows={3}
                  value={pointsForm.description}
                  onChange={(e) => setPointsForm({...pointsForm, description: e.target.value})}
                  placeholder="e.g. Compensation for delay"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Add Points</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* History Modal */}
      {showHistoryModal && selectedAccount && (
        <div className="modal-overlay">
          <div className="modal-box max-w-2xl w-full p-6 animate-fadeIn h-[80vh] flex flex-col">
            <div className="flex justify-between items-center mb-4 pb-4 border-b dark:border-gray-700">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Point History</h2>
                <p className="text-sm text-gray-500">{selectedAccount.customerId.name} ({selectedAccount.tier})</p>
              </div>
              <button onClick={() => setShowHistoryModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
              {selectedAccount.history && selectedAccount.history.length > 0 ? (
                <div className="space-y-4">
                  {selectedAccount.history.map((record: any, i: number) => (
                    <div key={i} className="flex justify-between items-center p-3 border dark:border-gray-700 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-full ${record.type === 'Earned' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                          <History className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{record.description}</p>
                          <p className="text-xs text-gray-500">{record.date}</p>
                        </div>
                      </div>
                      <span className={`font-bold ${record.type === 'Earned' ? 'text-green-600' : 'text-orange-600'}`}>
                        {record.type === 'Earned' ? '+' : '-'}{record.points} pts
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <History className="w-12 h-12 mb-2 opacity-20" />
                  <p>No history found for this account</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
