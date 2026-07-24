import express from 'express';
import {
  getPurchaseOrders, getPurchaseOrder, createPurchaseOrder,
  updatePurchaseOrder, deletePurchaseOrder
} from '../controllers/purchaseorderController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getPurchaseOrders)
  .post(protect, createPurchaseOrder);

router.route('/:id')
  .get(protect, getPurchaseOrder)
  .put(protect, updatePurchaseOrder)
  .delete(protect, deletePurchaseOrder);

export default router;
