import mongoose from 'mongoose';

const payrollSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  month: { type: Number, required: true, min: 1, max: 12 },
  year: { type: Number, required: true },
  basicSalary: { type: Number, required: true },
  allowances: { type: Number, default: 0 },
  overtimePay: { type: Number, default: 0 },
  bonus: { type: Number, default: 0 },
  deductions: { type: Number, default: 0 },
  netSalary: { type: Number },
  presentDays: { type: Number, default: 0 },
  absentDays: { type: Number, default: 0 },
  status: { type: String, enum: ['Pending', 'Processed', 'Paid'], default: 'Pending' },
  paidAt: { type: Date },
  paymentMethod: { type: String, default: 'Bank Transfer' },
  transactionId: { type: String, default: '' },
  notes: { type: String, default: '' },
  generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

payrollSchema.pre('save', function(next) {
  this.netSalary = this.basicSalary + this.allowances + this.overtimePay + this.bonus - this.deductions;
  next();
});

export default mongoose.model('Payroll', payrollSchema);
