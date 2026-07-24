'use client';
import { useState, useEffect } from 'react';
import { Settings, Save, CheckCircle2, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import axiosInstance from '@/lib/axiosInstance';

export default function SettingsPage() {
  const [saving, setSaving] = useState(false);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [razorpayEnabled, setRazorpayEnabled] = useState(false);
  
  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      name: 'SmartServe AI',
      gstNumber: '22AAAAA0000A1Z5',
      address: '123 Food Street, Tech Park, Bangalore',
      phone: '+91 9876543210',
      email: 'hello@smartserve.com',
      defaultTaxRate: 5,
      currency: 'INR',
      autoPrintReceipts: true,
      openingTime: '09:00',
      closingTime: '23:00'
    }
  });

  useEffect(() => {
    // Check Razorpay local storage
    const rzp = localStorage.getItem('razorpay_enabled');
    if (rzp === 'true') setRazorpayEnabled(true);

    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await axiosInstance.get('/restaurants');
      const data = res.data.data || res.data;
      if (Array.isArray(data) && data.length > 0) {
        setRestaurantId(data[0]._id);
        reset(data[0]);
      } else if (data && !Array.isArray(data) && data._id) {
        setRestaurantId(data._id);
        reset(data);
      }
    } catch (error) {
      console.error('Failed to load settings', error);
    }
  };

  const onSubmit = async (data: any) => {
    setSaving(true);
    try {
      if (restaurantId) {
        await axiosInstance.put(`/restaurants/${restaurantId}`, data);
      } else {
        const res = await axiosInstance.post('/restaurants', data);
        const newData = res.data.data || res.data;
        if (newData._id) setRestaurantId(newData._id);
      }
      toast.success('Settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const toggleRazorpay = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    setRazorpayEnabled(isChecked);
    localStorage.setItem('razorpay_enabled', isChecked ? 'true' : 'false');
    toast.success(isChecked ? 'Razorpay Enabled' : 'Razorpay Disabled');
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 animate-fadeIn h-full overflow-y-auto pb-10">
      <div className="page-header shrink-0">
        <div>
          <h1 className="page-title">System Settings</h1>
          <p className="text-gray-500 mt-1">Configure your restaurant profile, POS, and payment gateways.</p>
        </div>
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><Save className="w-4 h-4" /> Save Changes</>}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Restaurant Profile */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">Restaurant Profile</h2>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="label">Restaurant Name</label><input type="text" {...register('name')} className="input-field" required /></div>
              <div><label className="label">GST Number</label><input type="text" {...register('gstNumber')} className="input-field" /></div>
              <div className="col-span-2"><label className="label">Address</label><input type="text" {...register('address')} className="input-field" /></div>
              <div><label className="label">Contact Phone</label><input type="text" {...register('phone')} className="input-field" /></div>
              <div><label className="label">Contact Email</label><input type="email" {...register('email')} className="input-field" /></div>
            </div>
          </div>

          {/* Working Hours */}
          <div className="card p-6">
            <h2 className="text-lg font-bold mb-4">Working Hours</h2>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="label">Opening Time</label><input type="time" {...register('openingTime')} className="input-field" /></div>
              <div><label className="label">Closing Time</label><input type="time" {...register('closingTime')} className="input-field" /></div>
            </div>
          </div>

          {/* POS Settings */}
          <div className="card p-6">
            <h2 className="text-lg font-bold mb-4">POS Settings</h2>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="label">Default Tax Rate (%)</label><input type="number" {...register('defaultTaxRate')} className="input-field" /></div>
              <div><label className="label">Currency</label>
                <select {...register('currency')} className="input-field">
                  <option value="INR">INR (₹)</option>
                  <option value="USD">USD ($)</option>
                </select>
              </div>
              <div className="col-span-2 flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-xl">
                <div>
                  <p className="font-bold">Auto-print Receipts</p>
                  <p className="text-sm text-gray-500">Automatically print invoice on payment completion</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" {...register('autoPrintReceipts')} className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Third Party Integrations */}
        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="text-lg font-bold mb-4">Integrations</h2>
            
            <div className="space-y-4">
              {/* Razorpay */}
              <div className={`border p-4 rounded-xl transition-colors ${razorpayEnabled ? 'border-green-500/30 bg-green-500/5' : 'border-gray-200 dark:border-gray-700'}`}>
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-3">
                    <h3 className={`font-bold flex items-center gap-2 ${razorpayEnabled ? 'text-green-600 dark:text-green-400' : 'text-gray-700 dark:text-gray-300'}`}>
                      {razorpayEnabled ? <CheckCircle2 className="w-4 h-4" /> : null} Razorpay
                    </h3>
                    {razorpayEnabled ? <span className="badge-green text-xs">Connected</span> : null}
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={razorpayEnabled} onChange={toggleRazorpay} />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-green-500"></div>
                  </label>
                </div>
                <p className="text-xs text-gray-500 mb-3">Accept UPI and cards online.</p>
                <button type="button" className="text-sm font-medium text-gray-500 hover:text-gray-700">Configure Keys</button>
              </div>

              {/* Gemini AI */}
              <div className="border border-blue-500/30 bg-blue-500/5 p-4 rounded-xl">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-blue-600 dark:text-blue-400 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> Google Gemini AI
                  </h3>
                  <span className="badge-blue">Connected</span>
                </div>
                <p className="text-xs text-gray-500 mb-3">Powers the SmartServe Advisor.</p>
                <button className="text-sm font-medium text-gray-500 hover:text-gray-700">Configure Keys</button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </form>
  );
}