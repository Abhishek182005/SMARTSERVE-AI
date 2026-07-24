import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  customerName: { type: String, default: 'Anonymous' },
  foodRating: { type: Number, required: true, min: 1, max: 5 },
  serviceRating: { type: Number, required: true, min: 1, max: 5 },
  ambienceRating: { type: Number, min: 1, max: 5, default: 5 },
  cleanlinessRating: { type: Number, min: 1, max: 5, default: 5 },
  overallRating: { type: Number, min: 1, max: 5 },
  comment: { type: String, default: '' },
  sentiment: { type: String, enum: ['Positive', 'Neutral', 'Negative', ''], default: '' },
  sentimentScore: { type: Number, default: 0, min: -1, max: 1 },
  isPublic: { type: Boolean, default: true },
  reply: { type: String, default: '' },
  repliedAt: { type: Date },
  repliedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

reviewSchema.pre('save', function(next) {
  this.overallRating = Math.round((this.foodRating + this.serviceRating + this.ambienceRating + this.cleanlinessRating) / 4 * 10) / 10;
  if (this.overallRating >= 4) this.sentiment = 'Positive';
  else if (this.overallRating >= 2.5) this.sentiment = 'Neutral';
  else this.sentiment = 'Negative';
  next();
});

export default mongoose.model('Review', reviewSchema);
