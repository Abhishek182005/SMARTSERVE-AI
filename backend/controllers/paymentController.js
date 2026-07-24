import crypto from 'crypto';
import Payment from '../models/Payment.js';
import Order from '../models/Order.js';
import { createOrder as createRazorpayOrder, isPaymentEnabled } from '../config/razorpay.js';

// @desc    Create a payment (Razorpay or direct)
// @route   POST /api/v1/payments
// @access  Private
export const createPayment = async (req, res) => {
  try {
    const { orderId, paymentMethod, amount, restaurantId } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    let razorpayOrder = null;

    if (paymentMethod === 'Razorpay') {
      // Create Razorpay order (mocked in development)
      razorpayOrder = await createRazorpayOrder({
        amount:   Math.round(amount * 100), // paise
        currency: 'INR',
        receipt:  `rcpt_${orderId}`,
        notes:    { orderId: orderId.toString() },
      });
    }

    // Record payment as Pending
    const payment = await Payment.create({
      orderId,
      restaurantId,
      amount,
      paymentMethod,
      status:          paymentMethod === 'Razorpay' ? 'Pending' : 'Success',
      razorpayOrderId: razorpayOrder ? razorpayOrder.id : '',
      transactionId:   paymentMethod !== 'Razorpay' ? `TXN-${Date.now()}` : '',
    });

    // For non-Razorpay payments mark order as paid immediately
    if (paymentMethod !== 'Razorpay') {
      await Order.findByIdAndUpdate(orderId, { paymentStatus: 'Paid' });
    }

    res.status(201).json({
      success: true,
      data:    payment,
      razorpayOrder,
      isPaymentEnabled,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify Razorpay payment signature and mark order paid
// @route   POST /api/v1/payments/verify
// @access  Private
export const verifyRazorpayPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, paymentId } = req.body;

    let isValid = false;

    if (isPaymentEnabled) {
      // Live signature verification
      const body      = `${razorpay_order_id}|${razorpay_payment_id}`;
      const expected  = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
        .update(body)
        .digest('hex');

      isValid = expected === razorpay_signature;
    } else {
      // In mock/dev mode always verify
      isValid = true;
    }

    if (!isValid) {
      return res.status(400).json({ success: false, message: 'Invalid payment signature' });
    }

    // Update payment record
    const payment = await Payment.findByIdAndUpdate(
      paymentId,
      {
        status:           'Success',
        razorpayPaymentId: razorpay_payment_id,
        transactionId:    razorpay_payment_id,
      },
      { new: true }
    );

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment record not found' });
    }

    // Update order payment status
    await Order.findByIdAndUpdate(payment.orderId, { paymentStatus: 'Paid' });

    res.status(200).json({ success: true, data: payment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all payments (filter by orderId, restaurantId, status)
// @route   GET /api/v1/payments
// @access  Private
export const getPayments = async (req, res) => {
  try {
    const filter = {};
    if (req.query.restaurantId) filter.restaurantId = req.query.restaurantId;
    if (req.query.orderId)      filter.orderId      = req.query.orderId;
    if (req.query.status)       filter.status       = req.query.status;
    if (req.query.paymentMethod) filter.paymentMethod = req.query.paymentMethod;

    const payments = await Payment.find(filter)
      .populate('orderId', 'orderNumber totalAmount orderType')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: payments.length, data: payments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Refund a payment
// @route   POST /api/v1/payments/:id/refund
// @access  Private
export const refundPayment = async (req, res) => {
  try {
    const { refundAmount, refundReason } = req.body;

    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    if (payment.status !== 'Success') {
      return res.status(400).json({
        success: false,
        message: 'Only successful payments can be refunded',
      });
    }

    if (Number(refundAmount) > payment.amount) {
      return res.status(400).json({
        success: false,
        message: 'Refund amount cannot exceed original payment amount',
      });
    }

    payment.refundAmount = Number(refundAmount);
    payment.refundReason = refundReason || 'Customer requested refund';
    payment.status       = 'Refunded';
    await payment.save();

    // Update order payment status if partially refunded
    await Order.findByIdAndUpdate(payment.orderId, { paymentStatus: 'Partial' });

    res.status(200).json({ success: true, data: payment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
