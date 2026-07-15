const { payrollLines, payrollPeriods } = require('../models/index');

const lineAttributes = [
  'id', 'payroll_period_id', 'employee_id', 'base_salary', 'worked_days',
  'gross_pay', 'loan_deduction', 'other_deductions', 'net_pay',
  'payment_method', 'reference_number', 'status', 'notes'
];

const periodInclude = [
  {
    model: payrollPeriods,
    as: 'period',
    attributes: ['id', 'name', 'start_date', 'end_date', 'payment_date', 'frequency', 'status']
  }
];

const getPayrollLinesByEmployee = async (employeeId, page = 1, limit = 20) => {
  const offset = (page - 1) * limit;
  const { count, rows } = await payrollLines.findAndCountAll({
    attributes: lineAttributes,
    where: { employee_id: employeeId },
    include: periodInclude,
    order: [['id', 'DESC']],
    limit,
    offset,
    distinct: true
  });
  return { lines: rows, total: count };
};

const getPayrollLineByEmployee = async (lineId, employeeId) => {
  return payrollLines.findOne({
    attributes: lineAttributes,
    where: { id: lineId, employee_id: employeeId },
    include: periodInclude
  });
};

module.exports = { getPayrollLinesByEmployee, getPayrollLineByEmployee };
