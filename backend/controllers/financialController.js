import Order from '../models/Order.js';
import Payroll from '../models/Payroll.js';
import PurchaseOrder from '../models/PurchaseOrder.js';
import mongoose from 'mongoose';

export const getFinancialOverview = async (req, res) => {
  try {
    const filter = {};
    if (req.query.restaurantId) {
      filter.restaurantId = req.query.restaurantId;
    }

    const [orders, payrolls, purchaseOrders] = await Promise.all([
      Order.find({ ...filter, paymentStatus: 'Paid' }),
      Payroll.find(filter),
      PurchaseOrder.find(filter)
    ]);

    const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    const totalPayroll = payrolls.reduce((sum, p) => sum + (p.netSalary || 0), 0);
    const totalPurchases = purchaseOrders.reduce((sum, po) => sum + (po.totalCost || 0), 0);
    
    const totalExpenses = totalPayroll + totalPurchases;
    const netProfit = totalRevenue - totalExpenses;

    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    
    // Revenue by month
    const revenueByMonth = Array(12).fill(0);
    const thisMonthOrders = [];
    const lastMonthOrders = [];

    orders.forEach(order => {
      const date = new Date(order.createdAt);
      const m = date.getMonth(); // 0-11
      const y = date.getFullYear();
      
      if (y === currentYear || (y === currentYear - 1 && m > currentMonth - 1)) {
        // Calculate relative index for last 12 months
        let idx = m - currentMonth;
        if (idx < 0) idx += 12;
        revenueByMonth[idx] += order.totalAmount || 0;
      }

      if (y === currentYear && m + 1 === currentMonth) {
        thisMonthOrders.push(order);
      } else if (
        (m + 1 === currentMonth - 1 && y === currentYear) ||
        (currentMonth === 1 && m === 11 && y === currentYear - 1)
      ) {
        lastMonthOrders.push(order);
      }
    });

    const thisMonthRevenue = thisMonthOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const lastMonthRevenue = lastMonthOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    const expenseBreakdown = {
      payroll: totalPayroll,
      purchaseOrders: totalPurchases
    };

    res.status(200).json({
      success: true,
      data: {
        totalRevenue,
        totalExpenses,
        netProfit,
        thisMonthRevenue,
        lastMonthRevenue,
        revenueByMonth,
        expenseBreakdown
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getRevenueByMonth = async (req, res) => {
  try {
    const filter = { paymentStatus: 'Paid' };
    if (req.query.restaurantId) {
      filter.restaurantId = new mongoose.Types.ObjectId(req.query.restaurantId);
    }

    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
    twelveMonthsAgo.setDate(1);
    twelveMonthsAgo.setHours(0, 0, 0, 0);

    filter.createdAt = { $gte: twelveMonthsAgo };

    const revenue = await Order.aggregate([
      { $match: filter },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          totalRevenue: { $sum: '$totalAmount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.status(200).json({ success: true, data: revenue });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getExpenseReport = async (req, res) => {
  try {
    const filter = {};
    if (req.query.restaurantId) {
      filter.restaurantId = new mongoose.Types.ObjectId(req.query.restaurantId);
    }

    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
    twelveMonthsAgo.setDate(1);
    twelveMonthsAgo.setHours(0, 0, 0, 0);

    const payrolls = await Payroll.aggregate([
      { $match: { ...filter, createdAt: { $gte: twelveMonthsAgo } } },
      {
        $group: {
          _id: { year: '$year', month: '$month' },
          total: { $sum: '$netSalary' }
        }
      }
    ]);

    const pos = await PurchaseOrder.aggregate([
      { $match: { ...filter, createdAt: { $gte: twelveMonthsAgo } } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          total: { $sum: '$totalCost' }
        }
      }
    ]);

    res.status(200).json({ success: true, data: { payrolls, purchaseOrders: pos } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getTaxReport = async (req, res) => {
  try {
    const filter = {};
    if (req.query.restaurantId) {
      filter.restaurantId = new mongoose.Types.ObjectId(req.query.restaurantId);
    }

    const taxes = await Order.aggregate([
      { $match: filter },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          totalTax: { $sum: '$taxAmount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.status(200).json({ success: true, data: taxes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
