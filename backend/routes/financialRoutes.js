import express from 'express';
import {
  getFinancialOverview,
  getRevenueByMonth,
  getExpenseReport,
  getTaxReport
} from '../controllers/financialController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/overview', getFinancialOverview);
router.get('/revenue', getRevenueByMonth);
router.get('/expenses', getExpenseReport);
router.get('/tax', getTaxReport);

export default router;
