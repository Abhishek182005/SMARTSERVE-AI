import express from 'express';
import {
  getTables, createTable, updateTable, deleteTable, updateTableStatus
} from '../controllers/tableController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getTables)
  .post(protect, createTable);

router.route('/:id')
  .put(protect, updateTable)
  .delete(protect, deleteTable);

router.patch('/:id/status', protect, updateTableStatus);

export default router;
