import mongoose from 'mongoose';

const invoiceSchema = new mongoose.Schema({
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  invoiceNumber: { type: String, unique: true },
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  customerName: { type: String, default: 'Walk-in Customer' },
  customerPhone: { type: String, default: '' },
  customerGST: { type: String, default: '' },
  items: [{
    name: String,
    quantity: Number,
    price: Number,
    total: Number
  }],
  subtotal: { type: Number, required: true },
  taxRate: { type: Number, default: 5 },
  taxAmount: { type: Number, required: true },
  discountAmount: { type: Number, default: 0 },
  tipAmount: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  gstNumber: { type: String, default: '' },
  restaurantName: { type: String, default: '' },
  restaurantAddress: { type: String, default: '' },
  isPaid: { type: Boolean, default: false },
  paymentMethod: { type: String, default: '' },
  pdfUrl: { type: String, default: '' }
}, { timestamps: true });

invoiceSchema.pre('save', async function(next) {
  if (!this.invoiceNumber) {
    const count = await mongoose.model('Invoice').countDocuments({ restaurantId: this.restaurantId });
    const year = new Date().getFullYear();
    this.invoiceNumber = `INV-${year}-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

export default mongoose.model('Invoice', invoiceSchema);
