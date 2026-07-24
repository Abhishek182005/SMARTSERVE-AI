import express from 'express';
import {
  getInventory, createInventoryItem, updateInventoryItem,
  deleteInventoryItem, getLowStockItems, updateStock
} from '../controllers/inventoryController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Special routes before /:id to avoid conflicts
router.get('/low-stock', protect, getLowStockItems);

router.route('/')
  .get(protect, getInventory)
  .post(protect, createInventoryItem);

router.route('/:id')
  .put(protect, updateInventoryItem)
  .delete(protect, deleteInventoryItem);

router.patch('/:id/stock', protect, updateStock);

export default router;
