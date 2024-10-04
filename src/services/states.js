const { states } = require('../models/index');

const attributes = ['id', 'name', 'created_at', 'updated_at'];

const getAllStates = async() => {
  const result = await states.findAll({
    attributes
  });

  return result;
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
