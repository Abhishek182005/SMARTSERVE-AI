import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import connectDB from './config/db.js';
import { createServer } from 'http';
import { Server } from 'socket.io';

dotenv.config();
connectDB();

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Pass IO to request object for controllers
app.use((req, res, next) => { req.io = io; next(); });

// Middleware
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

// ─── Import Routes ────────────────────────────────────────────────────────────
import authRoutes from './routes/authRoutes.js';
import restaurantRoutes from './routes/restaurantRoutes.js';
import branchRoutes from './routes/branchRoutes.js';
import employeeRoutes from './routes/employeeRoutes.js';
import customerRoutes from './routes/customerRoutes.js';
import menucategoryRoutes from './routes/menucategoryRoutes.js';
import menuitemRoutes from './routes/menuitemRoutes.js';
import inventoryRoutes from './routes/inventoryRoutes.js';
import supplierRoutes from './routes/supplierRoutes.js';
import purchaseorderRoutes from './routes/purchaseorderRoutes.js';
import tableRoutes from './routes/tableRoutes.js';
import reservationRoutes from './routes/reservationRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import invoiceRoutes from './routes/invoiceRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import promotionRoutes from './routes/promotionRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import payrollRoutes from './routes/payrollRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import loyaltyRoutes from './routes/loyaltyRoutes.js';
import financialRoutes from './routes/financialRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';

// ─── Mount Routers ────────────────────────────────────────────────────────────
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/restaurants', restaurantRoutes);
app.use('/api/v1/branches', branchRoutes);
app.use('/api/v1/employees', employeeRoutes);
app.use('/api/v1/customers', customerRoutes);
app.use('/api/v1/menu/categories', menucategoryRoutes);
app.use('/api/v1/menu/items', menuitemRoutes);
app.use('/api/v1/inventory', inventoryRoutes);
app.use('/api/v1/suppliers', supplierRoutes);
app.use('/api/v1/purchase-orders', purchaseorderRoutes);
app.use('/api/v1/tables', tableRoutes);
app.use('/api/v1/reservations', reservationRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/invoices', invoiceRoutes);
app.use('/api/v1/reviews', reviewRoutes);
app.use('/api/v1/promotions', promotionRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/reports', reportRoutes);
app.use('/api/v1/ai', aiRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/payroll', payrollRoutes);
app.use('/api/v1/attendance', attendanceRoutes);
app.use('/api/v1/loyalty', loyaltyRoutes);
app.use('/api/v1/financial', financialRoutes);
app.use('/api/v1/analytics', analyticsRoutes);

app.get('/health', (req, res) => res.json({ status: 'OK', timestamp: new Date().toISOString() }));
app.get('/', (req, res) => res.json({ message: 'SmartServe AI API v1.0', status: 'Running ✅' }));

// ─── Error Handler ────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({ success: false, message: err.message || 'Server Error' });
});

// ─── Socket.IO ────────────────────────────────────────────────────────────────
io.on('connection', (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`);

  socket.on('join_kitchen', () => {
    socket.join('kitchen_room');
    console.log(`👨‍🍳 Socket ${socket.id} joined kitchen_room`);
    socket.emit('kitchen_joined', { message: 'Connected to kitchen' });
  });

  socket.on('join_pos', () => {
    socket.join('pos_room');
    socket.emit('pos_joined', { message: 'Connected to POS' });
  });

  socket.on('order_ready', (data) => {
    io.emit('order_ready_notification', data);
  });

  socket.on('disconnect', () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
  console.log(`📡 Socket.IO enabled`);
  console.log(`💳 Razorpay: ${process.env.ENABLE_RAZORPAY === 'true' ? 'LIVE' : 'Mock/Disabled'}`);
  console.log(`🤖 AI: ${process.env.GEMINI_API_KEY ? 'Gemini Connected' : 'Mock Mode'}`);
});
