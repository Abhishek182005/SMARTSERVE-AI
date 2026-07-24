import mongoose from 'mongoose';

const reservationSchema = new mongoose.Schema({
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  tableId: { type: mongoose.Schema.Types.ObjectId, ref: 'Table' },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  customerName: { type: String, required: [true, 'Customer name is required'] },
  customerPhone: { type: String, required: [true, 'Phone is required'] },
  customerEmail: { type: String },
  date: { type: Date, required: [true, 'Date is required'] },
  time: { type: String, required: [true, 'Time is required'] },
  guests: { type: Number, required: [true, 'Number of guests is required'], min: 1 },
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Seated', 'Completed', 'Cancelled', 'No-Show'],
    default: 'Pending'
  },
  specialRequests: { type: String, default: '' },
  occasion: { type: String, default: '' },
  notes: { type: String, default: '' }
}, { timestamps: true });

export default mongoose.model('Reservation', reservationSchema);
