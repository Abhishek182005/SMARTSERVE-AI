import Order from '../models/Order.js';
import Employee from '../models/Employee.js';
import Attendance from '../models/Attendance.js';
import Inventory from '../models/Inventory.js';
import Customer from '../models/Customer.js';
import Payment from '../models/Payment.js';

// @desc    Sales report grouped by date for a given date range
// @route   GET /api/v1/reports/sales?startDate=&endDate=&restaurantId=
// @access  Private
export const getSalesReport = async (req, res) => {
  try {
    const { startDate, endDate, restaurantId } = req.query;

    const matchStage = {
      status: { $in: ['Completed', 'Delivered'] },
    };

    if (restaurantId) matchStage.restaurantId = restaurantId;

    if (startDate || endDate) {
      matchStage.createdAt = {};
      if (startDate) matchStage.createdAt.$gte = new Date(startDate);
      if (endDate)   matchStage.createdAt.$lte = new Date(new Date(endDate).setHours(23, 59, 59));
    }

    const report = await Order.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id:          { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          totalRevenue: { $sum: '$totalAmount' },
          totalOrders:  { $sum: 1 },
          avgOrderValue:{ $avg: '$totalAmount' },
          dineIn:       { $sum: { $cond: [{ $eq: ['$orderType', 'Dine-in']   }, 1, 0] } },
          takeaway:     { $sum: { $cond: [{ $eq: ['$orderType', 'Takeaway']  }, 1, 0] } },
          delivery:     { $sum: { $cond: [{ $eq: ['$orderType', 'Delivery']  }, 1, 0] } },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          _id:           0,
          date:          '$_id',
          totalRevenue:  { $round: ['$totalRevenue',   2] },
          totalOrders:   1,
          avgOrderValue: { $round: ['$avgOrderValue',  2] },
          dineIn:        1,
          takeaway:      1,
          delivery:      1,
        },
      },
    ]);

    // Summary totals
    const summary = report.reduce(
      (acc, day) => ({
        totalRevenue: acc.totalRevenue + day.totalRevenue,
        totalOrders:  acc.totalOrders  + day.totalOrders,
      }),
      { totalRevenue: 0, totalOrders: 0 }
    );

    res.status(200).json({ success: true, summary, data: report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Employee report with attendance summary for a month/year
// @route   GET /api/v1/reports/employees?restaurantId=&month=&year=
// @access  Private
export const getEmployeeReport = async (req, res) => {
  try {
    const { restaurantId, month, year } = req.query;
    const currentYear  = year  ? Number(year)  : new Date().getFullYear();
    const currentMonth = month ? Number(month) : new Date().getMonth() + 1;

    const empFilter = { isActive: true };
    if (restaurantId) empFilter.restaurantId = restaurantId;

    const employees = await Employee.find(empFilter)
      .populate('branchId', 'name')
      .lean();

    // Date range for attendance
    const start = new Date(currentYear, currentMonth - 1, 1);
    const end   = new Date(currentYear, currentMonth, 0, 23, 59, 59);

    const attendanceSummaries = await Promise.all(
      employees.map(async (emp) => {
        const records = await Attendance.find({
          employeeId: emp._id,
          date:       { $gte: start, $lte: end },
        }).lean();

        const present   = records.filter((r) => r.status === 'Present').length;
        const absent    = records.filter((r) => r.status === 'Absent').length;
        const late      = records.filter((r) => r.status === 'Late').length;
        const halfDay   = records.filter((r) => r.status === 'Half-Day').length;
        const leave     = records.filter((r) => r.status === 'Leave').length;
        const totalHours= parseFloat(records.reduce((s, r) => s + (r.hoursWorked || 0), 0).toFixed(2));
        const overtime  = parseFloat(records.reduce((s, r) => s + (r.overtime    || 0), 0).toFixed(2));

        return {
          employee:   { _id: emp._id, name: emp.name, designation: emp.designation, branch: emp.branchId?.name },
          attendance: { present, absent, late, halfDay, leave, totalHours, overtime },
        };
      })
    );

    res.status(200).json({ success: true, count: employees.length, data: attendanceSummaries });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Inventory stock level report
// @route   GET /api/v1/reports/inventory?restaurantId=
// @access  Private
export const getInventoryReport = async (req, res) => {
  try {
    const filter = {};
    if (req.query.restaurantId) filter.restaurantId = req.query.restaurantId;

    const items = await Inventory.find(filter)
      .populate('supplierId', 'name phone')
      .lean();

    const report = items.map((item) => ({
      itemName:      item.itemName,
      category:      item.category,
      unit:          item.unit,
      currentStock:  item.currentStock,
      minimumStock:  item.minimumStock,
      stockValue:    parseFloat((item.currentStock * (item.costPerUnit || 0)).toFixed(2)),
      status:        item.currentStock <= 0
        ? 'Out of Stock'
        : item.currentStock < item.minimumStock
        ? 'Low Stock'
        : 'Adequate',
      supplier:      item.supplierId?.name || 'N/A',
      expiryDate:    item.expiryDate,
    }));

    const summary = {
      totalItems:   items.length,
      outOfStock:   report.filter((i) => i.status === 'Out of Stock').length,
      lowStock:     report.filter((i) => i.status === 'Low Stock').length,
      adequate:     report.filter((i) => i.status === 'Adequate').length,
      totalValue:   parseFloat(report.reduce((s, i) => s + i.stockValue, 0).toFixed(2)),
    };

    res.status(200).json({ success: true, summary, data: report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Customer report – top customers by spend
// @route   GET /api/v1/reports/customers?restaurantId=&limit=
// @access  Private
export const getCustomerReport = async (req, res) => {
  try {
    const limit        = Number(req.query.limit) || 20;
    const restaurantId = req.query.restaurantId;

    // Top customers by total spent
    const topCustomers = await Customer.find({ isActive: true })
      .sort({ totalSpent: -1 })
      .limit(limit)
      .lean();

    // Tier distribution
    const tierDist = await Customer.aggregate([
      { $group: { _id: '$membershipTier', count: { $sum: 1 } } },
    ]);

    const totalCustomers = await Customer.countDocuments({ isActive: true });

    res.status(200).json({
      success: true,
      summary: {
        totalCustomers,
        tierDistribution: tierDist,
      },
      data: topCustomers,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Monthly revenue for the current/requested year
// @route   GET /api/v1/reports/revenue?year=&restaurantId=
// @access  Private
export const getRevenueByMonth = async (req, res) => {
  try {
    const year         = Number(req.query.year) || new Date().getFullYear();
    const restaurantId = req.query.restaurantId;

    const matchStage = {
      status:    { $in: ['Completed', 'Delivered'] },
      createdAt: {
        $gte: new Date(`${year}-01-01`),
        $lte: new Date(`${year}-12-31T23:59:59`),
      },
    };

    if (restaurantId) matchStage.restaurantId = restaurantId;

    const monthly = await Order.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id:          { $month: '$createdAt' },
          totalRevenue: { $sum: '$totalAmount' },
          totalOrders:  { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Build a complete 12-month array (fill 0 for missing months)
    const months    = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const fullYear  = months.map((name, idx) => {
      const found = monthly.find((m) => m._id === idx + 1);
      return {
        month:        name,
        monthNumber:  idx + 1,
        totalRevenue: found ? parseFloat(found.totalRevenue.toFixed(2)) : 0,
        totalOrders:  found ? found.totalOrders : 0,
      };
    });

    const annualRevenue = fullYear.reduce((s, m) => s + m.totalRevenue, 0);

    res.status(200).json({
      success: true,
      year,
      annualRevenue: parseFloat(annualRevenue.toFixed(2)),
      data: fullYear,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
