import Razorpay from 'razorpay';
import dotenv from 'dotenv';
dotenv.config();

export const isPaymentEnabled = process.env.ENABLE_RAZORPAY === 'true';

export const razorpayInstance = isPaymentEnabled ? new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'mock_key_id',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'mock_key_secret',
}) : null;

// Mock function for local development
export const mockCreateOrder = async (options) => {
  return {
    id: `order_mock_${Date.now()}`,
    entity: "order",
    amount: options.amount,
    amount_paid: 0,
    amount_due: options.amount,
    currency: options.currency,
    receipt: options.receipt,
    status: "created",
    attempts: 0,
    notes: options.notes,
    created_at: Math.floor(Date.now() / 1000)
  };
};

export const createOrder = async (options) => {
  if (isPaymentEnabled && razorpayInstance) {
    return await razorpayInstance.orders.create(options);
  } else {
    console.log('[MOCK PAYMENT] Creating mock Razorpay order for local development');
    return await mockCreateOrder(options);
  }
};
