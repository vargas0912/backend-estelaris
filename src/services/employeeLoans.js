const { employeeLoans, loanPayments, employees, branches, users } = require('../models/index');

const loanAttributes = ['id', 'employee_id', 'branch_id', 'amount', 'balance', 'reason', 'disbursement_date', 'installment_amount', 'status', 'approved_by', 'user_id', 'created_at', 'updated_at'];
const paymentAttributes = ['id', 'loan_id', 'payroll_line_id', 'amount', 'payment_date', 'notes'];
const employeeAttributes = ['id', 'name', 'email'];
const branchAttributes = ['id', 'name'];
const userAttributes = ['id', 'name', 'email'];

const loanIncludes = [
  { model: employees, as: 'employee', attributes: employeeAttributes },
  { model: branches, as: 'branch', attributes: branchAttributes },
  { model: users, as: 'requestedBy', attributes: userAttributes }
];

const getAllLoans = async (branchId = null, page = 1, limit = 20) => {
  const offset = (page - 1) * limit;
  const where = branchId ? { branch_id: branchId } : {};

  const { count, rows } = await employeeLoans.findAndCountAll({
    attributes: loanAttributes,
    include: loanIncludes,
    where,
    order: [['id', 'DESC']],
    limit,
    offset,
    distinct: true
  });

  return { loans: rows, total: count };
};

const getLoansByEmployee = async (employeeId, page = 1, limit = 20) => {
  const offset = (page - 1) * limit;

  const { count, rows } = await employeeLoans.findAndCountAll({
    attributes: loanAttributes,
    include: loanIncludes,
    where: { employee_id: employeeId },
    order: [['id', 'DESC']],
    limit,
    offset,
    distinct: true
  });

  return { loans: rows, total: count };
};

const getLoan = async (id) => {
  const result = await employeeLoans.findOne({
    attributes: loanAttributes,
    include: [
      { model: employees, as: 'employee', attributes: employeeAttributes },
      { model: branches, as: 'branch', attributes: branchAttributes },
      { model: users, as: 'requestedBy', attributes: userAttributes },
      { model: users, as: 'approvedBy', attributes: userAttributes, required: false },
      { model: loanPayments, as: 'payments', attributes: paymentAttributes }
    ],
    where: { id }
  });

  return result || null;
};

const requestLoan = async (body, userId) => {
  const {
    employee_id: employeeId,
    branch_id: branchId,
    amount,
    reason,
    disbursement_date: disbursementDate,
    installment_amount: installmentAmount
  } = body;

  const result = await employeeLoans.create({
    employee_id: employeeId,
    branch_id: branchId,
    amount,
    balance: amount,
    reason,
    disbursement_date: disbursementDate,
    installment_amount: installmentAmount ?? 0,
    status: 'Pendiente',
    user_id: userId
  });

  return result;
};

const approveLoan = async (id, approvedBy, installmentAmount) => {
  const loan = await employeeLoans.findByPk(id);

  if (!loan) {
    return { error: 'NOT_FOUND' };
  }

  if (loan.status !== 'Pendiente') {
    return { error: 'LOAN_NOT_PENDING' };
  }

  loan.status = 'Activo';
  loan.approved_by = approvedBy;
  loan.installment_amount = installmentAmount;

  const result = await loan.save();
  return result;
};

const cancelLoan = async (id) => {
  const loan = await employeeLoans.findByPk(id);

  if (!loan) {
    return { error: 'NOT_FOUND' };
  }

  if (loan.status !== 'Pendiente' && loan.status !== 'Activo') {
    return { error: 'LOAN_NOT_CANCELLABLE' };
  }

  loan.status = 'Cancelado';

  const result = await loan.save();
  return result;
};

const deleteLoan = async (id) => {
  const result = await employeeLoans.destroy({ where: { id } });
  return result;
};

module.exports = { getAllLoans, getLoansByEmployee, getLoan, requestLoan, approveLoan, cancelLoan, deleteLoan };
