import Supplier from '../models/Supplier.js';
import PurchaseOrder from '../models/PurchaseOrder.js';

// Helper – generates a unique PO number
const generatePONumber = () =>
  `PO-${Date.now()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;

// @desc    Get all suppliers
// @route   GET /api/v1/suppliers
// @access  Private
export const getSuppliers = async (req, res) => {
  try {
    const filter = {};
    if (req.query.restaurantId) filter.restaurantId = req.query.restaurantId;
    if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === 'true';

    const suppliers = await Supplier.find(filter).sort({ name: 1 });

    res.status(200).json({ success: true, count: suppliers.length, data: suppliers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a supplier
// @route   POST /api/v1/suppliers
// @access  Private
export const createSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.create(req.body);
    res.status(201).json({ success: true, data: supplier });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a supplier
// @route   PUT /api/v1/suppliers/:id
// @access  Private
export const updateSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!supplier) {
      return res.status(404).json({ success: false, message: 'Supplier not found' });
    }

    res.status(200).json({ success: true, data: supplier });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete (soft-delete) a supplier
// @route   DELETE /api/v1/suppliers/:id
// @access  Private
export const deleteSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!supplier) {
      return res.status(404).json({ success: false, message: 'Supplier not found' });
    }

    res.status(200).json({ success: true, message: 'Supplier deactivated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all purchase orders for a supplier
// @route   GET /api/v1/suppliers/:id/purchase-orders
// @access  Private
export const getPurchaseOrders = async (req, res) => {
  try {
    const filter = { supplierId: req.params.id };
    if (req.query.status) filter.status = req.query.status;

    const orders = await PurchaseOrder.find(filter)
      .populate('supplierId', 'name phone')
      .populate('items.inventoryId', 'itemName unit')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a purchase order
// @route   POST /api/v1/suppliers/purchase-orders
// @access  Private
export const createPurchaseOrder = async (req, res) => {
  try {
    const { restaurantId, supplierId, items, expectedDelivery, notes } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Purchase order must include at least one item' });
    }

    // Calculate totals for each line item and the overall PO
    const processedItems = items.map((item) => ({
      ...item,
      total: Number(item.quantity) * Number(item.pricePerUnit),
    }));

    const totalAmount = processedItems.reduce((sum, item) => sum + item.total, 0);

    const purchaseOrder = await PurchaseOrder.create({
      restaurantId,
      supplierId,
      orderNumber: generatePONumber(),
      items: processedItems,
      totalAmount,
      expectedDelivery,
      notes,
    });

    // Increment supplier totalOrders
    await Supplier.findByIdAndUpdate(supplierId, { $inc: { totalOrders: 1 } });

    res.status(201).json({ success: true, data: purchaseOrder });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update purchase order status
// @route   PUT /api/v1/suppliers/purchase-orders/:id
// @access  Private
export const updatePurchaseOrder = async (req, res) => {
  try {
    const po = await PurchaseOrder.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!po) {
      return res.status(404).json({ success: false, message: 'Purchase order not found' });
    }

    res.status(200).json({ success: true, data: po });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
