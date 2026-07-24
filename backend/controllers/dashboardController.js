import Order from '../models/Order.js';
import Customer from '../models/Customer.js';
import Employee from '../models/Employee.js';
import Inventory from '../models/Inventory.js';
import Reservation from '../models/Reservation.js';
import Payment from '../models/Payment.js';
import Review from '../models/Review.js';
import mongoose from 'mongoose';

// @desc    Get comprehensive dashboard statistics
// @route   GET /api/v1/dashboard
// @access  Private
export const getDashboardStats = async (req, res) => {
  try {
    const restaurantId = req.query.restaurantId;

    // Today's date range
    const now      = new Date();
    const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const dayEnd   = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const baseFilter    = restaurantId ? { restaurantId } : {};
    const todayFilter   = { ...baseFilter, createdAt: { $gte: dayStart, $lte: dayEnd } };
    const reservFilter  = { ...baseFilter, date: { $gte: dayStart, $lte: dayEnd } };

    // Run all queries concurrently for maximum performance
    const [
      todayOrdersRaw,
      totalCustomers,
      activeEmployees,
      lowStockItems,
      pendingReservations,
      todayPayments,
      avgRatingResult,
      weeklyRevenue,
      recentReviews,
    ] = await Promise.all([
      // Today's orders
      Order.find(todayFilter)
        .populate('customerId', 'name phone')
        .populate('tableId', 'tableNumber')
        .sort({ createdAt: -1 })
        .lean(),

      // Total active customers
      Customer.countDocuments({ ...baseFilter, isActive: true }),

      // Active employees count
      Employee.countDocuments({ ...baseFilter, isActive: true }),

      // Low stock count
      Inventory.countDocuments({
        ...baseFilter,
        isActive: true,
        $expr: { $lt: ['$currentStock', '$minimumStock'] },
      }),

      // Pending reservations today
      Reservation.countDocuments({
        ...reservFilter,
        status: { $in: ['Pending', 'Confirmed'] },
      }),

      // Today's successful payments for revenue
      Payment.find({
        ...todayFilter,
        status: 'Success',
      }).lean(),

      // Average overall rating
      Review.aggregate([
        ...(restaurantId ? [{ $match: { restaurantId: new mongoose.Types.ObjectId(restaurantId) } }] : []),
        { $group: { _id: null, avgRating: { $avg: '$overallRating' } } },
      ]),

      // Last 7 days revenue aggregation
      Order.aggregate([
        {
          $match: {
            ...(restaurantId ? { restaurantId: new mongoose.Types.ObjectId(restaurantId) } : {}),
            createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
            status:    { $in: ['Completed', 'Delivered'] },
          },
        },
        {
          $group: {
            _id:     { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            revenue: { $sum: '$totalAmount' },
            orders:  { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),

      // 5 most recent reviews
      Review.find(baseFilter)
        .populate('customerId', 'name')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
    ]);

    // Calculate today's revenue from payments
    const todayRevenue = todayPayments.reduce((sum, p) => sum + p.amount, 0);
    const totalOrders  = todayOrdersRaw.length;

    // Categorize today orders by status
    const ordersByStatus = todayOrdersRaw.reduce((acc, o) => {
      acc[o.status] = (acc[o.status] || 0) + 1;
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      data: {
        todayRevenue:        parseFloat(todayRevenue.toFixed(2)),
        totalOrders,
        totalCustomers,
        activeEmployees,
        lowStockCount:       lowStockItems,
        pendingReservations,
        avgRating:           avgRatingResult[0]?.avgRating
                               ? parseFloat(avgRatingResult[0].avgRating.toFixed(1))
                               : 0,
        ordersByStatus,
        recentOrders:        todayOrdersRaw.slice(0, 10),  // latest 10 for table
        weeklyRevenue,
        recentReviews,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
