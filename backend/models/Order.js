import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch' },
  orderNumber: { type: String, unique: true },
  orderType: { type: String, enum: ['Dine-in', 'Takeaway', 'Delivery'], required: true },
  tableId: { type: mongoose.Schema.Types.ObjectId, ref: 'Table' },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  customerName: { type: String, default: 'Walk-in Customer' },
  customerPhone: { type: String, default: '' },
  waiterId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  items: [{
    menuItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    notes: { type: String, default: '' },
    total: { type: Number, required: true }
  }],
  subtotal: { type: Number, required: true },
  discountCode: { type: String, default: '' },
  discountAmount: { type: Number, default: 0 },
  taxRate: { type: Number, default: 5 },
  taxAmount: { type: Number, default: 0 },
  tipAmount: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  status: {
    type: String,
    enum: ['Pending', 'Accepted', 'Preparing', 'Ready', 'Delivered', 'Completed', 'Cancelled'],
    default: 'Pending'
  },
  statusHistory: [{
    status: String,
    changedAt: { type: Date, default: Date.now },
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    note: String
  }],
  kitchenNotes: { type: String, default: '' },
  paymentStatus: { type: String, enum: ['Unpaid', 'Partial', 'Paid'], default: 'Unpaid' },
  paymentMethod: { type: String, enum: ['Cash', 'UPI', 'Credit Card', 'Debit Card', 'Wallet', 'Razorpay', ''], default: '' },
  deliveryAddress: { type: String, default: '' },
  estimatedTime: { type: Number, default: 20, comment: 'minutes' },
  isSplitBill: { type: Boolean, default: false }
}, { timestamps: true });

// Auto-generate order number before save
orderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    const count = await mongoose.model('Order').countDocuments({ restaurantId: this.restaurantId });
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    this.orderNumber = `ORD-${date}-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

export default mongoose.model('Order', orderSchema);
