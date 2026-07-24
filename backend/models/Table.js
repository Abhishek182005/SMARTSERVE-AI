import mongoose from 'mongoose';

const tableSchema = new mongoose.Schema({
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch' },
  tableNumber: { type: String, required: [true, 'Table number is required'] },
  capacity: { type: Number, required: [true, 'Capacity is required'], min: 1 },
  status: { type: String, enum: ['Available', 'Occupied', 'Reserved', 'Cleaning'], default: 'Available' },
  qrCode: { type: String, default: '' },
  floor: { type: String, default: 'Ground Floor' },
  section: { type: String, default: 'Main Hall' },
  currentOrderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('Table', tableSchema);
