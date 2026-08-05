const { matchedData } = require('express-validator');
const { handleHttpError } = require('../utils/handleErorr');
const { getPaginationParams, buildPaginationResponse } = require('../utils/pagination');

const {
  getAllVacations,
  getVacation,
  getVacationsByEmployee,
  requestVacation,
  approveVacation,
  rejectVacation,
  deleteVacation
} = require('../services/employeeVacations');

/**
 * Obtener lista paginada de todas las solicitudes de vacaciones de la sucursal
 */
const getRecords = async (req, res) => {
  try {
    const data = matchedData(req);
    const { page, limit } = getPaginationParams(data);
    const { vacations, total } = await getAllVacations(req.branchId, page, limit);
    res.send(buildPaginationResponse('vacations', vacations, total, page, limit));
  } catch (error) {
    handleHttpError(res, `ERROR_GET_RECORDS -> ${error}`);
  }
};

/**
 * Obtener detalle de una solicitud de vacaciones por id
 */
const getRecord = async (req, res) => {
  try {
    const { id } = matchedData(req);
    const vacation = await getVacation(id);

    if (!vacation) {
      handleHttpError(res, `VACATION ${id} NOT EXISTS`, 404);
      return;
    }

    res.send({ vacation });
  } catch (error) {
    handleHttpError(res, `ERROR_GET_RECORD -> ${error}`, 400);
  }
};

/**
 * Obtener solicitudes de vacaciones por empleado
 */
const getRecordsByEmployee = async (req, res) => {
  try {
    const data = matchedData(req);
    const { page, limit } = getPaginationParams(data);
    const { vacations, total } = await getVacationsByEmployee(data.employee_id, page, limit);
    res.send(buildPaginationResponse('vacations', vacations, total, page, limit));
  } catch (error) {
    handleHttpError(res, `ERROR_GET_RECORDS_BY_EMPLOYEE -> ${error}`);
  }
};

/**
 * Crear solicitud de vacaciones (alta directa por admin)
 */
const createRecord = async (req, res) => {
  try {
    const data = matchedData(req);
    const vacation = await requestVacation(data, data.employee_id);
    res.status(201).send({ vacation });
  } catch (error) {
    handleHttpError(res, `ERROR_CREATE_RECORD -> ${error}`, 400);
  }
};

/**
 * Aprobar una solicitud de vacaciones pendiente
 */
const approveRecord = async (req, res) => {
  try {
    const { id } = matchedData(req);
    const result = await approveVacation(id, req.user.id);

    if (result.error === 'NOT_FOUND') {
      handleHttpError(res, result.error, 404);
      return;
    }

    if (result.error === 'VACATION_NOT_PENDING') {
      handleHttpError(res, result.error, 422);
      return;
    }

    res.send({ vacation: result });
  } catch (error) {
    handleHttpError(res, `ERROR_APPROVE_RECORD -> ${error}`, 400);
  }
};

/**
 * Rechazar una solicitud de vacaciones pendiente
 */
const rejectRecord = async (req, res) => {
  try {
    const { id } = matchedData(req);
    const result = await rejectVacation(id, req.user.id);

    if (result.error === 'NOT_FOUND') {
      handleHttpError(res, result.error, 404);
      return;
    }

    if (result.error === 'VACATION_NOT_PENDING') {
      handleHttpError(res, result.error, 422);
      return;
    }

    res.send({ vacation: result });
  } catch (error) {
    handleHttpError(res, `ERROR_REJECT_RECORD -> ${error}`, 400);
  }
};

/**
 * Eliminar una solicitud de vacaciones
 */
const deleteRecord = async (req, res) => {
  try {
    const { id } = matchedData(req);
    const result = await deleteVacation(id);
    res.send({ result });
  } catch (error) {
    handleHttpError(res, `ERROR_DELETE_RECORD -> ${error}`, 400);
  }
};

module.exports = { getRecords, getRecord, getRecordsByEmployee, createRecord, approveRecord, rejectRecord, deleteRecord };
