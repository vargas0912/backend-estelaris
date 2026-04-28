// eslint-disable-next-line camelcase
const { expenses, branches, users, expense_types } = require('../models/index');
const { Op } = require('sequelize');
const accountingEngine = require('./accountingEngine.service');

// eslint-disable-next-line camelcase
const attributes = ['id', 'branch_id', 'user_id', 'expense_type_id', 'trans_date', 'expense_amount', 'notes', 'created_at', 'updated_at'];

const includes = [
  { model: branches, as: 'branch', attributes: ['id', 'name'] },
  { model: users, as: 'user', attributes: ['id', 'name', 'email'] },
  // eslint-disable-next-line camelcase
  { model: expense_types, as: 'expenseType', attributes: ['id', 'name'] }
];

const getAllExpenses = async(page = 1, limit = 20, search = '') => {
  const offset = (page - 1) * limit;
  // eslint-disable-next-line camelcase
  const expenseTypeInclude = {
    model: expense_types, // eslint-disable-line camelcase
    as: 'expenseType',
    attributes: ['id', 'name'],
    ...(search ? { where: { name: { [Op.like]: `%${search}%` } }, required: true } : {})
  };
  const include = [
    { model: branches, as: 'branch', attributes: ['id', 'name'] },
    { model: users, as: 'user', attributes: ['id', 'name', 'email'] },
    expenseTypeInclude
  ];
  const { count, rows } = await expenses.findAndCountAll({
    attributes,
    include,
    limit,
    offset,
    distinct: true
  });
  return { expenses: rows, total: count };
};

const getExpensesByBranch = async(branchId, page = 1, limit = 20, search = '') => {
  const offset = (page - 1) * limit;
  // eslint-disable-next-line camelcase
  const expenseTypeInclude = {
    model: expense_types, // eslint-disable-line camelcase
    as: 'expenseType',
    attributes: ['id', 'name'],
    ...(search ? { where: { name: { [Op.like]: `%${search}%` } }, required: true } : {})
  };
  const include = [
    { model: branches, as: 'branch', attributes: ['id', 'name'] },
    { model: users, as: 'user', attributes: ['id', 'name', 'email'] },
    expenseTypeInclude
  ];
  const { count, rows } = await expenses.findAndCountAll({
    attributes,
    include,
    where: { branch_id: branchId },
    limit,
    offset,
    distinct: true
  });
  return { expenses: rows, total: count };
};

const getExpense = async(id) => {
  const result = await expenses.findOne({
    attributes,
    include: includes,
    where: { id }
  });

  return result;
};

const addExpense = async(body, branchId, userId) => {
  const result = await expenses.create({
    ...body,
    branch_id: branchId,
    user_id: userId
  });

  // Fire and forget — no bloquea, no lanza si falla
  accountingEngine.generateFromExpense(result.id).catch(err =>
    console.error('[AccountingEngine] Error generando póliza:', err.message)
  );

  return result;
};

const updateExpense = async(id, body) => {
  // eslint-disable-next-line camelcase
  const { expense_type_id, trans_date, expense_amount, notes } = body;

  const data = await expenses.findByPk(id);

  if (!data) {
    return {
      data: {
        msg: 'NOT_FOUND'
      }
    };
  }

  if (expense_type_id !== undefined) data.expense_type_id = expense_type_id; // eslint-disable-line camelcase
  if (trans_date !== undefined) data.trans_date = trans_date; // eslint-disable-line camelcase
  if (expense_amount !== undefined) data.expense_amount = expense_amount; // eslint-disable-line camelcase
  if (notes !== undefined) data.notes = notes;

  const result = await data.save();
  return result;
};

const deleteExpense = async(id) => {
  const result = await expenses.destroy({
    where: { id }
  });

  return result;
};

module.exports = { getAllExpenses, getExpensesByBranch, getExpense, addExpense, updateExpense, deleteExpense };
