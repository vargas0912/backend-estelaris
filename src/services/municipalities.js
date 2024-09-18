const { municipalities, states } = require('../models/index');

const attributes = ['id', 'name', 'created_at', 'updated_at'];
const stateAttributes = ['id', 'name'];

const getAllMunicipalities = async () => {
  const result = await municipalities.findAll({
    attributes,
    include: [
      {
        model: states,
        as: 'estado',
        attributes: stateAttributes
      }]
  });

  return result;
};

const getMunicipalitiesByStateId = async (stateId) => {
  const result = await municipalities.findAll({
    attributes,
    where: {
      state_id: stateId
    },
    include: [
      {
        model: states,
        as: 'estado',
        attributes: stateAttributes
      }]
  });

  return result;
};

const getMunicipality = async (id) => {
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
          attributes: stateAttributes
        }]
    });

  return result;
};

module.exports = { getAllMunicipalities, getMunicipalitiesByStateId, getMunicipality };
