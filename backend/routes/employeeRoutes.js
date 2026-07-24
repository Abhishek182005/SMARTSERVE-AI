import express from 'express';
import {
  getEmployees, createEmployee, getEmployee, updateEmployee, deleteEmployee,
  getEmployeeAttendance, markAttendance, getPayroll, processPayroll
} from '../controllers/employeeController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getEmployees)
  .post(protect, createEmployee);

router.route('/:id')
  .get(protect, getEmployee)
  .put(protect, updateEmployee)
  .delete(protect, deleteEmployee);

router.get('/:id/attendance', protect, getEmployeeAttendance);
router.post('/:id/attendance', protect, markAttendance);
router.get('/:id/payroll', protect, getPayroll);
router.post('/:id/payroll', protect, processPayroll);

export default router;
