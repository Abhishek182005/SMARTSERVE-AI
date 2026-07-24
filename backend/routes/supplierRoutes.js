import express from 'express';
import {
  getSuppliers, createSupplier, updateSupplier, deleteSupplier,
  getPurchaseOrders, createPurchaseOrder, updatePurchaseOrder
} from '../controllers/supplierController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getSuppliers)
  .post(protect, createSupplier);

router.route('/:id')
  .put(protect, updateSupplier)
  .delete(protect, deleteSupplier);

router.get('/:id/purchase-orders', protect, getPurchaseOrders);
router.post('/:id/purchase-orders', protect, createPurchaseOrder);
router.put('/:id/purchase-orders/:orderId', protect, updatePurchaseOrder);

export default router;
