import OrderItem from '../models/OrderItem.js';

export const getOrderItems = async (req, res) => {
  try {
    const data = await OrderItem.find();
    res.status(200).json({ success: true, count: data.length, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createOrderItem = async (req, res) => {
  try {
    const data = await OrderItem.create(req.body);
    res.status(201).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
