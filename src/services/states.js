const { states } = require('../models/index');

const attributes = ['id', 'name', 'created_at', 'updated_at'];

const getAllStates = async(page = 1, limit = 20) => {
  const offset = (page - 1) * limit;
  const { count, rows } = await states.findAndCountAll({
    attributes,
    limit,
    offset
  });

  return { states: rows, total: count };
};

const getState = async(id) => {
  const result = await states.findOne(
    {
      attributes,
      where: {
        id
      }
    });

  return result;
};

const deleteState = async(id) => {
  const result = await states.destroy({
    where: {
      id
    }
  });

  return result;
};

module.exports = { getAllStates, getState, deleteState };
