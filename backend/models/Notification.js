import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['Order', 'Reservation', 'Inventory', 'Payroll', 'Review', 'System', 'Promotion'], default: 'System' },
  isRead: { type: Boolean, default: false },
  priority: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Low' },
  link: { type: String, default: '' },
  data: { type: mongoose.Schema.Types.Mixed }
}, { timestamps: true });

export default mongoose.model('Notification', notificationSchema);
