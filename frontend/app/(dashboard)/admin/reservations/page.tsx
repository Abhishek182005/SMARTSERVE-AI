'use client';
import { useState, useEffect } from 'react';
import axiosInstance from '@/lib/axiosInstance';
import {
  CalendarDays, Plus, Search, Loader2, Edit, Trash2, Clock, Users,
  CheckCircle2, XCircle, AlertCircle, RefreshCw, X
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';

interface Reservation {
  _id: string;
  customerName: string;
  customerPhone: string;
  date: string;
  time: string;
  guests: number;
  status: string;
  specialRequests?: string;
  notes?: string;
  tableId?: { tableNumber: string; floor: string };
  customerId?: { name: string; phone: string };
}

const STATUS_OPTIONS = ['All', 'Pending', 'Confirmed', 'Seated', 'Completed', 'Cancelled', 'No-Show'];

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRes, setEditingRes] = useState<Reservation | null>(null);
  const [viewingRes, setViewingRes] = useState<Reservation | null>(null);

  const { register, handleSubmit, reset, formState: { isSubmitting, errors } } = useForm<any>();

  useEffect(() => { fetchReservations(); }, [statusFilter]);

  const fetchReservations = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (statusFilter !== 'All') params.status = statusFilter;
      const res = await axiosInstance.get('/reservations', { params });
      setReservations(res.data.data || []);
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to fetch reservations');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: any) => {
    try {
      if (editingRes) {
        await axiosInstance.put(`/reservations/${editingRes._id}`, data);
        toast.success('Reservation updated');
      } else {
        await axiosInstance.post('/reservations', data);
        toast.success('Reservation created');
      }
      setIsModalOpen(false);
      fetchReservations();
    } catch (e: any) { toast.error(e.response?.data?.message || 'Failed to save reservation'); }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await axiosInstance.put(`/reservations/${id}`, { status });
      toast.success(`Marked as ${status}`);
      fetchReservations();
      if (viewingRes?._id === id) setViewingRes(prev => prev ? { ...prev, status } : null);
    } catch { toast.error('Status update failed'); }
  };

  const deleteReservation = async (id: string) => {
    if (!confirm('Cancel this reservation?')) return;
    try {
      await axiosInstance.delete(`/reservations/${id}`);
      toast.success('Reservation cancelled');
      fetchReservations();
    } catch { toast.error('Delete failed'); }
  };

  const openModal = (res?: Reservation) => {
    setEditingRes(res ?? null);
    reset(res ? {
      customerName: res.customerName,
      customerPhone: res.customerPhone,
      date: res.date?.split('T')[0],
      time: res.time,
      guests: res.guests,
      specialRequests: res.specialRequests,
      notes: res.notes,
    } : { date: new Date().toISOString().split('T')[0] });
    setIsModalOpen(true);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Confirmed': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'Cancelled': case 'No-Show': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'Seated': return <Users className="w-4 h-4 text-blue-500" />;
      default: return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (s: string) => {
    const map: Record<string, string> = {
      Pending: 'badge-yellow', Confirmed: 'badge-green', Seated: 'badge-blue',
      Completed: 'badge-gray', Cancelled: 'badge-red', 'No-Show': 'badge-red',
    };
    return map[s] ?? 'badge-gray';
  };

  const filtered = reservations.filter(r =>
    r.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.customerPhone.includes(searchQuery)
  );

  const todayCount = reservations.filter(r => {
    const today = new Date().toISOString().split('T')[0];
    return r.date?.startsWith(today) && ['Pending', 'Confirmed'].includes(r.status);
  }).length;

  return (
    <div className="space-y-6 animate-fadeIn h-full flex flex-col">
      <div className="page-header shrink-0">
        <div>
          <h1 className="page-title">Reservations</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{todayCount} active reservations today</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchReservations} className="btn-secondary"><RefreshCw className="w-4 h-4" /></button>
          <button onClick={() => openModal()} className="btn-primary"><Plus className="w-4 h-4" /> New Reservation</button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 shrink-0">
        {['Pending', 'Confirmed', 'Seated', 'Completed'].map(s => (
          <div key={s} className="card p-4 text-center cursor-pointer hover:shadow-md transition-shadow" onClick={() => setStatusFilter(s)}>
            <p className="text-2xl font-black">{reservations.filter(r => r.status === s).length}</p>
            <p className="text-sm text-gray-500 mt-1">{s}</p>
          </div>
        ))}
      </div>

      <div className="card flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Filters */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 space-y-3 shrink-0">
          <div className="flex gap-3 flex-col sm:flex-row">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" placeholder="Search by name or phone…" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="input-field pl-9" />
            </div>
          </div>
          <div className="flex gap-2 overflow-x-auto hide-scrollbar">
            {STATUS_OPTIONS.map(s => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap flex-shrink-0 transition-colors ${statusFilter === s ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200'}`}
              >{s}</button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <CalendarDays className="w-12 h-12 mb-3 opacity-20" />
              <p className="font-medium">No reservations found</p>
            </div>
          ) : (
            <table className="min-w-full">
              <thead className="sticky top-0 bg-gray-50 dark:bg-gray-800 z-10">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date & Time</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Guests</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700 bg-white dark:bg-gray-800">
                {filtered.map(res => (
                  <tr key={res._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors cursor-pointer" onClick={() => setViewingRes(res)}>
                    <td className="px-4 py-3">
                      <p className="font-medium text-sm text-gray-900 dark:text-white">{res.customerName}</p>
                      <p className="text-xs text-gray-400">{res.customerPhone}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium">{new Date(res.date).toLocaleDateString('en-IN')}</p>
                      <p className="text-xs text-gray-400 flex items-center gap-1"><Clock className="w-3 h-3" />{res.time}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1 text-sm font-medium"><Users className="w-4 h-4 text-gray-400" />{res.guests}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={getStatusColor(res.status)}>{res.status}</span>
                    </td>
                    <td className="px-4 py-3 text-right" onClick={e => e.stopPropagation()}>
                      <div className="flex justify-end gap-1">
                        {res.status === 'Pending' && <button onClick={() => updateStatus(res._id, 'Confirmed')} className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded-lg">Confirm</button>}
                        {res.status === 'Confirmed' && <button onClick={() => updateStatus(res._id, 'Seated')} className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg">Seat</button>}
                        <button onClick={() => openModal(res)} className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg"><Edit className="w-4 h-4" /></button>
                        <button onClick={() => deleteReservation(res._id)} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setIsModalOpen(false)}>
          <div className="modal-box">
            <div className="sticky top-0 p-5 border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 z-10 flex justify-between">
              <h2 className="text-xl font-bold">{editingRes ? 'Edit Reservation' : 'New Reservation'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-700">✕</button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="label">Customer Name *</label><input {...register('customerName', { required: true })} className="input-field" /></div>
                <div><label className="label">Phone *</label><input type="tel" {...register('customerPhone', { required: true })} className="input-field" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="label">Date *</label><input type="date" {...register('date', { required: true })} className="input-field" /></div>
                <div><label className="label">Time *</label><input type="time" {...register('time', { required: true })} className="input-field" /></div>
              </div>
              <div><label className="label">Number of Guests *</label><input type="number" min="1" {...register('guests', { required: true, valueAsNumber: true, min: 1 })} className="input-field" /></div>
              <div><label className="label">Special Requests</label><textarea {...register('specialRequests')} className="input-field" rows={2} placeholder="Dietary restrictions, occasion, seating preference…" /></div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="btn-primary">
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : editingRes ? 'Update' : 'Create Reservation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Reservation Modal */}
      {viewingRes && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setViewingRes(null)}>
          <div className="modal-box max-w-md">
            <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex justify-between">
              <h2 className="text-xl font-bold">Reservation Details</h2>
              <button onClick={() => setViewingRes(null)} className="text-gray-400"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-bold">{viewingRes.customerName}</p>
                  <p className="text-gray-500">{viewingRes.customerPhone}</p>
                </div>
                <span className={getStatusColor(viewingRes.status)}>{viewingRes.status}</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl"><p className="text-xs text-gray-500">Date</p><p className="font-bold">{new Date(viewingRes.date).toLocaleDateString('en-IN')}</p></div>
                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl"><p className="text-xs text-gray-500">Time</p><p className="font-bold">{viewingRes.time}</p></div>
                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl"><p className="text-xs text-gray-500">Guests</p><p className="font-bold">{viewingRes.guests} persons</p></div>
                {viewingRes.tableId && <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl"><p className="text-xs text-gray-500">Table</p><p className="font-bold">Table {viewingRes.tableId.tableNumber} ({viewingRes.tableId.floor})</p></div>}
              </div>
              {viewingRes.specialRequests && <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl"><p className="text-xs font-semibold text-yellow-700 mb-1">Special Requests</p><p className="text-sm">{viewingRes.specialRequests}</p></div>}
              <div className="flex gap-2 flex-wrap">
                {viewingRes.status === 'Pending' && <button onClick={() => updateStatus(viewingRes._id, 'Confirmed')} className="flex-1 py-2 bg-green-600 text-white rounded-xl font-bold text-sm">Confirm</button>}
                {viewingRes.status === 'Confirmed' && <button onClick={() => updateStatus(viewingRes._id, 'Seated')} className="flex-1 py-2 bg-blue-600 text-white rounded-xl font-bold text-sm">Mark Seated</button>}
                {viewingRes.status === 'Seated' && <button onClick={() => updateStatus(viewingRes._id, 'Completed')} className="flex-1 py-2 bg-gray-600 text-white rounded-xl font-bold text-sm">Complete</button>}
                {['Pending', 'Confirmed'].includes(viewingRes.status) && <button onClick={() => updateStatus(viewingRes._id, 'Cancelled')} className="flex-1 py-2 bg-red-600 text-white rounded-xl font-bold text-sm">Cancel</button>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
