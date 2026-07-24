import express from 'express';
import {
  getReservations, createReservation, updateReservation,
  cancelReservation, getTodayReservations
} from '../controllers/reservationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/today', protect, getTodayReservations);

router.route('/')
  .get(protect, getReservations)
  .post(protect, createReservation);

router.route('/:id')
  .put(protect, updateReservation)
  .delete(protect, cancelReservation);

export default router;
