import mongoose from 'mongoose';

const promotionSchema = new mongoose.Schema({
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  name: { type: String, required: [true, 'Promotion name is required'] },
  code: { type: String, required: [true, 'Coupon code is required'], uppercase: true, unique: true },
  description: { type: String, default: '' },
  type: { type: String, enum: ['Percentage', 'Fixed', 'BOGO', 'FreeItem'], required: true },
  discountValue: { type: Number, required: true },
  minOrderAmount: { type: Number, default: 0 },
  maxDiscountAmount: { type: Number, default: 0 },
  validFrom: { type: Date, required: true },
  validUntil: { type: Date, required: true },
  usageLimit: { type: Number, default: 100 },
  usedCount: { type: Number, default: 0 },
  applicableItems: [{ type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' }],
  applicableCategories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'MenuCategory' }],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('Promotion', promotionSchema);
