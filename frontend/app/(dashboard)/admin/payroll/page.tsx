'use client';

import React, { useState, useEffect } from 'react';
import axiosInstance from '@/lib/axiosInstance';
import toast from 'react-hot-toast';
import { Wallet, Plus, ChevronLeft, ChevronRight, DollarSign, Users, AlertCircle, CheckCircle2 } from 'lucide-react';

interface Employee {
  _id: string;
  name: string;
  designation: string;
  salary: number;
}

interface Payroll {
  _id: string;
  employeeId: Employee;
  month: number;
  year: number;
  basicSalary: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  status: 'Pending' | 'Processed' | 'Paid';
  paidAt?: string;
}

export default function PayrollPage() {
  const [payrolls, setPayrolls] = useState<Payroll[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    employeeId: '',
    basicSalary: 0,
    allowances: 0,
    deductions: 0
  });

  const month = currentDate.getMonth() + 1;
  const year = currentDate.getFullYear();
  
  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];

  const fetchPayrolls = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(`/payroll?month=${month}&year=${year}`);
      if (res.data.success) {
        setPayrolls(res.data.data);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch payrolls');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await axiosInstance.get('/employees');
      if (res.data.success) {
        setEmployees(res.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch employees', error);
    }
  };

  useEffect(() => {
    fetchPayrolls();
  }, [month, year]);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 2, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month, 1));
  };

  const handleEmployeeSelect = (empId: string) => {
    const emp = employees.find(e => e._id === empId);
    if (emp) {
      setFormData({
        ...formData,
        employeeId: empId,
        basicSalary: emp.salary,
        allowances: 0,
        deductions: 0
      });
    } else {
      setFormData({ ...formData, employeeId: '' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.employeeId) {
      toast.error('Please select an employee');
      return;
    }
    
    try {
      const netSalary = formData.basicSalary + formData.allowances - formData.deductions;
      const payload = {
        ...formData,
        month,
        year,
        netSalary,
        status: 'Processed'
      };
      
      const res = await axiosInstance.post('/payroll', payload);
      if (res.data.success) {
        toast.success('Payroll processed successfully');
        setShowModal(false);
        fetchPayrolls();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to process payroll');
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await axiosInstance.put(`/payroll/${id}`, { status: newStatus });
      if (res.data.success) {
        toast.success(`Payroll marked as ${newStatus}`);
        fetchPayrolls();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update payroll status');
    }
  };

  const totalPayable = payrolls.reduce((acc, curr) => acc + curr.netSalary, 0);
  const paidCount = payrolls.filter(p => p.status === 'Paid').length;
  const pendingCount = payrolls.filter(p => p.status === 'Pending' || p.status === 'Processed').length;
  const totalEmployees = employees.length;

  return (
    <div className="space-y-6">
      <div className="page-header items-center justify-between">
        <h1 className="page-title text-gray-900 dark:text-white flex items-center gap-2">
          <Wallet className="w-6 h-6" /> Payroll Management
        </h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-lg p-1 border border-gray-200 dark:border-gray-700 shadow-sm">
            <button onClick={handlePrevMonth} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
              <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
            <span className="font-medium text-gray-900 dark:text-white px-2 min-w-[120px] text-center">
              {monthNames[month - 1]} {year}
            </span>
            <button onClick={handleNextMonth} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
              <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
          </div>
          <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> Process Payroll
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-5 border border-gray-200 dark:border-gray-700 flex items-center gap-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-full dark:bg-blue-900 dark:text-blue-300">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Total Payable</p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">${totalPayable.toFixed(2)}</h3>
          </div>
        </div>
        
        <div className="card p-5 border border-gray-200 dark:border-gray-700 flex items-center gap-4">
          <div className="p-3 bg-green-100 text-green-600 rounded-full dark:bg-green-900 dark:text-green-300">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Paid Count</p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{paidCount}</h3>
          </div>
        </div>

        <div className="card p-5 border border-gray-200 dark:border-gray-700 flex items-center gap-4">
          <div className="p-3 bg-yellow-100 text-yellow-600 rounded-full dark:bg-yellow-900 dark:text-yellow-300">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Pending Count</p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{pendingCount}</h3>
          </div>
        </div>

        <div className="card p-5 border border-gray-200 dark:border-gray-700 flex items-center gap-4">
          <div className="p-3 bg-purple-100 text-purple-600 rounded-full dark:bg-purple-900 dark:text-purple-300">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Total Employees</p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{totalEmployees}</h3>
          </div>
        </div>
      </div>

      <div className="card border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Employee Name</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Role</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Basic</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Allowances</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Deductions</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Net</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Status</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div></td>
                    <td className="px-6 py-4"><div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20"></div></td>
                    <td className="px-6 py-4 text-right"><div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-24 ml-auto"></div></td>
                  </tr>
                ))
              ) : payrolls.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    No payroll records found for {monthNames[month - 1]} {year}.
                  </td>
                </tr>
              ) : (
                payrolls.map((p) => (
                  <tr key={p._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                      {p.employeeId?.name || 'Unknown Employee'}
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400 text-sm">
                      {p.employeeId?.designation || '-'}
                    </td>
                    <td className="px-6 py-4 text-gray-900 dark:text-gray-300">${p.basicSalary}</td>
                    <td className="px-6 py-4 text-gray-900 dark:text-gray-300 text-green-600 dark:text-green-400">+${p.allowances}</td>
                    <td className="px-6 py-4 text-gray-900 dark:text-gray-300 text-red-600 dark:text-red-400">-${p.deductions}</td>
                    <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">${p.netSalary}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full
                        ${p.status === 'Pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' : ''}
                        ${p.status === 'Processed' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : ''}
                        ${p.status === 'Paid' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : ''}
                      `}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {p.status === 'Pending' && (
                        <button 
                          onClick={() => handleUpdateStatus(p._id, 'Processed')}
                          className="btn-primary py-1 px-3 text-sm"
                        >
                          Process
                        </button>
                      )}
                      {p.status === 'Processed' && (
                        <button 
                          onClick={() => handleUpdateStatus(p._id, 'Paid')}
                          className="bg-green-600 hover:bg-green-700 text-white font-medium py-1 px-3 rounded text-sm transition-colors"
                        >
                          Mark Paid
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm modal-overlay">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden modal-box animate-fadeIn border border-gray-200 dark:border-gray-700">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Process Payroll</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                &times;
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="label text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Employee</label>
                <select 
                  className="input-field w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  value={formData.employeeId}
                  onChange={(e) => handleEmployeeSelect(e.target.value)}
                  required
                >
                  <option value="">Select Employee</option>
                  {employees.map(emp => (
                    <option key={emp._id} value={emp._id}>{emp.name} ({emp.designation})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Month</label>
                  <input type="text" value={monthNames[month-1]} disabled className="input-field w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed" />
                </div>
                <div>
                  <label className="label text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Year</label>
                  <input type="text" value={year} disabled className="input-field w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed" />
                </div>
              </div>

              <div>
                <label className="label text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Basic Salary ($)</label>
                <input 
                  type="number" 
                  className="input-field w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  value={formData.basicSalary}
                  onChange={(e) => setFormData({...formData, basicSalary: Number(e.target.value)})}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Allowances ($)</label>
                  <input 
                    type="number" 
                    className="input-field w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    value={formData.allowances}
                    onChange={(e) => setFormData({...formData, allowances: Number(e.target.value)})}
                    required
                  />
                </div>
                <div>
                  <label className="label text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Deductions ($)</label>
                  <input 
                    type="number" 
                    className="input-field w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    value={formData.deductions}
                    onChange={(e) => setFormData({...formData, deductions: Number(e.target.value)})}
                    required
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400 font-medium">Net Salary:</span>
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  ${(formData.basicSalary + formData.allowances - formData.deductions).toFixed(2)}
                </span>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1 py-2 rounded-lg font-medium bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors">
                  Cancel
                </button>
                <button type="submit" className="btn-primary flex-1 py-2 rounded-lg font-medium transition-colors">
                  Submit Payroll
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
