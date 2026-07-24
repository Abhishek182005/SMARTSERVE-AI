import MenuCategory from '../models/MenuCategory.js';
import MenuItem from '../models/MenuItem.js';

// ─────────────────────────────────────────────
// CATEGORY HANDLERS
// ─────────────────────────────────────────────

// @desc    Get all menu categories
// @route   GET /api/v1/menucategories
// @access  Public
export const getCategories = async (req, res) => {
  try {
    const filter = {};
    if (req.query.restaurantId) filter.restaurantId = req.query.restaurantId;
    if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === 'true';

    const categories = await MenuCategory.find(filter)
      .sort({ order: 1, createdAt: -1 });

    res.status(200).json({ success: true, count: categories.length, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a menu category
// @route   POST /api/v1/menucategories
// @access  Private
export const createCategory = async (req, res) => {
  try {
    const category = await MenuCategory.create(req.body);
    res.status(201).json({ success: true, data: category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a menu category
// @route   PUT /api/v1/menucategories/:id
// @access  Private
export const updateCategory = async (req, res) => {
  try {
    const category = await MenuCategory.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    res.status(200).json({ success: true, data: category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a menu category
// @route   DELETE /api/v1/menucategories/:id
// @access  Private
export const deleteCategory = async (req, res) => {
  try {
    const category = await MenuCategory.findByIdAndDelete(req.params.id);

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    res.status(200).json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────
// MENU ITEM HANDLERS
// ─────────────────────────────────────────────

// @desc    Get all menu items
// @route   GET /api/v1/menuitems
// @access  Public
export const getMenuItems = async (req, res) => {
  try {
    const filter = {};
    if (req.query.restaurantId)  filter.restaurantId  = req.query.restaurantId;
    if (req.query.categoryId)    filter.categoryId    = req.query.categoryId;
    if (req.query.isAvailable !== undefined) filter.isAvailable = req.query.isAvailable === 'true';
    if (req.query.isVeg !== undefined)       filter.isVeg       = req.query.isVeg       === 'true';
    if (req.query.isBestSeller !== undefined) filter.isBestSeller = req.query.isBestSeller === 'true';
    if (req.query.isSpecial !== undefined)    filter.isSpecial    = req.query.isSpecial    === 'true';

    const items = await MenuItem.find(filter)
      .populate('categoryId', 'name')
      .populate('restaurantId', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: items.length, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get menu items by category
// @route   GET /api/v1/menuitems/category/:categoryId
// @access  Public
export const getMenuItemsByCategory = async (req, res) => {
  try {
    const items = await MenuItem.find({
      categoryId:  req.params.categoryId,
      isAvailable: true,
    }).sort({ name: 1 });

    res.status(200).json({ success: true, count: items.length, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a menu item
// @route   POST /api/v1/menuitems
// @access  Private
export const createMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.create(req.body);
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a menu item
// @route   PUT /api/v1/menuitems/:id
// @access  Private
export const updateMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('categoryId', 'name');

    if (!item) {
      return res.status(404).json({ success: false, message: 'Menu item not found' });
    }

    res.status(200).json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a menu item
// @route   DELETE /api/v1/menuitems/:id
// @access  Private
export const deleteMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.findByIdAndDelete(req.params.id);

    if (!item) {
      return res.status(404).json({ success: false, message: 'Menu item not found' });
    }

    res.status(200).json({ success: true, message: 'Menu item deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
