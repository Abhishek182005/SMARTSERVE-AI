'use client';
import { useState, useEffect } from 'react';
import axiosInstance from '@/lib/axiosInstance';
import {
  Search, Plus, Loader2, Edit, Trash2, ShoppingBag,
  CalendarDays, Clock, IndianRupee, Eye, RefreshCw, X
} from 'lucide-react';
import toast from 'react-hot-toast';

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  total: number;
}

interface Order {
  _id: string;
  orderNumber: string;
  orderType: string;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
  customerId?: { name: string; phone: string };
  tableId?: { tableNumber: string };
  items: OrderItem[];
  kitchenNotes?: string;
}

const STATUS_OPTIONS = ['All', 'Pending', 'Accepted', 'Preparing', 'Ready', 'Delivered', 'Completed', 'Cancelled'];

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => { fetchOrders(); }, [statusFilter]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (statusFilter !== 'All') params.status = statusFilter;
      const res = await axiosInstance.get('/orders', { params });
      setOrders(res.data.data || []);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      await axiosInstance.patch(`/orders/${orderId}/status`, { status: newStatus });
      toast.success(`Order marked as ${newStatus}`);
      fetchOrders();
      if (selectedOrder?._id === orderId) {
        setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    const map: Record<string, string> = {
      Pending: 'badge-yellow', Accepted: 'badge-blue', Preparing: 'badge-purple',
      Ready: 'badge-green', Delivered: 'badge-blue', Completed: 'badge-gray', Cancelled: 'badge-red',
    };
    return map[status] ?? 'badge-gray';
  };

  const getPaymentColor = (status: string) =>
    status === 'Paid' ? 'text-green-600 dark:text-green-400' :
    status === 'Partial' ? 'text-yellow-600 dark:text-yellow-400' :
    'text-red-500 dark:text-red-400';

  const NEXT_STATUS: Record<string, string> = {
    Pending: 'Accepted', Accepted: 'Preparing', Preparing: 'Ready',
    Ready: 'Delivered', Delivered: 'Completed',
  };

  const filtered = orders.filter(o =>
    o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (o.customerId?.name ?? '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fadeIn h-full flex flex-col">
      <div className="page-header shrink-0">
        <div>
          <h1 className="page-title">Orders Management</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{orders.length} total orders</p>
        </div>
        <button onClick={fetchOrders} className="btn-secondary"><RefreshCw className="w-4 h-4" /> Refresh</button>
      </div>

      <div className="card flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Filters */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 space-y-3 shrink-0">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by order number or customer…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="input-field pl-9"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
            {STATUS_OPTIONS.map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap flex-shrink-0 transition-colors ${
                  statusFilter === s
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <ShoppingBag className="w-12 h-12 mb-3 opacity-20" />
              <p className="text-lg font-medium">No orders found</p>
            </div>
          ) : (
            <table className="min-w-full">
              <thead className="sticky top-0 bg-gray-50 dark:bg-gray-800 z-10">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Order</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Payment</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700 bg-white dark:bg-gray-800">
                {filtered.map(order => (
                  <tr key={order._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-blue-600 dark:text-blue-400 text-sm">{order.orderNumber}</p>
                      <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                        <CalendarDays className="w-3 h-3" />
                        {new Date(order.createdAt).toLocaleDateString('en-IN')}
                        <Clock className="w-3 h-3 ml-1" />
                        {new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-sm text-gray-900 dark:text-white">{order.customerId?.name ?? 'Walk-in'}</p>
                      <p className="text-xs text-gray-400">{order.tableId ? `Table ${order.tableId.tableNumber}` : ''}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs font-medium">{order.orderType}</span>
                    </td>
                    <td className="px-4 py-3 font-bold text-gray-900 dark:text-white text-sm">₹{order.totalAmount?.toLocaleString('en-IN')}</td>
                    <td className={`px-4 py-3 text-sm font-semibold ${getPaymentColor(order.paymentStatus)}`}>{order.paymentStatus}</td>
                    <td className="px-4 py-3"><span className={getStatusColor(order.status)}>{order.status}</span></td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => setSelectedOrder(order)} className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors" title="View order">
                          <Eye className="w-4 h-4" />
                        </button>
                        {NEXT_STATUS[order.status] && (
                          <button
                            disabled={updatingId === order._id}
                            onClick={() => updateStatus(order._id, NEXT_STATUS[order.status])}
                            className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50"
                          >
                            {updatingId === order._id ? '…' : `→ ${NEXT_STATUS[order.status]}`}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="p-4 border-t border-gray-100 dark:border-gray-700 text-sm text-gray-500 shrink-0">
          Showing {filtered.length} of {orders.length} orders
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setSelectedOrder(null)}>
          <div className="modal-box max-w-2xl">
            <div className="sticky top-0 p-5 border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 z-10 flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{selectedOrder.orderNumber}</h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  {selectedOrder.orderType} • {new Date(selectedOrder.createdAt).toLocaleString('en-IN')}
                </p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              {/* Status badges */}
              <div className="flex gap-3 flex-wrap">
                <span className={getStatusColor(selectedOrder.status)}>{selectedOrder.status}</span>
                <span className={`badge ${selectedOrder.paymentStatus === 'Paid' ? 'badge-green' : selectedOrder.paymentStatus === 'Partial' ? 'badge-yellow' : 'badge-red'}`}>
                  {selectedOrder.paymentStatus}
                </span>
                {selectedOrder.tableId && <span className="badge-blue">Table {selectedOrder.tableId.tableNumber}</span>}
              </div>

              {/* Customer info */}
              {selectedOrder.customerId && (
                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <p className="text-sm font-semibold">{selectedOrder.customerId.name}</p>
                  <p className="text-xs text-gray-500">{selectedOrder.customerId.phone}</p>
                </div>
              )}

              {/* Items */}
              <div>
                <h3 className="font-semibold text-sm text-gray-500 uppercase tracking-wider mb-2">Order Items</h3>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, i) => (
                    <div key={i} className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                      <div>
                        <p className="font-medium text-sm">{item.name}</p>
                        <p className="text-xs text-gray-400">₹{item.price} × {item.quantity}</p>
                      </div>
                      <p className="font-bold text-sm">₹{item.total?.toLocaleString('en-IN')}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                <div className="flex justify-between text-lg font-black text-gray-900 dark:text-white">
                  <span>Total</span>
                  <span>₹{selectedOrder.totalAmount?.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {selectedOrder.kitchenNotes && (
                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl">
                  <p className="text-xs font-semibold text-yellow-700 dark:text-yellow-400 mb-1">Kitchen Notes</p>
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">{selectedOrder.kitchenNotes}</p>
                </div>
              )}

              {/* Status Actions */}
              {NEXT_STATUS[selectedOrder.status] && (
                <button
                  onClick={() => updateStatus(selectedOrder._id, NEXT_STATUS[selectedOrder.status])}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors"
                >
                  Move to: {NEXT_STATUS[selectedOrder.status]}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
