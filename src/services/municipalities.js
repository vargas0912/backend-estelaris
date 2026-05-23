const { Op } = require('sequelize');
const { municipalities, states } = require('../models/index');

const attributes = ['id', 'name', 'created_at', 'updated_at'];
const stateAttributes = ['id', 'name'];

const getMunicipalitiesByStateId = async(stateId, page = 1, limit = 20) => {
  const offset = (page - 1) * limit;
  const { count, rows } = await municipalities.findAndCountAll({
    attributes,
    where: {
      state_id: stateId
    },
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

const addMunicipality = async(body) => {
  const { name } = body;
  // eslint-disable-next-line camelcase
  const state_id = body.state_id;
  const key = name.toLowerCase().replace(/ /g, '_');
  // eslint-disable-next-line camelcase
  const result = await municipalities.create({ key, name, state_id, active: true });
  return result;
};

const updateMunicipality = async(id, body) => {
  const { name } = body;
  // eslint-disable-next-line camelcase
  const state_id = body.state_id;
  const data = await municipalities.findByPk(id);

  if (!data) {
    return null;
  }

  data.name = name;
  // eslint-disable-next-line camelcase
  data.state_id = state_id;

  const result = await data.save();
  return result;
};

const deleteMunicipality = async(id) => {
  const data = await municipalities.findByPk(id);

  if (!data) {
    return null;
  }

  await data.destroy();
  return data;
};

module.exports = { getMunicipalitiesByStateId, getMunicipality, getAll, addMunicipality, updateMunicipality, deleteMunicipality };
