'use client';
import { useState, useEffect } from 'react';
import axiosInstance from '@/lib/axiosInstance';
import { Plus, Edit, Trash2, CalendarClock, Users, Grid, RefreshCw, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';

interface Table {
  _id: string;
  tableNumber: string;
  capacity: number;
  status: 'Available' | 'Occupied' | 'Reserved' | 'Cleaning';
  floor: string;
  qrCode?: string;
  isActive?: boolean;
}

export default function TablesPage() {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);

  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      const res = await axiosInstance.get('/tables');
      setTables(res.data.data || res.data);
    } catch (error) {
      toast.error('Failed to load tables');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await axiosInstance.patch(`/tables/${id}/status`, { status });
      toast.success(`Table marked as ${status}`);
      fetchTables();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available': return 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800';
      case 'Occupied': return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';
      case 'Reserved': return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800';
      case 'Cleaning': return 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const onSubmit = async (data: any) => {
    try {
      if (editingTable) {
        await axiosInstance.put(`/tables/${editingTable._id}`, data);
        toast.success('Table updated');
      } else {
        await axiosInstance.post('/tables', data);
        toast.success('Table added');
      }
      setIsModalOpen(false);
      fetchTables();
    } catch (error) {
      toast.error('Failed to save table');
    }
  };

  const deleteTable = async (id: string) => {
    if (!confirm('Are you sure you want to delete this table?')) return;
    try {
      await axiosInstance.delete(`/tables/${id}`);
      toast.success('Table deleted');
      fetchTables();
    } catch (error) {
      toast.error('Failed to delete table');
    }
  };

  const openModal = (table?: Table) => {
    if (table) {
      setEditingTable(table);
      reset(table);
    } else {
      setEditingTable(null);
      reset({ status: 'Available', isActive: true });
    }
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-fadeIn h-full flex flex-col">
      <div className="page-header shrink-0">
        <div>
          <h1 className="page-title">Table Management</h1>
          <p className="text-gray-500 mt-1">Manage dining areas and table statuses.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchTables} className="btn-secondary"><RefreshCw className="w-4 h-4" /></button>
          <button onClick={() => openModal()} className="btn-primary"><Plus className="w-4 h-4" /> Add Table</button>
        </div>
      </div>

      {/* Floor Plan View */}
      <div className="flex-1 overflow-y-auto card p-6 bg-gray-50 dark:bg-gray-900/50">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {tables.map(table => (
              <div 
                key={table._id}
                className={`relative flex flex-col items-center justify-center p-6 rounded-3xl border-2 shadow-sm transition-all hover:shadow-md cursor-pointer group
                  ${getStatusColor(table.status)}
                `}
              >
                {/* Status Badge */}
                <span className={`absolute -top-3 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border shadow-sm ${getStatusColor(table.status)} bg-white dark:bg-gray-900`}>
                  {table.status}
                </span>

                <div className="absolute top-2 right-2 flex opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <button onClick={(e) => { e.stopPropagation(); openModal(table); }} className="p-1.5 bg-blue-500/10 text-blue-600 rounded-lg hover:bg-blue-500/20 mr-1"><Edit className="w-3 h-3" /></button>
                  <button onClick={(e) => { e.stopPropagation(); deleteTable(table._id); }} className="p-1.5 bg-red-500/10 text-red-600 rounded-lg hover:bg-red-500/20"><Trash2 className="w-3 h-3" /></button>
                </div>

                <Grid className="w-10 h-10 mb-2 opacity-50" />
                <h3 className="text-2xl font-black">{table.tableNumber}</h3>
                
                <div className="flex items-center gap-1 mt-2 text-sm font-medium opacity-75">
                  <Users className="w-4 h-4" /> {table.capacity} Seats
                </div>
                <div className="text-xs mt-1 opacity-60 font-semibold">{table.floor}</div>

                {/* Hover Actions */}
                <div className="absolute inset-0 bg-white/90 dark:bg-gray-800/95 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 backdrop-blur-sm">
                  {table.status !== 'Available' && (
                    <button onClick={() => updateStatus(table._id, 'Available')} className="px-4 py-1.5 bg-green-500 text-white text-xs font-bold rounded-lg w-3/4">Mark Available</button>
                  )}
                  {table.status !== 'Occupied' && (
                    <button onClick={() => updateStatus(table._id, 'Occupied')} className="px-4 py-1.5 bg-red-500 text-white text-xs font-bold rounded-lg w-3/4">Mark Occupied</button>
                  )}
                  {table.status !== 'Cleaning' && (
                    <button onClick={() => updateStatus(table._id, 'Cleaning')} className="px-4 py-1.5 bg-yellow-500 text-white text-xs font-bold rounded-lg w-3/4">Needs Cleaning</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-box p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">{editingTable ? 'Edit Table' : 'Add Table'}</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="label">Table Number</label>
                <input {...register('tableNumber')} className="input-field" required />
              </div>
              <div>
                <label className="label">Capacity</label>
                <input type="number" {...register('capacity')} className="input-field" required />
              </div>
              <div>
                <label className="label">Floor</label>
                <select {...register('floor')} className="input-field" required>
                  <option value="Ground Floor">Ground Floor</option>
                  <option value="First Floor">First Floor</option>
                  <option value="Second Floor">Second Floor</option>
                  <option value="Terrace">Terrace</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" {...register('isActive')} id="isActive" className="w-4 h-4" />
                <label htmlFor="isActive" className="text-sm font-medium">Is Active</label>
              </div>
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
