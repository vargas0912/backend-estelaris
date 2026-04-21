const { accountingPeriods, users } = require('../models/index');

const periodAttributes = [
  'id', 'name', 'year', 'month', 'status',
  'balance_snapshot', 'closed_at', 'closed_by_user_id',
  'created_at', 'updated_at'
];

const closedByInclude = {
  model: users,
  as: 'closedBy',
  attributes: ['id', 'name', 'email']
};

const getAllPeriods = async (page = 1, limit = 20) => {
  const offset = (page - 1) * limit;
  const { count, rows } = await accountingPeriods.findAndCountAll({
    attributes: periodAttributes,
    include: [closedByInclude],
    order: [['year', 'DESC'], ['month', 'DESC']],
    limit,
    offset,
    distinct: true
  });

  return { periods: rows, total: count };
};

const getCurrentPeriod = async () => {
  return accountingPeriods.findOne({
    attributes: periodAttributes,
    include: [closedByInclude],
    where: { status: 'abierto' }
  });
};

const getPeriod = async (id) => {
  return accountingPeriods.findOne({
    attributes: periodAttributes,
    include: [closedByInclude],
    where: { id }
  });
};

const getPreviousPeriod = async (year, month) => {
  let prevYear = year;
  let prevMonth = month - 1;
  if (prevMonth === 0) {
    prevMonth = 12;
    prevYear = year - 1;
  }
  return accountingPeriods.findOne({ where: { year: prevYear, month: prevMonth } });
};

const createPeriod = async (body) => {
  const { name, year, month } = body;

  const existing = await accountingPeriods.findOne({ where: { year, month } });
  if (existing) {
    return { error: 'PERIOD_ALREADY_EXISTS' };
  }

  const previous = await getPreviousPeriod(year, month);
  if (previous && previous.status === 'abierto') {
    return { error: 'PREVIOUS_PERIOD_STILL_OPEN' };
  }

  const period = await accountingPeriods.create({ name, year, month, status: 'abierto' });
  return getPeriod(period.id);
};

const closePeriod = async (id, userId) => {
  const period = await accountingPeriods.findByPk(id);

  if (!period) {
    return { error: 'NOT_FOUND' };
  }

  if (period.status !== 'abierto') {
    return { error: 'PERIOD_NOT_OPEN' };
  }

  // TODO: when journal_entries is implemented, calculate real balance snapshot
  const balanceSnapshot = {};

  period.status = 'cerrado';
  period.closed_at = new Date();
  period.closed_by_user_id = userId;
  period.balance_snapshot = balanceSnapshot;

  await period.save();
  return getPeriod(id);
};

const reopenPeriod = async (id) => {
  const period = await accountingPeriods.findByPk(id);

  if (!period) {
    return { error: 'NOT_FOUND' };
  }

  if (period.status === 'bloqueado') {
    return { error: 'PERIOD_LOCKED' };
  }

  if (period.status !== 'cerrado') {
    return { error: 'PERIOD_NOT_CLOSED' };
  }

  period.status = 'abierto';
  period.closed_at = null;
  period.closed_by_user_id = null;
  period.balance_snapshot = null;

  await period.save();
  return getPeriod(id);
};

const lockPeriod = async (id) => {
  const period = await accountingPeriods.findByPk(id);

  if (!period) {
    return { error: 'NOT_FOUND' };
  }

  if (period.status === 'bloqueado') {
    return { error: 'PERIOD_ALREADY_LOCKED' };
  }

  if (period.status !== 'cerrado') {
    return { error: 'PERIOD_NOT_CLOSED' };
  }

  period.status = 'bloqueado';
  await period.save();
  return getPeriod(id);
};

module.exports = {
  getAllPeriods,
  getCurrentPeriod,
  getPeriod,
  createPeriod,
  closePeriod,
  reopenPeriod,
  lockPeriod
};
