import Restaurant from '../models/Restaurant.js';

// @desc    Get all restaurants
// @route   GET /api/v1/restaurants
// @access  Private
export const getRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.find()
      .populate('ownerId', 'name email role')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: restaurants.length, data: restaurants });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a restaurant
// @route   POST /api/v1/restaurants
// @access  Private (Super Admin / Restaurant Owner)
export const createRestaurant = async (req, res) => {
  try {
    // Attach the logged-in user as owner if ownerId is not explicitly set
    if (!req.body.ownerId && req.user) {
      req.body.ownerId = req.user._id;
    }

    const restaurant = await Restaurant.create(req.body);

    res.status(201).json({ success: true, data: restaurant });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single restaurant
// @route   GET /api/v1/restaurants/:id
// @access  Private
export const getRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id)
      .populate('ownerId', 'name email role');

    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    res.status(200).json({ success: true, data: restaurant });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update restaurant
// @route   PUT /api/v1/restaurants/:id
// @access  Private (Owner / Super Admin)
export const updateRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('ownerId', 'name email role');

    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    res.status(200).json({ success: true, data: restaurant });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete restaurant
// @route   DELETE /api/v1/restaurants/:id
// @access  Private (Super Admin)
export const deleteRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findByIdAndDelete(req.params.id);

    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    res.status(200).json({ success: true, message: 'Restaurant deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
