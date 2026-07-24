import express from 'express';
import { getPayroll, processPayroll } from '../controllers/employeeController.js';
import Payroll from '../models/Payroll.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getPayroll)
  .post(processPayroll);

// PUT /api/v1/payroll/:id — update status (Processed → Paid etc.)
router.put('/:id', async (req, res) => {
  try {
    const payroll = await Payroll.findByIdAndUpdate(
      req.params.id,
      { ...req.body, ...(req.body.status === 'Paid' ? { paidAt: new Date() } : {}) },
      { new: true, runValidators: true }
    ).populate('employeeId', 'name designation salary');
    if (!payroll) return res.status(404).json({ success: false, message: 'Payroll record not found' });
    res.json({ success: true, data: payroll });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/v1/payroll/:id
router.delete('/:id', async (req, res) => {
  try {
    const payroll = await Payroll.findByIdAndDelete(req.params.id);
    if (!payroll) return res.status(404).json({ success: false, message: 'Payroll record not found' });
    res.json({ success: true, message: 'Payroll record deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
