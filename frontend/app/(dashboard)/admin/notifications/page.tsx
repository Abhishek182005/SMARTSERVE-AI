'use client';

import React, { useState, useEffect } from 'react';
import axiosInstance from '@/lib/axiosInstance';
import toast from 'react-hot-toast';
import { Bell, ShoppingBag, CalendarDays, Package, Wallet, Star, CheckCircle2, Trash2 } from 'lucide-react';

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: 'Order' | 'Reservation' | 'Inventory' | 'Payroll' | 'Review' | 'System';
  isRead: boolean;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  createdAt: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  const fetchNotifications = async () => {
    try {
      const res = await axiosInstance.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkAsRead = async (id: string, isRead: boolean) => {
    if (isRead) return;
    try {
      await axiosInstance.patch(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (error) {
      console.error('Failed to mark read', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const res = await axiosInstance.patch('/notifications/read-all');
      if (res.data.success) {
        toast.success('All notifications marked as read');
        setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      }
    } catch (error) {
      toast.error('Failed to update notifications');
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await axiosInstance.delete(`/notifications/${id}`);
      setNotifications(notifications.filter(n => n._id !== id));
      toast.success('Notification deleted');
    } catch (error) {
      toast.error('Failed to delete notification');
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'Order': return <ShoppingBag className="w-5 h-5 text-blue-500" />;
      case 'Reservation': return <CalendarDays className="w-5 h-5 text-indigo-500" />;
      case 'Inventory': return <Package className="w-5 h-5 text-orange-500" />;
      case 'Payroll': return <Wallet className="w-5 h-5 text-green-500" />;
      case 'Review': return <Star className="w-5 h-5 text-yellow-500" />;
      default: return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'High': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hrs ago`;
    if (diffInSeconds < 172800) return 'Yesterday';
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'All') return true;
    if (filter === 'Unread') return !n.isRead;
    if (filter === 'High Priority') return n.priority === 'High' || n.priority === 'Critical';
    return n.type === filter;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="page-header items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="page-title text-gray-900 dark:text-white flex items-center gap-2">
            <Bell className="w-6 h-6" /> Notifications
          </h1>
          {unreadCount > 0 && (
            <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300 text-sm font-semibold">
              {unreadCount} new
            </span>
          )}
        </div>
        <button 
          onClick={handleMarkAllAsRead} 
          disabled={unreadCount === 0}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            unreadCount > 0 
              ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700' 
              : 'opacity-50 cursor-not-allowed bg-gray-50 text-gray-400 dark:bg-gray-900'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" /> Mark All Read
        </button>
      </div>

      <div className="flex overflow-x-auto pb-2 gap-2 hide-scrollbar">
        {['All', 'Unread', 'Order', 'Inventory', 'System', 'High Priority'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              filter === f 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="card p-4 border border-gray-200 dark:border-gray-700 animate-pulse flex gap-4">
              <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
              </div>
            </div>
          ))
        ) : filteredNotifications.length === 0 ? (
          <div className="card p-12 text-center border border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center">
            <Bell className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No notifications</h3>
            <p className="text-gray-500 dark:text-gray-400">You're all caught up! No messages to display here.</p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <div 
              key={notification._id}
              onClick={() => handleMarkAsRead(notification._id, notification.isRead)}
              className={`card p-4 border transition-all cursor-pointer relative group flex gap-4 ${
                notification.isRead 
                  ? 'bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700' 
                  : 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800 shadow-sm'
              }`}
            >
              {!notification.isRead && (
                <div className="absolute top-1/2 -translate-y-1/2 left-0 w-1 h-8 bg-blue-600 rounded-r-md"></div>
              )}
              
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                notification.isRead ? 'bg-gray-100 dark:bg-gray-700' : 'bg-white dark:bg-gray-800 shadow-sm'
              }`}>
                {getIcon(notification.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h4 className={`font-medium truncate ${
                    notification.isRead ? 'text-gray-700 dark:text-gray-300' : 'text-gray-900 dark:text-white font-semibold'
                  }`}>
                    {notification.title}
                  </h4>
                  <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap mt-1 flex-shrink-0">
                    {formatTimeAgo(notification.createdAt)}
                  </span>
                </div>
                <p className={`text-sm ${
                  notification.isRead ? 'text-gray-500 dark:text-gray-400' : 'text-gray-700 dark:text-gray-300'
                }`}>
                  {notification.message}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getPriorityBadge(notification.priority)}`}>
                    {notification.priority}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-medium bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                    {notification.type}
                  </span>
                </div>
              </div>
              
              <button 
                onClick={(e) => handleDelete(e, notification._id)}
                className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all"
                title="Delete notification"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
