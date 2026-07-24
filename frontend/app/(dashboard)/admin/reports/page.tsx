'use client';
import { useState, useEffect } from 'react';
import axiosInstance from '@/lib/axiosInstance';
import { 
  BarChart3, PieChart, TrendingUp, Calendar, Download, FileText, 
  IndianRupee, ShoppingBag, Users, Package, Loader2 
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState('sales');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchReportData();
  }, [activeTab, dateRange]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      let endpoint = '';
      switch (activeTab) {
        case 'sales': endpoint = `/reports/sales?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`; break;
        case 'inventory': endpoint = '/reports/inventory'; break;
        case 'employees': endpoint = '/reports/employees'; break;
        case 'customers': endpoint = '/reports/customers'; break;
      }
      
      const res = await axiosInstance.get(endpoint);
      setData(res.data.data || res.data);
    } catch (error) {
      toast.error('Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    toast.success('Report exporting to CSV...');
    // In a real app, you would convert `data` to CSV and trigger a download
  };

  return (
    <div className="space-y-6 animate-fadeIn h-full flex flex-col">
      <div className="page-header shrink-0">
        <div>
          <h1 className="page-title">Analytics & Reports</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Detailed insights into your restaurant's performance.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white dark:bg-gray-800 p-2 rounded-lg border border-gray-200 dark:border-gray-700">
            <Calendar className="w-4 h-4 text-gray-500" />
            <input 
              type="date" 
              value={dateRange.startDate}
              onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
              className="bg-transparent text-sm focus:outline-none text-gray-700 dark:text-gray-300"
            />
            <span className="text-gray-400">-</span>
            <input 
              type="date" 
              value={dateRange.endDate}
              onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
              className="bg-transparent text-sm focus:outline-none text-gray-700 dark:text-gray-300"
            />
          </div>
          <button onClick={handleExport} className="btn-primary">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        
        {/* Tabs */}
        <div className="flex gap-4 border-b border-gray-200 dark:border-gray-700 shrink-0 mb-6">
          {[
            { id: 'sales', label: 'Sales & Revenue', icon: TrendingUp },
            { id: 'inventory', label: 'Inventory Stock', icon: Package },
            { id: 'employees', label: 'Staff Performance', icon: Users },
            { id: 'customers', label: 'Customer Analytics', icon: BarChart3 }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 pb-3 px-1 border-b-2 font-medium text-sm transition-colors
                ${activeTab === tab.id 
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }
              `}
            >
              <tab.icon className="w-4 h-4" /> {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="card p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">Total {activeTab === 'sales' ? 'Revenue' : 'Count'}</p>
                      <h3 className="text-2xl font-bold">
                        {activeTab === 'sales' ? '₹' : ''}
                        {data?.summary?.total || data?.length || 0}
                      </h3>
                    </div>
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-xl">
                      {activeTab === 'sales' ? <IndianRupee className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
                    </div>
                  </div>
                </div>
                <div className="card p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">Average / Metric 2</p>
                      <h3 className="text-2xl font-bold">{data?.summary?.average || 'N/A'}</h3>
                    </div>
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 text-green-600 rounded-xl">
                      <PieChart className="w-6 h-6" />
                    </div>
                  </div>
                </div>
                <div className="card p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">Status / Metric 3</p>
                      <h3 className="text-2xl font-bold text-green-500">Active</h3>
                    </div>
                    <div className="p-3 bg-purple-50 dark:bg-purple-900/20 text-purple-600 rounded-xl">
                      <TrendingUp className="w-6 h-6" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Data Table */}
              <div className="card">
                <div className="p-5 border-b border-gray-100 dark:border-gray-700">
                  <h3 className="text-lg font-bold">Detailed Data</h3>
                </div>
                <div className="table-wrapper rounded-none border-0 max-h-96">
                  <table className="w-full">
                    <thead className="sticky top-0 bg-gray-50 dark:bg-gray-800">
                      <tr>
                        {activeTab === 'sales' && (
                          <>
                            <th>Date</th>
                            <th>Total Orders</th>
                            <th>Revenue</th>
                            <th>Average Order Value</th>
                          </>
                        )}
                        {activeTab === 'inventory' && (
                          <>
                            <th>Item Name</th>
                            <th>Category</th>
                            <th>Current Stock</th>
                            <th>Status</th>
                          </>
                        )}
                        {activeTab === 'employees' && (
                          <>
                            <th>Employee Name</th>
                            <th>Role</th>
                            <th>Attendance %</th>
                            <th>Performance</th>
                          </>
                        )}
                        {activeTab === 'customers' && (
                          <>
                            <th>Customer Name</th>
                            <th>Total Orders</th>
                            <th>Total Spent</th>
                            <th>Last Visit</th>
                          </>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {(!Array.isArray(data) || data.length === 0) ? (
                        <tr>
                          <td colSpan={4} className="text-center py-8 text-gray-500">
                            No data available for the selected period.
                          </td>
                        </tr>
                      ) : (
                        data.map((row: any, i: number) => (
                          <tr key={row._id || i}>
                            {activeTab === 'sales' && (
                              <>
                                <td className="font-medium">{row._id}</td>
                                <td>{row.totalOrders}</td>
                                <td className="font-semibold text-green-600">₹{row.revenue}</td>
                                <td>₹{Math.round(row.revenue / (row.totalOrders || 1))}</td>
                              </>
                            )}
                            {activeTab === 'inventory' && (
                              <>
                                <td className="font-medium">{row.itemName}</td>
                                <td>{row.category}</td>
                                <td className="font-bold">{row.currentStock} {row.unit}</td>
                                <td>
                                  <span className={row.currentStock <= row.minimumStock ? 'badge-red' : 'badge-green'}>
                                    {row.currentStock <= row.minimumStock ? 'Low Stock' : 'Healthy'}
                                  </span>
                                </td>
                              </>
                            )}
                            {activeTab === 'employees' && (
                              <>
                                <td className="font-medium">{row.name}</td>
                                <td>{row.designation}</td>
                                <td>95%</td>
                                <td>Excellent</td>
                              </>
                            )}
                            {activeTab === 'customers' && (
                              <>
                                <td className="font-medium">{row.name}</td>
                                <td>{row.totalOrders}</td>
                                <td className="font-semibold text-blue-600">₹{row.totalSpent}</td>
                                <td>{new Date(row.updatedAt || row.createdAt).toLocaleDateString()}</td>
                              </>
                            )}
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
