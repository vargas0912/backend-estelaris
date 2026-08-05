const { matchedData } = require('express-validator');
const { handleHttpError } = require('../utils/handleErorr');
const { getPaginationParams, buildPaginationResponse } = require('../utils/pagination');

const { getAllPeriods, getPeriod, generatePeriod, updatePeriod, approvePeriod, deletePeriod } = require('../services/payrollPeriods');

/**
 * Obtener lista de períodos de nómina
 * @param {Request} req
 * @param {Response} res
 */
const getRecords = async (req, res) => {
  try {
    const data = matchedData(req);
    const { page, limit } = getPaginationParams(data);
    const { periods, total } = await getAllPeriods(req.branchId, page, limit);
    res.send(buildPaginationResponse('periods', periods, total, page, limit));
  } catch (error) {
    handleHttpError(res, `ERROR_GET_RECORDS -> ${error}`);
  }
};

/**
 * Obtener detalle de un período de nómina
 * @param {Request} req
 * @param {Response} res
 */
const getRecord = async (req, res) => {
  try {
    const { id } = matchedData(req);

    const period = await getPeriod(id);

    if (!period) {
      handleHttpError(res, `PERIOD ${id} NOT EXISTS`, 404);
      return;
    }

    res.send({ period });
  } catch (error) {
    handleHttpError(res, `ERROR_GET_RECORD -> ${error}`, 400);
  }
};

/**
 * Generar un nuevo período de nómina
 * @param {Request} req
 * @param {Response} res
 */
const createRecord = async (req, res) => {
  try {
    const data = matchedData(req);

    const result = await generatePeriod(data, req.branchId, req.user.id);

    if (result.error === 'NO_ACTIVE_EMPLOYEES') {
      handleHttpError(res, result.error, 422);
      return;
    }

    if (result.error) {
      handleHttpError(res, result.error, 422);
      return;
    }

    res.status(201).send({ period: result });
  } catch (error) {
    handleHttpError(res, `ERROR_CREATE_RECORD -> ${error}`, 400);
  }
};

/**
 * Actualizar un período de nómina en estado borrador
 * @param {Request} req
 * @param {Response} res
 */
const updateRecord = async (req, res) => {
  try {
    const data = matchedData(req);

    const result = await updatePeriod(data.id, data);

    if (result.error === 'NOT_FOUND') {
      handleHttpError(res, result.error, 404);
      return;
    }

    if (result.error === 'PERIOD_NOT_EDITABLE') {
      handleHttpError(res, result.error, 422);
      return;
    }

    res.send({ period: result });
  } catch (error) {
    handleHttpError(res, `ERROR_UPDATE_RECORD -> ${error}`, 400);
  }
};

/**
 * Aprobar un período de nómina
 * @param {Request} req
 * @param {Response} res
 */
const approveRecord = async (req, res) => {
  try {
    const { id } = matchedData(req);

    const result = await approvePeriod(id, req.user.id);

    if (result.error === 'NOT_FOUND') {
      handleHttpError(res, result.error, 404);
      return;
    }

    if (result.error === 'PERIOD_NOT_IN_DRAFT') {
      handleHttpError(res, result.error, 422);
      return;
    }

    res.send({ period: result });
  } catch (error) {
    handleHttpError(res, `ERROR_APPROVE_RECORD -> ${error}`, 400);
  }
};

/**
 * Eliminar un período de nómina
 * @param {Request} req
 * @param {Response} res
 */
const deleteRecord = async (req, res) => {
  try {
    const { id } = matchedData(req);

    const result = await deletePeriod(id);

    if (result.error === 'NOT_FOUND') {
      handleHttpError(res, result.error, 404);
      return;
    }

    if (result.error === 'PERIOD_NOT_DELETABLE') {
      handleHttpError(res, result.error, 422);
      return;
    }

    res.send({ result });
  } catch (error) {
    handleHttpError(res, `ERROR_DELETE_RECORD -> ${error}`, 400);
  }
};

module.exports = { getRecords, getRecord, createRecord, updateRecord, approveRecord, deleteRecord };
