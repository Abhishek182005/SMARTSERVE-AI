import Order from '../models/Order.js';
import Customer from '../models/Customer.js';

// Helper – generates a unique order number
const generateOrderNumber = () =>
  `ORD-${Date.now()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;

// @desc    Get all orders with rich filters
// @route   GET /api/v1/orders
// @access  Private
export const getOrders = async (req, res) => {
  try {
    const filter = {};

    if (req.query.restaurantId)  filter.restaurantId  = req.query.restaurantId;
    if (req.query.branchId)      filter.branchId      = req.query.branchId;
    if (req.query.status)        filter.status        = req.query.status;
    if (req.query.orderType)     filter.orderType     = req.query.orderType;
    if (req.query.paymentStatus) filter.paymentStatus = req.query.paymentStatus;
    if (req.query.customerId)    filter.customerId    = req.query.customerId;
    if (req.query.tableId)       filter.tableId       = req.query.tableId;

    // Date range filter
    if (req.query.from || req.query.to) {
      filter.createdAt = {};
      if (req.query.from) filter.createdAt.$gte = new Date(req.query.from);
      if (req.query.to)   filter.createdAt.$lte = new Date(new Date(req.query.to).setHours(23, 59, 59, 999));
    }

    const orders = await Order.find(filter)
      .populate('customerId', 'name phone membershipTier')
      .populate('tableId', 'tableNumber floor')
      .populate('waiterId', 'name designation')
      .populate('items.menuItemId', 'name price image')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create an order
// @route   POST /api/v1/orders
// @access  Private
export const createOrder = async (req, res) => {
  try {
    // Auto-generate order number is handled by the pre-save hook in the model

    // Calculate subtotal from items
    if (req.body.items && req.body.items.length > 0) {
      req.body.subtotal = req.body.items.reduce((sum, item) => sum + item.total, 0);

      // Apply a default tax of 5% if not provided
      if (!req.body.taxAmount) {
        req.body.taxAmount = parseFloat((req.body.subtotal * 0.05).toFixed(2));
      }

      // Compute total
      req.body.totalAmount =
        req.body.subtotal +
        (req.body.taxAmount      || 0) +
        (req.body.tipAmount      || 0) -
        (req.body.discountAmount || 0);
    }

    const order = await Order.create(req.body);

    // Update customer stats
    if (order.customerId) {
      await Customer.findByIdAndUpdate(order.customerId, {
        $inc: { totalOrders: 1 },
      });
    }

    // Real-time: notify kitchen display system
    if (req.io) {
      req.io.to('kitchen_room').emit('new_order', order);
    }

    res.status(201).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single order
// @route   GET /api/v1/orders/:id
// @access  Private
export const getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customerId', 'name phone email membershipTier loyaltyPoints')
      .populate('tableId', 'tableNumber floor capacity')
      .populate('waiterId', 'name designation phone')
      .populate('items.menuItemId', 'name price image isVeg preparationTime')
      .populate('restaurantId', 'name gstNumber address')
      .populate('branchId', 'name address');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update order (general fields)
// @route   PUT /api/v1/orders/:id
// @access  Private
export const updateOrder = async (req, res) => {
  try {
    // Recalculate totals if items changed
    if (req.body.items && req.body.items.length > 0) {
      req.body.subtotal = req.body.items.reduce((sum, item) => sum + item.total, 0);
      if (!req.body.taxAmount) {
        req.body.taxAmount = parseFloat((req.body.subtotal * 0.05).toFixed(2));
      }
      req.body.totalAmount =
        req.body.subtotal +
        (req.body.taxAmount      || 0) +
        (req.body.tipAmount      || 0) -
        (req.body.discountAmount || 0);
    }

    const order = await Order.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update order status only
// @route   PATCH /api/v1/orders/:id/status
// @access  Private
export const updateOrderStatus = async (req, res) => {
  try {
    const { status, kitchenNotes } = req.body;
    const allowed = ['Pending', 'Accepted', 'Preparing', 'Ready', 'Delivered', 'Completed', 'Cancelled'];

    if (!allowed.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed: ${allowed.join(', ')}`,
      });
    }

    const updateData = { status };
    if (kitchenNotes) updateData.kitchenNotes = kitchenNotes;

    // If order is completed, update customer total spent
    const order = await Order.findByIdAndUpdate(req.params.id, updateData, { new: true });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (status === 'Completed' && order.customerId) {
      await Customer.findByIdAndUpdate(order.customerId, {
        $inc: { totalSpent: order.totalAmount },
      });
    }

    // Real-time: broadcast status change
    if (req.io) {
      req.io.to('kitchen_room').emit('order_status_updated', {
        orderId: order._id,
        status:  order.status,
      });
      req.io.emit('order_status_updated', {
        orderId: order._id,
        status:  order.status,
      });
    }

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
