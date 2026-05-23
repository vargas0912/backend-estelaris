const { Op } = require('sequelize');
const { municipalities, states } = require('../models/index');

const attributes = ['id', 'name', 'created_at', 'updated_at'];
const stateAttributes = ['id', 'name'];

const getMunicipalitiesByStateId = async(stateId, page = 1, limit = 20, search = '') => {
  const offset = (page - 1) * limit;
  // eslint-disable-next-line camelcase
  const where = { state_id: stateId };
  if (search) where.name = { [Op.like]: `%${search}%` };

  const { count, rows } = await municipalities.findAndCountAll({
    attributes,
    where,
    include: [
      {
        model: states,
        as: 'estado',
        attributes: stateAttributes,
        required: true
      }],
    limit,
    offset,
    distinct: true
  });

  return { municipalities: rows, total: count };
};

const getMunicipality = async(id) => {
  const result = await municipalities.findOne(
    {
      attributes,
      where: {
        id
      },
      include: [
        {
          model: states,
          as: 'estado',
          attributes: stateAttributes,
          required: true
        }]
    });

  return result;
};

const getAll = async(search, limit = 15) => {
  const rows = await municipalities.findAll({
    attributes,
    where: { name: { [Op.like]: `%${search}%` } },
    include: [
      {
        model: states,
        as: 'estado',
        attributes: stateAttributes,
        required: false
      }
    ],
    limit
  });

  return { municipalities: rows };
};

module.exports = { getMunicipalitiesByStateId, getMunicipality, getAll };
