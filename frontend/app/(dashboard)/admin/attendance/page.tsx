'use client';

import React, { useState, useEffect } from 'react';
import axiosInstance from '@/lib/axiosInstance';
import toast from 'react-hot-toast';
import { Calendar, Clock, UserCheck, UserX, AlertTriangle, Coffee, Plus } from 'lucide-react';

interface Employee {
  _id: string;
  name: string;
  designation: string;
  photo?: string;
}

interface Attendance {
  _id: string;
  employeeId: Employee;
  date: string;
  checkIn?: string;
  checkOut?: string;
  status: 'Present' | 'Absent' | 'Late' | 'Half-Day' | 'Leave';
  hoursWorked?: number;
  overtime?: number;
  notes?: string;
}

export default function AttendancePage() {
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [showModal, setShowModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  
  const [formData, setFormData] = useState({
    status: 'Present',
    checkIn: '',
    checkOut: '',
    notes: ''
  });

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

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      // Might be GET /attendance?date=YYYY-MM-DD or similar. Adjusting to common pattern.
      const res = await axiosInstance.get(`/attendance?date=${selectedDate}`);
      if (res.data.success) {
        setAttendances(res.data.data || []);
      }
    } catch (error: any) {
      console.error('Failed to fetch attendance', error);
      // Fallback to empty list
      setAttendances([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    fetchAttendance();
  }, [selectedDate]);

  const handleCardClick = (employee: Employee) => {
    const existing = attendances.find(a => a.employeeId?._id === employee._id);
    setSelectedEmployee(employee);
    
    if (existing) {
      setFormData({
        status: existing.status,
        checkIn: existing.checkIn || '',
        checkOut: existing.checkOut || '',
        notes: existing.notes || ''
      });
    } else {
      setFormData({
        status: 'Present',
        checkIn: '09:00',
        checkOut: '17:00',
        notes: ''
      });
    }
    
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee) return;

    try {
      const payload = {
        employeeId: selectedEmployee._id,
        date: selectedDate,
        ...formData
      };
      
      const res = await axiosInstance.post('/attendance', payload);
      if (res.data.success) {
        toast.success('Attendance marked successfully');
        setShowModal(false);
        fetchAttendance();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to mark attendance');
    }
  };

  // Compute stats based on the UI data we have
  const presentCount = attendances.filter(a => a.status === 'Present').length;
  const absentCount = attendances.filter(a => a.status === 'Absent').length;
  const lateCount = attendances.filter(a => a.status === 'Late').length;
  const leaveCount = attendances.filter(a => a.status === 'Leave').length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Present': return 'bg-green-500';
      case 'Absent': return 'bg-red-500';
      case 'Late': return 'bg-yellow-500';
      case 'Half-Day': return 'bg-orange-500';
      case 'Leave': return 'bg-blue-500';
      default: return 'bg-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      <div className="page-header items-center justify-between">
        <h1 className="page-title text-gray-900 dark:text-white flex items-center gap-2">
          <Calendar className="w-6 h-6" /> Attendance
        </h1>
        <div className="flex items-center gap-4">
          <input 
            type="date" 
            className="input-field p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
          <button className="btn-primary flex items-center gap-2">
            <UserCheck className="w-4 h-4" /> Export Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card p-5 border border-gray-200 dark:border-gray-700 flex items-center gap-4">
          <div className="p-3 bg-green-100 text-green-600 rounded-full dark:bg-green-900 dark:text-green-300">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Present</p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{presentCount}</h3>
          </div>
        </div>
        
        <div className="card p-5 border border-gray-200 dark:border-gray-700 flex items-center gap-4">
          <div className="p-3 bg-red-100 text-red-600 rounded-full dark:bg-red-900 dark:text-red-300">
            <UserX className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Absent</p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{absentCount}</h3>
          </div>
        </div>

        <div className="card p-5 border border-gray-200 dark:border-gray-700 flex items-center gap-4">
          <div className="p-3 bg-yellow-100 text-yellow-600 rounded-full dark:bg-yellow-900 dark:text-yellow-300">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Late</p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{lateCount}</h3>
          </div>
        </div>

        <div className="card p-5 border border-gray-200 dark:border-gray-700 flex items-center gap-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-full dark:bg-blue-900 dark:text-blue-300">
            <Coffee className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">On Leave</p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{leaveCount}</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="card p-4 border border-gray-200 dark:border-gray-700 animate-pulse flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            </div>
          ))
        ) : employees.length === 0 ? (
          <div className="col-span-full card p-8 text-center border border-gray-200 dark:border-gray-700">
            <p className="text-gray-500 dark:text-gray-400">No employees found. Add employees to track attendance.</p>
          </div>
        ) : (
          employees.map(emp => {
            const att = attendances.find(a => a.employeeId?._id === emp._id);
            const status = att?.status || 'Unmarked';
            
            return (
              <div 
                key={emp._id} 
                onClick={() => handleCardClick(emp)}
                className="card p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md cursor-pointer transition-shadow flex items-center gap-4 relative"
              >
                <div className="absolute top-3 right-3 flex items-center gap-1">
                  <span className={`w-2.5 h-2.5 rounded-full ${getStatusColor(status)}`}></span>
                </div>
                
                <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 font-bold text-lg overflow-hidden shrink-0">
                  {emp.photo ? (
                    <img src={emp.photo} alt={emp.name} className="w-full h-full object-cover" />
                  ) : (
                    emp.name.charAt(0)
                  )}
                </div>
                
                <div className="overflow-hidden">
                  <h3 className="font-semibold text-gray-900 dark:text-white truncate" title={emp.name}>{emp.name}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate" title={emp.designation}>{emp.designation}</p>
                  {att && (att.checkIn || att.checkOut) && (
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> 
                      {att.checkIn || '--:--'} - {att.checkOut || '--:--'}
                    </p>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {showModal && selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm modal-overlay">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden modal-box animate-fadeIn border border-gray-200 dark:border-gray-700">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Mark Attendance</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                &times;
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="mb-2">
                <p className="text-sm text-gray-500 dark:text-gray-400">Employee</p>
                <p className="font-semibold text-gray-900 dark:text-white text-lg">{selectedEmployee.name}</p>
              </div>

              <div>
                <label className="label text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Status</label>
                <select 
                  className="input-field w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  required
                >
                  <option value="Present">Present</option>
                  <option value="Absent">Absent</option>
                  <option value="Late">Late</option>
                  <option value="Half-Day">Half-Day</option>
                  <option value="Leave">On Leave</option>
                </select>
              </div>

              {['Present', 'Late', 'Half-Day'].includes(formData.status) && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Check In</label>
                    <input 
                      type="time" 
                      className="input-field w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      value={formData.checkIn}
                      onChange={(e) => setFormData({...formData, checkIn: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="label text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Check Out</label>
                    <input 
                      type="time" 
                      className="input-field w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      value={formData.checkOut}
                      onChange={(e) => setFormData({...formData, checkOut: e.target.value})}
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="label text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Notes</label>
                <textarea 
                  className="input-field w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Optional notes..."
                ></textarea>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1 py-2 rounded-lg font-medium bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors">
                  Cancel
                </button>
                <button type="submit" className="btn-primary flex-1 py-2 rounded-lg font-medium transition-colors">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
