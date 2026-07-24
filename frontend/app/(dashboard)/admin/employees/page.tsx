'use client';
import { useState, useEffect } from 'react';
import axiosInstance from '@/lib/axiosInstance';
import { Search, Plus, Filter, Loader2, Edit, Trash2, Mail, Phone, Calendar as CalendarIcon, Briefcase } from 'lucide-react';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';

interface Employee {
  _id: string;
  name: string;
  email: string;
  phone: string;
  designation: string;
  salary: number;
  shift: string;
  joiningDate: string;
  isActive: boolean;
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await axiosInstance.get('/employees');
      setEmployees(res.data.data || res.data);
    } catch (error) {
      toast.error('Failed to fetch employees');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: any) => {
    try {
      if (editingEmployee) {
        await axiosInstance.put(`/employees/${editingEmployee._id}`, data);
        toast.success('Employee updated');
      } else {
        await axiosInstance.post('/employees', data);
        toast.success('Employee added');
      }
      setIsModalOpen(false);
      fetchEmployees();
    } catch (error) {
      toast.error('Failed to save employee');
    }
  };

  const deleteEmployee = async (id: string) => {
    if (!confirm('Delete this employee?')) return;
    try {
      await axiosInstance.delete(`/employees/${id}`);
      toast.success('Employee deleted');
      fetchEmployees();
    } catch (error) {
      toast.error('Failed to delete employee');
    }
  };

  const filtered = employees.filter(e => 
    e.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    e.designation.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fadeIn h-full flex flex-col">
      <div className="page-header shrink-0">
        <div>
          <h1 className="page-title">Staff Management</h1>
          <p className="text-gray-500 mt-1">Manage restaurant employees, roles, and shifts.</p>
        </div>
        <button 
          onClick={() => { setEditingEmployee(null); reset({}); setIsModalOpen(true); }}
          className="btn-primary"
        >
          <Plus className="w-4 h-4" /> Add Staff
        </button>
      </div>

      <div className="card flex-1 flex flex-col min-h-0 overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex gap-4 shrink-0">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search staff by name or role..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-9"
            />
          </div>
          <button className="btn-secondary"><Filter className="w-4 h-4" /> Filter</button>
        </div>

        <div className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900/50 p-4">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map(emp => (
                <div key={emp._id} className="card p-5 hover:shadow-md transition-shadow relative group">
                  <div className="absolute top-4 right-4 flex opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => { setEditingEmployee(emp); reset(emp); setIsModalOpen(true); }}
                      className="p-1.5 text-blue-600 bg-blue-50 dark:bg-blue-900/30 rounded mr-1"
                    >
                      <Edit className="w-3 h-3" />
                    </button>
                    <button 
                      onClick={() => deleteEmployee(emp._id)}
                      className="p-1.5 text-red-600 bg-red-50 dark:bg-red-900/30 rounded"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                      {emp.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-gray-900 dark:text-white leading-tight">{emp.name}</h3>
                      <span className="badge-blue mt-1">{emp.designation}</span>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-gray-400" /> <span className="truncate">{emp.email}</span></div>
                    <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-gray-400" /> {emp.phone}</div>
                    <div className="flex items-center gap-2"><Briefcase className="w-4 h-4 text-gray-400" /> Shift: {emp.shift}</div>
                    <div className="flex items-center gap-2"><CalendarIcon className="w-4 h-4 text-gray-400" /> Joined {new Date(emp.joiningDate).toLocaleDateString()}</div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
                    <span className="font-semibold text-gray-900 dark:text-white">₹{emp.salary}/mo</span>
                    <span className={emp.isActive ? 'text-green-500 font-medium text-sm' : 'text-red-500 font-medium text-sm'}>
                      {emp.isActive ? 'Active' : 'Inactive'}
                    </span>
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
            <h2 className="text-xl font-bold mb-4">{editingEmployee ? 'Edit Staff' : 'Add Staff'}</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="label">Full Name</label><input {...register('name')} className="input-field" required /></div>
                <div>
                  <label className="label">Role</label>
                  <select {...register('designation')} className="input-field" required>
                    <option value="Manager">Manager</option>
                    <option value="Cashier">Cashier</option>
                    <option value="Waiter">Waiter</option>
                    <option value="Chef">Chef</option>
                    <option value="Kitchen Staff">Kitchen Staff</option>
                    <option value="Delivery Partner">Delivery Partner</option>
                    <option value="Cleaner">Cleaner</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="label">Email</label><input type="email" {...register('email')} className="input-field" required /></div>
                <div><label className="label">Phone</label><input type="tel" {...register('phone')} className="input-field" required /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="label">Salary (₹/mo)</label><input type="number" {...register('salary', { valueAsNumber: true })} className="input-field" required /></div>
                <div>
                  <label className="label">Shift</label>
                  <select {...register('shift')} className="input-field" required>
                    <option value="Morning">Morning</option>
                    <option value="Evening">Evening</option>
                    <option value="Night">Night</option>
                    <option value="Flexible">Flexible</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 justify-end mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="btn-primary">
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Staff'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}