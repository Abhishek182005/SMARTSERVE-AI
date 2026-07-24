import Employee from '../models/Employee.js';
import Attendance from '../models/Attendance.js';
import Payroll from '../models/Payroll.js';

// @desc    Get all employees (filter by restaurantId / branchId via query)
// @route   GET /api/v1/employees
// @access  Private
export const getEmployees = async (req, res) => {
  try {
    const filter = {};
    if (req.query.restaurantId) filter.restaurantId = req.query.restaurantId;
    if (req.query.branchId)     filter.branchId     = req.query.branchId;
    if (req.query.designation)  filter.designation  = req.query.designation;
    if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === 'true';

    const employees = await Employee.find(filter)
      .populate('restaurantId', 'name')
      .populate('branchId', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: employees.length, data: employees });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create employee
// @route   POST /api/v1/employees
// @access  Private
export const createEmployee = async (req, res) => {
  try {
    const employee = await Employee.create(req.body);
    res.status(201).json({ success: true, data: employee });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single employee
// @route   GET /api/v1/employees/:id
// @access  Private
export const getEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id)
      .populate('restaurantId', 'name logo')
      .populate('branchId', 'name address');

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    res.status(200).json({ success: true, data: employee });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update employee
// @route   PUT /api/v1/employees/:id
// @access  Private
export const updateEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    res.status(200).json({ success: true, data: employee });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete (soft-delete) employee
// @route   DELETE /api/v1/employees/:id
// @access  Private
export const deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    res.status(200).json({ success: true, message: 'Employee deactivated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get attendance records for an employee
// @route   GET /api/v1/employees/:id/attendance
// @access  Private
export const getEmployeeAttendance = async (req, res) => {
  try {
    const { month, year } = req.query;
    const filter = { employeeId: req.params.id };

    if (month && year) {
      const start = new Date(year, month - 1, 1);
      const end   = new Date(year, month, 0, 23, 59, 59);
      filter.date = { $gte: start, $lte: end };
    }

    const records = await Attendance.find(filter).sort({ date: -1 });

    res.status(200).json({ success: true, count: records.length, data: records });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mark attendance for an employee
// @route   POST /api/v1/employees/attendance
// @access  Private
export const markAttendance = async (req, res) => {
  try {
    const { employeeId, date, checkIn, checkOut, status, notes } = req.body;

    // Calculate hoursWorked if both checkIn and checkOut are provided
    let hoursWorked = 0;
    let overtime    = 0;
    if (checkIn && checkOut) {
      const diffMs = new Date(checkOut) - new Date(checkIn);
      hoursWorked  = parseFloat((diffMs / 3_600_000).toFixed(2));
      overtime     = hoursWorked > 8 ? parseFloat((hoursWorked - 8).toFixed(2)) : 0;
    }

    // Upsert so re-submitting the same day updates the record
    const attendance = await Attendance.findOneAndUpdate(
      { employeeId, date: new Date(date) },
      { employeeId, date: new Date(date), checkIn, checkOut, status, hoursWorked, overtime, notes },
      { upsert: true, new: true, runValidators: true }
    );

    res.status(201).json({ success: true, data: attendance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get payroll records for an employee (or all employees in a restaurant)
// @route   GET /api/v1/employees/payroll   (query: restaurantId, employeeId, month, year)
// @access  Private
export const getPayroll = async (req, res) => {
  try {
    const filter = {};
    if (req.query.restaurantId) filter.restaurantId = req.query.restaurantId;
    if (req.query.employeeId)   filter.employeeId   = req.query.employeeId;
    if (req.query.month)        filter.month        = Number(req.query.month);
    if (req.query.year)         filter.year         = Number(req.query.year);

    const payrolls = await Payroll.find(filter)
      .populate('employeeId', 'name designation salary')
      .sort({ year: -1, month: -1 });

    res.status(200).json({ success: true, count: payrolls.length, data: payrolls });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Process payroll for a specific employee & month
// @route   POST /api/v1/employees/payroll
// @access  Private
export const processPayroll = async (req, res) => {
  try {
    const { employeeId, restaurantId, month, year, allowances = 0, deductions = 0, paymentMethod, notes } = req.body;

    // Fetch employee to get their base salary
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const basicSalary = employee.salary || 0;
    const netSalary   = basicSalary + Number(allowances) - Number(deductions);

    // Upsert – idempotent; recalculate if reprocessed
    const payroll = await Payroll.findOneAndUpdate(
      { employeeId, month: Number(month), year: Number(year) },
      {
        employeeId,
        restaurantId,
        month:     Number(month),
        year:      Number(year),
        basicSalary,
        allowances: Number(allowances),
        deductions: Number(deductions),
        netSalary,
        status: 'Processed',
        paymentMethod,
        notes,
      },
      { upsert: true, new: true, runValidators: true }
    );

    res.status(201).json({ success: true, data: payroll });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
