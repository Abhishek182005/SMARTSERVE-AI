import express from 'express';
import { getMenuItems, getMenuItem, createMenuItem, updateMenuItem, deleteMenuItem } from '../controllers/menuitemController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getMenuItems)
  .post(protect, createMenuItem);

router.route('/:id')
  .get(protect, getMenuItem)
  .put(protect, updateMenuItem)
  .delete(protect, deleteMenuItem);

export default router;
