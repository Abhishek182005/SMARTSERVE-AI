import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  name: { type: String, required: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('OrderItem', schema);
