const { positions } = require('../models/index');

const attributes = ['id', 'name', 'created_at', 'updated_at'];

const getAllPositions = async(page = 1, limit = 20) => {
  const offset = (page - 1) * limit;
  const { count, rows } = await positions.findAndCountAll({
    attributes,
    limit,
    offset
  });

  return { positions: rows, total: count };
};

const getPosition = async(id) => {
  const result = await positions.findOne(
    {
      attributes,
      where: {
        id
      }
    });

  return result;
};

const addNewPosition = async(body) => {
  const result = await positions.create(body);

  return result;
};

const updatePosition = async(id, req) => {
  const { name } = req;

  const data = await positions.findByPk(id);

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

const deletePosition = async(id) => {
  const result = await positions.destroy({
    where: {
      id
    }
  });

  return result;
};

module.exports = { getAllPositions, getPosition, addNewPosition, updatePosition, deletePosition };
