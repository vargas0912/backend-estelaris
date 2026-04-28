const { matchedData } = require('express-validator');
const { states } = require('../models/index');
const { handleHttpError } = require('../utils/handleErorr');
const { getAllStates } = require('../services/states');

/**
 * Obtener lista de registros
 * @param {*} req Request
 * @param {*} res Response
 */
const getRecords = async(req, res) => {
  try {
    const statesList = await getAllStates();
    res.send({ states: statesList });
  } catch (error) {
    handleHttpError(res, `ERROR_GET_RECORDS -> ${error}`);
  }
};

/**
 * Obtener detalle de un registro
 * @param {Request} req Request param
 * @param {Response} res Response param
 */
const getRecord = async(req, res) => {
  try {
    const { id } = matchedData(req);

    const state = await states.findByPk(id);
    res.send({ state });
  } catch (error) {
    handleHttpError(res, `ERROR_GET_RECORD -> ${error}`);
  }
};

module.exports = { getRecords, getRecord };
