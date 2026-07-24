import LoyaltyAccount from '../models/LoyaltyAccount.js';
import Customer from '../models/Customer.js';

export const getLoyaltyAccounts = async (req, res) => {
  try {
    const filter = {};
    if (req.query.restaurantId) filter.restaurantId = req.query.restaurantId;

    const accounts = await LoyaltyAccount.find(filter)
      .populate('customerId', 'name phone membershipTier')
      .sort({ currentPoints: -1 });

    res.status(200).json({ success: true, count: accounts.length, data: accounts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getLoyaltyAccount = async (req, res) => {
  try {
    const account = await LoyaltyAccount.findOne({ customerId: req.params.customerId })
      .populate('customerId', 'name phone membershipTier email');

    if (!account) {
      return res.status(404).json({ success: false, message: 'Loyalty account not found' });
    }

    res.status(200).json({ success: true, data: account });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addPoints = async (req, res) => {
  try {
    const { customerId, points, description, orderId, restaurantId } = req.body;

    let account = await LoyaltyAccount.findOne({ customerId });
    if (!account) {
      account = await LoyaltyAccount.create({
        customerId,
        restaurantId,
        currentPoints: 0,
        totalPointsEarned: 0,
        totalPointsRedeemed: 0,
        history: []
      });
    }

    account.currentPoints += Number(points);
    account.totalPointsEarned += Number(points);
    account.history.push({
      transactionType: 'Earned',
      points: Number(points),
      description: description || 'Points earned',
      orderId
    });
    
    await account.save();

    // Auto-upgrade tier: Bronze(0-999), Silver(1000-4999), Gold(5000-9999), Platinum(10000+)
    const customer = await Customer.findById(customerId);
    if (customer) {
      customer.loyaltyPoints = account.currentPoints;
      
      const total = account.totalPointsEarned;
      if (total >= 10000) customer.membershipTier = 'Platinum';
      else if (total >= 5000) customer.membershipTier = 'Gold';
      else if (total >= 1000) customer.membershipTier = 'Silver';
      else customer.membershipTier = 'Bronze';

      await customer.save();
    }

    res.status(200).json({ success: true, data: account });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const redeemPoints = async (req, res) => {
  try {
    const { customerId, points, description, orderId } = req.body;

    const account = await LoyaltyAccount.findOne({ customerId });
    if (!account) {
      return res.status(404).json({ success: false, message: 'Loyalty account not found' });
    }

    if (account.currentPoints < Number(points)) {
      return res.status(400).json({ success: false, message: 'Insufficient points' });
    }

    account.currentPoints -= Number(points);
    account.totalPointsRedeemed += Number(points);
    account.history.push({
      transactionType: 'Redeemed',
      points: Number(points),
      description: description || 'Points redeemed',
      orderId
    });

    await account.save();

    const customer = await Customer.findById(customerId);
    if (customer) {
      customer.loyaltyPoints = account.currentPoints;
      await customer.save();
    }

    res.status(200).json({ success: true, data: account });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
