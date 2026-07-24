import mongoose from 'mongoose';

const supplierSchema = new mongoose.Schema({
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  name: { type: String, required: [true, 'Supplier name is required'], trim: true },
  contactPerson: { type: String, default: '' },
  phone: { type: String, required: [true, 'Phone is required'] },
  email: { type: String, lowercase: true },
  address: { type: String, default: '' },
  gstNumber: { type: String, default: '' },
  category: { type: String, default: 'General', comment: 'Type of goods supplied' },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  totalOrders: { type: Number, default: 0 },
  totalSpent: { type: Number, default: 0 },
  bankDetails: {
    accountNumber: { type: String, default: '' },
    ifscCode: { type: String, default: '' },
    bankName: { type: String, default: '' },
    accountName: { type: String, default: '' }
  },
  isActive: { type: Boolean, default: true },
  notes: { type: String, default: '' }
}, { timestamps: true });

export default mongoose.model('Supplier', supplierSchema);
