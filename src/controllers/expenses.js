const { matchedData } = require('express-validator');
const { handleHttpError } = require('../utils/handleErorr');

const { getAllExpenses, getExpensesByBranch, getExpense, addExpense, updateExpense, deleteExpense } = require('../services/expenses');

/**
 * Obtener lista de todos los gastos
 * @param {*} req Request
 * @param {*} res Response
 */
const getRecords = async(req, res) => {
  try {
    const expensesList = await getAllExpenses();

    res.send({ expenses: expensesList });
  } catch (error) {
    handleHttpError(res, `ERROR_GET_RECORDS -> ${error}`);
  }
};

/**
 * Obtener detalle de un gasto por id
 * @param {Request} req Request param
 * @param {Response} res Response param
 */
const getRecord = async(req, res) => {
  try {
    const { id } = matchedData(req);

    const expense = await getExpense(id);

    if (!expense) {
      handleHttpError(res, `EXPENSE ${id} NOT EXISTS`, 404);
      return;
    }

    res.send({ expense });
  } catch (error) {
    handleHttpError(res, `ERROR_GET_RECORD -> ${error}`, 400);
  }
};

/**
 * Obtener gastos por sucursal
 * @param {Request} req Request param
 * @param {Response} res Response param
 */
const getRecordsByBranch = async(req, res) => {
  try {
    // eslint-disable-next-line camelcase
    const { branch_id } = matchedData(req);

    const expensesList = await getExpensesByBranch(branch_id);

    res.send({ expenses: expensesList });
  } catch (error) {
    handleHttpError(res, `ERROR_GET_RECORDS_BY_BRANCH -> ${error}`, 400);
  }
};

/**
 * Agregar un nuevo gasto
 * @param {*} req
 * @param {*} res
 */
const addRecord = async(req, res) => {
  try {
    const body = matchedData(req);
    const branchId = req.branchId || parseInt(req.headers['x-branch-id'], 10);
    const userId = req.user.id;

    const expense = await addExpense(body, branchId, userId);

    res.send({ expense });
  } catch (error) {
    handleHttpError(res, `ERROR_ADDING_RECORD --> ${error}`, 400);
  }
};

const updateRecord = async(req, res) => {
  try {
    const body = matchedData(req);

    const expense = await updateExpense(body.id, body);

    res.send({ expense });
  } catch (error) {
    handleHttpError(res, `ERROR_UPDATE_RECORD --> ${error}`, 400);
  }
};

const deleteRecord = async(req, res) => {
  try {
    const { id } = matchedData(req);

    const result = await deleteExpense(id);
    res.send({ result });
  } catch (error) {
    handleHttpError(res, `ERROR_DELETE_RECORD --> ${error}`, 400);
  }
};

module.exports = { getRecords, getRecord, getRecordsByBranch, addRecord, updateRecord, deleteRecord };
