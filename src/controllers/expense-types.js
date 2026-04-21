const { matchedData } = require('express-validator');
const { handleHttpError } = require('../utils/handleErorr');
const { getPaginationParams, buildPaginationResponse } = require('../utils/pagination');

const { getAllExpenseTypes, getExpenseType, addExpenseType, updateExpenseType, deleteExpenseType } = require('../services/expense-types');

/**
 * Obtener lista de registros
 * @param {*} req Request
 * @param {*} res Response
 */
const getRecords = async(req, res) => {
  try {
    const { page, limit } = getPaginationParams(matchedData(req));
    const { expenseTypes, total } = await getAllExpenseTypes(page, limit);

    res.send(buildPaginationResponse('expenseTypes', expenseTypes, total, page, limit));
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

    const expenseType = await getExpenseType(id);

    if (!expenseType) {
      handleHttpError(res, `EXPENSE_TYPE ${id} NOT EXISTS`, 404);
      return;
    }

    res.send({ expenseType });
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

    const expenseType = await addExpenseType(req);

    res.send({ expenseType });
  } catch (error) {
    handleHttpError(res, `ERROR_ADDING_RECORD --> ${error}`, 400);
  }
};

const updateRecord = async(req, res) => {
  try {
    req = matchedData(req);

    const expenseType = await updateExpenseType(req.id, req);

    res.send({ expenseType });
  } catch (error) {
    handleHttpError(res, `ERROR_UPDATE_RECORD --> ${error}`, 400);
  }
};

const deleteRecord = async(req, res) => {
  try {
    req = matchedData(req);

    const result = await deleteExpenseType(req.id);
    res.send({ result });
  } catch (error) {
    handleHttpError(res, `ERROR_DELETE_RECORD --> ${error}`, 400);
  }
};

module.exports = { getRecord, getRecords, addRecord, updateRecord, deleteRecord };
