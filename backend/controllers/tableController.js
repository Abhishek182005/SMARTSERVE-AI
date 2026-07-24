import Table from '../models/Table.js';

// @desc    Get all tables (filter by restaurantId, branchId, status)
// @route   GET /api/v1/tables
// @access  Private
export const getTables = async (req, res) => {
  try {
    const filter = {};
    if (req.query.restaurantId) filter.restaurantId = req.query.restaurantId;
    if (req.query.branchId)     filter.branchId     = req.query.branchId;
    if (req.query.status)       filter.status       = req.query.status;
    if (req.query.floor)        filter.floor        = req.query.floor;
    if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === 'true';

    const tables = await Table.find(filter)
      .populate('restaurantId', 'name')
      .populate('branchId', 'name')
      .sort({ tableNumber: 1 });

    res.status(200).json({ success: true, count: tables.length, data: tables });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a table
// @route   POST /api/v1/tables
// @access  Private
export const createTable = async (req, res) => {
  try {
    const table = await Table.create(req.body);
    res.status(201).json({ success: true, data: table });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a table
// @route   PUT /api/v1/tables/:id
// @access  Private
export const updateTable = async (req, res) => {
  try {
    const table = await Table.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!table) {
      return res.status(404).json({ success: false, message: 'Table not found' });
    }

    res.status(200).json({ success: true, data: table });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a table
// @route   DELETE /api/v1/tables/:id
// @access  Private
export const deleteTable = async (req, res) => {
  try {
    const table = await Table.findByIdAndDelete(req.params.id);

    if (!table) {
      return res.status(404).json({ success: false, message: 'Table not found' });
    }

    res.status(200).json({ success: true, message: 'Table deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update table status only
// @route   PATCH /api/v1/tables/:id/status
// @access  Private
export const updateTableStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['Available', 'Occupied', 'Reserved', 'Cleaning'];

    if (!allowed.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${allowed.join(', ')}`,
      });
    }

    const table = await Table.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!table) {
      return res.status(404).json({ success: false, message: 'Table not found' });
    }

    // Emit real-time update to all clients
    if (req.io) {
      req.io.emit('table_status_updated', { tableId: table._id, status: table.status });
    }

    res.status(200).json({ success: true, data: table });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
