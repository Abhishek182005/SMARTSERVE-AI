import express from 'express';
import {
  getPromotions, createPromotion, getPromotion, updatePromotion,
  deletePromotion, applyPromotion
} from '../controllers/promotionController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/apply', protect, applyPromotion);

router.route('/')
  .get(protect, getPromotions)
  .post(protect, createPromotion);

router.route('/:id')
  .get(protect, getPromotion)
  .put(protect, updatePromotion)
  .delete(protect, deletePromotion);

export default router;
