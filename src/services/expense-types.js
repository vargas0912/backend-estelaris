// eslint-disable-next-line camelcase
const { expense_types } = require('../models/index');

const attributes = ['id', 'name', 'created_at', 'updated_at'];

const getAllExpenseTypes = async(page = 1, limit = 20) => {
  const offset = (page - 1) * limit;
  // eslint-disable-next-line camelcase
  const { count, rows } = await expense_types.findAndCountAll({
    attributes,
    limit,
    offset
  });

  return { expenseTypes: rows, total: count };
};

const getExpenseType = async(id) => {
  // eslint-disable-next-line camelcase
  const result = await expense_types.findOne({
    attributes,
    where: { id }
  });

  return result;
};

const addExpenseType = async(body) => {
  // eslint-disable-next-line camelcase
  const result = await expense_types.create(body);

  return result;
};

const updateExpenseType = async(id, req) => {
  const { name } = req;

  // eslint-disable-next-line camelcase
  const data = await expense_types.findByPk(id);

  if (!data) {
    return {
      data: {
        msg: 'NOT_FOUND'
      }
    };
  }

  data.name = name || data.name;

  const result = await data.save();
  return result;
};

const deleteExpenseType = async(id) => {
  // eslint-disable-next-line camelcase
  const result = await expense_types.destroy({
    where: { id }
  });

  return result;
};

module.exports = { getAllExpenseTypes, getExpenseType, addExpenseType, updateExpenseType, deleteExpenseType };
