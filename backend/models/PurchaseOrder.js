import mongoose from 'mongoose';

const purchaseOrderSchema = new mongoose.Schema({
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  supplierId: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', required: true },
  orderNumber: { type: String, unique: true },
  items: [{
    inventoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Inventory' },
    itemName: { type: String, required: true },
    quantity: { type: Number, required: true },
    unit: { type: String, required: true },
    pricePerUnit: { type: Number, required: true },
    total: { type: Number }
  }],
  totalAmount: { type: Number },
  status: { type: String, enum: ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'], default: 'Pending' },
  expectedDelivery: { type: Date },
  actualDelivery: { type: Date },
  notes: { type: String, default: '' },
  paymentStatus: { type: String, enum: ['Unpaid', 'Partial', 'Paid'], default: 'Unpaid' },
  invoiceUrl: { type: String, default: '' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

purchaseOrderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    const count = await mongoose.model('PurchaseOrder').countDocuments({ restaurantId: this.restaurantId });
    this.orderNumber = `PO-${String(count + 1).padStart(5, '0')}`;
  }
  // Calculate line totals and grand total
  if (this.items && this.items.length) {
    this.items.forEach(item => { item.total = item.quantity * item.pricePerUnit; });
    this.totalAmount = this.items.reduce((sum, i) => sum + i.total, 0);
  }
  next();
});

export default mongoose.model('PurchaseOrder', purchaseOrderSchema);
