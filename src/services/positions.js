const { positions } = require('../models/index');
const { Op } = require('sequelize');

const attributes = ['id', 'name', 'created_at', 'updated_at'];

const getAllPositions = async(page = 1, limit = 20, search = '') => {
  const offset = (page - 1) * limit;
  const where = search ? { name: { [Op.like]: `%${search}%` } } : {};
  const { count, rows } = await positions.findAndCountAll({
    attributes,
    where,
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
