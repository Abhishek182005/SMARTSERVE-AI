import mongoose from 'mongoose';

const branchSchema = new mongoose.Schema({
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  name: { type: String, required: [true, 'Branch name is required'], trim: true },
  address: {
    street: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    pincode: { type: String, default: '' }
  },
  phone: { type: String, default: '' },
  managerName: { type: String, default: '' },
  managerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  openingTime: { type: String, default: '09:00' },
  closingTime: { type: String, default: '22:00' },
  isActive: { type: Boolean, default: true },
  notes: { type: String, default: '' }
}, { timestamps: true });

export default mongoose.model('Branch', branchSchema);
