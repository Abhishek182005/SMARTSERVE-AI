import mongoose from 'mongoose';

/**
 * LoyaltyAccount Model
 * Tracks a customer's earned/redeemed loyalty points with full history.
 */
const loyaltyHistorySchema = new mongoose.Schema(
  {
    date:        { type: Date, default: Date.now },
    points:      { type: Number, required: true },
    type:        { type: String, enum: ['Earned', 'Redeemed'], required: true },
    orderId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    description: { type: String, default: '' },
  },
  { _id: false }
);

const loyaltyAccountSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      unique: true,
      required: [true, 'Customer ID is required'],
    },
    totalPointsEarned: {
      type: Number,
      default: 0,
    },
    totalPointsRedeemed: {
      type: Number,
      default: 0,
    },
    currentPoints: {
      type: Number,
      default: 0,
    },
    tier: {
      type: String,
      enum: ['Bronze', 'Silver', 'Gold', 'Platinum'],
      default: 'Bronze',
    },
    history: [loyaltyHistorySchema],
  },
  { timestamps: true }
);

export default mongoose.model('LoyaltyAccount', loyaltyAccountSchema);
