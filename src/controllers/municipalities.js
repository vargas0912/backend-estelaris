const { matchedData } = require('express-validator');
const { handleHttpError } = require('../utils/handleErorr');
const { getPaginationParams, buildPaginationResponse } = require('../utils/pagination');

const { getMunicipality, getMunicipalitiesByStateId, getAll: getAllMunicipalities, addMunicipality, updateMunicipality, deleteMunicipality } = require('../services/municipalities');

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

const getAll = async(req, res) => {
  try {
    const { search, limit } = matchedData(req);
    const { municipalities } = await getAllMunicipalities(search, limit);
    res.send({ municipalities });
  } catch (error) {
    handleHttpError(res, `ERROR_GET_RECORDS -> ${error}`, 400);
  }
};

/**
 * Agregar un nuevo municipio
 * @param {*} req
 * @param {*} res
 */
const addRecord = async(req, res) => {
  try {
    const data = matchedData(req);
    const municipality = await addMunicipality(data);
    res.status(201).send({ municipality });
  } catch (error) {
    handleHttpError(res, `ERROR_ADDING_RECORD --> ${error}`, 400);
  }
};

/**
 * Actualizar un municipio
 * @param {*} req
 * @param {*} res
 */
const updateRecord = async(req, res) => {
  try {
    const data = matchedData(req);
    const municipality = await updateMunicipality(data.id, data);

    if (!municipality) {
      handleHttpError(res, `MUNICIPALITY ${data.id} NOT EXISTS`, 404);
      return;
    }

    res.send({ municipality });
  } catch (error) {
    handleHttpError(res, `ERROR_UPDATE_RECORD --> ${error}`, 400);
  }
};

/**
 * Eliminar un municipio (soft delete)
 * @param {*} req
 * @param {*} res
 */
const deleteRecord = async(req, res) => {
  try {
    const { id } = matchedData(req);
    const result = await deleteMunicipality(id);

    if (!result) {
      handleHttpError(res, `MUNICIPALITY ${id} NOT EXISTS`, 404);
      return;
    }

    res.send({ result });
  } catch (error) {
    handleHttpError(res, `ERROR_DELETE_RECORD --> ${error}`, 400);
  }
};

module.exports = { getById, getByStateId, getAll, addRecord, updateRecord, deleteRecord };
