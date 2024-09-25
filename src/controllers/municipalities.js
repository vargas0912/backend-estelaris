const { matchedData } = require('express-validator');
const { handleHttpError } = require('../utils/handleErorr');

const { getMunicipality, getMunicipalitiesByStateId } = require('../services/municipalities');

/**
 * Obtener detalle de un registro
 * @param {Request} req Request param
 * @param {Response} res Response param
 */
const getById = async (req, res) => {
  try {
    console.log(req);

    const { id } = matchedData(req);
    const data = await getMunicipality(id);

    if (!data) {
      handleHttpError(res, `MUNICIPALITY ${id} NOT EXISTS`, 404);
      return;
    }

    res.send({ data });
  } catch (error) {
    handleHttpError(res, `ERROR_GET_RECORD -> ${error}`, 400);
  }
};

const getByStateId = async (req, res) => {
  try {
    const { stateId } = matchedData(req);

    const data = await getMunicipalitiesByStateId(stateId);

    if (!data) {
      handleHttpError(res, `STATE ${stateId} NOT EXISTS`, 404);
      return;
    }

    res.send({ data });
  } catch (error) {
    handleHttpError(res, `ERROR_GET_RECORD -> ${error}`, 400);
  }
};

module.exports = { getById, getByStateId };
