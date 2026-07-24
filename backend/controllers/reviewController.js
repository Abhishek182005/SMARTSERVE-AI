import Review from '../models/Review.js';
import MenuItem from '../models/MenuItem.js';
import mongoose from 'mongoose';

// @desc    Get all reviews (filter by restaurantId, customerId, isPublic)
// @route   GET /api/v1/reviews
// @access  Private
export const getReviews = async (req, res) => {
  try {
    const filter = {};
    if (req.query.restaurantId) filter.restaurantId = req.query.restaurantId;
    if (req.query.customerId)   filter.customerId   = req.query.customerId;
    if (req.query.orderId)      filter.orderId      = req.query.orderId;
    if (req.query.isPublic !== undefined) filter.isPublic = req.query.isPublic === 'true';

    const reviews = await Review.find(filter)
      .populate('customerId', 'name phone membershipTier')
      .populate('orderId', 'orderNumber orderType totalAmount')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: reviews.length, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a review
// @route   POST /api/v1/reviews
// @access  Private
export const createReview = async (req, res) => {
  try {
    const { foodRating, serviceRating, ambienceRating, cleanlinessRating } = req.body;

    // Auto-calculate overallRating as average of submitted ratings
    const ratings  = [foodRating, serviceRating, ambienceRating, cleanlinessRating].filter(Boolean);
    const avgRating = ratings.length
      ? parseFloat((ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1))
      : null;

    req.body.overallRating = avgRating;

    const review = await Review.create(req.body);

    // Update MenuItem average rating if a menu item is referenced in the review
    // (Best effort – skipped if not provided)
    if (req.body.menuItemId) {
      const allReviews = await Review.find({ restaurantId: req.body.restaurantId });
      const totalRatings = allReviews.length;
      const avgFood      = allReviews.reduce((s, r) => s + (r.foodRating || 0), 0) / totalRatings;

      await MenuItem.findByIdAndUpdate(req.body.menuItemId, {
        rating:       parseFloat(avgFood.toFixed(1)),
        totalRatings: totalRatings,
      });
    }

    res.status(201).json({ success: true, data: review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reply to a review or update sentiment
// @route   PUT /api/v1/reviews/:id
// @access  Private
export const updateReview = async (req, res) => {
  try {
    // If a reply is provided, stamp the reply timestamp
    if (req.body.reply) {
      req.body.repliedAt = new Date();
    }

    const review = await Review.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('customerId', 'name phone');

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    res.status(200).json({ success: true, data: review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get aggregate average ratings for a restaurant
// @route   GET /api/v1/reviews/averages
// @access  Private
export const getAverageRatings = async (req, res) => {
  try {
    const filter = {};
    if (req.query.restaurantId) {
      filter.restaurantId = new mongoose.Types.ObjectId(req.query.restaurantId);
    }

    const result = await Review.aggregate([
      { $match: filter },
      {
        $group: {
          _id:              null,
          avgFood:          { $avg: '$foodRating' },
          avgService:       { $avg: '$serviceRating' },
          avgAmbience:      { $avg: '$ambienceRating' },
          avgCleanliness:   { $avg: '$cleanlinessRating' },
          avgOverall:       { $avg: '$overallRating' },
          totalReviews:     { $sum: 1 },
          avgSentiment:     { $avg: '$sentimentScore' },
        },
      },
      {
        $project: {
          _id:            0,
          avgFood:        { $round: ['$avgFood', 1] },
          avgService:     { $round: ['$avgService', 1] },
          avgAmbience:    { $round: ['$avgAmbience', 1] },
          avgCleanliness: { $round: ['$avgCleanliness', 1] },
          avgOverall:     { $round: ['$avgOverall', 1] },
          totalReviews:   1,
          avgSentiment:   { $round: ['$avgSentiment', 2] },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data:    result[0] || {
        avgFood: 0, avgService: 0, avgAmbience: 0,
        avgCleanliness: 0, avgOverall: 0, totalReviews: 0, avgSentiment: 0,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
