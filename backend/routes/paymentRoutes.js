import express from 'express';
import { createPayment, verifyRazorpayPayment, getPayments, refundPayment } from '../controllers/paymentController.js';
import { createOrder as createRazorpayOrder, isPaymentEnabled } from '../config/razorpay.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET/POST /api/v1/payments
router.route('/')
  .get(protect, getPayments)
  .post(protect, createPayment);

// POST /api/v1/payments/razorpay/create
// Returns { razorpayOrderId, key } for the frontend Razorpay SDK
router.post('/razorpay/create', protect, async (req, res) => {
  try {
    const { orderId, amount } = req.body;
    if (!amount) return res.status(400).json({ success: false, message: 'amount is required' });

    const razorpayOrder = await createRazorpayOrder({
      amount:   Math.round(amount * 100),
      currency: 'INR',
      receipt:  `rcpt_${orderId || Date.now()}`,
      notes:    { orderId: String(orderId) },
    });

    res.json({
      success: true,
      data: {
        razorpayOrderId: razorpayOrder.id,
        key:             process.env.RAZORPAY_KEY_ID || 'rzp_test_mock',
        amount:          razorpayOrder.amount,
        currency:        razorpayOrder.currency,
        isPaymentEnabled,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/v1/payments/razorpay/verify
router.post('/razorpay/verify', protect, verifyRazorpayPayment);

// POST /api/v1/payments/verify-razorpay  (backward-compatible alias)
router.post('/verify-razorpay', protect, verifyRazorpayPayment);

// POST /api/v1/payments/:id/refund
router.post('/:id/refund', protect, refundPayment);

export default router;
