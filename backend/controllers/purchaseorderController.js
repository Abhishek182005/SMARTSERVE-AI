import PurchaseOrder from '../models/PurchaseOrder.js';

// @desc    Get all purchase orders
// @route   GET /api/v1/purchaseorders
// @access  Private
export const getPurchaseOrders = async (req, res) => {
  try {
    const filter = {};
    if (req.query.restaurantId) filter.restaurantId = req.query.restaurantId;
    if (req.query.supplierId)   filter.supplierId   = req.query.supplierId;
    if (req.query.status)       filter.status       = req.query.status;
    if (req.query.paymentStatus) filter.paymentStatus = req.query.paymentStatus;

    const orders = await PurchaseOrder.find(filter)
      .populate('supplierId', 'name phone email')
      .populate('items.inventoryId', 'itemName unit')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single purchase order
// @route   GET /api/v1/purchaseorders/:id
// @access  Private
export const getPurchaseOrder = async (req, res) => {
  try {
    const order = await PurchaseOrder.findById(req.params.id)
      .populate('supplierId', 'name phone email address gstNumber')
      .populate('restaurantId', 'name gstNumber')
      .populate('items.inventoryId', 'itemName unit currentStock');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Purchase order not found' });
    }

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update purchase order (status, payment, etc.)
// @route   PUT /api/v1/purchaseorders/:id
// @access  Private
export const updatePurchaseOrder = async (req, res) => {
  try {
    if (req.body.status === 'Delivered' && !req.body.actualDelivery) {
      req.body.actualDelivery = new Date();
    }

    const order = await PurchaseOrder.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Purchase order not found' });
    }

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete purchase order
// @route   DELETE /api/v1/purchaseorders/:id
// @access  Private
export const deletePurchaseOrder = async (req, res) => {
  try {
    const order = await PurchaseOrder.findByIdAndDelete(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Purchase order not found' });
    }

    res.status(200).json({ success: true, message: 'Purchase order deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a new purchase order
// @route   POST /api/v1/purchase-orders
// @access  Private
export const createPurchaseOrder = async (req, res) => {
  try {
    // Auto-generate order number if not provided
    if (!req.body.orderNumber) {
      const count = await PurchaseOrder.countDocuments();
      req.body.orderNumber = `PO-${String(count + 1).padStart(5, '0')}`;
    }

    const order = await PurchaseOrder.create(req.body);
    res.status(201).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
