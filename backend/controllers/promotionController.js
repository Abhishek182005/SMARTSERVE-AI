import Promotion from '../models/Promotion.js';
import Order from '../models/Order.js';

// @desc    Get all promotions
// @route   GET /api/v1/promotions
// @access  Private
export const getPromotions = async (req, res) => {
  try {
    const filter = {};
    if (req.query.restaurantId) filter.restaurantId = req.query.restaurantId;
    if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === 'true';
    if (req.query.type)         filter.type         = req.query.type;

    const promotions = await Promotion.find(filter)
      .populate('applicableItems', 'name price image')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: promotions.length, data: promotions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a promotion
// @route   POST /api/v1/promotions
// @access  Private
export const createPromotion = async (req, res) => {
  try {
    // Ensure code is uppercase
    if (req.body.code) {
      req.body.code = req.body.code.toUpperCase();
    }

    const promotion = await Promotion.create(req.body);
    res.status(201).json({ success: true, data: promotion });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single promotion
// @route   GET /api/v1/promotions/:id
// @access  Private
export const getPromotion = async (req, res) => {
  try {
    const promotion = await Promotion.findById(req.params.id)
      .populate('applicableItems', 'name price image');

    if (!promotion) {
      return res.status(404).json({ success: false, message: 'Promotion not found' });
    }

    res.status(200).json({ success: true, data: promotion });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a promotion
// @route   PUT /api/v1/promotions/:id
// @access  Private
export const updatePromotion = async (req, res) => {
  try {
    if (req.body.code) {
      req.body.code = req.body.code.toUpperCase();
    }

    const promotion = await Promotion.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!promotion) {
      return res.status(404).json({ success: false, message: 'Promotion not found' });
    }

    res.status(200).json({ success: true, data: promotion });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a promotion
// @route   DELETE /api/v1/promotions/:id
// @access  Private
export const deletePromotion = async (req, res) => {
  try {
    const promotion = await Promotion.findByIdAndDelete(req.params.id);

    if (!promotion) {
      return res.status(404).json({ success: false, message: 'Promotion not found' });
    }

    res.status(200).json({ success: true, message: 'Promotion deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Validate and apply a promotion code to an order
// @route   POST /api/v1/promotions/apply
// @access  Private
export const applyPromotion = async (req, res) => {
  try {
    const { code, orderAmount } = req.body;

    const promotion = await Promotion.findOne({
      code:     code.toUpperCase(),
      isActive: true,
    });

    if (!promotion) {
      return res.status(404).json({ success: false, message: 'Invalid or expired promotion code' });
    }

    // Validity check
    const now = new Date();
    if (promotion.validFrom   && now < promotion.validFrom)   {
      return res.status(400).json({ success: false, message: 'Promotion has not started yet' });
    }
    if (promotion.validUntil  && now > promotion.validUntil)  {
      return res.status(400).json({ success: false, message: 'Promotion has expired' });
    }
    if (promotion.usageLimit  && promotion.usedCount >= promotion.usageLimit) {
      return res.status(400).json({ success: false, message: 'Promotion usage limit reached' });
    }
    if (promotion.minOrderAmount && Number(orderAmount) < promotion.minOrderAmount) {
      return res.status(400).json({
        success: false,
        message: `Minimum order amount of ₹${promotion.minOrderAmount} required`,
      });
    }

    // Calculate discount
    let discountAmount = 0;
    if (promotion.type === 'Percentage') {
      discountAmount = (Number(orderAmount) * promotion.discountValue) / 100;
      if (promotion.maxDiscountAmount) {
        discountAmount = Math.min(discountAmount, promotion.maxDiscountAmount);
      }
    } else if (promotion.type === 'Fixed') {
      discountAmount = promotion.discountValue;
    }

    discountAmount = parseFloat(discountAmount.toFixed(2));

    // Increment usage count
    await Promotion.findByIdAndUpdate(promotion._id, { $inc: { usedCount: 1 } });

    res.status(200).json({
      success: true,
      data: {
        promotion,
        discountAmount,
        finalAmount: parseFloat((Number(orderAmount) - discountAmount).toFixed(2)),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
