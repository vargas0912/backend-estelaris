const { municipalities, states } = require('../models/index');

const attributes = ['id', 'name', 'created_at', 'updated_at'];
const stateAttributes = ['id', 'name'];

const getMunicipalitiesByStateId = async(stateId) => {
  const result = await municipalities.findAll({
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
      }]
  });

  return result;
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
