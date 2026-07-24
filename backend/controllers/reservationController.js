import Reservation from '../models/Reservation.js';

// @desc    Get all reservations (with optional filters)
// @route   GET /api/v1/reservations
// @access  Private
export const getReservations = async (req, res) => {
  try {
    const filter = {};
    if (req.query.restaurantId) filter.restaurantId = req.query.restaurantId;
    if (req.query.tableId)      filter.tableId      = req.query.tableId;
    if (req.query.customerId)   filter.customerId   = req.query.customerId;
    if (req.query.status)       filter.status       = req.query.status;

    // Filter by date range
    if (req.query.from || req.query.to) {
      filter.date = {};
      if (req.query.from) filter.date.$gte = new Date(req.query.from);
      if (req.query.to)   filter.date.$lte = new Date(req.query.to);
    }

    const reservations = await Reservation.find(filter)
      .populate('tableId', 'tableNumber floor capacity')
      .populate('customerId', 'name phone email membershipTier')
      .sort({ date: 1, time: 1 });

    res.status(200).json({ success: true, count: reservations.length, data: reservations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get today's reservations
// @route   GET /api/v1/reservations/today
// @access  Private
export const getTodayReservations = async (req, res) => {
  try {
    const today   = new Date();
    const dayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
    const dayEnd   = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

    const filter = { date: { $gte: dayStart, $lte: dayEnd } };
    if (req.query.restaurantId) filter.restaurantId = req.query.restaurantId;

    const reservations = await Reservation.find(filter)
      .populate('tableId', 'tableNumber floor capacity')
      .populate('customerId', 'name phone email')
      .sort({ time: 1 });

    res.status(200).json({ success: true, count: reservations.length, data: reservations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a reservation
// @route   POST /api/v1/reservations
// @access  Private
export const createReservation = async (req, res) => {
  try {
    const reservation = await Reservation.create(req.body);

    // Notify front-of-house in real time
    if (req.io) {
      req.io.emit('new_reservation', reservation);
    }

    res.status(201).json({ success: true, data: reservation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a reservation
// @route   PUT /api/v1/reservations/:id
// @access  Private
export const updateReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('tableId', 'tableNumber floor capacity')
      .populate('customerId', 'name phone email');

    if (!reservation) {
      return res.status(404).json({ success: false, message: 'Reservation not found' });
    }

    res.status(200).json({ success: true, data: reservation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Cancel a reservation
// @route   PATCH /api/v1/reservations/:id/cancel
// @access  Private
export const cancelReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findByIdAndUpdate(
      req.params.id,
      { status: 'Cancelled' },
      { new: true }
    );

    if (!reservation) {
      return res.status(404).json({ success: false, message: 'Reservation not found' });
    }

    res.status(200).json({ success: true, data: reservation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
