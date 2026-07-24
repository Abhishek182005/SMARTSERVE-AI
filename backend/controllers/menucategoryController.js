import MenuCategory from '../models/MenuCategory.js';

export const getMenuCategories = async (req, res) => {
  try {
    const filter = {};
    if (req.query.restaurantId) filter.restaurantId = req.query.restaurantId;
    const data = await MenuCategory.find(filter).sort({ order: 1, name: 1 });
    res.status(200).json({ success: true, count: data.length, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Keep old name for backward compat
export const getMenuCategorys = getMenuCategories;

export const createMenuCategory = async (req, res) => {
  try {
    const data = await MenuCategory.create(req.body);
    res.status(201).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateMenuCategory = async (req, res) => {
  try {
    const data = await MenuCategory.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!data) return res.status(404).json({ success: false, message: 'Category not found' });
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteMenuCategory = async (req, res) => {
  try {
    const data = await MenuCategory.findByIdAndDelete(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: 'Category not found' });
    res.status(200).json({ success: true, message: 'Category deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
