import Invoice from '../models/Invoice.js';
import Order from '../models/Order.js';

// Helper – unique invoice number
const generateInvoiceNumber = () =>
  `INV-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;

// @desc    Get all invoices
// @route   GET /api/v1/invoices
// @access  Private
export const getInvoices = async (req, res) => {
  try {
    const filter = {};
    if (req.query.restaurantId) filter.restaurantId = req.query.restaurantId;
    if (req.query.customerId)   filter.customerId   = req.query.customerId;
    if (req.query.orderId)      filter.orderId      = req.query.orderId;
    if (req.query.isPaid !== undefined) filter.isPaid = req.query.isPaid === 'true';

    const invoices = await Invoice.find(filter)
      .populate('orderId', 'orderNumber orderType totalAmount status')
      .populate('customerId', 'name phone email')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: invoices.length, data: invoices });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single invoice
// @route   GET /api/v1/invoices/:id
// @access  Private
export const getInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('orderId')
      .populate('customerId', 'name phone email address')
      .populate('restaurantId', 'name gstNumber address phone email logo');

    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    res.status(200).json({ success: true, data: invoice });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create invoice (auto-populated from order if orderId provided)
// @route   POST /api/v1/invoices
// @access  Private
export const createInvoice = async (req, res) => {
  try {
    const { orderId } = req.body;

    if (orderId && !req.body.items) {
      // Auto-build invoice from existing order
      const order = await Order.findById(orderId).populate('restaurantId');

      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }

      req.body.items          = order.items.map((i) => ({
        name:     i.name,
        quantity: i.quantity,
        price:    i.price,
        total:    i.total,
      }));
      req.body.subtotal       = order.subtotal;
      req.body.taxAmount      = order.taxAmount;
      req.body.discountAmount = order.discountAmount;
      req.body.totalAmount    = order.totalAmount;
      req.body.restaurantId   = order.restaurantId?._id || order.restaurantId;
      req.body.customerId     = order.customerId;
      req.body.gstNumber      = order.restaurantId?.gstNumber || '';
    }

    if (!req.body.invoiceNumber) {
      req.body.invoiceNumber = generateInvoiceNumber();
    }

    const invoice = await Invoice.create(req.body);

    res.status(201).json({ success: true, data: invoice });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update invoice (e.g. mark as paid, add PDF URL)
// @route   PUT /api/v1/invoices/:id
// @access  Private
export const updateInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    res.status(200).json({ success: true, data: invoice });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete invoice
// @route   DELETE /api/v1/invoices/:id
// @access  Private
export const deleteInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findByIdAndDelete(req.params.id);

    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    res.status(200).json({ success: true, message: 'Invoice deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
