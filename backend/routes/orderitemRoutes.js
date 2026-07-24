import express from 'express';
import { getOrderItems, createOrderItem } from '../controllers/orderitemController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getOrderItems)
  .post(protect, createOrderItem);

export default router;
