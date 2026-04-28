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

module.exports = { getMunicipalitiesByStateId, getMunicipality };
