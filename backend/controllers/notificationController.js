import Notification from '../models/Notification.js';

// @desc    Get all notifications for a user/restaurant
// @route   GET /api/v1/notifications
// @access  Private
export const getNotifications = async (req, res) => {
  try {
    const filter = {};
    if (req.query.restaurantId) filter.restaurantId = req.query.restaurantId;
    if (req.query.userId)       filter.userId       = req.query.userId;
    if (req.query.type)         filter.type         = req.query.type;
    if (req.query.isRead !== undefined) filter.isRead = req.query.isRead === 'true';
    if (req.query.priority)     filter.priority     = req.query.priority;

    const limit = Number(req.query.limit) || 50;

    const notifications = await Notification.find(filter)
      .populate('userId', 'name email role')
      .sort({ createdAt: -1 })
      .limit(limit);

    const unreadCount = await Notification.countDocuments({ ...filter, isRead: false });

    res.status(200).json({ success: true, count: notifications.length, unreadCount, data: notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a notification
// @route   POST /api/v1/notifications
// @access  Private
export const createNotification = async (req, res) => {
  try {
    const notification = await Notification.create(req.body);

    // Broadcast real-time notification
    if (req.io) {
      req.io.emit('new_notification', notification);
    }

    res.status(201).json({ success: true, data: notification });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mark a notification as read
// @route   PATCH /api/v1/notifications/:id/read
// @access  Private
export const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    res.status(200).json({ success: true, data: notification });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mark all notifications as read for a user/restaurant
// @route   PATCH /api/v1/notifications/mark-all-read
// @access  Private
export const markAllAsRead = async (req, res) => {
  try {
    const filter = { isRead: false };
    if (req.body.restaurantId) filter.restaurantId = req.body.restaurantId;
    if (req.body.userId)       filter.userId       = req.body.userId;

    const result = await Notification.updateMany(filter, { isRead: true });

    res.status(200).json({ success: true, message: `${result.modifiedCount} notifications marked as read` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a notification
// @route   DELETE /api/v1/notifications/:id
// @access  Private
export const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndDelete(req.params.id);

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    res.status(200).json({ success: true, message: 'Notification deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
