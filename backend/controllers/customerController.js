import Customer from '../models/Customer.js';
import Order from '../models/Order.js';
import LoyaltyAccount from '../models/LoyaltyAccount.js';

// @desc    Get all customers
// @route   GET /api/v1/customers
// @access  Private
export const getCustomers = async (req, res) => {
  try {
    const filter = {};
    if (req.query.membershipTier) filter.membershipTier = req.query.membershipTier;
    if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === 'true';

    const customers = await Customer.find(filter).sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: customers.length, data: customers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a customer
// @route   POST /api/v1/customers
// @access  Private
export const createCustomer = async (req, res) => {
  try {
    const customer = await Customer.create(req.body);

    // Also create a linked loyalty account
    await LoyaltyAccount.create({ customerId: customer._id });

    res.status(201).json({ success: true, data: customer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single customer
// @route   GET /api/v1/customers/:id
// @access  Private
export const getCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    // Fetch loyalty account alongside
    const loyaltyAccount = await LoyaltyAccount.findOne({ customerId: customer._id });

    res.status(200).json({ success: true, data: { ...customer.toObject(), loyaltyAccount } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update customer
// @route   PUT /api/v1/customers/:id
// @access  Private
export const updateCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    res.status(200).json({ success: true, data: customer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete (soft-delete) customer
// @route   DELETE /api/v1/customers/:id
// @access  Private
export const deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    res.status(200).json({ success: true, message: 'Customer deactivated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add / redeem loyalty points for a customer
// @route   POST /api/v1/customers/:id/loyalty
// @access  Private
export const addLoyaltyPoints = async (req, res) => {
  try {
    const { points, type = 'Earned', orderId, description = '' } = req.body;
    const customerId = req.params.id;

    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    let loyaltyAccount = await LoyaltyAccount.findOne({ customerId });
    if (!loyaltyAccount) {
      loyaltyAccount = await LoyaltyAccount.create({ customerId });
    }

    const pts = Number(points);

    if (type === 'Earned') {
      loyaltyAccount.totalPointsEarned += pts;
      loyaltyAccount.currentPoints     += pts;
      customer.loyaltyPoints           += pts;
    } else if (type === 'Redeemed') {
      if (loyaltyAccount.currentPoints < pts) {
        return res.status(400).json({ success: false, message: 'Insufficient loyalty points' });
      }
      loyaltyAccount.totalPointsRedeemed += pts;
      loyaltyAccount.currentPoints       -= pts;
      customer.loyaltyPoints             -= pts;
    }

    // Compute tier upgrades
    const cp = loyaltyAccount.currentPoints;
    if (cp >= 5000)      loyaltyAccount.tier = 'Platinum';
    else if (cp >= 2000) loyaltyAccount.tier = 'Gold';
    else if (cp >= 500)  loyaltyAccount.tier = 'Silver';
    else                 loyaltyAccount.tier = 'Bronze';

    customer.membershipTier = loyaltyAccount.tier;

    loyaltyAccount.history.push({ date: new Date(), points: pts, type, orderId, description });

    await loyaltyAccount.save();
    await customer.save();

    res.status(200).json({ success: true, data: loyaltyAccount });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all orders for a customer
// @route   GET /api/v1/customers/:id/orders
// @access  Private
export const getCustomerOrders = async (req, res) => {
  try {
    const orders = await Order.find({ customerId: req.params.id })
      .populate('items.menuItemId', 'name price image')
      .populate('tableId', 'tableNumber')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
