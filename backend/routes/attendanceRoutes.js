import express from 'express';
import { markAttendance } from '../controllers/employeeController.js';
import Attendance from '../models/Attendance.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

// GET /api/v1/attendance?date=YYYY-MM-DD&employeeId=xxx&month=M&year=Y
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.employeeId) filter.employeeId = req.query.employeeId;
    if (req.query.restaurantId) filter.restaurantId = req.query.restaurantId;

    if (req.query.date) {
      const d = new Date(req.query.date);
      const start = new Date(d.setHours(0, 0, 0, 0));
      const end   = new Date(d.setHours(23, 59, 59, 999));
      filter.date = { $gte: start, $lte: end };
    } else if (req.query.month && req.query.year) {
      const start = new Date(req.query.year, req.query.month - 1, 1);
      const end   = new Date(req.query.year, req.query.month, 0, 23, 59, 59);
      filter.date = { $gte: start, $lte: end };
    }

    const records = await Attendance.find(filter)
      .populate('employeeId', 'name designation photo')
      .sort({ date: -1 });

    res.json({ success: true, count: records.length, data: records });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/v1/attendance — mark / upsert attendance
router.post('/', markAttendance);

// PUT /api/v1/attendance/:id — update a specific attendance record
router.put('/:id', async (req, res) => {
  try {
    const record = await Attendance.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!record) return res.status(404).json({ success: false, message: 'Attendance record not found' });
    res.json({ success: true, data: record });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
