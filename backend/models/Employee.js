import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema({
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: { type: String, required: [true, 'Employee name is required'], trim: true },
  photo: { type: String, default: '' },
  email: { type: String, lowercase: true, trim: true },
  phone: { type: String },
  designation: {
    type: String,
    enum: ['Manager', 'Cashier', 'Waiter', 'Chef', 'Kitchen Staff', 'Delivery Partner', 'Cleaner', 'Receptionist', 'Other'],
    required: true
  },
  salary: { type: Number, required: true, min: 0 },
  shift: { type: String, enum: ['Morning', 'Evening', 'Night', 'Flexible'], default: 'Morning' },
  joiningDate: { type: Date, default: Date.now },
  experience: { type: Number, default: 0, comment: 'years of experience' },
  address: { type: String, default: '' },
  emergencyContact: { type: String, default: '' },
  aadharNumber: { type: String, default: '' },
  panNumber: { type: String, default: '' },
  bankAccountNumber: { type: String, default: '' },
  ifscCode: { type: String, default: '' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('Employee', employeeSchema);
