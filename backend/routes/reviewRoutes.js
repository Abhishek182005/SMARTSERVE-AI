import express from 'express';
import { getReviews, createReview, updateReview, getAverageRatings } from '../controllers/reviewController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/averages', protect, getAverageRatings);

router.route('/')
  .get(protect, getReviews)
  .post(protect, createReview);

router.route('/:id')
  .put(protect, updateReview);

// Dedicated reply route (delegates to updateReview with reply field)
router.put('/:id/reply', protect, updateReview);

export default router;
