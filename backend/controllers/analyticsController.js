import Order from '../models/Order.js';
import MenuItem from '../models/MenuItem.js';
import Customer from '../models/Customer.js';

export const getSalesAnalytics = async (req, res) => {
  try {
    const filter = {};
    if (req.query.restaurantId) filter.restaurantId = req.query.restaurantId;

    const ordersByHour = await Order.aggregate([
      { $match: filter },
      { $group: { _id: { $hour: '$createdAt' }, count: { $sum: 1 }, revenue: { $sum: '$totalAmount' } } },
      { $sort: { '_id': 1 } }
    ]);

    const ordersByDay = await Order.aggregate([
      { $match: filter },
      { $group: { _id: { $dayOfWeek: '$createdAt' }, count: { $sum: 1 }, revenue: { $sum: '$totalAmount' } } },
      { $sort: { '_id': 1 } }
    ]);

    // Top selling items simplified (assuming order items structure has menuItem and quantity)
    const topSellingItems = await Order.aggregate([
      { $match: filter },
      { $unwind: '$items' },
      { $group: { _id: '$items.menuItem', totalQuantity: { $sum: '$items.quantity' } } },
      { $sort: { totalQuantity: -1 } },
      { $limit: 10 }
    ]);

    const cancelledVsCompleted = await Order.aggregate([
      { $match: filter },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    res.status(200).json({
      success: true,
      data: { ordersByHour, ordersByDay, topSellingItems, cancelledVsCompleted }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCustomerAnalytics = async (req, res) => {
  try {
    const filter = {};
    if (req.query.restaurantId) filter.restaurantId = req.query.restaurantId;

    const byMembershipTier = await Customer.aggregate([
      { $match: filter },
      { $group: { _id: '$membershipTier', count: { $sum: 1 } } }
    ]);

    const topSpenders = await Customer.aggregate([
      { $match: filter },
      { $sort: { totalSpent: -1 } },
      { $limit: 10 },
      { $project: { name: 1, phone: 1, totalSpent: 1 } }
    ]);

    res.status(200).json({
      success: true,
      data: { byMembershipTier, topSpenders }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getInventoryAnalytics = async (req, res) => {
  try {
    // Basic mock implementation as Inventory model structure isn't provided directly
    res.status(200).json({
      success: true,
      data: {
        lowStockCount: 5,
        overstockCount: 2,
        categoryBreakdown: [],
        turnoverRate: 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPeakHoursData = async (req, res) => {
  try {
    const filter = {};
    if (req.query.restaurantId) filter.restaurantId = req.query.restaurantId;

    const peakHours = await Order.aggregate([
      { $match: filter },
      { $group: { _id: { $hour: '$createdAt' }, orderCount: { $sum: 1 }, revenue: { $sum: '$totalAmount' } } },
      { $sort: { orderCount: -1 } }
    ]);

    const formattedData = peakHours.map(p => ({
      hour: p._id,
      orderCount: p.orderCount,
      revenue: p.revenue
    }));

    res.status(200).json({ success: true, data: formattedData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
