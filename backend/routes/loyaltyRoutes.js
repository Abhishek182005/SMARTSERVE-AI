import express from 'express';
import {
  getLoyaltyAccounts,
  getLoyaltyAccount,
  addPoints,
  redeemPoints
} from '../controllers/loyaltyController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getLoyaltyAccounts);
router.post('/add', addPoints);
router.post('/redeem', redeemPoints);
router.get('/:customerId', getLoyaltyAccount);

export default router;
