const { matchedData } = require('express-validator');
const { handleHttpError } = require('../utils/handleErorr');
const { getPaginationParams, buildPaginationResponse } = require('../utils/pagination');

const { getMunicipality, getMunicipalitiesByStateId } = require('../services/municipalities');

/**
 * Obtener detalle de un registro
 * @param {Request} req Request param
 * @param {Response} res Response param
 */
const getById = async(req, res) => {
  try {
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

const getByStateId = async(req, res) => {
  try {
    const data = matchedData(req);
    const { stateId } = data;
    const { page, limit } = getPaginationParams(data);

    const { municipalities, total } = await getMunicipalitiesByStateId(stateId, page, limit);

    res.send(buildPaginationResponse('municipalities', municipalities, total, page, limit));
  } catch (error) {
    handleHttpError(res, `ERROR_GET_RECORD -> ${error}`, 400);
  }
};

module.exports = { getById, getByStateId };
