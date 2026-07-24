import express from 'express';
import {
  getCustomers, createCustomer, getCustomer, updateCustomer, deleteCustomer,
  addLoyaltyPoints, getCustomerOrders
} from '../controllers/customerController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getCustomers)
  .post(protect, createCustomer);

router.route('/:id')
  .get(protect, getCustomer)
  .put(protect, updateCustomer)
  .delete(protect, deleteCustomer);

router.post('/:id/loyalty', protect, addLoyaltyPoints);
router.get('/:id/orders', protect, getCustomerOrders);

export default router;
