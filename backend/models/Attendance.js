import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  date: { type: Date, required: true },
  checkIn: { type: Date },
  checkOut: { type: Date },
  status: { type: String, enum: ['Present', 'Absent', 'Late', 'Half-Day', 'Leave', 'Holiday'], default: 'Present' },
  hoursWorked: { type: Number, default: 0 },
  overtime: { type: Number, default: 0 },
  notes: { type: String, default: '' }
}, { timestamps: true });

attendanceSchema.pre('save', function(next) {
  if (this.checkIn && this.checkOut) {
    const diff = (this.checkOut - this.checkIn) / (1000 * 60 * 60);
    this.hoursWorked = Math.round(diff * 100) / 100;
    if (this.hoursWorked > 8) this.overtime = Math.round((this.hoursWorked - 8) * 100) / 100;
  }
  next();
});

export default mongoose.model('Attendance', attendanceSchema);
