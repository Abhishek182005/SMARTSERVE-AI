import mongoose from 'mongoose';

const menuItemSchema = new mongoose.Schema({
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuCategory', required: true },
  name: { type: String, required: [true, 'Item name is required'], trim: true },
  description: { type: String, default: '' },
  image: { type: String, default: '' },
  price: { type: Number, required: [true, 'Price is required'], min: 0 },
  discountedPrice: { type: Number, default: null },
  isAvailable: { type: Boolean, default: true },
  isVeg: { type: Boolean, default: true },
  calories: { type: Number, default: 0 },
  preparationTime: { type: Number, default: 15, comment: 'in minutes' },
  ingredients: [{ type: String }],
  allergens: [{ type: String }],
  tags: [{ type: String }],
  isBestSeller: { type: Boolean, default: false },
  isSpecial: { type: Boolean, default: false },
  isCombo: { type: Boolean, default: false },
  comboItems: [{ type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' }],
  rating: { type: Number, default: 0, min: 0, max: 5 },
  totalRatings: { type: Number, default: 0 },
  totalSold: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model('MenuItem', menuItemSchema);
