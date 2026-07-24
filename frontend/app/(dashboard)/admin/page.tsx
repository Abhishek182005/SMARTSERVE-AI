'use client';
import { useState, useEffect } from 'react';
import axiosInstance from '@/lib/axiosInstance';
import { useAppSelector } from '@/lib/hooks';
import Link from 'next/link';
import {
  IndianRupee, ShoppingBag, Users, AlertTriangle,
  TrendingUp, TrendingDown, Loader2, Bot, Star, 
  CheckCircle2, Clock, ChefHat, Receipt
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar
} from 'recharts';

interface DashboardData {
  todayRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  activeEmployees: number;
  lowStockCount: number;
  pendingReservations: number;
  avgRating: number;
  ordersByStatus: Record<string, number>;
  todayOrders: any[];
  weeklyRevenue: { _id: string; revenue: number; orders: number }[];
  recentReviews: any[];
}

export default function AdminDashboard() {
  const { user } = useAppSelector(s => s.auth);
  const [data, setData] = useState<DashboardData | null>(null);
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
    fetchInsight();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await axiosInstance.get('/dashboard/stats');
      setData(res.data.data);
    } catch (err) {
      console.error('Dashboard fetch failed', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchInsight = async () => {
    try {
      const res = await axiosInstance.get('/ai/insights');
      setInsight(res.data.data?.insight || null);
    } catch { /* silent – insight is optional */ }
  };

  const getStatusColor = (status: string) => {
    const map: Record<string, string> = {
      Pending: 'badge-yellow', Accepted: 'badge-blue', Preparing: 'badge-purple',
      Ready: 'badge-green', Delivered: 'badge-blue', Completed: 'badge-gray', Cancelled: 'badge-red',
    };
    return map[status] ?? 'badge-gray';
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        <p className="text-gray-500">Loading dashboard…</p>
      </div>
    );
  }

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Pad weekly revenue with 0s for missing days
  const weeklyChartData = data?.weeklyRevenue.map(d => ({
    date: d._id.slice(5), // MM-DD
    revenue: parseFloat(d.revenue.toFixed(0)),
    orders: d.orders,
  })) ?? [];

  return (
    <div className="space-y-6 animate-fadeIn pb-6">
      {/* Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {greeting()}, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <Link href="/admin/pos" className="btn-primary shadow-lg shadow-blue-600/20 self-start sm:self-auto">
          <Receipt className="h-4 w-4" /> Open POS
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Today's Revenue", value: `₹${(data?.todayRevenue ?? 0).toLocaleString('en-IN')}`,
            icon: IndianRupee, color: 'blue', trend: '+12%', up: true
          },
          {
            label: 'Orders Today', value: data?.totalOrders ?? 0,
            icon: ShoppingBag, color: 'indigo', trend: '+5%', up: true
          },
          {
            label: 'Total Customers', value: (data?.totalCustomers ?? 0).toLocaleString(),
            icon: Users, color: 'purple', trend: 'Active', up: null
          },
          {
            label: 'Low Stock Alerts', value: data?.lowStockCount ?? 0,
            icon: AlertTriangle, color: 'red', trend: 'Action needed', up: false
          },
        ].map(card => (
          <div key={card.label} className="card p-5 flex items-start justify-between group hover:shadow-md transition-shadow">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{card.label}</p>
              <h3 className="text-2xl font-black text-gray-900 dark:text-white mt-1">{card.value}</h3>
              <div className={`flex items-center gap-1 text-sm mt-2 font-medium ${card.up === true ? 'text-green-500' : card.up === false ? 'text-red-500' : 'text-gray-400'}`}>
                {card.up === true && <TrendingUp className="h-4 w-4" />}
                {card.up === false && <TrendingDown className="h-4 w-4" />}
                <span>{card.trend}</span>
              </div>
            </div>
            <div className={`p-3 bg-${card.color}-100 dark:bg-${card.color}-900/30 text-${card.color}-600 dark:text-${card.color}-400 rounded-xl group-hover:scale-110 transition-transform`}>
              <card.icon className="h-5 w-5" />
            </div>
          </div>
        ))}
      </div>

      {/* Secondary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-4 flex items-center gap-3">
          <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 rounded-lg"><Clock className="h-5 w-5" /></div>
          <div><p className="text-xs text-gray-500">Pending Reservations</p><p className="text-xl font-bold">{data?.pendingReservations ?? 0}</p></div>
        </div>
        <div className="card p-4 flex items-center gap-3">
          <div className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-lg"><Users className="h-5 w-5" /></div>
          <div><p className="text-xs text-gray-500">Active Staff</p><p className="text-xl font-bold">{data?.activeEmployees ?? 0}</p></div>
        </div>
        <div className="card p-4 flex items-center gap-3">
          <div className="p-2 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-lg"><Star className="h-5 w-5" /></div>
          <div><p className="text-xs text-gray-500">Avg Rating</p><p className="text-xl font-bold">{data?.avgRating ?? '—'} / 5</p></div>
        </div>
        <div className="card p-4 flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg"><ChefHat className="h-5 w-5" /></div>
          <div><p className="text-xs text-gray-500">In Kitchen</p><p className="text-xl font-bold">{(data?.ordersByStatus?.Preparing ?? 0) + (data?.ordersByStatus?.Accepted ?? 0)}</p></div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Weekly Revenue Chart */}
        <div className="xl:col-span-2 card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">Weekly Revenue</h2>
            <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">Last 7 days</span>
          </div>
          {weeklyChartData.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-gray-400">
              <p>No completed orders in the last 7 days</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={weeklyChartData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" strokeOpacity={0.3} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v}`} />
                <Tooltip
                  contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: '12px', fontSize: '12px' }}
                  labelStyle={{ color: '#f9fafb' }}
                  formatter={(v: any) => [`₹${v.toLocaleString('en-IN')}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={2} fill="url(#colorRev)" dot={{ fill: '#2563eb', r: 4 }} activeDot={{ r: 6 }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* AI Advisor */}
        <div className="card bg-gradient-to-br from-gray-900 via-gray-900 to-indigo-950 border border-indigo-500/20 text-white relative overflow-hidden">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-600/10 rounded-full blur-3xl" />
          </div>
          <div className="p-5 border-b border-white/10 flex items-center gap-3 relative">
            <div className="p-2 bg-indigo-500/20 border border-indigo-500/30 rounded-lg">
              <Bot className="h-5 w-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="font-bold text-indigo-50">SmartServe AI</h2>
              <p className="text-xs text-indigo-300">Business Advisor</p>
            </div>
          </div>
          <div className="p-5 relative flex-1 flex flex-col gap-3">
            {insight ? (
              <div className="text-sm text-gray-200 leading-relaxed whitespace-pre-line">
                {insight.slice(0, 500)}{insight.length > 500 ? '…' : ''}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-2 py-8 text-gray-500">
                <Loader2 className="h-6 w-6 animate-spin text-indigo-400" />
                <span className="text-sm">Analyzing your data…</span>
              </div>
            )}
            <Link href="/admin/ai-assistant" className="mt-auto block text-center py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors">
              Chat with AI Assistant
            </Link>
          </div>
        </div>
      </div>

      {/* Orders Today Table */}
      <div className="card">
        <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-lg font-bold">Today's Orders</h2>
          <Link href="/admin/orders" className="text-sm text-blue-600 hover:text-blue-700 font-medium">View all →</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Order</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {(data?.todayOrders ?? []).length === 0 ? (
                <tr><td colSpan={5} className="text-center py-10 text-gray-400">No orders placed today yet.</td></tr>
              ) : (
                (data?.todayOrders ?? []).map((order: any) => (
                  <tr key={order._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors">
                    <td className="px-4 py-3 font-semibold text-blue-600 dark:text-blue-400 text-sm">{order.orderNumber}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{order.customerId?.name ?? 'Walk-in'}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{order.orderType}</td>
                    <td className="px-4 py-3 text-sm font-bold text-gray-900 dark:text-white">₹{order.totalAmount?.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3"><span className={getStatusColor(order.status)}>{order.status}</span></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Status Distribution */}
      {data?.ordersByStatus && Object.keys(data.ordersByStatus).length > 0 && (
        <div className="card p-5">
          <h2 className="text-lg font-bold mb-4">Order Status Distribution (Today)</h2>
          <div className="flex flex-wrap gap-3">
            {Object.entries(data.ordersByStatus).map(([status, count]) => (
              <div key={status} className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-medium text-sm ${getStatusColor(status)} border-current/20`}>
                <span>{count}</span>
                <span>{status}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
