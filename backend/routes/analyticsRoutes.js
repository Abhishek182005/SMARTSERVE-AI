import express from 'express';
import {
  getSalesAnalytics,
  getCustomerAnalytics,
  getInventoryAnalytics,
  getPeakHoursData
} from '../controllers/analyticsController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/sales', getSalesAnalytics);
router.get('/customers', getCustomerAnalytics);
router.get('/inventory', getInventoryAnalytics);
router.get('/peak-hours', getPeakHoursData);

export default router;
