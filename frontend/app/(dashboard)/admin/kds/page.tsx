'use client';
import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import axiosInstance from '@/lib/axiosInstance';
import { ChefHat, Clock, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface OrderItem {
  _id: string;
  name: string;
  quantity: number;
  notes?: string;
  status: 'Pending' | 'Preparing' | 'Ready';
}

interface Order {
  _id: string;
  orderNumber: string;
  orderType: string;
  tableNumber?: number;
  items: OrderItem[];
  status: string;
  kitchenNotes?: string;
  createdAt: string;
}

export default function KDSPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    fetchActiveOrders();

    // Setup Socket.IO
    const newSocket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000', {
      withCredentials: true,
    });

    newSocket.on('connect', () => {
      console.log('KDS Connected to Socket');
      newSocket.emit('join_kitchen');
      toast.success('Kitchen Display Connected');
    });

    newSocket.on('new_order', (order: Order) => {
      // Play sound
      const audio = new Audio('/notification.mp3');
      audio.play().catch(e => console.log('Audio play failed', e));
      toast.custom((t) => (
        <div className="bg-blue-600 text-white p-4 rounded-xl shadow-lg flex items-center gap-3 animate-fadeIn">
          <ChefHat className="h-6 w-6 animate-pulse" />
          <div>
            <p className="font-bold">New Order Received!</p>
            <p className="text-sm opacity-90">{order.orderNumber} • {order.orderType}</p>
          </div>
        </div>
      ));
      setOrders(prev => [...prev, order]);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const fetchActiveOrders = async () => {
    try {
      const res = await axiosInstance.get('/orders?status=Pending,Accepted,Preparing');
      setOrders(res.data.data);
    } catch (error) {
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await axiosInstance.patch(`/orders/${orderId}/status`, { status: newStatus });
      
      if (newStatus === 'Ready') {
        // Remove from KDS if fully ready
        setOrders(prev => prev.filter(o => o._id !== orderId));
        toast.success(`Order ${newStatus}! Waiter notified.`);
      } else {
        // Just update status in UI
        setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
      }
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const getElapsedTime = (createdAt: string) => {
    const start = new Date(createdAt).getTime();
    const now = new Date().getTime();
    const diff = Math.floor((now - start) / 60000); // minutes
    return diff;
  };

  if (loading) return <div className="flex justify-center items-center h-full"><Loader2 className="w-10 h-10 animate-spin text-blue-600" /></div>;

  return (
    <div className="h-full flex flex-col bg-gray-950 -m-4 lg:-m-6 p-4 lg:p-6 overflow-hidden">
      <div className="flex items-center justify-between mb-6 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-orange-500 rounded-xl shadow-lg shadow-orange-500/20">
            <ChefHat className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">Kitchen Display System</h1>
            <p className="text-gray-400">Live order sync enabled • {orders.length} Active Orders</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-gray-900 px-4 py-2 rounded-lg border border-gray-800">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse-glow"></div>
          <span className="text-sm font-semibold text-green-400">Connected</span>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto pb-4 hide-scrollbar">
        <div className="flex gap-4 h-full min-w-max">
          {orders.length === 0 ? (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-600">
              <ChefHat className="w-16 h-16 mb-4 opacity-20" />
              <p className="text-xl font-medium">No active orders</p>
              <p className="text-sm mt-2">Waiting for new orders from POS...</p>
            </div>
          ) : (
            orders.map(order => {
              const elapsed = getElapsedTime(order.createdAt);
              const isUrgent = elapsed > 20;
              const isPreparing = order.status === 'Preparing';

              return (
                <div 
                  key={order._id} 
                  className={`w-80 flex flex-col rounded-2xl border-2 flex-shrink-0 bg-gray-900 shadow-xl overflow-hidden transition-all
                    ${isUrgent ? 'border-red-500/50 shadow-red-500/10' : isPreparing ? 'border-blue-500/50 shadow-blue-500/10' : 'border-gray-700 hover:border-gray-600'}
                  `}
                >
                  {/* Header */}
                  <div className={`p-4 border-b ${isUrgent ? 'bg-red-500/10 border-red-500/20' : isPreparing ? 'bg-blue-500/10 border-blue-500/20' : 'bg-gray-800 border-gray-700'}`}>
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xl font-black text-white">{order.orderNumber}</span>
                      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-sm font-bold
                        ${isUrgent ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-700 text-gray-300'}
                      `}>
                        <Clock className="w-4 h-4" /> {elapsed}m
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-300 font-medium">{order.orderType} {order.tableNumber ? `• Table ${order.tableNumber}` : ''}</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${isPreparing ? 'bg-blue-500 text-white' : 'bg-yellow-500 text-black'}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex gap-3 items-start border-b border-gray-800 pb-3 last:border-0">
                        <div className="w-8 h-8 rounded bg-gray-800 flex items-center justify-center text-white font-bold shrink-0">
                          {item.quantity}x
                        </div>
                        <div>
                          <p className="text-white font-medium text-lg leading-tight mb-1">{item.name}</p>
                          {item.notes && (
                            <p className="text-yellow-500 text-sm font-medium flex items-start gap-1">
                              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /> {item.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    {order.kitchenNotes && (
                      <div className="mt-4 p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                        <p className="text-orange-400 text-sm font-medium uppercase mb-1">Order Note:</p>
                        <p className="text-orange-200 text-sm">{order.kitchenNotes}</p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="p-4 bg-gray-900 border-t border-gray-800 mt-auto">
                    {order.status === 'Pending' ? (
                      <button 
                        onClick={() => updateOrderStatus(order._id, 'Preparing')}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-lg transition-colors shadow-lg shadow-blue-900/20"
                      >
                        Start Preparing
                      </button>
                    ) : (
                      <button 
                        onClick={() => updateOrderStatus(order._id, 'Ready')}
                        className="w-full py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold text-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-green-900/20"
                      >
                        <CheckCircle2 className="w-6 h-6" /> Mark as Ready
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
