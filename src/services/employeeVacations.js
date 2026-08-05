const { employeeVacations, employees, users } = require('../models/index');

const vacationAttributes = ['id', 'employee_id', 'start_date', 'end_date', 'days', 'reason', 'status', 'approved_by', 'created_at', 'updated_at'];
const employeeAttributes = ['id', 'name', 'email'];
const userAttributes = ['id', 'name', 'email'];

const getAllVacations = async (branchId = null, page = 1, limit = 20) => {
  const offset = (page - 1) * limit;

  const employeeInclude = {
    model: employees,
    as: 'employee',
    attributes: ['id', 'name', 'email', 'branch_id'],
    ...(branchId ? { where: { branch_id: branchId }, required: true } : { required: false })
  };

  const { count, rows } = await employeeVacations.findAndCountAll({
    attributes: vacationAttributes,
    include: [
      employeeInclude,
      { model: users, as: 'approvedBy', attributes: userAttributes, required: false }
    ],
    order: [['id', 'DESC']],
    limit,
    offset,
    distinct: true
  });

  return { vacations: rows, total: count };
};

const getVacationsByEmployee = async (employeeId, page = 1, limit = 20) => {
  const offset = (page - 1) * limit;

  const { count, rows } = await employeeVacations.findAndCountAll({
    attributes: vacationAttributes,
    include: [
      { model: employees, as: 'employee', attributes: employeeAttributes },
      { model: users, as: 'approvedBy', attributes: userAttributes, required: false }
    ],
    where: { employee_id: employeeId },
    order: [['id', 'DESC']],
    limit,
    offset,
    distinct: true
  });

  return { vacations: rows, total: count };
};

const getVacation = async (id) => {
  const result = await employeeVacations.findOne({
    attributes: vacationAttributes,
    include: [
      { model: employees, as: 'employee', attributes: employeeAttributes },
      { model: users, as: 'approvedBy', attributes: userAttributes, required: false }
    ],
    where: { id }
  });

  return result || null;
};

const requestVacation = async (body, employeeId) => {
  const { start_date: startDate, end_date: endDate, reason } = body;

  const msPerDay = 1000 * 60 * 60 * 24;
  const days = Math.round((new Date(endDate) - new Date(startDate)) / msPerDay) + 1;

  const result = await employeeVacations.create({
    employee_id: employeeId,
    start_date: startDate,
    end_date: endDate,
    days,
    reason: reason ?? null,
    status: 'Pendiente'
  });

  return result;
};

const resolveVacation = async (id, approvedBy, newStatus) => {
  const vacation = await employeeVacations.findByPk(id);

  if (!vacation) return { error: 'NOT_FOUND' };
  if (vacation.status !== 'Pendiente') return { error: 'VACATION_NOT_PENDING' };

  vacation.status = newStatus;
  vacation.approved_by = approvedBy;

  return vacation.save();
};

const approveVacation = (id, approvedBy) => resolveVacation(id, approvedBy, 'Aprobado');
const rejectVacation = (id, approvedBy) => resolveVacation(id, approvedBy, 'Rechazado');

const deleteVacation = async (id) => {
  const result = await employeeVacations.destroy({ where: { id } });
  return result;
};

module.exports = { getAllVacations, getVacationsByEmployee, getVacation, requestVacation, approveVacation, rejectVacation, deleteVacation };
