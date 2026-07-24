import mongoose from 'mongoose';

const inventorySchema = new mongoose.Schema({
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  itemName: { type: String, required: [true, 'Item name is required'], trim: true },
  category: { type: String, default: 'General', enum: ['Vegetables', 'Dairy', 'Meat', 'Grains', 'Spices', 'Beverages', 'Packaging', 'Cleaning', 'General'] },
  unit: { type: String, enum: ['kg', 'g', 'L', 'ml', 'pcs', 'dozen', 'box'], required: true },
  currentStock: { type: Number, default: 0, min: 0 },
  minimumStock: { type: Number, default: 10 },
  maximumStock: { type: Number, default: 1000 },
  costPerUnit: { type: Number, default: 0 },
  supplierId: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' },
  expiryDate: { type: Date },
  lastRestockedDate: { type: Date },
  location: { type: String, default: 'Main Storage' },
  notes: { type: String, default: '' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Virtual for stock status
inventorySchema.virtual('stockStatus').get(function() {
  if (this.currentStock <= 0) return 'Out of Stock';
  if (this.currentStock <= this.minimumStock) return 'Critical';
  if (this.currentStock <= this.minimumStock * 1.5) return 'Low';
  return 'Good';
});

inventorySchema.set('toJSON', { virtuals: true });

export default mongoose.model('Inventory', inventorySchema);
