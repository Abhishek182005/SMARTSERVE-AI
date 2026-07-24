import Inventory from '../models/Inventory.js';

// @desc    Get all inventory items
// @route   GET /api/v1/inventory
// @access  Private
export const getInventory = async (req, res) => {
  try {
    const filter = {};
    if (req.query.restaurantId) filter.restaurantId = req.query.restaurantId;
    if (req.query.category)     filter.category     = req.query.category;
    if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === 'true';

    const items = await Inventory.find(filter)
      .populate('supplierId', 'name phone email')
      .sort({ itemName: 1 });

    res.status(200).json({ success: true, count: items.length, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create an inventory item
// @route   POST /api/v1/inventory
// @access  Private
export const createInventoryItem = async (req, res) => {
  try {
    const item = await Inventory.create(req.body);
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update an inventory item
// @route   PUT /api/v1/inventory/:id
// @access  Private
export const updateInventoryItem = async (req, res) => {
  try {
    const item = await Inventory.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('supplierId', 'name phone');

    if (!item) {
      return res.status(404).json({ success: false, message: 'Inventory item not found' });
    }

    res.status(200).json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete an inventory item
// @route   DELETE /api/v1/inventory/:id
// @access  Private
export const deleteInventoryItem = async (req, res) => {
  try {
    const item = await Inventory.findByIdAndDelete(req.params.id);

    if (!item) {
      return res.status(404).json({ success: false, message: 'Inventory item not found' });
    }

    res.status(200).json({ success: true, message: 'Inventory item deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get items whose currentStock < minimumStock
// @route   GET /api/v1/inventory/low-stock
// @access  Private
export const getLowStockItems = async (req, res) => {
  try {
    const filter = { $expr: { $lt: ['$currentStock', '$minimumStock'] }, isActive: true };
    if (req.query.restaurantId) filter.restaurantId = req.query.restaurantId;

    const items = await Inventory.find(filter)
      .populate('supplierId', 'name phone')
      .sort({ currentStock: 1 });

    res.status(200).json({ success: true, count: items.length, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Adjust stock quantity (add or subtract)
// @route   PATCH /api/v1/inventory/:id/stock
// @access  Private
export const updateStock = async (req, res) => {
  try {
    // Accept: { quantity: +/-N } OR legacy { adjustment: N, type: 'add'|'subtract' }
    let delta;
    if (req.body.quantity !== undefined) {
      delta = Number(req.body.quantity); // positive = add, negative = subtract
    } else {
      const adjustment = Number(req.body.adjustment);
      delta = req.body.type === 'subtract' ? -adjustment : adjustment;
    }

    if (isNaN(delta)) {
      return res.status(400).json({ success: false, message: 'Invalid quantity value' });
    }

    const item = await Inventory.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Inventory item not found' });
    }

    const newStock = item.currentStock + delta;
    if (newStock < 0) {
      return res.status(400).json({ success: false, message: `Insufficient stock. Current: ${item.currentStock} ${item.unit}` });
    }

    item.currentStock = newStock;
    if (delta > 0) item.lastRestockedDate = new Date();
    await item.save();

    res.status(200).json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
