const { matchedData } = require('express-validator');
const { states } = require('../models/index');
const { handleHttpError } = require('../utils/handleErorr');

/**
 * Obtener lista de registros
 * @param {*} req Request
 * @param {*} res Response
 */
const getRecords = async(req, res) => {
  try {
    // eslint-disable-next-line no-use-before-define
    const data = await states.findAll();
    res.send({ data });
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
