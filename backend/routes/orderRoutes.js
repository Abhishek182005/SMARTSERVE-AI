import express from 'express';
import { getOrders, createOrder, getOrder, updateOrder, updateOrderStatus } from '../controllers/orderController.js';
import { protect } from '../middleware/authMiddleware.js';
const router = express.Router();
router.route('/').get(protect, getOrders).post(protect, createOrder);
router.route('/:id').get(protect, getOrder).put(protect, updateOrder);
router.patch('/:id/status', protect, updateOrderStatus);
export default router;
