import express from 'express';
import { getRestaurants, createRestaurant } from '../controllers/restaurantController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getRestaurants)
  .post(protect, createRestaurant);

export default router;
