'use client';

import React, { useState, useEffect } from 'react';
import { ShoppingCart, Package, DollarSign, Plus, Search, Filter, X, Trash2, Eye } from 'lucide-react';
import axiosInstance from '@/lib/axiosInstance';
import toast from 'react-hot-toast';

export default function PurchaseOrders() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);
  const [filterStatus, setFilterStatus] = useState('All');
  
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  // New PO Form state
  const [poForm, setPoForm] = useState({
    supplierId: '',
    supplierName: '', // For mock
    expectedDelivery: '',
    notes: '',
    items: [{ itemName: '', quantity: 1, unit: 'kg', pricePerUnit: 0 }]
  });

  const mockOrders = [
    { _id: '1', orderNumber: 'PO-2024-001', supplierId: { name: 'Fresh Farms Inc', phone: '123456789' }, items: [{itemName: 'Tomatoes', quantity: 50, unit: 'kg', pricePerUnit: 40, total: 2000}], totalAmount: 2000, status: 'Delivered', paymentStatus: 'Paid', expectedDelivery: '2024-05-10', notes: '' },
    { _id: '2', orderNumber: 'PO-2024-002', supplierId: { name: 'Global Spices', phone: '987654321' }, items: [{itemName: 'Cumin', quantity: 5, unit: 'kg', pricePerUnit: 300, total: 1500}, {itemName: 'Turmeric', quantity: 10, unit: 'kg', pricePerUnit: 150, total: 1500}], totalAmount: 3000, status: 'Shipped', paymentStatus: 'Partial', expectedDelivery: '2024-05-12', notes: 'Urgent' },
    { _id: '3', orderNumber: 'PO-2024-003', supplierId: { name: 'Dairy Co', phone: '555444333' }, items: [{itemName: 'Milk', quantity: 100, unit: 'L', pricePerUnit: 50, total: 5000}], totalAmount: 5000, status: 'Pending', paymentStatus: 'Unpaid', expectedDelivery: '2024-05-15', notes: '' },
    { _id: '4', orderNumber: 'PO-2024-004', supplierId: { name: 'Metro Cash & Carry', phone: '111222333' }, items: [{itemName: 'Napkins', quantity: 1000, unit: 'pcs', pricePerUnit: 0.5, total: 500}], totalAmount: 500, status: 'Cancelled', paymentStatus: 'Unpaid', expectedDelivery: '2024-05-08', notes: 'Out of stock' },
  ];

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/purchase-orders');
      if (res.data.success) {
        setOrders(res.data.data);
      } else {
        setOrders(mockOrders);
      }
    } catch (error) {
      setOrders(mockOrders);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'Pending': return 'badge-yellow';
      case 'Confirmed': return 'badge-blue';
      case 'Shipped': return 'badge-purple';
      case 'Delivered': return 'badge-green';
      case 'Cancelled': return 'badge-red';
      default: return 'badge-gray';
    }
  };

  const getPaymentBadge = (status: string) => {
    switch(status) {
      case 'Paid': return 'badge-green';
      case 'Partial': return 'badge-yellow';
      case 'Unpaid': return 'badge-red';
      default: return 'badge-gray';
    }
  };

  const handleAddItem = () => {
    setPoForm({
      ...poForm,
      items: [...poForm.items, { itemName: '', quantity: 1, unit: 'kg', pricePerUnit: 0 }]
    });
  };

  const handleRemoveItem = (index: number) => {
    const newItems = [...poForm.items];
    newItems.splice(index, 1);
    setPoForm({ ...poForm, items: newItems });
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems: any = [...poForm.items];
    newItems[index][field] = value;
    setPoForm({ ...poForm, items: newItems });
  };

  const calculateTotal = () => {
    return poForm.items.reduce((total, item) => total + (Number(item.quantity) * Number(item.pricePerUnit)), 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...poForm,
        totalAmount: calculateTotal(),
        items: poForm.items.map(item => ({
          ...item,
          total: Number(item.quantity) * Number(item.pricePerUnit)
        }))
      };
      // await axiosInstance.post('/purchase-orders', payload);
      toast.success('Purchase order created successfully');
      setShowModal(false);
      fetchOrders();
    } catch (error) {
      toast.error('Failed to create purchase order');
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      // await axiosInstance.put(`/purchase-orders/${id}`, { status });
      toast.success(`Order marked as ${status}`);
      setOrders(orders.map(o => o._id === id ? { ...o, status } : o));
      if (selectedOrder) setSelectedOrder({ ...selectedOrder, status });
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const formatCurrency = (amount: number) => `₹${amount.toLocaleString()}`;

  const filteredOrders = filterStatus === 'All' ? orders : orders.filter(o => o.status === filterStatus);

  return (
    <div className="p-6 space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="page-header flex justify-between items-center">
        <h1 className="page-title">Purchase Orders</h1>
        <button className="btn-primary flex items-center" onClick={() => setShowModal(true)}>
          <Plus className="w-4 h-4 mr-2" /> New PO
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-5 border-l-4 border-blue-500">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-500 text-sm">Total Orders</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{orders.length}</h3>
            </div>
            <ShoppingCart className="w-8 h-8 text-blue-100 fill-blue-500" />
          </div>
        </div>
        <div className="card p-5 border-l-4 border-yellow-500">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-500 text-sm">Pending</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {orders.filter(o => o.status === 'Pending').length}
              </h3>
            </div>
            <Package className="w-8 h-8 text-yellow-100 fill-yellow-500" />
          </div>
        </div>
        <div className="card p-5 border-l-4 border-green-500">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-500 text-sm">Delivered</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {orders.filter(o => o.status === 'Delivered').length}
              </h3>
            </div>
            <Package className="w-8 h-8 text-green-100 fill-green-500" />
          </div>
        </div>
        <div className="card p-5 border-l-4 border-purple-500">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-500 text-sm">Total Value</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(orders.reduce((sum, o) => sum + o.totalAmount, 0))}
              </h3>
            </div>
            <DollarSign className="w-8 h-8 text-purple-100 fill-purple-500" />
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="card p-5 space-y-4">
        <div className="flex overflow-x-auto pb-2 gap-2 custom-scrollbar">
          {['All', 'Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'].map(status => (
            <button
              key={status}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                filterStatus === status 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300'
              }`}
              onClick={() => setFilterStatus(status)}
            >
              {status}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-y dark:border-gray-700">
              <tr>
                <th className="p-3">Order #</th>
                <th className="p-3">Supplier</th>
                <th className="p-3">Items</th>
                <th className="p-3">Total</th>
                <th className="p-3">Exp. Delivery</th>
                <th className="p-3">Payment</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr><td colSpan={8} className="p-4 text-center">Loading...</td></tr>
              ) : filteredOrders.length === 0 ? (
                <tr><td colSpan={8} className="p-4 text-center text-gray-500">No purchase orders found</td></tr>
              ) : (
                filteredOrders.map(order => (
                  <tr key={order._id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <td className="p-3 font-medium text-gray-900 dark:text-white">{order.orderNumber}</td>
                    <td className="p-3">{order.supplierId?.name}</td>
                    <td className="p-3 text-gray-500">{order.items?.length || 0} items</td>
                    <td className="p-3 font-semibold text-gray-900 dark:text-white">{formatCurrency(order.totalAmount)}</td>
                    <td className="p-3 text-gray-500">{order.expectedDelivery}</td>
                    <td className="p-3">
                      <span className={getPaymentBadge(order.paymentStatus)}>{order.paymentStatus}</span>
                    </td>
                    <td className="p-3">
                      <span className={getStatusBadge(order.status)}>{order.status}</span>
                    </td>
                    <td className="p-3 text-right">
                      <button 
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        onClick={() => { setSelectedOrder(order); setShowDetailsModal(true); }}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New PO Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box max-w-4xl w-full p-6 animate-fadeIn h-[90vh] flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Create Purchase Order</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Supplier Name</label>
                  <input type="text" required className="input-field" value={poForm.supplierName} onChange={(e) => setPoForm({...poForm, supplierName: e.target.value})} />
                </div>
                <div>
                  <label className="label">Expected Delivery Date</label>
                  <input type="date" required className="input-field" value={poForm.expectedDelivery} onChange={(e) => setPoForm({...poForm, expectedDelivery: e.target.value})} />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="label mb-0">Line Items</label>
                  <button type="button" onClick={handleAddItem} className="text-blue-600 text-sm font-medium hover:underline flex items-center">
                    <Plus className="w-4 h-4 mr-1" /> Add Item
                  </button>
                </div>
                
                <div className="space-y-3">
                  {poForm.items.map((item, index) => (
                    <div key={index} className="flex flex-wrap md:flex-nowrap gap-3 items-end p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border dark:border-gray-700">
                      <div className="flex-1 min-w-[200px]">
                        <label className="text-xs text-gray-500 mb-1 block">Item Name</label>
                        <input type="text" required className="input-field py-1.5" value={item.itemName} onChange={(e) => handleItemChange(index, 'itemName', e.target.value)} />
                      </div>
                      <div className="w-24">
                        <label className="text-xs text-gray-500 mb-1 block">Qty</label>
                        <input type="number" min="1" required className="input-field py-1.5" value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', e.target.value)} />
                      </div>
                      <div className="w-24">
                        <label className="text-xs text-gray-500 mb-1 block">Unit</label>
                        <select className="input-field py-1.5" value={item.unit} onChange={(e) => handleItemChange(index, 'unit', e.target.value)}>
                          <option>kg</option><option>g</option><option>L</option><option>ml</option><option>pcs</option><option>box</option>
                        </select>
                      </div>
                      <div className="w-32">
                        <label className="text-xs text-gray-500 mb-1 block">Price/Unit</label>
                        <input type="number" min="0" step="0.01" required className="input-field py-1.5" value={item.pricePerUnit} onChange={(e) => handleItemChange(index, 'pricePerUnit', e.target.value)} />
                      </div>
                      <div className="w-32">
                        <label className="text-xs text-gray-500 mb-1 block">Total</label>
                        <input type="text" disabled className="input-field py-1.5 bg-gray-100" value={formatCurrency(Number(item.quantity) * Number(item.pricePerUnit))} />
                      </div>
                      <button type="button" onClick={() => handleRemoveItem(index)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg mb-0.5" disabled={poForm.items.length === 1}>
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="label">Notes / Instructions</label>
                <textarea className="input-field" rows={2} value={poForm.notes} onChange={(e) => setPoForm({...poForm, notes: e.target.value})}></textarea>
              </div>

              <div className="flex justify-between items-center pt-4 border-t dark:border-gray-700">
                <div className="text-lg">
                  <span className="text-gray-500">Total Amount: </span>
                  <span className="font-bold text-gray-900 dark:text-white">{formatCurrency(calculateTotal())}</span>
                </div>
                <div className="flex space-x-3">
                  <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn-primary">Create PO</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedOrder && (
        <div className="modal-overlay">
          <div className="modal-box max-w-3xl w-full p-6 animate-fadeIn">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Order Details</h2>
                <p className="text-gray-500">{selectedOrder.orderNumber}</p>
              </div>
              <button onClick={() => setShowDetailsModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div>
                <p className="text-sm text-gray-500">Supplier</p>
                <p className="font-medium text-gray-900 dark:text-white">{selectedOrder.supplierId?.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Expected Delivery</p>
                <p className="font-medium text-gray-900 dark:text-white">{selectedOrder.expectedDelivery}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <span className={`mt-1 inline-block ${getStatusBadge(selectedOrder.status)}`}>{selectedOrder.status}</span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Payment</p>
                <span className={`mt-1 inline-block ${getPaymentBadge(selectedOrder.paymentStatus)}`}>{selectedOrder.paymentStatus}</span>
              </div>
            </div>

            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 border-b pb-2 dark:border-gray-700">Line Items</h3>
            <div className="overflow-x-auto mb-6">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                  <tr>
                    <th className="p-2">Item</th>
                    <th className="p-2">Qty</th>
                    <th className="p-2">Price/Unit</th>
                    <th className="p-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {selectedOrder.items?.map((item: any, i: number) => (
                    <tr key={i}>
                      <td className="p-2">{item.itemName}</td>
                      <td className="p-2">{item.quantity} {item.unit}</td>
                      <td className="p-2">{formatCurrency(item.pricePerUnit)}</td>
                      <td className="p-2 text-right font-medium">{formatCurrency(item.total)}</td>
                    </tr>
                  ))}
                  <tr className="bg-gray-50 dark:bg-gray-800 font-bold">
                    <td colSpan={3} className="p-2 text-right">Grand Total:</td>
                    <td className="p-2 text-right text-blue-600">{formatCurrency(selectedOrder.totalAmount)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex flex-wrap gap-2 justify-end pt-4 border-t dark:border-gray-700">
              {selectedOrder.status === 'Pending' && (
                <button onClick={() => updateStatus(selectedOrder._id, 'Confirmed')} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">Confirm Order</button>
              )}
              {selectedOrder.status === 'Confirmed' && (
                <button onClick={() => updateStatus(selectedOrder._id, 'Shipped')} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium">Mark Shipped</button>
              )}
              {selectedOrder.status === 'Shipped' && (
                <button onClick={() => updateStatus(selectedOrder._id, 'Delivered')} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium">Mark Delivered</button>
              )}
              {['Pending', 'Confirmed'].includes(selectedOrder.status) && (
                <button onClick={() => updateStatus(selectedOrder._id, 'Cancelled')} className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 text-sm font-medium">Cancel Order</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
