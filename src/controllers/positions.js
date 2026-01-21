const { matchedData } = require('express-validator');
const { handleHttpError } = require('../utils/handleErorr');

const { getAllPositions, getPosition, addNewPosition, updatePosition, deletePosition } = require('../services/positions');

/**
 * Obtener lista de registros
 * @param {*} req Request
 * @param {*} res Response
 */
const getRecords = async(req, res) => {
  try {
    const positions = await getAllPositions();

    res.send({ positions });
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

    const position = await getPosition(id);

    if (!position) {
      handleHttpError(res, `POSITION ${id} NOT EXISTS`, 404);
      return;
    }

    res.send({ position });
  } catch (error) {
    handleHttpError(res, `ERROR_GET_RECORD -> ${error}`, 400);
  }
};

/**
 * Agregar un nuevo registro
 * @param {*} req
 * @param {*} res
 */
const addRecord = async(req, res) => {
  try {
    req = matchedData(req);

    const position = await addNewPosition(req);

    res.send({ position });
  } catch (error) {
    handleHttpError(res, `ERROR_ADDING_RECORD --> ${error}`, 400);
  }
};

const updateRecord = async(req, res) => {
  try {
    req = matchedData(req);

    const position = await updatePosition(req.id, req);

    res.send({ position });
  } catch (error) {
    handleHttpError(res, `ERROR_UPDATE_RECORD --> ${error}`, 400);
  }
};

const deleteRecord = async(req, res) => {
  try {
    req = matchedData(req);

    const result = await deletePosition(req.id);
    res.send({ result });
  } catch (error) {
    handleHttpError(res, `ERROR_DELETE_RECORD --> ${error}`, 400);
  }
};

module.exports = { getRecord, getRecords, addRecord, updateRecord, deleteRecord };
