'use client';

import { useState, useEffect } from 'react';
import {
  Search, Plus, Minus, Trash2, Receipt, Loader2, ChevronDown,
  Phone, User, UtensilsCrossed, CreditCard, Smartphone, Wallet, Banknote,
  CheckCircle, X, Tag
} from 'lucide-react';
import axiosInstance from '../../../../lib/axiosInstance';
import toast from 'react-hot-toast';

interface MenuItem {
  _id: string;
  name: string;
  price: number;
  discountedPrice?: number;
  category: { _id: string; name: string } | string;
  isVeg: boolean;
  isAvailable: boolean;
  preparationTime?: number;
  imageUrl?: string;
}

interface Category {
  _id: string;
  name: string;
}

interface CartItem {
  item: MenuItem;
  quantity: number;
  notes?: string;
}

const ORDER_TYPES = ['Dine-in', 'Takeaway', 'Delivery'];
const PAYMENT_METHODS = [
  { key: 'cash', label: 'Cash', icon: Banknote },
  { key: 'upi', label: 'UPI', icon: Smartphone },
  { key: 'card', label: 'Card', icon: CreditCard },
  { key: 'wallet', label: 'Wallet', icon: Wallet },
];

export default function POSPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orderType, setOrderType] = useState('Dine-in');
  const [tableNumber, setTableNumber] = useState('1');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [kitchenNotes, setKitchenNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [tip, setTip] = useState(0);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<{ orderNumber: string; total: number } | null>(null);
  const [razorpayEnabled, setRazorpayEnabled] = useState(false);

  useEffect(() => {
    const isRzpEnabled = localStorage.getItem('razorpay_enabled') === 'true';
    setRazorpayEnabled(isRzpEnabled);
    if (isRzpEnabled) {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.head.appendChild(script);
    }
    fetchData();
  }, []);

  useEffect(() => {
    let items = menuItems.filter((i) => i.isAvailable);
    if (selectedCategory !== 'all') {
      items = items.filter((i) => {
        const catId = typeof i.category === 'object' ? i.category._id : i.category;
        return catId === selectedCategory;
      });
    }
    if (searchQuery) {
      items = items.filter((i) => i.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    setFilteredItems(items);
  }, [menuItems, selectedCategory, searchQuery]);

  const fetchData = async () => {
    try {
      const [catRes, menuRes] = await Promise.allSettled([
        axiosInstance.get('/menu/categories'),
        axiosInstance.get('/menu/items'),
      ]);
      if (catRes.status === 'fulfilled') {
        setCategories(catRes.value.data?.data || catRes.value.data || []);
      }
      if (menuRes.status === 'fulfilled') {
        const items = menuRes.value.data?.data || menuRes.value.data || [];
        setMenuItems(items);
      } else {
        // Mock data
        setMenuItems([
          { _id: '1', name: 'Paneer Butter Masala', price: 280, isVeg: true, isAvailable: true, category: { _id: 'main', name: 'Mains' }, preparationTime: 20 },
          { _id: '2', name: 'Butter Naan', price: 40, isVeg: true, isAvailable: true, category: { _id: 'bread', name: 'Breads' }, preparationTime: 8 },
          { _id: '3', name: 'Dal Makhani', price: 220, isVeg: true, isAvailable: true, category: { _id: 'main', name: 'Mains' }, preparationTime: 15 },
          { _id: '4', name: 'Chicken Tikka', price: 380, isVeg: false, isAvailable: true, category: { _id: 'starter', name: 'Starters' }, preparationTime: 25 },
          { _id: '5', name: 'Mango Lassi', price: 80, isVeg: true, isAvailable: true, category: { _id: 'drink', name: 'Drinks' }, preparationTime: 5 },
          { _id: '6', name: 'Gulab Jamun', price: 120, isVeg: true, isAvailable: true, category: { _id: 'dessert', name: 'Desserts' }, preparationTime: 5 },
          { _id: '7', name: 'Veg Biryani', price: 260, isVeg: true, isAvailable: true, category: { _id: 'main', name: 'Mains' }, preparationTime: 30 },
          { _id: '8', name: 'Chicken Biryani', price: 320, isVeg: false, isAvailable: true, category: { _id: 'main', name: 'Mains' }, preparationTime: 30 },
          { _id: '9', name: 'Spring Rolls', price: 160, isVeg: true, isAvailable: true, category: { _id: 'starter', name: 'Starters' }, preparationTime: 12 },
          { _id: '10', name: 'Cold Coffee', price: 90, isVeg: true, isAvailable: true, category: { _id: 'drink', name: 'Drinks' }, preparationTime: 5 },
          { _id: '11', name: 'Masala Dosa', price: 140, isVeg: true, isAvailable: true, category: { _id: 'main', name: 'Mains' }, preparationTime: 15 },
          { _id: '12', name: 'Rasmalai', price: 100, isVeg: true, isAvailable: true, category: { _id: 'dessert', name: 'Desserts' }, preparationTime: 5 },
        ]);
        setCategories([
          { _id: 'starter', name: 'Starters' },
          { _id: 'main', name: 'Mains' },
          { _id: 'bread', name: 'Breads' },
          { _id: 'dessert', name: 'Desserts' },
          { _id: 'drink', name: 'Drinks' },
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.item._id === item._id);
      if (existing) {
        return prev.map((c) => c.item._id === item._id ? { ...c, quantity: c.quantity + 1 } : c);
      }
      return [...prev, { item, quantity: 1 }];
    });
    toast.success(`${item.name} added`, { duration: 1000 });
  };

  const updateQuantity = (id: string, qty: number) => {
    if (qty <= 0) {
      setCart((prev) => prev.filter((c) => c.item._id !== id));
    } else {
      setCart((prev) => prev.map((c) => c.item._id === id ? { ...c, quantity: qty } : c));
    }
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((c) => c.item._id !== id));
  };

  const applyCoupon = () => {
    const codes: Record<string, number> = { 'SAVE10': 10, 'FLAT50': 50, 'NEW20': 20 };
    if (codes[couponCode.toUpperCase()]) {
      const disc = codes[couponCode.toUpperCase()];
      setDiscount(disc);
      toast.success(`Coupon applied! ${disc}% off`);
    } else {
      toast.error('Invalid coupon code');
    }
  };

  const subtotal = cart.reduce((sum, c) => sum + (c.item.discountedPrice || c.item.price) * c.quantity, 0);
  const discountAmount = Math.round((subtotal * discount) / 100);
  const taxableAmount = subtotal - discountAmount;
  const gst = Math.round(taxableAmount * 0.05);
  const tipAmount = Math.round(taxableAmount * (tip / 100));
  const total = taxableAmount + gst + tipAmount;

  const placeOrder = async () => {
    if (cart.length === 0) { toast.error('Cart is empty'); return; }
    setPlacing(true);
    try {
      const items = cart.map((c) => ({
        menuItemId: c.item._id,
        name: c.item.name,
        price: c.item.discountedPrice || c.item.price,
        quantity: c.quantity,
        total: (c.item.discountedPrice || c.item.price) * c.quantity,
      }));
      const payload = {
        items,
        orderType,
        kitchenNotes: kitchenNotes || undefined,
        discountAmount,
        taxAmount: gst,
        tipAmount,
        totalAmount: total,
        subtotal,
        paymentStatus: 'Unpaid',
      };
      const res = await axiosInstance.post('/orders', payload);
      const order = res.data?.data || res.data;
      
      if (razorpayEnabled && (paymentMethod === 'card' || paymentMethod === 'upi')) {
        await initiateRazorpay(order._id || order.orderNumber, total);
      }
      
      setPlacedOrder({ orderNumber: order.orderNumber || `ORD-${Date.now()}`, total });
      setCart([]);
      setCustomerName('');
      setCustomerPhone('');
      setKitchenNotes('');
      setCouponCode('');
      setDiscount(0);
      setTip(0);
      toast.success('Order placed & sent to kitchen!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setPlacing(false);
    }
  };

  const initiateRazorpay = async (orderId: string, amount: number) => {
    try {
      const res = await axiosInstance.post('/payments/razorpay/create', { orderId, amount });
      const { razorpayOrderId, key } = res.data.data || res.data;
      
      const options = {
        key,
        amount: amount * 100, // paise
        currency: 'INR',
        name: 'SmartServe AI',
        description: 'Order Payment',
        order_id: razorpayOrderId,
        handler: async (response: any) => {
          await axiosInstance.post('/payments/razorpay/verify', {
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
            orderId
          });
          toast.success('Payment verified!');
        },
        prefill: { name: customerName, contact: customerPhone },
        theme: { color: '#2563eb' }
      };
      
      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      toast.error('Razorpay initialization failed');
    }
  };

  const getCartCount = (id: string) => {
    return cart.find((c) => c.item._id === id)?.quantity || 0;
  };

  return (
    <div className="flex h-full overflow-hidden">
      {/* Left Panel - Menu */}
      <div className="flex-1 flex flex-col overflow-hidden border-r border-gray-800/50">
        {/* Search & Category Filter */}
        <div className="p-4 space-y-3 border-b border-gray-800/50 bg-gray-900/50 flex-shrink-0">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold text-white">POS System</h1>
            <div className="ml-auto text-gray-400 text-sm">{cart.length} items in cart</div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search menu items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-800/50 border border-gray-700 text-white placeholder-gray-500 rounded-xl px-4 py-2.5 pl-10 text-sm focus:outline-none focus:border-blue-500 transition-all"
            />
          </div>
          {/* Category Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium flex-shrink-0 transition-all ${selectedCategory === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
            >
              All Items
            </button>
            {categories.map((cat) => (
              <button
                key={cat._id}
                onClick={() => setSelectedCategory(cat._id)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium flex-shrink-0 transition-all ${selectedCategory === cat._id ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Menu Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="shimmer h-32 rounded-2xl" />
              ))}
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-gray-500">
              <UtensilsCrossed className="w-8 h-8 mb-2 opacity-50" />
              <p>No items found</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredItems.map((item) => {
                const cartQty = getCartCount(item._id);
                return (
                  <div
                    key={item._id}
                    className={`bg-gray-800/50 border rounded-2xl p-4 cursor-pointer card-hover transition-all ${cartQty > 0 ? 'border-blue-500/40 bg-blue-500/5' : 'border-gray-700/50 hover:border-gray-600/50'}`}
                    onClick={() => addToCart(item)}
                  >
                    {/* Veg/Non-veg indicator */}
                    <div className="flex items-center justify-between mb-2">
                      <div className={`w-4 h-4 border-2 rounded-sm flex items-center justify-center ${item.isVeg ? 'border-green-500' : 'border-red-500'}`}>
                        <div className={`w-2 h-2 rounded-full ${item.isVeg ? 'bg-green-500' : 'bg-red-500'}`} />
                      </div>
                      {cartQty > 0 && (
                        <span className="bg-blue-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                          {cartQty}
                        </span>
                      )}
                    </div>

                    {/* Item placeholder image */}
                    <div className="w-full h-16 bg-gray-700/50 rounded-xl mb-3 flex items-center justify-center text-2xl">
                      {item.isVeg ? '🥗' : '🍗'}
                    </div>

                    <h3 className="text-white text-sm font-semibold leading-tight mb-1 line-clamp-2">{item.name}</h3>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-blue-400 font-bold text-sm">₹{item.discountedPrice || item.price}</span>
                        {item.discountedPrice && (
                          <span className="text-gray-500 text-xs line-through ml-1">₹{item.price}</span>
                        )}
                      </div>
                      {item.preparationTime && (
                        <span className="text-gray-500 text-xs">{item.preparationTime}m</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Right Panel - Cart */}
      <div className="w-80 xl:w-96 flex flex-col bg-gray-900/50 overflow-hidden flex-shrink-0">
        {/* Order Type */}
        <div className="p-4 border-b border-gray-800/50 flex-shrink-0">
          <div className="flex gap-1 bg-gray-800/50 p-1 rounded-xl mb-3">
            {ORDER_TYPES.map((type) => (
              <button
                key={type}
                onClick={() => setOrderType(type)}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${orderType === type ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
              >
                {type}
              </button>
            ))}
          </div>

          {orderType === 'Dine-in' && (
            <div className="flex items-center gap-2">
              <label className="text-gray-400 text-xs flex-shrink-0">Table #</label>
              <select
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                className="flex-1 bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500"
              >
                {[...Array(20)].map((_, i) => (
                  <option key={i + 1} value={i + 1} className="bg-gray-800">Table {i + 1}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-gray-600">
              <Receipt className="w-8 h-8 mb-2" />
              <p className="text-sm">Cart is empty</p>
              <p className="text-xs mt-1">Select items from the menu</p>
            </div>
          ) : (
            cart.map((cartItem) => (
              <div key={cartItem.item._id} className="flex items-center gap-2 bg-gray-800/50 rounded-xl p-3">
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{cartItem.item.name}</p>
                  <p className="text-blue-400 text-xs">₹{(cartItem.item.discountedPrice || cartItem.item.price) * cartItem.quantity}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => updateQuantity(cartItem.item._id, cartItem.quantity - 1)}
                    className="w-6 h-6 bg-gray-700 hover:bg-gray-600 rounded-full flex items-center justify-center text-gray-300"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="text-white text-sm font-bold w-5 text-center">{cartItem.quantity}</span>
                  <button
                    onClick={() => updateQuantity(cartItem.item._id, cartItem.quantity + 1)}
                    className="w-6 h-6 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center text-white"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => removeFromCart(cartItem.item._id)}
                    className="w-6 h-6 bg-red-500/10 hover:bg-red-500/20 rounded-full flex items-center justify-center text-red-400 ml-1"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Customer Info + Summary */}
        <div className="border-t border-gray-800/50 p-3 space-y-3 flex-shrink-0">
          {/* Customer Info */}
          <div className="grid grid-cols-2 gap-2">
            <div className="relative">
              <User className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
              <input
                type="text"
                placeholder="Customer name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full bg-gray-800/50 border border-gray-700 text-white placeholder-gray-500 rounded-lg px-3 py-2 pl-8 text-xs focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="relative">
              <Phone className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
              <input
                type="tel"
                placeholder="Phone number"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full bg-gray-800/50 border border-gray-700 text-white placeholder-gray-500 rounded-lg px-3 py-2 pl-8 text-xs focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Kitchen Notes */}
          <textarea
            placeholder="Kitchen notes (optional)..."
            value={kitchenNotes}
            onChange={(e) => setKitchenNotes(e.target.value)}
            rows={2}
            className="w-full bg-gray-800/50 border border-gray-700 text-white placeholder-gray-500 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500 resize-none"
          />

          {/* Coupon */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Tag className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
              <input
                type="text"
                placeholder="Coupon code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="w-full bg-gray-800/50 border border-gray-700 text-white placeholder-gray-500 rounded-lg px-3 py-2 pl-8 text-xs focus:outline-none focus:border-blue-500"
              />
            </div>
            <button onClick={applyCoupon} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-xs font-semibold">
              Apply
            </button>
          </div>

          {/* Tip */}
          <div className="flex items-center gap-2">
            <span className="text-gray-400 text-xs">Tip:</span>
            <div className="flex gap-1">
              {[0, 5, 10, 15].map((t) => (
                <button
                  key={t}
                  onClick={() => setTip(t)}
                  className={`px-2 py-1 rounded text-xs font-semibold transition-all ${tip === t ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
                >
                  {t === 0 ? 'None' : `${t}%`}
                </button>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="bg-gray-800/50 rounded-xl p-3 space-y-1.5">
            <div className="flex justify-between text-xs text-gray-400">
              <span>Subtotal</span>
              <span>₹{subtotal.toLocaleString()}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-xs text-green-400">
                <span>Discount ({discount}%)</span>
                <span>-₹{discountAmount}</span>
              </div>
            )}
            <div className="flex justify-between text-xs text-gray-400">
              <span>GST (5%)</span>
              <span>₹{gst}</span>
            </div>
            {tip > 0 && (
              <div className="flex justify-between text-xs text-gray-400">
                <span>Tip ({tip}%)</span>
                <span>₹{tipAmount}</span>
              </div>
            )}
            <div className="border-t border-gray-700/50 pt-1.5 flex justify-between font-bold text-white">
              <span>Total</span>
              <span className="text-blue-400 text-lg">₹{total.toLocaleString()}</span>
            </div>
          </div>

          {/* Payment Method */}
          <div className="flex items-center justify-between mb-1">
            <span className="text-gray-400 text-xs font-semibold">Payment Method</span>
            {razorpayEnabled && (
              <span className="bg-green-500/20 text-green-400 text-[10px] font-bold px-2 py-0.5 rounded border border-green-500/30 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" /> Razorpay LIVE
              </span>
            )}
          </div>
          <div className="grid grid-cols-4 gap-1">
            {PAYMENT_METHODS.map((pm) => (
              <button
                key={pm.key}
                onClick={() => setPaymentMethod(pm.key)}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl text-xs font-medium transition-all ${paymentMethod === pm.key ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'bg-gray-800/50 text-gray-500 hover:bg-gray-700/50 border border-gray-700/30'}`}
              >
                <pm.icon className="w-4 h-4" />
                {pm.label}
              </button>
            ))}
          </div>

          {/* Place Order */}
          <button
            onClick={placeOrder}
            disabled={placing || cart.length === 0}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all"
          >
            {placing ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Placing Order...</>
            ) : (
              <><Receipt className="w-4 h-4" /> Place Order · ₹{total.toLocaleString()}</>
            )}
          </button>
        </div>
      </div>

      {/* Order Placed Modal */}
      {placedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-gray-900 border border-gray-700/50 rounded-2xl p-8 max-w-sm w-full mx-4 text-center animate-slideUp">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
            <h2 className="text-xl font-black text-white mb-2">Order Placed!</h2>
            <p className="text-gray-400 mb-1">Order Number</p>
            <p className="text-2xl font-black text-blue-400 mb-1">{placedOrder.orderNumber}</p>
            <p className="text-gray-300 text-lg font-bold mb-6">Total: ₹{placedOrder.total.toLocaleString()}</p>
            <div className="flex gap-3">
              <button
                onClick={() => setPlacedOrder(null)}
                className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-2.5 rounded-xl font-semibold transition-all"
              >
                <X className="w-4 h-4 inline mr-2" />New Order
              </button>
              <button
                onClick={() => { window.print(); setPlacedOrder(null); }}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl font-semibold transition-all"
              >
                <Receipt className="w-4 h-4 inline mr-2" />Print Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
