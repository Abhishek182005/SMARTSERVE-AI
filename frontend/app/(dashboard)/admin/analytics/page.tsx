'use client';

import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { TrendingUp, ShoppingBag, DollarSign, Smile, Calendar } from 'lucide-react';
import axiosInstance from '@/lib/axiosInstance';
import toast from 'react-hot-toast';

export default function AnalyticsDashboard() {
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30 days');
  const [analytics, setAnalytics] = useState<any>(null);

  // MOCK DATA for robust UI
  const mockSalesTrend = [
    { date: '1', orders: 120, revenue: 45000 },
    { date: '5', orders: 150, revenue: 52000 },
    { date: '10', orders: 140, revenue: 48000 },
    { date: '15', orders: 180, revenue: 65000 },
    { date: '20', orders: 210, revenue: 80000 },
    { date: '25', orders: 190, revenue: 72000 },
    { date: '30', orders: 240, revenue: 95000 },
  ];

  const mockPeakHours = Array.from({ length: 24 }, (_, i) => ({
    hour: `${i}:00`,
    orders: Math.floor(Math.random() * 50) + (i >= 12 && i <= 14 ? 80 : 0) + (i >= 19 && i <= 21 ? 100 : 0),
  }));

  const mockTopItems = [
    { name: 'Butter Chicken', quantity: 450 },
    { name: 'Garlic Naan', quantity: 680 },
    { name: 'Paneer Tikka', quantity: 320 },
    { name: 'Biryani', quantity: 510 },
    { name: 'Dal Makhani', quantity: 290 },
  ];

  const mockCustomerTiers = [
    { name: 'Bronze', value: 450 },
    { name: 'Silver', value: 300 },
    { name: 'Gold', value: 150 },
    { name: 'Platinum', value: 50 },
  ];

  const mockOrderTypes = [
    { name: 'Dine-in', value: 65 },
    { name: 'Takeaway', value: 15 },
    { name: 'Delivery', value: 20 },
  ];

  const mockWeeklyComparison = [
    { day: 'Mon', thisWeek: 120, lastWeek: 110 },
    { day: 'Tue', thisWeek: 135, lastWeek: 125 },
    { day: 'Wed', thisWeek: 150, lastWeek: 140 },
    { day: 'Thu', thisWeek: 180, lastWeek: 160 },
    { day: 'Fri', thisWeek: 250, lastWeek: 210 },
    { day: 'Sat', thisWeek: 320, lastWeek: 280 },
    { day: 'Sun', thisWeek: 290, lastWeek: 260 },
  ];

  const COLORS = {
    primary: '#3b82f6',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    purple: '#8b5cf6',
    bronze: '#cd7f32',
    silver: '#c0c0c0',
    gold: '#ffd700',
    platinum: '#e5e4e2',
  };

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      // Simulate API calls
      // const [sales, customers, hours] = await Promise.all([
      //   axiosInstance.get(`/analytics/sales?period=${period}`),
      //   axiosInstance.get(`/analytics/customers?period=${period}`),
      //   axiosInstance.get(`/analytics/peak-hours?period=${period}`)
      // ]);
      
      // Using mock data fallback
      setAnalytics({
        totalOrders: 1450,
        totalRevenue: 540000,
        avgOrderValue: 372,
        customerSat: 4.8,
        salesTrend: mockSalesTrend,
        peakHours: mockPeakHours,
        topItems: mockTopItems,
        customerTiers: mockCustomerTiers,
        orderTypes: mockOrderTypes,
        weeklyComparison: mockWeeklyComparison
      });
    } catch (error) {
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="page-header">
          <h1 className="page-title">Analytics Dashboard</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card p-5 shimmer h-32 rounded-xl"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="card p-5 shimmer h-80 rounded-xl"></div>
          <div className="card p-5 shimmer h-80 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="page-header flex justify-between items-center">
        <h1 className="page-title">Analytics Dashboard</h1>
        <div className="flex items-center space-x-2">
          <Calendar className="w-5 h-5 text-gray-500" />
          <select 
            className="input-field py-1.5 min-w-[120px]"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
          >
            <option>7 days</option>
            <option>30 days</option>
            <option>90 days</option>
            <option>1 year</option>
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Orders</p>
              <h3 className="text-2xl font-bold mt-1 text-gray-900 dark:text-white">
                {analytics?.totalOrders?.toLocaleString()}
              </h3>
            </div>
            <div className="p-2 bg-blue-100 rounded-full text-blue-600">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <p className="text-sm text-green-600 mt-2 flex items-center"><TrendingUp className="w-4 h-4 mr-1"/> +12%</p>
        </div>
        
        <div className="card p-5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Revenue</p>
              <h3 className="text-2xl font-bold mt-1 text-gray-900 dark:text-white">
                {formatCurrency(analytics?.totalRevenue || 0)}
              </h3>
            </div>
            <div className="p-2 bg-green-100 rounded-full text-green-600">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="text-sm text-green-600 mt-2 flex items-center"><TrendingUp className="w-4 h-4 mr-1"/> +8%</p>
        </div>

        <div className="card p-5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm font-medium">Avg Order Value</p>
              <h3 className="text-2xl font-bold mt-1 text-gray-900 dark:text-white">
                {formatCurrency(analytics?.avgOrderValue || 0)}
              </h3>
            </div>
            <div className="p-2 bg-purple-100 rounded-full text-purple-600">
              <BarChart className="w-5 h-5" />
            </div>
          </div>
          <p className="text-sm text-green-600 mt-2 flex items-center"><TrendingUp className="w-4 h-4 mr-1"/> +5%</p>
        </div>

        <div className="card p-5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm font-medium">Customer Satisfaction</p>
              <h3 className="text-2xl font-bold mt-1 text-gray-900 dark:text-white">
                {analytics?.customerSat} / 5.0
              </h3>
            </div>
            <div className="p-2 bg-yellow-100 rounded-full text-yellow-600">
              <Smile className="w-5 h-5" />
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">Based on 342 reviews</p>
        </div>
      </div>

      {/* Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-5">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Sales & Orders Trend</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics?.salesTrend} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" tickFormatter={(v) => `₹${v/1000}k`} />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="revenue" name="Revenue" stroke={COLORS.primary} strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 8 }} />
                <Line yAxisId="right" type="monotone" dataKey="orders" name="Orders" stroke={COLORS.purple} strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-5">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Peak Hours Analysis</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics?.peakHours} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="hour" tick={{ fontSize: 12 }} interval={2} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="orders" name="Orders">
                  {analytics?.peakHours?.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.orders > 75 ? COLORS.warning : COLORS.primary} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-5">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Top Selling Items</h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics?.topItems} layout="vertical" margin={{ top: 5, right: 20, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="quantity" fill={COLORS.success} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-5">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Customer Tiers</h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics?.customerTiers}
                  cx="50%" cy="50%"
                  innerRadius={60} outerRadius={80}
                  paddingAngle={5} dataKey="value"
                >
                  <Cell fill={COLORS.bronze} />
                  <Cell fill={COLORS.silver} />
                  <Cell fill={COLORS.gold} />
                  <Cell fill={COLORS.platinum} />
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-5">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Orders by Type</h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics?.orderTypes}
                  cx="50%" cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                >
                  <Cell fill={COLORS.primary} />
                  <Cell fill={COLORS.warning} />
                  <Cell fill={COLORS.success} />
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 3 */}
      <div className="card p-5">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Weekly Comparison (Orders)</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analytics?.weeklyComparison} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="thisWeek" name="This Week" fill={COLORS.primary} radius={[4, 4, 0, 0]} />
              <Bar dataKey="lastWeek" name="Last Week" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
