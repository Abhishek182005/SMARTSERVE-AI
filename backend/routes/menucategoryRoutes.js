import express from 'express';
import { getMenuCategories, createMenuCategory, updateMenuCategory, deleteMenuCategory } from '../controllers/menucategoryController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getMenuCategories)
  .post(protect, createMenuCategory);

router.route('/:id')
  .put(protect, updateMenuCategory)
  .delete(protect, deleteMenuCategory);

export default router;
