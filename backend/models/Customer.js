import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema({
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant' },
  name: { type: String, required: [true, 'Customer name is required'], trim: true },
  phone: { type: String, required: [true, 'Phone is required'], unique: true },
  email: { type: String, lowercase: true, trim: true },
  address: { type: String, default: '' },
  birthday: { type: Date },
  anniversary: { type: Date },
  loyaltyPoints: { type: Number, default: 0 },
  membershipTier: { type: String, enum: ['Bronze', 'Silver', 'Gold', 'Platinum'], default: 'Bronze' },
  totalOrders: { type: Number, default: 0 },
  totalSpent: { type: Number, default: 0 },
  favoriteItems: [{ type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' }],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Auto-update membership tier based on spend
customerSchema.pre('save', function(next) {
  if (this.totalSpent >= 50000) this.membershipTier = 'Platinum';
  else if (this.totalSpent >= 20000) this.membershipTier = 'Gold';
  else if (this.totalSpent >= 5000) this.membershipTier = 'Silver';
  else this.membershipTier = 'Bronze';
  next();
});

export default mongoose.model('Customer', customerSchema);
