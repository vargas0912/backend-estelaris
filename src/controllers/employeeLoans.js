const { matchedData } = require('express-validator');
const { handleHttpError } = require('../utils/handleErorr');
const { getPaginationParams, buildPaginationResponse } = require('../utils/pagination');

const {
  getAllLoans,
  getLoan,
  getLoansByEmployee,
  requestLoan,
  approveLoan,
  cancelLoan,
  deleteLoan
} = require('../services/employeeLoans');

/**
 * Obtener lista paginada de préstamos por sucursal
 * @param {Request} req
 * @param {Response} res
 */
const getRecords = async (req, res) => {
  try {
    const data = matchedData(req);
    const { page, limit } = getPaginationParams(data);
    const { loans, total } = await getAllLoans(req.branchId, page, limit);
    res.send(buildPaginationResponse('loans', loans, total, page, limit));
  } catch (error) {
    handleHttpError(res, `ERROR_GET_RECORDS -> ${error}`);
  }
};

/**
 * Obtener detalle de un préstamo por id
 * @param {Request} req
 * @param {Response} res
 */
const getRecord = async (req, res) => {
  try {
    const { id } = matchedData(req);
    const loan = await getLoan(id);

    if (!loan) {
      handleHttpError(res, `LOAN ${id} NOT EXISTS`, 404);
      return;
    }

    res.send({ loan });
  } catch (error) {
    handleHttpError(res, `ERROR_GET_RECORD -> ${error}`, 400);
  }
};

/**
 * Obtener préstamos de un empleado específico
 * @param {Request} req
 * @param {Response} res
 */
const getRecordsByEmployee = async (req, res) => {
  try {
    const data = matchedData(req);
    const { page, limit } = getPaginationParams(data);
    const { loans, total } = await getLoansByEmployee(data.employee_id, page, limit);
    res.send(buildPaginationResponse('loans', loans, total, page, limit));
  } catch (error) {
    handleHttpError(res, `ERROR_GET_RECORDS_BY_EMPLOYEE -> ${error}`);
  }
};

/**
 * Solicitar un nuevo préstamo
 * @param {Request} req
 * @param {Response} res
 */
const createRecord = async (req, res) => {
  try {
    const data = matchedData(req);
    // Usar branch_id del cuerpo si existe; si no, tomar el del contexto de sucursal
    const payload = { ...data, branch_id: data.branch_id || req.branchId };
    const loan = await requestLoan(payload, req.user.id);
    res.status(201).send({ loan });
  } catch (error) {
    handleHttpError(res, `ERROR_CREATE_RECORD -> ${error}`, 400);
  }
};

/**
 * Aprobar un préstamo pendiente
 * @param {Request} req
 * @param {Response} res
 */
const approveRecord = async (req, res) => {
  try {
    const { id, installment_amount: installmentAmount } = matchedData(req);
    const result = await approveLoan(id, req.user.id, installmentAmount);

    if (result.error === 'NOT_FOUND') {
      handleHttpError(res, result.error, 404);
      return;
    }

    if (result.error === 'LOAN_NOT_PENDING') {
      handleHttpError(res, result.error, 422);
      return;
    }

    if (result.error) {
      handleHttpError(res, result.error, 422);
      return;
    }

    res.send({ loan: result });
  } catch (error) {
    handleHttpError(res, `ERROR_APPROVE_RECORD -> ${error}`, 400);
  }
};

/**
 * Cancelar un préstamo
 * @param {Request} req
 * @param {Response} res
 */
const cancelRecord = async (req, res) => {
  try {
    const { id } = matchedData(req);
    const result = await cancelLoan(id);

    if (result.error === 'NOT_FOUND') {
      handleHttpError(res, result.error, 404);
      return;
    }

    if (result.error === 'LOAN_NOT_CANCELLABLE') {
      handleHttpError(res, result.error, 422);
      return;
    }

    if (result.error) {
      handleHttpError(res, result.error, 422);
      return;
    }

    res.send({ result });
  } catch (error) {
    handleHttpError(res, `ERROR_CANCEL_RECORD -> ${error}`, 400);
  }
};

/**
 * Eliminar un préstamo (soft delete)
 * @param {Request} req
 * @param {Response} res
 */
const deleteRecord = async (req, res) => {
  try {
    const { id } = matchedData(req);
    const result = await deleteLoan(id);
    res.send({ result });
  } catch (error) {
    handleHttpError(res, `ERROR_DELETE_RECORD -> ${error}`, 400);
  }
};

module.exports = {
  getRecords,
  getRecord,
  getRecordsByEmployee,
  createRecord,
  approveRecord,
  cancelRecord,
  deleteRecord
};
